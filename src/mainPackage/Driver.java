package mainPackage;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;

import metrics.EvaluateModel;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;

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
	static ArrayList<Tuple> allSamples = new ArrayList<Tuple>();

	public static void main(String args[]) throws Exception{
		//give the configuration file name as input argument
		String configFileName = args[0];
		String configFromFrontEnd = args[1];
		BufferedReader br = new BufferedReader(new FileReader(configFileName));
		BufferedReader br2 = new BufferedReader(new FileReader(configFromFrontEnd));
		JSONTokener tokener = new JSONTokener(br);
		JSONTokener tokener2 = new JSONTokener(br2);
		JSONObject config = new JSONObject(tokener);
		JSONObject configFrontEnd = new JSONObject(tokener2);

		//connect to the database
		DBConnection cm = new DBConnection();
		try {
			cm.connect(configFrontEnd);
		} catch (SQLException e) {
			e.printStackTrace();
		}

		//create the global variables based on the configuration file
		new Global(config, configFrontEnd);

		//linear exploration performs all the three phases of a linear exploration
		LinearExploration exploration = new LinearExploration();

		int totalSamples = 0;
		UserModel model = null;
		Label lb = new Label();

		HashMap<Integer, State> stateMap = new HashMap<Integer, State> ();
		int iterNum = 0;
		long totalTime = 0;

		// TODO simply delete them after use. ==========================
		File file = new File("./psfmag_i.csv");
		if (!file.exists()) {
			file.createNewFile();
		}
		FileWriter fw = new FileWriter(file);
		BufferedWriter bw = new BufferedWriter(fw);

		//============================================================== 
		//while we still have samples to show to the user
		while(totalSamples<Global.MAX_SAMPLES){
			//use cmd controller to control the progress
			if (Global.STEP_BY_STEP) {
				int currentIter = Global.CMDCONTROLLER.readInput(stateMap, iterNum);
				if (Global.CMDCONTROLLER.isExit()) break;

				if (currentIter>-1) {

					State state = stateMap.get(currentIter);

					exploration = state.getExploration();
					totalSamples = state.getTotalSamples();
					//model = state.getUserModel();
					//model = new DTUserModel();
					//((DTUserModel) model).buildTree();
					iterNum = currentIter + 1;
				} else if(currentIter==-2) {
					model = new DTUserModel();
					((DTUserModel) model).buildTree();
				}
			}


			//translate model
			if(model!=null){
				String query = model.translateToSQL();
				JSONArray q = model.getRanges(query);
				JSONObject b = new JSONObject();
				b.put("prediction", q);
				if(q!=null)
					System.out.println("------------------------------------"+b.toString());
			}
			System.out.println("Iteration: " + iterNum);		//TODO delete it
			bw.append(Integer.toString(iterNum));
			bw.append(", ");
			//System.out.println("Going to explore");
			//perform the exploration steps and get back samples to present to the user.

			long t1 = System.currentTimeMillis();
			ArrayList<Tuple> samples = new ArrayList<Tuple>();
			while(samples.size()==0){
				samples = exploration.explore(model, 0); //0 does not matter if we are not running in the demo mode
				//TODO add more samples here
				samples = checkSamples(samples);
			}
			//if (samples.size() > 0)
			//System.out.println("samples: " + samples.get(0) + ", " + samples.get(samples.size()-1));
			long delta = System.currentTimeMillis()-t1;

			totalTime += delta;

			System.out.println("Time spent is " + totalTime + " milliseconds");
			bw.append(Long.toString(totalTime));
			bw.append(", ");

			totalSamples += samples.size();
			System.out.println("Samples number: " + totalSamples);	//TODO delete it
			bw.append(Integer.toString(totalSamples));
			bw.append(", ");

			//get labels(relevant/non-relevant) from each of the samples you retrieved
			//System.out.println("Going to get labels");
			ArrayList<Integer> labels = lb.getLabels(samples);

			//build the decision tree based on the labeled samples you have and get back the user model
			//System.out.println("Going to classify and build the tree");
			model = exploration.classify(samples, labels);

			if(Global.DRIVER_VERSION == 0) {
				State currentState = new State();
				currentState.setOffset(totalSamples+6);	
				currentState.setTotalSamples(totalSamples);
				//currentState.setUserModel(model.tree);
				currentState.setExploration(exploration);
				stateMap.put(iterNum, currentState);
			}

			Global.CMDCONTROLLER.updateModel(model);

			if (Global.SHOW_STATUS_EVERY_ITERATION) {
				EvaluateModel evaluator = Global.CMDCONTROLLER.printStatus();
				//TODO delete all
				bw.append(Double.toString(evaluator.precision()));
				bw.append(", ");
				bw.append(Double.toString(evaluator.recall()));
				bw.append(", ");
				bw.append(Double.toString(evaluator.fmeasure()));
			}
			iterNum++;
			bw.append('\n');				//TODO of course delete the two
			System.out.println();
		}
		bw.close();
	}
	
	private static ArrayList<Tuple> checkSamples(ArrayList<Tuple> samples) {
		ArrayList<Tuple> newSamples = new ArrayList<Tuple>();
		for(int i=0; i<samples.size(); i++){
			if(!allSamples.contains(samples.get(i)) && !newSamples.contains(samples.get(i))){
				newSamples.add(samples.get(i));
			}
		}
		return newSamples;
	}
}
