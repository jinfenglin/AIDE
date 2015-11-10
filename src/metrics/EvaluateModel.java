package metrics;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import configuration.Global;
import mainPackage.Tuple;


@SuppressWarnings("rawtypes")
public class EvaluateModel {

	private List predictedRelevantSamples;
	private int truePositive;
	private int falsePositive;
	private int falseNegative;

	/**Evaluate model constructor
	 * 
	 * @param targetSamples  all the relevant samples in the target query
	 * @param predictedRelevantSamples  the samples that our classification algorithm predicted as relevant
	 */
	public EvaluateModel(List predictedRelevantSamples){
		this.predictedRelevantSamples = predictedRelevantSamples;

		if(predictedRelevantSamples.size()==0){
			truePositive = 0;
			falsePositive = 0;
			falseNegative = 0;
		}else{
			Set<Tuple> intersection = new HashSet<Tuple>(predictedRelevantSamples);
			intersection.retainAll(Global.targetSamples);
			truePositive = intersection.size();

			Set<Tuple> difference = new HashSet<Tuple>(predictedRelevantSamples);
			difference.removeAll(Global.targetSamples);
			falsePositive = difference.size();

			falseNegative = Global.targetSamples.size()-truePositive;
			//trueNegative = totalSamples-truePositive-falseNegative-falsePositive;
		}
	}

	//precision of the model
	public double precision(){
		if(truePositive + falsePositive == 0)
			return 0;
		return (truePositive*1.0/(truePositive + falsePositive));	// make it calculate decimals. Kemi
	}

	//recall of the model
	public double recall(){
		if(truePositive + falseNegative==0)
			return 0;
		return (truePositive*1.0/(truePositive + falseNegative));
	}

	//fmeasure of the model
	public double fmeasure(){
		double p = precision();
		double r = recall();
		if(p+r==0)
			return 0;
		return 2*((p*r*1.0)/(p+r));
	}

	//classification error of the model
	public double classificationError(){
		if(predictedRelevantSamples.size()==0)
			return 0;
		return ((falsePositive+falseNegative)/predictedRelevantSamples.size());
	}

}
