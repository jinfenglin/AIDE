package mainPackage;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.OutputStream;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;

import metrics.EvaluateModel;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONTokener;

import recommandation.Recommander;
import recommandation.Userbased;
import recommandation.Hybird;
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
	public static void PrintArray(ArrayList<Tuple> al){
		for(Tuple tp:al)
			System.out.print(tp.getKey()+" ");
		System.out.print("\n");
	}
	public static boolean PositiveLabelInArray(ArrayList<Integer> list){
		for(int label:list){
			if(label==1)
				return true;
		}
		return false;
	}
	public static void main(String args[]) throws Exception{
		//give the configuration file name as input argument
		String configFileName = args[0];
		String configFromFrontEnd = args[1];
		String recommandOption= args[2];
		System.out.println(configFileName);
		System.out.println(configFromFrontEnd);
		System.out.println(recommandOption);
		BufferedReader br = new BufferedReader(new FileReader(configFileName));
		BufferedReader br2 = new BufferedReader(new FileReader(configFromFrontEnd));
		JSONTokener tokener = new JSONTokener(br);
		JSONTokener tokener2 = new JSONTokener(br2);
		JSONObject config = new JSONObject(tokener);
		JSONObject configFrontEnd = new JSONObject(tokener2);
		boolean is_trainning = false;
		if(args[3].equals("train")){
			is_trainning=true;
			System.out.println("training model...");
		}
		
		
		//connect to the database
		DBConnection cm = new DBConnection();
		try {
			cm.connect(configFrontEnd);
		} catch (SQLException e) {
			e.printStackTrace();
		}

		//Evaluation output
		FileWriter fw_log;
		if(recommandOption.equals("False")){
			fw_log=new FileWriter("./log/normal_log.csv");	
		}else{
			fw_log=new FileWriter("./log/recommand_log.csv");
		}
		BufferedWriter bw_log=new BufferedWriter(fw_log);
		//create the global variables based on the configuration file
		new Global(config, configFrontEnd, true);
		
		File file = new File("./psfmag_i.csv");
		if (!file.exists()) {
			file.createNewFile();
		}
		FileWriter fw = new FileWriter(file);
		BufferedWriter bw = new BufferedWriter(fw);
		// Kemi
		File file_pres = new File("./record.csv");
		if(is_trainning){
			file_pres.delete();
		}
		if (!file_pres.exists()) {
			file_pres.createNewFile();
		}
		BufferedWriter bw_pres=null;
		if(is_trainning){
			FileWriter fw_pres = new FileWriter(file_pres.getAbsoluteFile(),true);
			bw_pres= new BufferedWriter(fw_pres);
		}
		
		
		// kemi - done
		// Kemi
		
		ArrayList<DTUserModel> ModelCollection=new ArrayList<DTUserModel>();
		for (int the_idx=0; the_idx<Math.max(Global.PREVIOUS_QUERIES.length,1); the_idx++) {
			if (is_trainning) {
				Global.execute(config, configFrontEnd, the_idx);
				//bw_pres.append("-----------New User-----------\n");
				}
			// Kemi
			//linear exploration performs all the three phases of a linear exploration
			Global.RECOMMENDATION=Global.DISABLED;
			LinearExploration exploration = new LinearExploration();
			Recommander recommand = null;
			if(recommandOption.equals("Userbased")){
				recommand=new Userbased();
			}else if(recommandOption.equals("Hybird")){
				recommand= new Hybird();
			}
			exploration.recommand = recommand;


			int totalSamples = 0;
			UserModel model = null;
			Label lb = new Label();
			
			HashMap<Integer, State> stateMap = new HashMap<Integer, State> ();
			int iterNum = 0;
			long totalTime = 0;
			// TODO simply delete them after use. ==========================
			
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
					samples = exploration.explore(model, 0); 
					samples=checkSamples(samples);
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

				// Kemi
				if (is_trainning) {
					for (int idx=0; idx<samples.size(); idx++)
					{
						//bw_pres.write(Integer.toString(the_idx) + "," + samples.get(idx).getKey() + "," +labels.get(idx)+","+samples.get(idx).toString()+ "\n");
						bw_pres.append(Integer.toString(the_idx) + "," + samples.get(idx).getKey() + "," +labels.get(idx)+","+samples.get(idx).toString()+ "\n");
					}	
				}
				// Kemi Done
			
				if (Global.SHOW_STATUS_EVERY_ITERATION) {
					EvaluateModel evaluator = Global.CMDCONTROLLER.printStatus();
					//TODO delete all
					bw.append(Double.toString(evaluator.precision()));
					bw.append(", ");
					bw.append(Double.toString(evaluator.recall()));
					bw.append(", ");
					bw.append(Double.toString(evaluator.fmeasure()));
					if(exploration.RecommendFlag)
						bw_log.write(totalSamples+","+evaluator.fmeasure()+"\n");
				}
				iterNum++;
				bw.append('\n');				//TODO of course delete the two
				System.out.println();
				}
				ModelCollection.add((DTUserModel)model);
			} // kemi
			if(is_trainning){
				//write models into files
				WriteModel(ModelCollection);
				bw_pres.close();
			}
			bw.close();
			bw_log.close();
	}
	public static void WriteModel(ArrayList<DTUserModel> models){
		FileOutputStream fos;
		try {
			fos = new FileOutputStream("./models.ser");
			ObjectOutputStream oos = new ObjectOutputStream(fos);
			oos.writeObject(models);
			oos.close();
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	@SuppressWarnings("unchecked")
	public static ArrayList<DTUserModel> ReadModel(){
		FileInputStream fis;
		ArrayList<DTUserModel> result=null;
		try {
			fis = new FileInputStream("models.ser");
			ObjectInputStream ois = new ObjectInputStream(fis);
			result = (ArrayList<DTUserModel>) ois.readObject();
			ois.close();
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return result;
		
		
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
