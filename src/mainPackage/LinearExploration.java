package mainPackage;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;

import relevantObjectDiscovery.ClusterExploration;
import relevantObjectDiscovery.GridExploration;
import relevantObjectDiscovery.HistogramSampling;
import relevantObjectDiscovery.HybridExploration;
import relevantObjectDiscovery.ObjectDiscovery;
import Server.Protocol;
import boundaryExploitation.BoundaryExploitation;
import misclassifiedExploitation.ClusterExploitation;
import misclassifiedExploitation.ExploitEachMisclassified;
import misclassifiedExploitation.MisclassifiedExploitation;
import configuration.Global;

public class LinearExploration implements MiddleWare, Cloneable{

	MisclassifiedExploitation [] misExpArr = new MisclassifiedExploitation [2];
	MisclassifiedExploitation misclExp;
	BoundaryExploitation boundExp;
	ObjectDiscovery [] objDisArr = new ObjectDiscovery [3];
	ObjectDiscovery objectDiscovery ;
	ArrayList<Tuple> allExploreTuples;
	Label label;
	ArffFile trainingFile;
	ArffFile shadowTrainingFile;

	/**Constructs a new LinearExploration objects
	 * and initializes many of the variables used
	 * during the 3 phases of the linear exploration.
	 */
	public LinearExploration(){
		try {
			boundExp = new BoundaryExploitation();
		} catch (IOException e) {
			e.printStackTrace();
		}

		// by kemi, change it to support switching techniques during exploration
		objDisArr[0] = new GridExploration();
		objDisArr[1] = new ClusterExploration();
		objDisArr[2] = new HybridExploration();

		misExpArr[0] = new ExploitEachMisclassified();
		misExpArr[1] = new ClusterExploitation();

		//if exploration technique is 0 then perform the grid exploration
		//if it is 1 perform the clustering exploration
		//if it is 2 perform the hybrid exploration
		if(Global.EXPLORATION_TECHNIQUE == 0){
			objectDiscovery = objDisArr[0];
		}else if(Global.EXPLORATION_TECHNIQUE == 1){
			objectDiscovery = objDisArr[1];
		}else if(Global.EXPLORATION_TECHNIQUE == 2){
			objectDiscovery = objDisArr[2];
		}
		//if misclassified technique is 0 then sample around each misclassified
		//if it is 1 perform the clustering misclassified exploitation
		if(Global.MISCLASSIFIED_TECHNIQUE == 0){
			misclExp = misExpArr[0];
		}else if(Global.MISCLASSIFIED_TECHNIQUE == 1){
			misclExp = misExpArr[1];
		}

		allExploreTuples = new ArrayList<Tuple>();

		label = new Label();

		//initialize the training file
		trainingFile = new ArffFile(Global.TRAINING_FILE_NAME);
		shadowTrainingFile = new ArffFile(Global.SHADOW_TRAINING_FILE_NAME);
		trainingFile.createDataFile();
		shadowTrainingFile.createDataFile();
	}


	/**Builds a user model by calling a decision tree classifier
	 * 
	 * @param samples The labeled samples
	 * @param labels  The labels of the samples
	 * 	@return returns a user model.
	 */
	public UserModel classify(ArrayList<Tuple> samples, ArrayList<Integer> labels) {

		//append classified samples with label to training file
		if(Global.DRIVER_VERSION == 0) {
			trainingFile.appendToTrainingFile(samples, labels);
		} else {
			shadowTrainingFile.appendToTrainingFile(samples, labels);
		}


		//build the user model
		DTUserModel tree = new DTUserModel();
		try {
			tree.buildTree();
		} catch (Exception e) {
			e.printStackTrace();
		}

		return tree;
	}

