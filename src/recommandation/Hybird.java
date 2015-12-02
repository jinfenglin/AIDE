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
			double weight=Similarity(currentUserHistory,itemList);
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
		return Math.sqrt(score);
	}
}
