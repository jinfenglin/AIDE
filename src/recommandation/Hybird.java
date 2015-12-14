package recommandation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import weka.core.Attribute;
import weka.core.DenseInstance;
import weka.core.FastVector;
import weka.core.Instance;
import weka.core.Instances;
import mainPackage.DTUserModel;
import mainPackage.Driver;
import mainPackage.Tuple;

public class Hybird extends Recommander{
	Map<String,DTUserModel> pastModels;
	Map<String,Tuple> CurrentUserItemId2Tuple;
	public Hybird(){
		super();
		pastModels= new HashMap<String,DTUserModel>();
		CurrentUserItemId2Tuple= new HashMap<String,Tuple>();
		LoadModels();
		
	}
	public void LoadModels(){
		ArrayList<DTUserModel> models=null;
		models=Driver.ReadModel();
		for(int i=0;i<models.size();i++){
			pastModels.put(Integer.toString(i), models.get(i));
		}
	}

	public String classify(Tuple tuple,DTUserModel model){
		Object[] attrvalues=tuple.getAttrValues();
		Attribute Attribute1 = new Attribute("firstNumeric");
		Attribute Attribute2 = new Attribute("secondNumeric");
		FastVector fvClassVal = new FastVector(2);
		fvClassVal.addElement("1");
		fvClassVal.addElement("-1");
		Attribute ClassAttribute = new Attribute("theClass", fvClassVal);
		FastVector fvWekaAttributes = new FastVector(3);
		fvWekaAttributes.addElement(Attribute1);
		fvWekaAttributes.addElement(Attribute2);
		fvWekaAttributes.addElement(ClassAttribute);
		Instances isTrainingSet = new Instances("Rel", fvWekaAttributes, 1);
		isTrainingSet.setClassIndex(2);
		Instance instance = new DenseInstance(3);
		instance.setValue((Attribute)fvWekaAttributes.elementAt(0),  Double.parseDouble((String) attrvalues[0]));
		instance.setValue((Attribute)fvWekaAttributes.elementAt(1),  Double.parseDouble((String) attrvalues[1]));
		instance.setValue((Attribute)fvWekaAttributes.elementAt(2), "1");
		isTrainingSet.add(instance);
		String compareLabel = null;
		try {
			compareLabel = isTrainingSet.classAttribute().value((int) model.getTree().classifyInstance(isTrainingSet.firstInstance()));
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return compareLabel;
	}
	public ArrayList<RecEntry> BuildItemListWithPastModel(String UserId,DTUserModel model){
		ArrayList<RecEntry> itemList= new ArrayList<RecEntry>();
		//Model md= pastModels.get(UserId);
		for(RecEntry item: currentUserHistory){
			Tuple tup= getTupleFromCurrentUser(item.itemId);
			String compareLabel= classify(tup,model);
			RecEntry tmp= new RecEntry(item.itemId,compareLabel);
			itemList.add(tmp);
		}
		return itemList;
	}
	public void UpdateHistory(ArrayList<Tuple> samples){
		currentUserHistory=MakeEntryList(samples);
		for(Tuple tp:samples){
			CurrentUserItemId2Tuple.put((String)tp.getKey(), tp);
		}
	}
	public Tuple getTupleFromCurrentUser(String ItemId){
		Tuple tuple=null;
		tuple=CurrentUserItemId2Tuple.get(ItemId);
		return tuple;
	}
	@Override
	public double ScoreItem(String itemId) {
		double score=0.0;
		//double I2U=ItemUserAffinity(itemId);
		for(String UserId:UserRecord.keySet()){
			DTUserModel model= pastModels.get(UserId);
			ArrayList<RecEntry> itemList=BuildItemListWithPastModel(UserId,model);
			double weight=Similarity(currentUserHistory,itemList);
			//System.out.println("weight:"+weight);
			Tuple tuple= getTuple(itemId);
			String past_label=classify(tuple,model);
			if(past_label.equals("1")){
				score+=weight;
			}else{
				score-=weight;
			}
		}
		return score;//+I2U;
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
				res.add(Double.parseDouble((String)target[i]));
			}else{
				if(target[i].equals(compare[i]))
					res.add(1.0);
				else
					res.add(0.0);
			}
		}
		return res;
	}
	public double ItemUserAffinity(String itemId){//item's affinity with user by comapring with all history items of current user
		Tuple tuple=getTuple(itemId);
		double score=0;
		int count=0;
		for(RecEntry entry:currentUserHistory){
			count++;
			Tuple tmp= getTupleFromCurrentUser(entry.itemId);
			if(entry.label=="1")
				score+= ItemSimilarity(tuple,tmp);
			else
				score-= ItemSimilarity(tuple,tmp);
		}
		return score/count;
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
