package recommandation;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import mainPackage.Label;
import mainPackage.Tuple;

public abstract class Recommander {
	
	Recommander(){
		ItemId2Tuple=new HashMap<String,Tuple>();
		UserRecord= new HashMap<String,ArrayList<RecEntry>>();
		ReadRecord();
		label=new Label();
	}
	public void UpdateHistory(ArrayList<Tuple> samples){
		currentUserHistory=MakeEntryList(samples);
		//currentUserHistory.addAll(MakeEntryList(samples));
	}
	protected ArrayList<RecEntry> currentUserHistory; //current user's labeling history
	abstract double ScoreItem(String itemId);
	protected HashMap<String,Tuple>ItemId2Tuple;
	protected HashMap<String,ArrayList<RecEntry>> UserRecord; 
	//abstract public double Similarity(ArrayList<RecEntry> currentUser,ArrayList<RecEntry> pastUser);
	protected Label label; //label the samples of current user's record
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
		RecEntry entry= new RecEntry(ItemId,label);
		if(UserRecord.containsKey(UserId)){
			UserRecord.get(UserId).add(entry); //add new record to that user
		}else{
			ArrayList<RecEntry> al= new ArrayList<RecEntry>();
			al.add(entry);
			UserRecord.put(UserId,al);
		}
	}
	protected void ReadRecord(){
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
	public ArrayList<RecEntry> MakeEntryList(ArrayList<Tuple> currentUser){
		ArrayList<Integer> tmp= label.getLabels(currentUser);
		ArrayList<RecEntry> res=new ArrayList<RecEntry>();
		//System.out.println("Items #:"+ItemId2Tuple.size());
		for(int i=0;i<currentUser.size();i++){
			String tmpItemId=currentUser.get(i).getKey().toString();
			String tmpLabel=tmp.get(i).toString();
			RecEntry newEntry=new RecEntry(tmpItemId,tmpLabel);
			ItemId2Tuple.remove(tmpItemId); //remove items that don't need to be recommanded
			res.add(newEntry);
		}
		//System.out.println("Items #:"+ItemId2Tuple.size());
		return res;
		
	}
	
	public Tuple getTuple(String ItemId){
		return ItemId2Tuple.get(ItemId);
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
			//tpList.add(ItemId2Tuple.get(en.getKey()));
			tpList.add(getTuple(en.getKey()));
			i++;
		}
		return tpList;
	}
}
