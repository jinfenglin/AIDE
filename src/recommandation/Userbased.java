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
public class Userbased {
	private HashMap<String,Tuple>ItemId2Tuple;
	private HashMap<String,ArrayList<Entry>> UserRecord; 
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
		for(int i=0;i<currentUser.size();i++){
			String tmpItemId=currentUser.get(i).getKey().toString();
			String tmpLabel=tmp.get(i).toString();
			Entry newEntry=new Entry(tmpItemId,tmpLabel);
			ItemId2Tuple.remove(tmpItemId); //remove items that don't need to be recommanded
			res.add(newEntry);
		}
		return res;
		
	}
	public double Simiarity(ArrayList<Entry> currentUser,ArrayList<Entry> pastUser){
		double score=0.0;
		for(int i=0;i<currentUser.size();i++){
			for(int j=0;j<pastUser.size();j++){
				if(currentUser.get(i).itemId==pastUser.get(j).itemId){
					score+=1;
				}
			}
		}
		return Math.sqrt(score);
	}
	public Userbased(){ //pass samples labeled by user as parameter
		ItemId2Tuple=new HashMap<String,Tuple>();
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
			if(itemList.contains(new Entry(itemId,"1"))){
				score+=weight;
			}else if(itemList.contains(new Entry(itemId,"0"))){
				score-=weight;
			}
			
		}
		return score;
		
	}
	public ArrayList<Tuple> recommend(int k){
		ArrayList<Tuple> tpList=new ArrayList<Tuple>();
		TreeMap tm=new TreeMap();
		for(String itemId:ItemId2Tuple.keySet()){
			double score=ScoreItem(itemId);
			tm.put(score, itemId);
		}
		Iterator it=tm.values().iterator();
		int i=0;
		while(it.hasNext() && i<k){
			tpList.add(ItemId2Tuple.get(it.next()));
		}
		return tpList;
	}
}
