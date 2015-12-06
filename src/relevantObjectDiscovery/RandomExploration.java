//package relevantObjectDiscovery;
//import java.io.IOException;
//import java.sql.Connection;
//import java.sql.ResultSet;
//import java.sql.SQLException;
//import java.sql.Statement;
//import java.util.ArrayList;
//
//import mainPackage.Tuple;
//
//import configuration.DBConnection;
//import configuration.Global;
//
//
//
//public class RandomExploration extends ObjectDiscovery{
//
//
//	public ArrayList<Tuple> explore(int numberOfTuples) throws IOException, SQLException{
//		Connection connection = DBConnection.getConnection();
//		Statement statement;
//		ResultSet rs;
//		ArrayList<Tuple> randomSamples = new ArrayList<Tuple>();
//		String fetchRandomQuery = "SELECT ";//add objid here if exists in the covering index.
//		for(int i=0; i<Global.attributes.size(); i++){
//			if(i!=Global.attributes.size()-1)
//				fetchRandomQuery += Global.attributes.get(i)+" , ";
//			else
//				fetchRandomQuery += Global.attributes.get(i);
//		}
//		fetchRandomQuery +=" FROM "+Global.TABLE_NAME +" ORDER BY RANDOM() LIMIT "+numberOfTuples;
//		statement = connection.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);//make the cursor scrollable
//		rs = statement.executeQuery(fetchRandomQuery);
//		while(rs.next()){
//			Object[] attrValues = new Object[Global.attributes.size()];
//			for(int m=1; m<=Global.attributes.size(); m++){
//				attrValues[m-1] = rs.getString(m); 
//			}
//			Tuple tuple = new Tuple(attrValues);
//			randomSamples.add(tuple); 
//		}
//		return randomSamples;
//	}
//}
