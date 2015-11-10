package Server;

import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Scanner;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import configuration.DBConnection;
import configuration.Global;
import visualization.EvaluatingPoints;
import visualization.TableAttrStat;
import mainPackage.FirstScenario;
import mainPackage.Label;
import mainPackage.Tuple;
import mainPackage.UserModel;
import metrics.EvaluateModel;

public class Protocol {
	private static final int INITIALIZE = 0;
	private static final int ACCEPT_LABELED_SAMPLES = 1;
	public static boolean stop = false;
	private ArrayList<Tuple> labeledSamples = null;
	private ArrayList<Tuple> nextSamples = null;
	private static UserModel model = null;
	private TableAttrStat tas;
	HashMap<Long, double[]> points;
	FirstScenario fs = null;
	int fsIteration = 0;
	boolean real_estate = true;
	ArrayList<Tuple> allSamples;

	private int state = INITIALIZE;

	//Initially the server gets called and should initialize the exploration as in driver.

	public Protocol() throws SQLException{
		//this.config = config;
		//this.configFE = configFE;
		tas = new TableAttrStat();
		allSamples = new ArrayList<Tuple>();
	}

	/** Protocol of communication with front-end.	
	 * @param theInput
	 * @return
	 * @throws Exception 
	 */
	public JSONObject processInput(String theInput, Driver d) throws Exception {
		JSONObject theOutput = null;

		if(state == INITIALIZE){
			nextSamples = new ArrayList<Tuple>();
			while(nextSamples.size()==0){
				if(Global.SCENARIO!=1)
					nextSamples = d.explore(null,0); //return samples from initial phase
				else{
					fs = new FirstScenario(); 
					nextSamples = fs.readSamplesFromFile(1);
					fsIteration = 2;
				}
			}
			EvaluatingPoints e = null;
			if(!Global.TABLE_NAME.equals("real_estate")){
				e = new EvaluatingPoints(tas, 10000);
				points = e.points;
			}
			ArrayList<Integer> labels = null;

			if(Global.SCENARIO==2 || Global.SCENARIO==4 || Global.SCENARIO == 1){
				Label l = new Label();
				labels = l.getLabelsBackEnd(nextSamples);
			}
			theOutput = serializeFirstIter(nextSamples, points, labels);
			
			allSamples.addAll(nextSamples);
			state = ACCEPT_LABELED_SAMPLES;
		}else if(state == ACCEPT_LABELED_SAMPLES){
			ArrayList<Integer> labels = null;
			if(Global.SCENARIO!=2 && Global.SCENARIO!=4 && Global.SCENARIO!=1){//when we don't have a target query, get labels from front-end
				//System.out.println("The incoming info: "+theInput);
				labeledSamples = deserialize(theInput);
				labels = getLabels(theInput);
			}else{ 
				labeledSamples = nextSamples;
				Label l = new Label();
				labels = l.getLabelsBackEnd(labeledSamples);
			}
			//classify and build model
			model = d.buildModel(labeledSamples, labels);  //build model

			ArrayList<Integer> labelsForVis = null;
			if(!Global.TABLE_NAME.equals("real_estate")){
				//you have the built model and the grid points, pass the grid points through the model and return the labels.
				labelsForVis = d.classifyGridPoints(model, points);
			}
			int relevantFromExplore = d.getInterestingFromExplore(labeledSamples, labels);//find how many relevant samples we have from explore phase
			nextSamples = new ArrayList<Tuple>();
			while(nextSamples.size()==0){
				if(Global.SCENARIO!=1){
					nextSamples = d.explore(model, relevantFromExplore);	//find the next batch of samples based on exploration
				}else{
					nextSamples = fs.readSamplesFromFile(fsIteration);
				}
				nextSamples = checkSamples(nextSamples);
				System.out.println("Finished checking samples..");
			}
			if(Global.SCENARIO==1)fsIteration++; //if we go more than 6_iteration it will crash because there is no file.

			if(Global.SCENARIO!=2 && Global.SCENARIO!=4 && Global.SCENARIO!=1)
				theOutput = serialize(nextSamples, labelsForVis);  //return the next samples for exploration
			else{
				ArrayList<Integer> currentLabels = new ArrayList<Integer>();
				Label l = new Label();
				currentLabels = l.getLabelsBackEnd(nextSamples);
				theOutput = serializeWithLabelsFromBackEnd(nextSamples, labelsForVis, currentLabels);  //return the next samples for exploration

			}//System.out.println("Sending back the new samples and the labeled grid points...");
			state = ACCEPT_LABELED_SAMPLES;
			allSamples.addAll(nextSamples);
		}
		return theOutput;
	}


