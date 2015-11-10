package Server;

import java.io.BufferedReader;
import java.io.FileReader;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;


//import mainPackage.DTUserModel;
import mainPackage.LinearExploration;
//import mainPackage.State;
import mainPackage.Tuple;
import mainPackage.UserModel;
//import mainPackage.Label;


import org.json.JSONObject;
import org.json.JSONTokener;

import configuration.Constants;
import configuration.DBConnection;
import configuration.Global;

/**The main driver class for the entire project.
 * Gets in as an argument the JSON file that contains 
 * all the configuration variables for the algorithm, 
 * the database etc.
 * 
 * @author kiki
 *
 */
public class Driver {
	private LinearExploration exploration;
	//private int totalSamples;
	private UserModel model;
	int allRelevantFromExplore = 0;

	//private Label lb = new Label();
	//private HashMap<Integer, State> stateMap = new HashMap<Integer, State> ();
	//private int iterNum = 0;
	//private ArrayList<Tuple> interestingFromExplore = new ArrayList<Tuple>();
	
	public Driver(String configFile, String configFE) throws Exception{
		System.out.println("Creating driver...");
		System.out.println("Here is the configuration:"+configFE);
		String configFileName = configFile;
		
		JSONTokener tokener2 = new JSONTokener(configFE);
		JSONObject configFrontEnd = new JSONObject(tokener2);
		
		JSONObject demo = configFrontEnd.getJSONObject("demo"); //contains scenario and target query
		JSONObject q = configFrontEnd.getJSONObject("query");

		String sc = demo.getString("scenario");
		if(sc.contains("1")){
			configFileName = "config.json";
		}
		if(sc.contains("2")){
			configFileName = "configScenario2.json";
		}
		if(sc.contains("3")){
			String table = q.getString("tableName");
			if(table.equals("sdss_random_sample"))
				configFileName = "configScenario3sdss.json";
			else
				configFileName = "configScenario3.json";
		}
		if(sc.contains("4")){
			String targetQuery = demo.getString("target_query");
			if(targetQuery.contains("1")){
				configFileName = "configScenario4query1.json";
			}else if(targetQuery.contains("2")){
				configFileName = "configScenario4query2.json";
			}else{
				configFileName = "configScenario4query3.json";
			}
			
		}
		
		BufferedReader br = new BufferedReader(new FileReader(configFileName));
		JSONTokener tokener = new JSONTokener(br);
		JSONObject config = new JSONObject(tokener);

		//connect to the database
		DBConnection cm = new DBConnection();
		try {
			cm.connect(configFrontEnd);
		} catch (SQLException e) {
			e.printStackTrace();
		}

		//create the global variables based on the configuration file
		new Global(config, configFrontEnd);
		System.out.println("Here");

		//linear exploration performs all the three phases of a linear exploration
		exploration = new LinearExploration();

		//totalSamples = 0;
		model = null;
		//lb = new Label();

		//stateMap = new HashMap<Integer, State> ();
		//iterNum = 0;
		
		System.out.println("Created driver...");
	}
	
	
	

//	public void driver(String configFile, String configFE) throws Exception{
//		//give the configuration file name as input argument
//		
//		//long totalTime = 0;
//
//		//		// TODO simply delete them after use. ==========================
//		//		File file = new File("./psfmag_i.csv");
//		//		if (!file.exists()) {
//		//			file.createNewFile();
//		//		}
//		//		FileWriter fw = new FileWriter(file);
//		//		BufferedWriter bw = new BufferedWriter(fw);
//
//		//============================================================== 
//		//while we still have samples to show to the user
//		while(totalSamples<Global.MAX_SAMPLES){
//			//use cmd controller to control the progress
//			if (Global.STEP_BY_STEP) {
//				int currentIter = Global.CMDCONTROLLER.readInput(stateMap, iterNum);
//				if (Global.CMDCONTROLLER.isExit()) break;
//
//				if (currentIter>-1) {
//
//					State state = stateMap.get(currentIter);
//
//					exploration = state.getExploration();
//					totalSamples = state.getTotalSamples();
//					//model = state.getUserModel();
//					//model = new DTUserModel();
//					//((DTUserModel) model).buildTree();
//					iterNum = currentIter + 1;
//				} else if(currentIter==-2) {
//					model = new DTUserModel();
//					((DTUserModel) model).buildTree();
//				}
//			}
//			//System.out.println("Iteration: " + iterNum);		//TODO delete it
//			//bw.append(Integer.toString(iterNum));
//			//bw.append(", ");
//			//System.out.println("Going to explore");
//			//perform the exploration steps and get back samples to present to the user.
//
//			//long t1 = System.currentTimeMillis();
//			ArrayList<Tuple> samples = exploration.explore(model);
//			//if (samples.size() > 0)
//			//System.out.println("samples: " + samples.get(0) + ", " + samples.get(samples.size()-1));
//			//long delta = System.currentTimeMillis()-t1;
//
//			//totalTime += delta;
//
//			//System.out.println("Time spent is " + totalTime + " milliseconds");
//			//bw.append(Long.toString(totalTime));
//			//bw.append(", ");
//
//			totalSamples += samples.size();
//			//System.out.println("Samples number: " + totalSamples);	//TODO delete it
//			//bw.append(Integer.toString(totalSamples));
//			//bw.append(", ");
//
//			//get labels(relevant/non-relevant) from each of the samples you retrieved
//			//System.out.println("Going to get labels");
//			ArrayList<Integer> labels = lb.getLabels(samples);
//
//			//build the decision tree based on the labeled samples you have and get back the user model
//			//System.out.println("Going to classify and build the tree");
//			model = exploration.classify(samples, labels);
//
//			if(Global.DRIVER_VERSION == 0) {
//				State currentState = new State();
//				currentState.setOffset(totalSamples+6);	
//				currentState.setTotalSamples(totalSamples);
//				//currentState.setUserModel(model.tree);
//				currentState.setExploration(exploration);
//				stateMap.put(iterNum, currentState);
//			}
//
//			Global.CMDCONTROLLER.updateModel(model);
//
//			//			if (Global.SHOW_STATUS_EVERY_ITERATION) {
//			//				EvaluateModel evaluator = Global.CMDCONTROLLER.printStatus();
//			//				//TODO delete all
//			//				bw.append(Double.toString(evaluator.precision()));
//			//				bw.append(", ");
//			//				bw.append(Double.toString(evaluator.recall()));
//			//				bw.append(", ");
//			//				bw.append(Double.toString(evaluator.fmeasure()));
//			//			}
//			iterNum++;
//			//	bw.append('\n');				//TODO of course delete the two
//			System.out.println();
//		}
//	}


