package recommandation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import mainPackage.Tuple;

public class Hybird extends Recommander{
	Map<String,Model> pastModels;
	public Hybird(){
		super();
		pastModels= new HashMap<String,Model>();
		LoadModels("some file name");
		
	}
	public void LoadModels(String path){
		
	}
	@Override
	public void UpdateHistory(ArrayList<Tuple> samples) {
		currentUserHistory.addAll(MakeEntryList(samples));
	}
	public ArrayList<RecEntry> BuildItemListWithPastModel(String UserId,Model model){
		ArrayList<RecEntry> itemList= new ArrayList<RecEntry>();
		//Model md= pastModels.get(UserId);
		for(RecEntry item: currentUserHistory){
			Tuple tup= getTuple(item.itemId);
			String compareLabel = model.classify(tup);
			RecEntry tmp= new RecEntry(item.itemId,compareLabel);
			itemList.add(tmp);
		}
		return itemList;
	}
	@Override
	public double ScoreItem(String itemId) {
		double score=0.0;
		for(String UserId:UserRecord.keySet()){
			Model model= pastModels.get(UserId);
			ArrayList<RecEntry> itemList=BuildItemListWithPastModel(UserId,model);
			double weight=Similarity(currentUserHistory,itemList)+ItemUserAffinity(itemId);
			Tuple tuple= getTuple(itemId);
			String past_label=model.classify(tuple);
			if(past_label.equals("1")){
				score+=weight;
			}else{
				score-=weight;
			}
		}
		return score;
	}
	public double CosinSimilairty(ArrayList<Double> vectorA,ArrayList<Double> vectorB){
		double dotProduct = 0.0;
	    double normA = 0.0;
	    double normB = 0.0;
	    for (int i = 0; i < vectorA.size(); i++) {
	        dotProduct += vectorA.get(i) * vectorB.get(i);
	        normA += Math.pow(vectorA.get(i), 2);
	        normB += Math.pow(vectorB.get(i), 2);
	    }   
	    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
	}
	public boolean isNumeric(String s) {  
	    return s.matches("[-+]?\\d*\\.?\\d+");  
	} 
	public ArrayList<Double> ToVector(Object[] target,Object[] compare){
		ArrayList<Double> res=new ArrayList<Double>();
		for(int i=0;i<target.length;i++){
			if(isNumeric(target[i].toString())){
				res.add((Double)target[i]);
			}else{
				if(target[i].equals(compare[i]))
					res.add(1.0);
				else
					res.add(0.0);
			}
		}
		return res;
	}
	public double ItemUserAffinity(String itemId){
		Tuple tuple=getTuple(itemId);
		double score=0;
		for(RecEntry entry:currentUserHistory){
			Tuple tmp= getTuple(entry.itemId);
			if(entry.label=="1")
				score+= ItemSimilarity(tuple,tmp);
			else
				score-= ItemSimilarity(tuple,tmp);
		}
		return score;
	}
	public double ItemSimilarity(Tuple item1,Tuple item2){
		ArrayList<Double> al1= ToVector(item1.getAttrValues(),item2.getAttrValues());
		ArrayList<Double> al2= ToVector(item2.getAttrValues(),item1.getAttrValues());
		return CosinSimilairty(al1,al2);
	}
	public double Similarity(ArrayList<RecEntry> currentUser, ArrayList<RecEntry> pastUser) {
		// TODO Auto-generated method stub
		double score=0.0;
		for(int i=0;i<currentUser.size();i++){
			for(int j=0;j<pastUser.size();j++){
				if(currentUser.get(i).itemId.equals(pastUser.get(j).itemId)){
					score+=1;
					break;
				}
			}
		}
		return score/currentUser.size();
	}
}