	private JSONObject serializeWithLabelsFromBackEnd(ArrayList<Tuple> samples, ArrayList<Integer> labelsForVis, ArrayList<Integer> labelsPrev) throws SQLException, JSONException {
		JSONArray toReturn = new JSONArray();
		for(int i=0; i<samples.size(); i++){
			Tuple t = samples.get(i);
			Object[] a = fixSample(t);
			JSONArray array = new JSONArray(a);  
			toReturn.put(array);
		}
		JSONObject json = new JSONObject();
		json.put("samples", toReturn);
		if(!Global.TABLE_NAME.equals("real_estate")){
			JSONArray toReturn2 = new JSONArray();
			for(int i=0; i<labelsForVis.size(); i++){
				//Integer b = ;
				toReturn2.put(labelsForVis.get(i));
			}
			json.put("labels", toReturn2);
		}
		String query = model.translateToSQL();
		//		json.put("prediction", model.getRanges(query));
		//		json.put("relevantAttributes", model.getRelevantAttributes(query));
		if(query.equals("") || query.equals("null") || query.equals(null) || query.equals("Empty") || query.endsWith("WHERE ") || query.endsWith("WHERE")){
			json.put("prediction", "");
		}else{
			json.put("prediction", model.getRanges(query));
		}
		if(query.equals("") || query.equals("null") || query.equals(null) || query.equals("Empty") || query.endsWith("WHERE ") || query.endsWith("WHERE")){
			json.put("relevantAttributes","");
		}else{
			json.put("relevantAttributes", model.getRelevantAttributes(query));
		}
		String query1 = fixQuery(query);
		if(!query1.equals("")&& !query1.endsWith("WHERE ") && !query1.endsWith("WHERE"))
			json.put("predictedQuery", query1);
		else
			json.put("predictedQuery", "");
		Double fmeasure = getAccuracy(query);
		json.put("predictedAccuracy", fmeasure);
		//add the previous keys for the samples and the labels
		JSONArray toReturn3 = new JSONArray();
		for(int i=0; i<samples.size(); i++){
			Tuple t = samples.get(i);
			Object[] a = new Object[2];
			a[0] = t.getKey();
			a[1] = labelsPrev.get(i);
			JSONArray array = new JSONArray(a);  
			toReturn3.put(array);
		}
		json.put("labelsFromBackEnd", toReturn3);
		return json;
	}

	private String fixQuery(String query) {
		if(query.equals("")|| query.endsWith("WHERE ") || query.endsWith("WHERE")) return "";
		StringBuilder q = new StringBuilder();
		q.append("SELECT "+Global.OBJECT_KEY+", ");
		for(int i=0; i<Global.visualAttributes.size(); i++){
			q.append(""+Global.visualAttributes.get(i).getName()+" , ");
		}
		q.append(query.substring(15));
		return q.toString();
	}

	private JSONObject serializeFirstIter(ArrayList<Tuple> nextSamples, HashMap<Long, double[]> points, ArrayList<Integer> labels) throws JSONException, SQLException {
		JSONArray toReturn = new JSONArray();
		for(int i=0; i<nextSamples.size(); i++){
			Tuple t = nextSamples.get(i);
			Object[] a = fixSample(t);
			JSONArray array = new JSONArray(a);
			toReturn.put(array);
		}
		JSONObject json = new JSONObject();
		json.put("samples", toReturn);
		//System.out.println("Samples to be sent: "+nextSamples.size());
		if(!Global.TABLE_NAME.equals("real_estate")){
			JSONArray gridPoints = new JSONArray();
			//System.out.println("Points to be sent: "+points.size());
			for(int i=0; i<points.keySet().size(); i++){
				double[] p = points.get((long)i);
				//System.out.println("This is point i: "+i+" == "+p.toString());
				JSONArray array = new JSONArray(p);  
				gridPoints.put(array);   //[[attr1,attr2],[],[]]
			}
			json.put("points", gridPoints);
		}
		//json.put("labels", "null"); //we have no labels in the first iteration so send dummy string
		if(labels!=null){
			JSONArray toReturn3 = new JSONArray();
			for(int i=0; i<nextSamples.size(); i++){
				Tuple t = nextSamples.get(i);
				Object[] a = new Object[2];
				a[0] = t.getKey();
				a[1] = labels.get(i);
				JSONArray array = new JSONArray(a);  
				toReturn3.put(array);
			}
			json.put("labelsFromBackEnd", toReturn3);
			System.out.println("These are the labels from backend: "+toReturn3.toString());
		}
		//send the truth query if it exists.
		if(Global.SCENARIO==4){
			json.put("truth", getRanges(Global.TARGET_QUERY));
			json.put("truth_shape", "rectangle");
		}
		return json;
	}

