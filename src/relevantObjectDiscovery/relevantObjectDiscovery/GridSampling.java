package relevantObjectDiscovery;
import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Random;

import configuration.DBConnection;
import configuration.Global;
import mainPackage.Tuple;
import metrics.OutputFile;





public class GridSampling {

	public ArrayList<Tuple> sample(ArrayList<Tuple> values, ArrayList<Integer> numberOfTuples) throws IOException, SQLException, InterruptedException{
		ArrayList<Tuple> samplesToReturn = new ArrayList<Tuple>();

		for(int i=0; i<values.size(); i++){
			if(numberOfTuples.get(i)==0){
				break;
			}
			//System.out.println(values.get(i).toString());
			
			String fileName = Global.GRID_FOLDER+"/"+Global.CACHED_FILE_FOLDER+"/"+values.get(i).toString()+".txt";
			File fi = new File(fileName);

			//if the file exists get samples from the file
			if(fi.exists()){
			//	System.out.println("Going to read samples from file.."+fileName);
				samplesToReturn.addAll(readSamplesFromFile(fileName,numberOfTuples.get(i)));
			}else{ //else send a query to get the samples inside the specified distance from the center and then store them in a file
				//System.out.println("Going to send query to get samples..");
				samplesToReturn.addAll(sendQueryToGetSamples(values.get(i), Global.PERCENT_AROUND_GRID_CENTER, fileName, numberOfTuples.get(i)));
			}
		}
		return samplesToReturn; 
	}

	private ArrayList<Tuple> readSamplesFromFile(String fileName, int numberOfTuples) throws IOException{
		ArrayList<Tuple> toReturn = new ArrayList<Tuple>();
		OutputFile fr = new OutputFile(fileName);
		ArrayList<Tuple> f = fr.readFileIntoArrayListOfTuples();
		if(f.size()!=0){
			for(int il=0; il<numberOfTuples; il++){
				if(f.size()==1){
					toReturn.add(f.get(0));
				}else{
					Random generator = new Random();
					if (Global.SEED >= 0)
						generator.setSeed(Global.SEED + il);    // zhan: set seed so that same result for every run
					int kl = generator.nextInt(f.size()-1);
					toReturn.add(f.get(kl));
				}
			}
		}
		return toReturn;
	}
	
	
	private ArrayList<Tuple> sendQueryToGetSamples(Tuple center, double distanceAroundCenter, String fileName, int numberOfSamples) throws IOException, SQLException{
		ArrayList<Tuple> samples = new ArrayList<>();
		ResultSet rs;
		Statement statement;
		String query = "SELECT "+Global.OBJECT_KEY+" , ";
		for(int i=0; i<Global.attributes.size(); i++){
			if(i!=Global.attributes.size()-1)
				query += Global.attributes.get(i).getName()+" , ";
			else
				query += Global.attributes.get(i).getName();
		}
		query += " FROM "+Global.TABLE_NAME+ " WHERE ";
		for(int i = 0; i<Global.attributes.size(); i++){
			ArrayList<Object> toInverse = Global.attributes.get(i).getDomain();
			int index = toInverse.indexOf(Double.parseDouble(center.valueAt(i).toString()));
			if(index<0)index=0;
			if(index==toInverse.size())index=toInverse.size()-1;
			ArrayList<String> a = getClosest(toInverse, distanceAroundCenter, Double.parseDouble(center.valueAt(i).toString()));
			query += " ("+Global.attributes.get(i).getName()+ " >= "+a.get(0)+ " AND "+Global.attributes.get(i).getName()+ " <= "+a.get(1)+") ";
			if(i< Global.attributes.size()-1){
				query += " AND ";
			}
		}
		query += " ORDER BY RANDOM() LIMIT "+(numberOfSamples+Global.EXPLORE_EXTRA_SAMPLES);
		Connection connection = DBConnection.getConnection();
		statement = connection.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);
		rs = statement.executeQuery(query);
		//System.out.println("Sent this query to return samples: "+query);
		while(rs.next()){
			Object key = rs.getString(1);
			Object[] attrValues = new Object[Global.attributes.size()];
			for(int m=1; m<=Global.attributes.size(); m++){
				attrValues[m-1] = rs.getString(m+1); 
			}
			Tuple tuple = new Tuple(key, attrValues);
			samples.add(tuple);
		}
		ArrayList<Tuple> toReturn = new ArrayList<Tuple>();
		if(numberOfSamples<=samples.size()){
			for(int l=0; l<numberOfSamples; l++){
				toReturn.add(samples.get(l));
			}
		}else{
			toReturn.addAll(samples);
		}
		//System.out.println("Size i got back: "+toReturn.size());
		OutputFile fh = new OutputFile(fileName);
		fh.writeArrayListOfTuples(samples);
		return toReturn;
	}

	private ArrayList<String> getClosest(ArrayList<Object> values, double number, double value) throws IOException{
		ArrayList<String> toReturn = new ArrayList<String>();
		double min = Double.parseDouble(""+values.get(0));
		double max = Double.parseDouble(""+values.get(values.size()-1));
		double perce = (max-min)/(100/number);
		double downLimit = value - perce;
		double upLimit = value + perce;
		toReturn.add(""+downLimit);
		toReturn.add(""+upLimit);
		return toReturn;
	}

}
