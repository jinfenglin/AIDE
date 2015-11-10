package relevantObjectDiscovery;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;

import configuration.Global;

import mainPackage.Tuple;


public class GridExploration extends ObjectDiscovery{

	private ArrayList<Tuple> toExploreNextIter = new ArrayList<Tuple>();
	private ArrayList<Tuple> centers;
	private int grids = Global.NUMBER_OF_GRIDS;
	private int levelCounter = 0;
	private ArrayList<Tuple> centersExplored;


	/**This function is the main function of the relevant object discovery phase. 
	 * It will decide around which centers to explore and will
	 * send queries to get the random samples around the grids and 
	 * return those samples in an arraylist
	 * @param queryNumber2 
	 * 
	 * @param	exploreSamples  number of samples we want to return/number of centers to explore
	 * @return the samples we gathered from the relevant object discovery phase for classification 
	 * @throws IOException 
	 * @throws InterruptedException 
	 * @throws SQLException 
	 * 
	 */
	public ArrayList<Tuple> explore(int exploreTupleSize) throws IOException, SQLException, InterruptedException{
		ArrayList<Tuple> toExplore = new ArrayList<Tuple>();
		centersExplored = new ArrayList<Tuple>();

		if(toExploreNextIter.size()==0){//if we don't have any grids in our list to explore, we need to make grids
			if(!(Global.DISTANCE_HINT && levelCounter>1)){ //only make a new grid level if you are NOT 
				makeGrids();  							//(using the distance hint and you have made more than 1 levels)  
				toExplore.addAll(centers);				// What's distance hint
			}
			levelCounter++;
		}else{
			toExplore.addAll(toExploreNextIter);
			toExploreNextIter = new ArrayList<Tuple>();
		}
		if(Global.SCENARIO == 4)
			exploreTupleSize = centers.size();
		ArrayList<Integer> tuplesNumber = new ArrayList<Integer>();
		for(int i=0; i<toExplore.size(); i++){
			tuplesNumber.add(0);
		}
		if(exploreTupleSize<=tuplesNumber.size()){
			for(int i=0; i<exploreTupleSize; i++){
				tuplesNumber.set(i, 1);
			}
		}else{
			for(int i=0; i<tuplesNumber.size(); i++){
				tuplesNumber.set(i, 1);
			}
		}
		for(int i=0; i<tuplesNumber.size(); i++){
			if(tuplesNumber.get(i) == 0){
				toExploreNextIter.add(toExplore.get(i));
			}
		}

		//this only needed for hybrid exploration
		for(int i=0; i<tuplesNumber.size(); i++){
			if(tuplesNumber.get(i) == 1){
				centersExplored.add(toExplore.get(i));
			}
		}

		GridSampling n = new GridSampling();
		ArrayList<Tuple> toReturn = n.sample(toExplore, tuplesNumber); //sample around the grid center
		return toReturn;															//and return the samples you found
	} 

	/**This method breaks the whole data space into the appropriate
	 * number of grids, calculates the centers of the grids
	 * and fills in an arraylist with the centers of the grids.
	 * 
	 * @throws IOException 
	 * @throws  
	 */
	private void makeGrids() throws IOException{
		centers = new ArrayList<Tuple>();
		ArrayList<Double> attrGridCenters = new ArrayList<Double>();

		if(!Global.DISTANCE_HINT)
			grids = grids*Global.GRID_DIVIDING_FACTOR;
		ArrayList<Integer> numberOfBuckets = new ArrayList<Integer>();
		for(int i=0; i<Global.attributes.size(); i++){
			//read the whole attribute file and store all the values in an arrayList
			ArrayList<Object> attributeValues = Global.attributes.get(i).getDomain();
			System.out.println("--------------------------------------------");
			System.out.println("Atrribute values === "+attributeValues.size());
			
			if(attributeValues.size()>grids)
				numberOfBuckets.add(grids);
			else
				numberOfBuckets.add(attributeValues.size());
			
			//calculate how many values each segment will have for each attribute
			int inSegment = attributeValues.size()/grids;	
			if(attributeValues.size()>grids){
				for(int j=0; j<grids; j++){
					attrGridCenters.add(Double.parseDouble(""+attributeValues.get((int)((inSegment*j)+(inSegment/2))))); 
					//System.out.println(Double.parseDouble(""+attributeValues.get((int)((inSegment*j)+(inSegment/2)))));
				}
			}else{
				for(int j=0; j<attributeValues.size(); j++){
					attrGridCenters.add(Double.parseDouble(""+attributeValues.get(j))); 
				}
			}
		}
		GridCenter s = new GridCenter();
		centers.addAll(s.constructGridCenters(attrGridCenters, numberOfBuckets));
		//System.out.println("Centers size is: "+centers.size());
	}

	//only needed for hybrid exploration
	public ArrayList<Tuple> getCentersToExplore(){
		return centersExplored;
	}

	public int getGridNumber(){
		return grids;
	}

}