	private Object[] fixSample(Tuple t) throws SQLException {
		int size = 1+Global.visualAttributes.size()+t.getAttrValues().length;
		Object[] a = new Object[size];
		a[0] = t.getKey();
		Object[] b = visualAttributes(a[0]);
		for(int i=0; i<b.length; i++){
			a[i+1] = b[i];
		}
		//a[1] = b[0]; a[2] = b[1];
		for(int j=0; j<t.getAttrValues().length; j++)
			a[3+j] = t.getAttrValues()[j];
		return a;
	}

	private ArrayList<Integer> getLabels(String input) throws JSONException {
		JSONTokener tokener = new JSONTokener(input);
		JSONObject jo = new JSONObject(tokener);
		ArrayList<Integer> labels = new ArrayList<Integer>();
		JSONArray jsonArray = jo.getJSONArray("samples");  //TODO: I AM 99% SURE THIS IS GOING TO WORK
		if(jsonArray != null) { 
			int len = jsonArray.length();
			for (int i=0;i<len;i++){ 
				JSONArray a = jsonArray.getJSONArray(i);
				labels.add(Integer.parseInt(""+a.get(a.length()-1))); //TODO: NOT SURE IF THIS IS GOING TO WORK
			} 
		} 		
		return labels;
	}

	private ArrayList<Tuple> deserialize(String input) throws JSONException {
		JSONTokener tokener = new JSONTokener(input);
		JSONObject jo = new JSONObject(tokener);
		ArrayList<Tuple> samples = new ArrayList<Tuple>();
		JSONArray jsonArray = jo.getJSONArray("samples"); 
		if(jsonArray != null) { 
			int len = jsonArray.length();
			for (int i=0;i<len;i++){ 
				JSONArray a = jsonArray.getJSONArray(i);
				Object[] ar = new Object[a.length()-1];
				for (int j=0; j<a.length()-1; j++){  //a.length() -1 because in the last position you have the label
					ar[j] = a.get(j);
				} 
				Tuple t = new Tuple(null, ar); //TODO: check this. do you need the front-end to give you something else?
				samples.add(t);
			} 
		} 
		return samples;
	}

	private JSONObject serialize(ArrayList<Tuple> samples, ArrayList<Integer> labels) throws JSONException, SQLException {
		JSONArray toReturn = new JSONArray();
		for(int i=0; i<samples.size(); i++){
			Tuple t = samples.get(i);
			Object[] a = fixSample(t);
			JSONArray array = new JSONArray(a);  
			toReturn.put(array);
		}
		JSONObject json = new JSONObject();
		json.put("samples", toReturn);

		if(!Global.TABLE_NAME.equals("real_estate")){
			JSONArray toReturn2 = new JSONArray();
			for(int i=0; i<labels.size(); i++){
				//Integer b = ;
				toReturn2.put(labels.get(i));
			}
			json.put("labels", toReturn2);
		}
		String query = model.translateToSQL();
		if(query.equals("") || query.equals("null") || query.equals(null) || query.equals("Empty") || query.endsWith("WHERE ") || query.endsWith("WHERE")){
			json.put("prediction", "");
		}else{
			json.put("prediction", model.getRanges(query));
		}
		if(query.equals("") || query.equals("null") || query.equals(null) || query.equals("Empty") || query.endsWith("WHERE ") || query.endsWith("WHERE")){
			json.put("relevantAttributes","");
		}else{
			json.put("relevantAttributes", model.getRelevantAttributes(query));
		}
		String query1 = fixQuery(query);
		if(!query1.equals("")&& !query1.endsWith("WHERE ") && !query1.endsWith("WHERE"))
			json.put("predictedQuery", query1);
		else
			json.put("predictedQuery", "");
		return json;
	}