	public UserModel buildModel(ArrayList<Tuple> labeledSamples, ArrayList<Integer> labels) {
		model = exploration.classify(labeledSamples, labels);
		return model;
	}
	
	public ArrayList<Tuple> explore(UserModel model, int relevantFromExplore) {
		return exploration.explore(model, relevantFromExplore);
	}


	public ArrayList<Integer> classifyGridPoints(UserModel model, HashMap<Long, double[]> points) throws Exception {
		ArrayList<Integer> toReturn = new ArrayList<Integer>();
		for(int i=0; i<points.keySet().size(); i++){
			double[] a = points.get((long)i);
			int l = model.labelObject(a);
			//System.out.println("This is the label: "+l);
			toReturn.add(l);
		}
		return toReturn;
	}


	public int getInterestingFromExplore(ArrayList<Tuple> labeledSamples,
			ArrayList<Integer> labels) {
		ArrayList<Tuple> a = exploration.getAllExploreSamples();
		
		for(int i=0; i<labels.size(); i++){
			if(labels.get(i) == Constants.RELEVANT_CLASS){
				for(int j=0; j<a.size(); j++)
					if(a.get(j).isEqual(labeledSamples.get(i))){
						allRelevantFromExplore++;
						break;
					}
			}
		}
		return allRelevantFromExplore;
	}
	
}
