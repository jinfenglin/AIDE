package mainPackage;
import java.util.ArrayList;

import configuration.Constants;
import configuration.Global;




public class Label {
	private int count = 0;
	public static int countInteresting = 0;

	/**Counts the number of relevant samples that we have found from the exploration phase.
	 * 
	 * @param allExploreTuples  All the samples that we have gathered from the exploration phase.
	 * @return the number of relevant samples that we have found from the exploration phase.
	 */
	public int countRelevantFromExplorationPhase(ArrayList<Tuple> allExploreTuples){
		int count = 0;
		if(Global.SCENARIO == 2){ //use target samples (we have target query for scenario 2)
			for(int i=0; i<allExploreTuples.size(); i++){
				if(Global.targetSamples.contains(allExploreTuples.get(i))){
					count++;
				}
			}
		}else{
			//here find how many yes from object discovery exploration has the user said.
		}
		return count;
	}

	/**Labels all the samples that we pass in as relevant (1) or non-relevant(0)
	 * 
	 * @param samples the samples we want to label
	 * @return
	 */
	public ArrayList<Integer> getLabels(ArrayList<Tuple> samples) {
		ArrayList<Integer> labels = new ArrayList<Integer>();
		System.out.println("Going to label: " + samples.size() + " samples.");
		for (int i = 0; i < samples.size(); i++) {
			//System.out.println("This is the sample: "+samples.get(i).toString());
			if (Global.targetSamples.contains(samples.get(i))) {
				count++;
				labels.add(Constants.RELEVANT_CLASS);
			} else {
				labels.add( Constants.IRRELEVANT_CLASS);
			}
		}
		System.out.println("Found " + count + " interesting samples.");
		return labels;
	}



	/**Labels all the samples that we pass in as relevant (1) or non-relevant(0)
	 * 
	 * @param samples the samples we want to label
	 * @return
	 */
	public ArrayList<Integer> getLabelsBackEnd(ArrayList<Tuple> samples) {
		ArrayList<Integer> labels = new ArrayList<Integer>();
		System.out.println("Going to label: " + samples.size() + " samples.");
		for (int i = 0; i < samples.size(); i++) {
			//System.out.println("This is the sample: "+samples.get(i).toString());
			//System.out.println("TargetSamples size: "+Global.targetSamples.size());
			if (Global.targetSamples.contains(samples.get(i))) {
				count++;
				countInteresting++;
				labels.add(Constants.RELEVANT_CLASS);
			} else {
				labels.add( Constants.IRRELEVANT_CLASS);
			}
		}
		System.out.println("Found " + count + " interesting samples.");
		return labels;
	}
}



