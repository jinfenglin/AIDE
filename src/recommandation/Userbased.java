package recommandation;
import java.io.*;
import java.util.*;

import mainPackage.Label;
import mainPackage.Tuple;

class Entry{
	public String itemId;
	public String label;
	Entry(String itemId,String label){
		this.itemId=itemId;
		this.label=label;
	}
}
class Pair{
	public String first,second; 
}
public class Userbased {
	private HashMap<String,Tuple>ItemId2Tuple;
	private HashMap<String,ArrayList<Entry>> UserRecord; 
	//private HashMap<Pair,Double> SimilarityMap;
	//past user's information, key is userId, value is items' info,wrapped in Entry class
	private Label label; //label the samples of current user's record
	private ArrayList<Entry> currentUserHistory; //current user's labeling history
	private void parseLine(String line){//parse one line of record, put it into map
		String[] tokens= line.split(",");
		String UserId=tokens[0];
		String ItemId=tokens[1];
		String label =tokens[2];
		ArrayList<Object> collect=new ArrayList<Object>();
		for(int i=3;i<tokens.length;i++){
			collect.add(tokens[i].trim());
		}
		Tuple tp=new Tuple(ItemId,collect.toArray());
		ItemId2Tuple.put(ItemId, tp);
		Entry entry= new Entry(ItemId,label);
		if(UserRecord.containsKey(UserId)){
			UserRecord.get(UserId).add(entry); //add new record to that user
		}else{
			ArrayList<Entry> al= new ArrayList<Entry>();
			al.add(entry);
			UserRecord.put(UserId,al);
		}
	}
	private void ReadRecord(){
		File f= new File("./record.csv");
		try {
			BufferedReader bf=new BufferedReader(new FileReader(f));
			String line;
			while((line=bf.readLine()) != null){
				parseLine(line);
			}
			bf.close();
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
	public ArrayList<Entry> MakeEntryList(ArrayList<Tuple> currentUser){
		ArrayList<Integer> tmp= label.getLabels(currentUser);
		ArrayList<Entry> res=new ArrayList<Entry>();
		//System.out.println("Items #:"+ItemId2Tuple.size());
		for(int i=0;i<currentUser.size();i++){
			String tmpItemId=currentUser.get(i).getKey().toString();
			String tmpLabel=tmp.get(i).toString();
			Entry newEntry=new Entry(tmpItemId,tmpLabel);
			ItemId2Tuple.remove(tmpItemId); //remove items that don't need to be recommanded
			res.add(newEntry);
		}
		//System.out.println("Items #:"+ItemId2Tuple.size());
		return res;
		
	}
	public double Simiarity(ArrayList<Entry> currentUser,ArrayList<Entry> pastUser){
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
	public Userbased(){ //pass samples labeled by user as parameter
		ItemId2Tuple=new HashMap<String,Tuple>();
		UserRecord= new HashMap<String,ArrayList<Entry>>();
		ReadRecord();
		label=new Label();

	}
	public void UpdateHistory(ArrayList<Tuple> samples){
		currentUserHistory=MakeEntryList(samples);
	}
	double ScoreItem(String itemId){
		double score=0.0;
		for(String key:UserRecord.keySet()){
			ArrayList<Entry> itemList=UserRecord.get(key);
			double weight=Simiarity(currentUserHistory,itemList);
			for(Entry et:itemList){
				if(et.itemId.equals(itemId))
					if(et.label.equals("-1"))
						score-=weight;
					else
						score+=weight;
			}
		}
		return score;
		
	}
	public ArrayList<Tuple> recommend(int k){
		ArrayList<Tuple> tpList=new ArrayList<Tuple>();
		HashMap<String,Double> tm=new HashMap<String,Double>();
		for(String itemId:ItemId2Tuple.keySet()){
			double score=ScoreItem(itemId);
			tm.put(itemId, score);
		}
		List<Map.Entry<String, Double>> list= new ArrayList<Map.Entry<String, Double>>(tm.entrySet());
		Collections.sort( list, new Comparator<Map.Entry<String, Double>>()
		        {
		            public int compare( Map.Entry<String, Double> o1, Map.Entry<String, Double> o2 )
		            {
		                return (o2.getValue()).compareTo( o1.getValue() );
		            }
		        } );
		
		int i=0;
		for(Map.Entry<String, Double> en:list){
			if(i>=k)
				break;
			tpList.add(ItemId2Tuple.get(en.getKey()));
			i++;
		}
		return tpList;
	}
}
