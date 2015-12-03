package recommandation;
import java.io.*;
import java.util.*;

import mainPackage.Label;
import mainPackage.Tuple;
class Pair{
	public String first,second; 
}
public class Userbased extends Recommander{
	public double Similarity(ArrayList<RecEntry> currentUser,ArrayList<RecEntry> pastUser){
		double score=0.0;
		for(int i=0;i<currentUser.size();i++){
			for(int j=0;j<pastUser.size();j++){
				if(currentUser.get(i).itemId.equals(pastUser.get(j).itemId)){
					score+=1;
					break;
				}
			}
		}
		return score;
	}
	double ScoreItem(String itemId){
		double score=0.0;
		for(String key:UserRecord.keySet()){
			ArrayList<RecEntry> itemList=UserRecord.get(key);
			double weight=Similarity(currentUserHistory,itemList);
			for(RecEntry et:itemList){
				if(et.itemId.equals(itemId))
					if(et.label.equals("-1"))
						score-=weight;
					else
						score+=weight;
			}
		}
		return score;
		
	}
}