	private Object[] visualAttributes(Object key) throws SQLException{
		StringBuilder query = new StringBuilder();
		query.append("SELECT ");
		for(int i=0; i<Global.visualAttributes.size(); i++){
			if(i==Global.visualAttributes.size()-1)
				query.append(" "+Global.visualAttributes.get(i).getName()+" ");
			else
				query.append(""+Global.visualAttributes.get(i).getName()+" , ");
		}
		query.append(" FROM "+Global.TABLE_NAME+" WHERE "+Global.OBJECT_KEY+" = "+key);
		Connection connection = DBConnection.getConnection();
		Statement statement = connection.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);
		ResultSet rs = statement.executeQuery(query.toString());
		Object[] values = new Object[Global.visualAttributes.size()];
		while(rs.next()){
			for(int m=1; m<=Global.visualAttributes.size(); m++){
				values[m-1] = rs.getString(m); 
			}
		}
		return values;
	}

	private ArrayList<Tuple> checkSamples(ArrayList<Tuple> samples) {
		ArrayList<Tuple> newSamples = new ArrayList<Tuple>();
		for(int i=0; i<samples.size(); i++){
			if(!allSamples.contains(samples.get(i)) && !newSamples.contains(samples.get(i))){
				newSamples.add(samples.get(i));
			}
		}
		return newSamples;
	}
	
	private double getAccuracy(String predictedQuery){
		if(predictedQuery.equals("") || predictedQuery.equals("null") || predictedQuery.equals(null) || predictedQuery.equals("Empty") || predictedQuery.endsWith("WHERE ") || predictedQuery.endsWith("WHERE"))return 0.0;
		StringBuilder q = new StringBuilder();
		q.append("SELECT "+Global.OBJECT_KEY+", ");
		q.append(predictedQuery.substring(15));
		ArrayList<Tuple> samples = new ArrayList<Tuple>();
		try {
			samples.addAll(runQuery(q.toString()));
		} catch (Exception e) {
			//e.printStackTrace();
		}
		EvaluateModel d = new EvaluateModel(samples);
		double rounded = (double) Math.round(d.fmeasure() * 100) / 100;
		return rounded;
	}
	
	/**Sends the query to the database and returns an arraylist with the tuples
	 * that the query returned.
	 * 
	 * @param query  the query to send to the db
	 */
	public ArrayList<Tuple> runQuery(String query) throws SQLException, IOException {
		ArrayList<Tuple> toReturn = new ArrayList<Tuple>();
		Connection connection = DBConnection.getConnection();
		Statement statement = connection.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);
		ResultSet rs = statement.executeQuery(query);
		while(rs.next()){
			Object key = rs.getString(1);
			Object[] attrValues = new Object[Global.attributes.size()];
			for(int m=1; m<=Global.attributes.size(); m++){
				attrValues[m-1] = rs.getString(m+1); 
			}
			Tuple tuple = new Tuple(key, attrValues);
			toReturn.add(tuple);
		}
		return toReturn;
	}
	
	public JSONArray getRanges(String query) throws JSONException{ 
		System.out.println("Started Ranges");
		if(query.equals("") || query.equals("null") || query.equals(null) || query.equals("Empty") || query.endsWith("WHERE ") || query.endsWith("WHERE"))return null;
		//JSONObject obj = new JSONObject();
		JSONArray toReturn = new JSONArray();
		Scanner s = new Scanner(query);
		s.useDelimiter("WHERE");
		s.next();//skip first part
		String wc = s.next();
		Scanner s1 = new Scanner(wc);
		s1.useDelimiter("OR");
		while(s1.hasNext()){ //for each different area
			String area = s1.next();
			JSONObject attr = new JSONObject();
			//JSONArray theArea = new JSONArray();
			for(int i=0; i<Global.attributes.size(); i++){
				Object[] bounds = new Object[2];
				bounds[0] = Global.attributes.get(i).getMinValue();
				bounds[1] = Global.attributes.get(i).getMaxValue();
				if(area.contains(Global.attributes.get(i).getName()+" >=") || area.contains(Global.attributes.get(i).getName()+" > ")){
					String ar = area;
					ar = ar.replaceAll("[()]", ""); //supposed to remove all parenthesis
					String[] a = ar.split("\\s+");
					for(int j=0; j<a.length; j++){
						if(a[j].equals(Global.attributes.get(i).getName()) && (a[j+1].equals(">=") || a[j+1].equals(">")))
							bounds[0] = a[j+2];
					}
				}
				if(area.contains(Global.attributes.get(i).getName()+" <=") || area.contains(Global.attributes.get(i).getName()+" < ")){
					String ar = area;
					ar = ar.replaceAll("[()]", ""); //supposed to remove all parenthesis
					String[] a = ar.split("\\s+");
					for(int j=0; j<a.length; j++){
						if(a[j].equals(Global.attributes.get(i).getName()) && (a[j+1].equals("<=") || a[j+1].equals("<")))
							bounds[1] = a[j+2];
					}
				}
				JSONArray theBound = new JSONArray(bounds);
				attr.put(Global.attributes.get(i).getName(), theBound);
			}
			//theArea.put(attr);
			toReturn.put(attr);
		}
		//obj.put("predictedArea", toReturn);
		System.out.println("Returning Ranges");
		return toReturn;
	}
}