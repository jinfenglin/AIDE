package relevantObjectDiscovery;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;

import com.mysql.jdbc.ResultSet;


import configuration.DBConnection;
import configuration.Global;

import mainPackage.Tuple;

public class HybridExploration extends ObjectDiscovery{
	GridExploration grids;
	ClusterExploration clusters;

	public HybridExploration(){
		grids = new GridExploration();
		clusters = new ClusterExploration();
	}

	/**Performs the hybrid relevant object discovery technique.
	 * Collects samples from around the clusters and then
	 * if uses the grid-structure to detect sparse grid-cells and for those
	 * it collects samples around the grid-center and returns ALL of the samples we 
	 * collected.
	 * 
	 * @param exploreTupleSize number of clusters, number of grids to explore
	 * @return ArrayList<Tuple>  the samples that we have collected with this technique.
	 */
	@Override
	public ArrayList<Tuple> explore(int exploreTupleSize) throws Exception {
		ArrayList<Tuple> samples = new ArrayList<Tuple>();//samples to return for labeling

		//get all the samples from the clusters to present to the user
		samples.addAll(clusters.explore(exploreTupleSize));
		//System.out.println("Added "+samples.size()+" samples from the clusters.");

		//for the grid-based method: get all the grids constructed
		ArrayList<Tuple> gridSamples = grids.explore(exploreTupleSize); //we call this to construct the grids and get the samples from the grid exploration
		//System.out.println(gridSamples.toString());
		//System.out.println(gridSamples.size());
		ArrayList<Tuple> gridCenters = grids.getCentersToExplore();
		//System.out.println(gridCenters.toString());
		//System.out.println(gridCenters.size());

		//get the density for each of the grids (based on the grid - center)
		//if it is less than threshold show to the user.
		for(int i=0; i<gridCenters.size(); i++){
			double s = findDensity(gridCenters.get(i));
			//System.out.println("Density of this grid: "+s);
			if(s<Global.DENSITY_THRESHOLD && s!=0){ 
				//System.out.println("This grid is sparse: "+gridCenters.get(i).toString()+", we are going to present this sample to the user: "+gridSamples.get(i));
				samples.add(gridSamples.get(i));
			}
		}	
		return samples;
	}

	/**This method calculates the density of a grid cell according to this type:
	 * numberOfUniqueExistingTuples/numberOfUniqueCombinations (in the cell)
	 *
	 * @param theBoundary the boundaries of the specific cell we are calculating the density for
	 * @return the density of the cell.
	 * @throws SQLException
	 * @throws IOException 
	 * @throws NumberFormatException 
	 */
	private double findDensity(Tuple center) throws SQLException, NumberFormatException, IOException{
		double density = 0.0;

		//calculates the size of each grid 
		double gridLength = 100/(double)grids.getGridNumber();
		
		String query = "SELECT count(*) AS count_1 FROM ( SELECT ";
		for(int i=0; i<Global.attributes.size(); i++){
			if(i!=Global.attributes.size()-1)
				query += Global.attributes.get(i).getName()+" , ";
			else
				query += Global.attributes.get(i).getName();
		}
		query += " FROM "+Global.TABLE_NAME+ " WHERE ";
		for(int i=0; i<Global.attributes.size(); i++){
			query += Global.attributes.get(i).getName() + " >= " +getClosest(Global.attributes.get(i).getDomain(), gridLength/2 , Double.parseDouble(""+center.valueAt(i)), false) +" AND "+ Global.attributes.get(i).getName() + " <= " + getClosest(Global.attributes.get(i).getDomain(), gridLength/2 , Double.parseDouble(""+center.valueAt(i)), true);
			if(i< Global.attributes.size()-1){
				query += " AND ";
			}
		}
		query +=" GROUP BY ";
		for(int i=0; i<Global.attributes.size(); i++){
			if(i!=Global.attributes.size()-1)
				query += Global.attributes.get(i).getName()+" , ";
			else
				query += Global.attributes.get(i).getName();
		}
		query += ") AS anon_1";
		//System.out.println("Query: "+query);
		Connection connection = DBConnection.getConnection();
		java.sql.Statement statement = connection.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);
		java.sql.ResultSet rs = statement.executeQuery(query);
		String result = "";
		while(rs.next()){
			result = rs.getString(1);
		}
		int existing = Integer.parseInt(result);
		rs.close(); statement.close();

		ArrayList<Integer> uniques = new ArrayList<Integer>();
		for(int i=0; i<Global.attributes.size(); i++){
			String query1 = "SELECT count(distinct "+Global.attributes.get(i).getName();
			query1 += ") FROM "+Global.TABLE_NAME+ " WHERE ";
			query1 += Global.attributes.get(i).getName() + " >= " +getClosest(Global.attributes.get(i).getDomain(), gridLength/2 , Double.parseDouble(""+center.valueAt(i)), false) +" AND "+ Global.attributes.get(i).getName() + " <= " + getClosest(Global.attributes.get(i).getDomain(), gridLength/2 , Double.parseDouble(""+center.valueAt(i)), true);
			java.sql.Statement statement1 = connection.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);
			java.sql.ResultSet rs1 = statement1.executeQuery(query1);
			String result2 = "";
			while(rs1.next()){
				result2 = rs1.getString(1);
			}
			uniques.add(Integer.parseInt(result2));
			rs1.close(); statement1.close();
		}
		int possibleCombinations = uniques.get(0);
//		System.out.println("First attr unique values in the cell: "+uniques.get(0));
//		System.out.println("Second attr unique values in the cell: "+uniques.get(1));
//		System.out.println("Here should be 2: "+uniques.size());
		for(int i=1; i<uniques.size(); i++){
			possibleCombinations *= uniques.get(i);
		}
		//System.out.println("Possible combinations: "+ possibleCombinations);

		density = (double)existing/(double)possibleCombinations;

		return density;
	}

	private double getClosest(ArrayList<Object> values, double number, double value, boolean rightBoundary) throws IOException{
		double min = Double.parseDouble(""+values.get(0));
		double max = Double.parseDouble(""+values.get(values.size()-1));
		double perce = (max-min)/(100/number);
		double downLimit = value - perce;
		double upLimit = value + perce;
		if(rightBoundary)
			return upLimit;
		else
			return downLimit;
	}


}