	/**Performs the 3 phases of the linear exploration.
	 * 
	 * @param model 	A user model leveraged by some of the phases to come
	 * up with better sampling areas.
	 * @return ArrayList<Tuple>  returns an arraylist of samples that we gathered
	 * from all the exploration phases to be labeled by the user.
	 * 
	 */
	public ArrayList<Tuple> explore(UserModel model, int relevantFromExplore){
		ArrayList<Tuple> samples = new ArrayList<Tuple>();

		String predictedQuery = "";
		if(!(model==null))
			predictedQuery = model.translateToSQL();

		//boundary exploitation
		ArrayList<Tuple> exploit = new ArrayList<Tuple>();
		if (!Global.SKIP_BOUNDARYEXPLOITATION) {
			System.out.println("Exploring boundaries...");
			if(!predictedQuery.equals("") && !predictedQuery.endsWith("WHERE ") && !predictedQuery.endsWith("WHERE ")){ //if there is a tree built
				try {
					exploit.addAll(boundExp.exploitBoundaries());
					for (Tuple t: exploit) {
						t.setStage(1);
					}
				} catch (SQLException | IOException | InterruptedException e) {
					e.printStackTrace();
				} 
			}
			System.out.println("Returned..."+exploit.size()+" samples..");
			if(exploit.size()>0){
				System.out.println("--------------------------------------Here: "+exploit.get(0).getKey()+" is KEY!");
			}
			samples.addAll(exploit);
		}


		//grid exploration
		Boolean foundRelevant = false;
		if(Global.SCENARIO == 4){
			int n = label.countInteresting;
			if(n!=0)
				foundRelevant = true;
			System.out.println("HOW MANY RELEVANT I FOUND: "+n);
		}

		int interestingFromExploreAllIter = 0;
		if (!Global.SKIP_OBJECTDISCOVERY && !Global.HISTOGRAM_SAMPLING) {
			System.out.println("Object Discovery");
			if(Global.EXPLORATION_TECHNIQUE == 0){
				objectDiscovery = objDisArr[0];
			}else if(Global.EXPLORATION_TECHNIQUE == 1){
				objectDiscovery = objDisArr[1];
			}else if(Global.EXPLORATION_TECHNIQUE == 2){
				objectDiscovery = objDisArr[2];
			}

			int exploreSampleSize = Global.SAMPLES_PER_ITERATION - exploit.size();		
			ArrayList<Tuple> explore = new ArrayList<Tuple>();
			try {
				ArrayList<Tuple> temp = new ArrayList<Tuple>();
				if(!(Global.SCENARIO ==4) || (Global.SCENARIO == 4 && !foundRelevant)){
					temp = objectDiscovery.explore(exploreSampleSize);
				}
				for(int i=0; i<temp.size(); i++){
					if(!explore.contains(temp.get(i)))
						explore.add(temp.get(i));
				}
				for (Tuple t: explore) {
					t.setStage(2);
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
			if(!(Global.SCENARIO ==4) || (Global.SCENARIO == 4 && !foundRelevant)) //do not move to next exploration level if you are in scenario 4 and you found relevant
				samples.addAll(explore);
			allExploreTuples.addAll(explore);//check if you add the boundaries here too.
			if(Global.SCENARIO == 2)
				interestingFromExploreAllIter = label.countRelevantFromExplorationPhase(allExploreTuples);
			else
				interestingFromExploreAllIter = relevantFromExplore;
			System.out.println("Returned..."+explore.size()+" samples..");
		}


		if (Global.HISTOGRAM_SAMPLING && Global.DO_Object) {
			HistogramSampling h = new HistogramSampling();
			ArrayList<Tuple> list = new ArrayList<>();
			try {
				list = h.sampling();
			} catch (Exception e) {
				System.out.println(e.toString());
			}
			for (Tuple t: list) {
				t.setStage(3);
			}
			samples.addAll(list);
			if(Global.SCENARIO == 2)
				interestingFromExploreAllIter = label.countRelevantFromExplorationPhase(list);
			else
				interestingFromExploreAllIter = relevantFromExplore;
			/*for (Tuple t: list) {
				System.out.println(t);
			}*/
			//System.out.println("interesting: " + interestingFromExploreAllIter);
		}

		//missclassified phase
		if (!Global.SKIP_MISCLASSIFIEDEXPLOITATION) {
			System.out.println("Misclassified");
			if(Global.MISCLASSIFIED_TECHNIQUE == 0){
				misclExp = misExpArr[0];
			}else if(Global.MISCLASSIFIED_TECHNIQUE == 1){
				misclExp = misExpArr[1];
			}

			ArrayList<Tuple> nearestToMiss = new ArrayList<Tuple>();
			ArrayList<Tuple> misclassified = new ArrayList<Tuple>();
			if(model!=null)
				try {
					misclassified = model.getMissclassified();
				} catch (Exception e) {
					e.printStackTrace();
				}
			if(misclassified.size()>0){
				ArffFile f = new ArffFile("miscl.arff");
				try {
					f.writeMisclassifiedToFile(misclassified);
					if(interestingFromExploreAllIter>0) {
						nearestToMiss = misclExp.getNearestMissclassified(interestingFromExploreAllIter, misclassified);
						System.out.println("Here: "+nearestToMiss.get(0).getKey()+" is key!");
					}

				} catch (Exception e) {
					e.printStackTrace();
				}

			}
			for (Tuple t: nearestToMiss) {
				t.setStage(4);
			}
			System.out.println("Returned..."+nearestToMiss.size()+" samples..");
			samples.addAll(nearestToMiss);
		}
		return samples;
	}

	public ArrayList<Tuple> getAllExploreSamples(){
		return allExploreTuples;
	}

	//Cloned copy can be safely stored in somewhere else, by Kemi
	public Object clone() {  
		LinearExploration obj = null;  
		try{  
			obj = (LinearExploration)super.clone();  
		}catch(CloneNotSupportedException e) {  
			e.printStackTrace();  
		}  
		return obj;  
	}  
}
