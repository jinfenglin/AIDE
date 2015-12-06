package relevantObjectDiscovery;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.ArrayList;

import configuration.Global;
import mainPackage.Tuple;
import metrics.OutputFile;
import weka.clusterers.SimpleKMeans;
import weka.core.Instances;

public class ClusterExploration extends ObjectDiscovery{

	ArrayList<Tuple> toExploreNextIter = new ArrayList<Tuple>();
	int clusters = Global.NUMBER_OF_GRIDS;	

	public ArrayList<Tuple> explore(int exploreTupleSize) throws Exception{
		ArrayList<Tuple> toExplore = new ArrayList<Tuple>();

		if(toExploreNextIter.size()==0){//if we don't have any grids in our list to explore, we need to make grids
			toExplore.addAll(getCentroids());
		}else{
			toExplore.addAll(toExploreNextIter);
			toExploreNextIter = new ArrayList<Tuple>();
		}
		ArrayList<Integer> tuplesNumber = new ArrayList<Integer>();
		for(int i=0; i<toExplore.size(); i++){
			tuplesNumber.add(0); //tuplesNumber is same size as explore
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

//		ArrayList<Tuple> toReturn = new ArrayList<Tuple>();
//		for(int i=0; i<tuplesNumber.size(); i++){
//			if(tuplesNumber.get(i) == 1){
//				toReturn.add(toExplore.get(i));
//			}
//		}
//		return toReturn;
		GridSampling n = new GridSampling();
		System.out.println("Going to sample around the centroid..");

		ArrayList<Tuple> toReturn = n.sample(toExplore, tuplesNumber); //sample around the cluster center
		return toReturn;					
	} 



	/**Runs the kmeans algorithm on the entire exploration space ("wholeData.arff")
	 * and returns the centroids of the clusters that kmeans created. 
	 * 
	 * @param number    the number of centroids for kmeans. They will be the tuples for the explore phase.
	 * @return			the centroids.
	 * @throws Exception
	 */
	private ArrayList<Tuple> getCentroids() throws Exception{
		ArrayList<Tuple> toReturn = new ArrayList<Tuple>();
		
		if(!Global.DISTANCE_HINT)
			clusters = clusters*Global.GRID_DIVIDING_FACTOR;
		
		//int numberOfClusters = (int) Math.pow(clusters, Global.attributes.size());
		int numberOfClusters = clusters;
		System.out.println("Running the k-means algorithm to discover "+numberOfClusters+" cluster centroids in the data space...");

		StringBuilder fileName = new StringBuilder();
		for(int i=0; i<Global.attributes.size(); i++){
			fileName.append(Global.attributes.get(i).getName());
		}
		fileName.append(numberOfClusters+".txt");
		OutputFile f = new OutputFile(Global.CLUSTER_FOLDER+"/"+fileName);
		if(f.exists()){
			System.out.println("Read samples from file and returning..");
			toReturn = f.readFileIntoArrayListOfTuples();
			return toReturn;
		}

		BufferedReader reader = new BufferedReader(new FileReader(Global.DATA_SPACE_FILE)); //read from Global
		//DataSource source = new DataSource(Global.SHADOW_TRAINING_FILE_NAME);
		//source.getDataSet();
		Instances data = new Instances(reader);

		//System.out.println("Number of areas is : "+cl+" and number of instances is: "+data.numInstances());
		if(data.numInstances()<=numberOfClusters){
			for(int i=0; i<data.numInstances(); i++){
				Object[] attrValues = new Object[Global.attributes.size()];
				for(int j=0; j<attrValues.length; j++){
					attrValues[j] = data.instance(i).value(j);
				}
				Tuple t = new Tuple(null, attrValues);
				toReturn.add(t);
			}
			System.out.println("returning all of the samples because number of clusters>number of instances..");
			return toReturn;
		}
		System.out.println("Running kmeans");
		SimpleKMeans k = new SimpleKMeans();
		k.setNumClusters(numberOfClusters);
		k.setPreserveInstancesOrder(true);

		k.buildClusterer(data);

		Instances centroids = k.getClusterCentroids();
		for (int i=0; i<centroids.numInstances(); i++) {
			Object[] attrValues = new Object[Global.attributes.size()];
			for(int j=0; j<attrValues.length; j++){
				attrValues[j] = centroids.instance(i).value(j);
			}
			Tuple t = new Tuple(null, attrValues);
			toReturn.add(t);  //adds the centroids in the list to return
		}

		OutputFile centroidFile = new OutputFile(Global.CLUSTER_FOLDER+"/"+fileName);  // zhan: add CACHED_FILE_FOLDER
		centroidFile.writeArrayListOfTuples(toReturn);

		return toReturn;
	}

}

