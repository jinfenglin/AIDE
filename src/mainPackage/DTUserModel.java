package mainPackage;
//import weka.classifiers.Classifier;
import weka.classifiers.Classifier;
import weka.classifiers.meta.FilteredClassifier;
import weka.classifiers.trees.J48;
import weka.core.DenseInstance;
//import weka.classifiers.trees.SimpleCart;
//import weka.core.Instance;
import weka.core.Instances;
//import weka.core.Attribute;
//import weka.gui.treevisualizer.PlaceNode2;
//import weka.gui.treevisualizer.TreeVisualizer;









//import java.awt.BorderLayout;
import java.io.BufferedReader;
import java.io.FileReader;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Scanner;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import configuration.Constants;
import configuration.DBConnection;
import configuration.Global;



public class DTUserModel implements UserModel{

	Instances trainingSamples ;

	//public static SimpleCart tree;
	public static J48 tree;

	/**Builds a desicion tree classifier using all the samples labeled by the user so far.
	 * These samples are stored in a training arff file.
	 * 
	 * @throws Exception
	 */
	public void buildTree() throws Exception{

		String filePath = null;
		if(Global.DRIVER_VERSION == 0) {
			filePath = Global.TRAINING_FILE_NAME;
		} else {
			filePath = Global.SHADOW_TRAINING_FILE_NAME;
		}

		BufferedReader reader = new BufferedReader(new FileReader(filePath));
		trainingSamples = new Instances(reader);
		reader.close();
		trainingSamples.setClassIndex(trainingSamples.numAttributes() - 1);

		//Use SimpleCart here
		//tree = new weka.classifiers.trees.SimpleCart();
		tree = new weka.classifiers.trees.J48();

		//setting options for the algorithm
		String[] options = new String[1];
		options[0] = "-U";            // unpruned tree
		tree.setOptions(options);     // set the options

		//building the classifier
		tree.buildClassifier(trainingSamples);   // build classifier


		//IN CASE WE WANT TO DRAW THE TREE:
		//to get the tree nodes and splits
		//tree.toString();
		//set options for CART
		//scheme.setOptions(weka.core.Utils.splitOptions("-C 1.0 -L 0.0010 -P 1.0E-12 -N 0 -V -1 -W 1 -K \"weka.classifiers.functions.supportVector.PolyKernel -C 250007 -E 1.0\""));
		//evaluate the model.. this data should be coming from somewhere
		//Evaluation eval = new Evaluation(trainingSamples);
		//eval.crossValidateModel(tree, trainingSamples, 2, new Random(1));

		//System.out.println(eval.toSummaryString("\nResults\n======\n", false));
		//
		//		final javax.swing.JFrame jf = 
		//				new javax.swing.JFrame("Weka Classifier Tree Visualizer: J48");
		//		jf.setSize(700,700);
		//		jf.getContentPane().setLayout(new BorderLayout());
		//		TreeVisualizer tv = new TreeVisualizer(null,
		//				tree.graph(),
		//				new PlaceNode2());
		//		jf.getContentPane().add(tv, BorderLayout.CENTER);
		//		jf.addWindowListener(new java.awt.event.WindowAdapter() {
		//			public void windowClosing(java.awt.event.WindowEvent e) {
		//				jf.dispose();
		//			}
		//		});
		//
		//		jf.setVisible(true);
		//		tv.fitToScreen();
	}

	public static J48 getTree() {
		return tree;
	}

	//	public static SimpleCart getTree() {
	//		return tree;
	//	}

	//	public static void setTree(J48 tree) {
	//		return tree;
	//	}


	/**Translate the user model to a SQL query.
	 * 
	 * @return The SQL query.
	 */
	public String translateToSQL(){
		System.out.println(tree.toString());
		String dt = tree.toString();
		Boolean emptyTree = false;

		System.out.println("[TESTING CREATE QUERY] testing started.");

		//System.out.println("This is the tree: "+tree);
		String theQuery = "SELECT DISTINCT ";

		if(!dt.contains(": 1")){
			emptyTree = true;
		}

		for(int i=0; i<Global.attributes.size(); i++){
			if(i==Global.attributes.size()-1)
				theQuery += ""+Global.attributes.get(i).getName()+" "; 
			else
				theQuery += ""+Global.attributes.get(i).getName()+" , "; 
		}

		theQuery+= "FROM " +Global.TABLE_NAME+ " WHERE ";

		String before = theQuery;
		Scanner scanner = new Scanner(dt);

		for(int i=0; i<3; i++){
			scanner.nextLine();
		}
		ArrayList<String> theLines = new ArrayList<String>();
		while (scanner.hasNextLine()) {
			theLines.add(scanner.nextLine());
		}
		for(int i=0; i<theLines.size()-2; i++){
			String line = theLines.get(i);
			if(line.contains(": 1")){
				theQuery += "( ";
				if(line.contains("|")){
					theQuery += keepProper(line);
					int times = countOc(line);
					for(int j = i-1; j>-1 ; j--){
						String prLine = theLines.get(j);
						int prTimes = countOc(prLine);
						if(prTimes == times-1){
							theQuery += " AND " +keepProper(prLine);
							times = prTimes;
						}
					}
				}else{
					theQuery += keepProper(line)+" ";
				}
				theQuery += ") OR ";
			}
		}
		if(theQuery.endsWith("OR ")){
			theQuery = theQuery.substring(0, theQuery.length()-3) + " ";
		}

		String after = theQuery;
		if (!before.equals(after))
			Global.DO_Object = false;
		System.out.println("Query that we guessed: "+theQuery);

		if(!emptyTree)
			return theQuery;
		else
			return "";
	}

