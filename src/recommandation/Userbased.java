package recommandation;
import java.io.*;
import java.util.*;

import mainPackage.Label;
import mainPackage.Tuple;

class Entry{
	String itemId;
	String label;
	Entry(String itemId,String label){
		this.itemId=itemId;
		this.label=label;
	}
}
public class Userbased {
	private HashMap<String,ArrayList<Entry>> UserRecord; 
	//past user's information, key is userId, value is items' info,wrapped in Entry class
	private Label label; //label the samples of current user's record
	private ArrayList<Tuple> currentUserHistory; //current user's labeling history
	private void parseLine(String line){//parse one line of record, put it into map
		String[] tokens= line.split(" ");
		String UserId=tokens[0];
		String ItemId=tokens[1];
		String label =tokens[2];
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
			Entry newEntry=new Entry(tmp.get(i).toString(),currentUser.get(i).getKey().toString());
			res.add(newEntry);
		}
		return res;
		
	}
	public double Simiarity(ArrayList<Tuple> currentUser,ArrayList<Entry> pastUser){
		return 0.0;
	}
	public Userbased(ArrayList<Tuple> Samples){ //pass samples labeled by user as parameter
		ReadRecord();
		currentUserHistory=Samples;
		label=new Label();
	}
}