	/**Returns *ONLY* the relevant attributes the query predicted.
	 * 
	 * @param the predicted query
	 * @return
	 */
	public JSONArray getRelevantAttributes(String query){
		if(query.equals("") || query.equals("null") || query.equals(null) || query.equals("Empty") || query.endsWith("WHERE "))return null;
		JSONArray a = new JSONArray();
		ArrayList<String> relevantAttributes = new ArrayList<String>();
		Scanner s = new Scanner(query);
		s.useDelimiter("WHERE");
		s.next(); 
		String leftPart = s.next();
		for(int i=0; i<Global.attributes.size(); i++){
			if(leftPart.contains(" "+Global.attributes.get(i).getName()+" ") || leftPart.contains(Global.attributes.get(i).getName()+" ")){
				relevantAttributes.add(Global.attributes.get(i).getName());
			}
		}
		a =  new JSONArray(relevantAttributes);
		return a;
	}

	/**This method runs the predicted query and 
	 * returns all of the samples in the predicted area.
	 * 
	 * @param query
	 * @return
	 * @throws SQLException
	 */
	public ArrayList<Tuple> getRelevantTuples(String query) throws SQLException{
		ArrayList<Tuple> relevantSamples = new ArrayList<Tuple>();
		Connection connection = DBConnection.getConnection();
		Statement statement = connection.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);
		ResultSet rs = statement.executeQuery(query);
		while(rs.next()){
			Object[] attrValues = new Object[Global.attributes.size()];
			for(int m=1; m<=Global.attributes.size(); m++){
				attrValues[m-1] = rs.getString(m); 
			}
			Tuple tuple = new Tuple(null, attrValues); //TODO: DO I NEED TO RETURN THE KEY FOR THE PREDICTED RELEVANT SAMPLES?
			relevantSamples.add(tuple);
		}
		return relevantSamples;
	}


	/**This method returns the misclassified samples in our training sample set 
	 * (misclassified based on the current user model we have built)
	 * 
	 * @return an arrayList that contains the misclassified samples
	 * @throws Exception
	 */
	public ArrayList<Tuple> getMissclassified() throws Exception{
		ArrayList<Tuple> toReturn = new ArrayList<Tuple>();
		Instances data = trainingSamples;
		data.setClassIndex(data.numAttributes() - 1);
		Classifier cls = new J48();
		cls.buildClassifier(data);
		FilteredClassifier fc = new FilteredClassifier();
		fc.setClassifier(cls);
		// train and make predictions
		fc.buildClassifier(data);


		for (int i = 0; i < data.numInstances(); i++) {
			double pred = fc.classifyInstance(data.instance(i));

			String actual = data.classAttribute().value((int) data.instance(i).classValue());
			String predicted = data.classAttribute().value((int) pred);
			DenseInstance a = new DenseInstance(data.instance(i)); //TODO: CHANGED SMALL THING IN HERE : from: Instance a = new Instance(data.instance(i));
			a.deleteAttributeAt(data.numAttributes()-1);
			Object[] attrValues = new Object[Global.attributes.size()];
			for(int j=0; j<attrValues.length; j++){
				attrValues[j] = a.value(j);
			}
			Tuple t = new Tuple(null, attrValues);
			//System.out.println("Actual class: "+actual+" predicted class: "+predicted);
			if(!actual.equals(predicted)){//Actual class != predicted class for tuple t
				//System.out.println("In here!");
				if(!toReturn.contains(a.toString())){
					if(actual.equals(""+Constants.RELEVANT_CLASS)){//only return the samples who are actually relevant 
						//but misclassified as irrelevant
						//System.out.println("Going to return this misclassified sample");
						toReturn.add(t);
					}
				}
			}
		}
		return toReturn;
	}

	//helper function for translating the query
	private String keepProper(String line) {
		line = line.replace("|","");
		Scanner s = new Scanner(line);
		s.useDelimiter(" +");
		String attribute = s.next();
		String operator = s.next();
		String value = s.next();
		Scanner sv = new Scanner(value);
		sv.useDelimiter(":");
		value = sv.next();
		String toReturn = " "+attribute+" "+operator+" "+value+" ";
		return toReturn;
	}

	//helper function for translating the query
	private int countOc(String s){
		int count = 0;
		for(int i =0; i < s.length(); i++)
			if(s.charAt(i) == '|')
				count++;
		return count;
	}

	//Cloned copy can be safely stored in somewhere else, by Kemi
	public Object clone() {  
		UserModel obj = null;  
		try{  
			obj = (UserModel)super.clone();  
		}catch(CloneNotSupportedException e) {  
			e.printStackTrace();  
		}  
		return obj;  
	}  


	public Integer labelObject(double[] o) throws Exception{
		Integer b;
		DenseInstance d = new DenseInstance(1.0, o);
		//System.out.println(o.toString());

		d.setDataset(trainingSamples);
		//for(int i=0; i<a.numValues(); i++){
		//	System.out.println("Hi");
		//}
		//System.out.println(a.isMissing(0)+" "+a.isMissing(1))
		//		for(int i=0; i<trainingSamples.numInstances(); i++){
		//			System.out.println(trainingSamples.get(i).toString());
		//		}
		double predicted = tree.classifyInstance(d);
		//System.out.println("Predicted class : "+predicted);
		if(predicted == 0){									//TODO: if there is -1 here there is a bug. The tree predicts 0 for non-relevant
			b = Constants.IRRELEVANT_CLASS;
		}else{ 
			b = Constants.RELEVANT_CLASS;
		}
		//trainingSamples.delete(lastInstance.);
		return b;
	}

	//	private Boolean treeIsEmpty() throws Exception{
	//		DTUserModel bt = new DTUserModel();
	//		bt.buildTree(); 
	//		String tree = DTUserModel.getTree().toString();
	//		if(!tree.contains(": 1")){
	//			return true;
	//		}else{
	//			return false;
	//		}
	//	}

	//	public String getQueryAsNotExists(String query){
	//	String oppositeQuery = "";
	//
	//	if(query.equals("Empty") || query.equals("")){
	//		return "";
	//	}
	//
	//	Scanner s = new Scanner(query);
	//	s.useDelimiter("WHERE");
	//	s.next();
	//	oppositeQuery += " AND NOT( ";
	//	oppositeQuery += s.next();
	//	oppositeQuery += " )";
	//
	//	return oppositeQuery;
	//}


	@SuppressWarnings("resource")
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
				if(area.contains(Global.attributes.get(i).getName()+" >=")){
					String ar = area;
					ar = ar.replaceAll("[()]", ""); //supposed to remove all parenthesis
					String[] a = ar.split("\\s+");
					for(int j=0; j<a.length; j++){
						if(a[j].equals(Global.attributes.get(i).getName()) && (a[j+1].equals(">=")))
							bounds[0] = a[j+2];
					}
				}
				if(area.contains(Global.attributes.get(i).getName()+" > ")){
					ArrayList<Object> dom = Global.attributes.get(i).getDomain();
					String ar = area;
					ar = ar.replaceAll("[()]", ""); //supposed to remove all parenthesis
					String[] a = ar.split("\\s+");
					for(int j=0; j<a.length; j++){
						if(a[j].equals(Global.attributes.get(i).getName()) && (a[j+1].equals(">"))){
							int index = dom.indexOf(a[j+2]);
							double theNum = Double.parseDouble(a[j+2]);
							theNum = Math.round(theNum*100.0)/100.0;
							if(index == -1){ //exact number does not exist in the domain
								for(int k=0; k<dom.size(); k++){
									double d = Double.parseDouble(""+dom.get(k));
									//System.out.println(d);
									d = Math.round(d*100.0)/100.0;
									if(theNum == d){
										if(k!=dom.size()-1){
											bounds[0] = dom.get(k+1);
											break;
										}
									}
								}
							}else if(index!=dom.size()-1){
								bounds[0] = dom.get(index+1);
							}else{
								bounds[0] = a[j+2];
							}
						}
						//bounds[0] = a[j+2];
					}
				}
				if(area.contains(Global.attributes.get(i).getName()+" <=")){
					String ar = area;
					ar = ar.replaceAll("[()]", ""); //supposed to remove all parenthesis
					String[] a = ar.split("\\s+");
					for(int j=0; j<a.length; j++){
						if(a[j].equals(Global.attributes.get(i).getName()) && (a[j+1].equals("<=")))
							bounds[1] = a[j+2];
					}
				}
				if(area.contains(Global.attributes.get(i).getName()+" < ")){
					ArrayList<Object> dom = Global.attributes.get(i).getDomain();
					String ar = area;
					ar = ar.replaceAll("[()]", ""); //supposed to remove all parenthesis
					String[] a = ar.split("\\s+");
					for(int j=0; j<a.length; j++){
						if(a[j].equals(Global.attributes.get(i).getName()) && (a[j+1].equals("<"))){
							int index = dom.indexOf(a[j+2]);
							double theNum = Double.parseDouble(a[j+2]);
							theNum = Math.round(theNum*100.0)/100.0;
							if(index == -1){ //exact number does not exist in the domain
								for(int k=0; k<dom.size(); k++){
									double d = Double.parseDouble(""+dom.get(k));
									d = Math.round(d*100.0)/100.0;
								//	System.out.println(d);
									if(theNum == d){
										if(k!=0){
											bounds[1] = dom.get(k-1);
											break;
										}
									}
								}
							}else if(index!=0){
								bounds[1] = dom.get(index-1);
							}else{
								bounds[1] = a[j+2];
							}
						}
						//bounds[1] = a[j+2];
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
