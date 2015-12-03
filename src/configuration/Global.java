package configuration;

import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

import mainPackage.ArffFile;
import mainPackage.Attribute;
import mainPackage.CMDController;
import mainPackage.Tuple;
import metrics.OutputFile;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;



public class Global {

	public static int RANDOM_AROUND_MISCLASSIFIED;
	public static int EXPLORE_EXTRA_SAMPLES;
	public static int SAMPLES_PER_ITERATION;
	public static double PERCENT_AROUND_GRID_CENTER;
	public static int EXPLOIT_ERROR;
	public static int MAX_SAMPLES;
	public static double PERCENT_AROUND_BOUNDARY;
	public static int RANDOM_AROUND_BOUNDARIES;
	public static double PERCENT_AROUND_MISCLASSIFIED;
	public static int EXPLOIT_SAMPLES;
	public static String TABLE_NAME;
	public static String GRID_FOLDER;
	public static String TRAINING_FILE_NAME;
	public static String SHADOW_TRAINING_FILE_NAME;
	public static ArrayList<Attribute> attributes;
	public static ArrayList<Attribute> visualAttributes;
	public static Set<Tuple> targetSamples;
	public static int NUMBER_OF_GRIDS;
	public static int GRID_DIVIDING_FACTOR;
	public static int EXPLORATION_TECHNIQUE;
	public static int MISCLASSIFIED_TECHNIQUE;
	public static String DATA_SPACE_FILE;
	public static Boolean DISTANCE_HINT = false;
	public static double DENSITY_THRESHOLD;
	public static String CLUSTER_FOLDER;
	public static String targetQuery;
	public static boolean ADAPTIVE_BOUNDARY;

	//user can skip certain phase
	public static boolean SKIP_OBJECTDISCOVERY;
	public static boolean SKIP_MISCLASSIFIEDEXPLOITATION;
	public static boolean SKIP_BOUNDARYEXPLOITATION;

	public static boolean DO_Object;

	//public static boolean DEMO; //if true we are running in the demo mode (no targetSamples, no targetQuery etc.)

	public static boolean HISTOGRAM_SAMPLING;

	public static boolean STEP_BY_STEP;                        // users can control every iteration or not. kemi
	public static CMDController CMDCONTROLLER;                //used to parse and controll command, by Kemi
	public static int DRIVER_VERSION;                        // now, only 2 version, original one and shadow
	public static String CACHED_FILE_FOLDER;

	public static double DISTANCE;                            // KEMI, for distance hint.
	public static Boolean FOCUSED_EXPLORATION;

	public static boolean SHOW_STATUS_EVERY_ITERATION;

	public static String OBJECT_KEY;

	public static int SCENARIO;
	public static String TARGET_QUERY;

	//private static JSONObject m_config = null;
	private static AttriFocsDomain[] m_domains = null;    // by KEMI, to store the focus domains read from config file.

	public static long SEED;   // zhan: seed used in object discovery, when randomly get samples from file.
	
	public static int QUERYNUMBER = -1; // KEMI
	public static JSONObject QUERIES [] = null; // kemi
	/**
	 * @param config a JSONObject that represents the JSON file that contains
	 *               all the info for algorithm/query etc.
	 * @throws JSONException
	 */
	public static void execute(JSONObject config, JSONObject configFrontEnd, int the_idx) throws JSONException {

		//front end config file
		JSONObject queryFE = QUERIES[the_idx]; //configFrontEnd.getJSONObject("query");
		JSONObject demo = configFrontEnd.getJSONObject("demo"); //contains scenario and target query
	
		String sc = demo.getString("scenario");
		if(sc.contains("1")){
			SCENARIO = 1;
			targetQuery = "SELECT price, beds, baths, size, pricesqrf, crime, population, prc_college, income FROM real_estate WHERE (beds < 3 and price < 200000)";
			TARGET_QUERY = targetQuery;
			//read samples from file
		}else if(sc.contains("2")){
			targetQuery = demo.getString("target_query");
			SCENARIO = 2;
			//use target query
		}else if(sc.contains("3")){
			//don't do anything yet.
			SCENARIO = 3;
		}else if(sc.contains("4")){
			targetQuery = demo.getString("target_query");
			if(targetQuery.contains("1")){
				targetQuery = "SELECT rowc, colc FROM sdss_random_sample WHERE (rowc >= 500 AND rowc <= 650 AND  colc >= 1100 AND colc <= 1400 )";
				//targetQuery = "SELECT rowc, colc FROM sdss_random_sample WHERE (rowc >= 120 AND rowc <= 200 AND  colc >= 340 AND colc <= 440 ) OR (rowc >= 1100 AND rowc <= 1200 AND  colc >= 1100 AND colc <= 1400 )";
			}else if(targetQuery.contains("2")){
				targetQuery = "SELECT ra, dec FROM sdss_random_sample WHERE  ( ra >= 70 and ra <= 100 and dec >= -9.6 AND dec <= 0.5 )";
			}else if(targetQuery.contains("3")){
				targetQuery = "SELECT rowc, colc FROM sdss_random_sample WHERE (rowc >= 120 AND rowc <= 200 AND  colc >= 340 AND colc <= 440 ) OR (rowc >= 1100 AND rowc <= 1200 AND  colc >= 1100 AND colc <= 1400 )";
			}
			TARGET_QUERY = targetQuery;
			SCENARIO = 4;
		}
		
		/* kemi */
		targetQuery = QUERIES[the_idx].getString("targetQuery");
		TARGET_QUERY = targetQuery;
		/* kemi */

		OBJECT_KEY = queryFE.getString("key");

		JSONObject algorithm = config.getJSONObject("algorithm");
		JSONObject optimizations = config.getJSONObject("optimizations");
		JSONObject classificationAlgorithm = config.getJSONObject("classificationAlgorithm");
		JSONObject controller = config.getJSONObject("controller");


		//number of random samples around the misclassified sample
		RANDOM_AROUND_MISCLASSIFIED = algorithm.getInt("randomAroundMisclassified");

		//number of random samples around the boundaries	
		RANDOM_AROUND_BOUNDARIES = algorithm.getInt("randomAroundBoundaries");
		//is adaptive sampling optimization on around the boundaries			
		ADAPTIVE_BOUNDARY = algorithm.getBoolean("adaptiveBoundary");

		//number of extra samples around the center of the grid to be cached in file
		EXPLORE_EXTRA_SAMPLES = algorithm.getInt("exploreExtraSamples");
		//number of samples per iteration
		SAMPLES_PER_ITERATION = algorithm.getInt("samplesPerIteration");
		//percentange for exploration around the grid center
		PERCENT_AROUND_GRID_CENTER = algorithm.getDouble("percentAroundGridCenter");
		//a file that contains the entire data in the data space in arff format.To be used by the clustering object
		//discovery technique in order to create clusters in the data space.
		//DATA_SPACE_FILE = algorithm.getString("dataSpaceFile");
		//boundary exploit error (used to calculate how many samples around boundary to gather)
		EXPLOIT_ERROR = algorithm.getInt("exploitError");
		//maximum number of samples to stop exploration
		MAX_SAMPLES = algorithm.getInt("maxNumberOfSamples");
		//percentange for exploration around a boundary
		PERCENT_AROUND_BOUNDARY = algorithm.getDouble("percentAroundBoundary");
		PERCENT_AROUND_MISCLASSIFIED = algorithm.getDouble("percentAroundMisclassified");
		//number of samples to collect around boundaries
		EXPLOIT_SAMPLES = algorithm.getInt("exploitSamples");
		CLUSTER_FOLDER = algorithm.getString("clusterFolder");
		//the misclassified exploitation technique to be used, 0 to sample around each misclassified sample
		//1 to create clusters of misclassified and sample the clusters
		MISCLASSIFIED_TECHNIQUE = algorithm.getInt("misclassifiedTechnique");
		//database table name
		TABLE_NAME = queryFE.getString("tableName");
		//fileName of the training file for the data classification algorithm
		TRAINING_FILE_NAME = classificationAlgorithm.getString("trainingFileName");
		//similar to TRAINING_FILE_NAME, but it is used to store a different state, to compare to the original one
		SHADOW_TRAINING_FILE_NAME = classificationAlgorithm.getString("shadowTrainingFileName");
		//the folder that contains the grids
		GRID_FOLDER = algorithm.getString("gridFolder");
		//how many pieces should you break a grid cell into (in one attribute)
		GRID_DIVIDING_FACTOR = algorithm.getInt("gridDividingFactor");
		//number of break-downs for every domain of every relevant attribute
		NUMBER_OF_GRIDS = algorithm.getInt("numberOfGrids");
		System.out.println("numberOfGrids: "+NUMBER_OF_GRIDS);
		//the density threshold for a grid cell for the hybrid object discovery method
		DENSITY_THRESHOLD = optimizations.getDouble("densityThreshold");
		//the target query -> true user interest
		//targetQuery = targetQ.getString("targetQuery");
		JSONArray array = queryFE.getJSONArray("attributes");
		//attributes selected by the user as interesting
		attributes = new ArrayList<Attribute>();
		// for distance hint
		DISTANCE = optimizations.getDouble("distance");
		// hint of exploration
		FOCUSED_EXPLORATION = queryFE.getBoolean("focusedExploration");

		SEED = algorithm.getLong("seed");

		CACHED_FILE_FOLDER = "";    //zhan: if not initiated, folder starts with "null"
		for (int i = 0; i < array.length(); i++) {
			Attribute attr = new Attribute(array.getString(i), getDomain(array.getString(i)));
			attributes.add(attr);
			System.out.println("Domain size for:"+attr.getName()+" = "+attr.getDomain().size());
			System.out.println("Domain max: "+attr.getMaxValue()+" domain min: "+attr.getMinValue());
			CACHED_FILE_FOLDER += array.getString(i);
			if (i != array.length() - 1) {
				CACHED_FILE_FOLDER += "&";
			}
		}
		if(Global.SCENARIO == 2 || Global.SCENARIO == 4 || Global.SCENARIO == 1){
			try {
				//execute the target query and write the target samples into an arff file
				executeTargetQuery();
			} catch (IOException | SQLException e) {
				e.printStackTrace();
			}
		}
		//if the user has selected to focus his exploration on a specific domain range
		//then trim the domains for all the attributes to be the specified by the user ranges.
		//Domain ranges for all attributes should be specified
		//if the user needs to trim even one domain.
		if (FOCUSED_EXPLORATION) {
			trimDomains(queryFE);
		}
		//the object discovery technique to be used , 0 for grids, 1 for clustering
		EXPLORATION_TECHNIQUE = algorithm.getInt("objectDiscoveryTechnique");
		if (EXPLORATION_TECHNIQUE == 1 || EXPLORATION_TECHNIQUE == 2) {
			loadDataSpace();
		}
		//if the user has given us a distance hint for his relevant area (such as
		//the relevant area will be occupying 10% of the domain) then we can use this hint
		//in the relevant object discovery phase to build grids of the same size.
		//This guarantees that we will discover the relevant area in the first
		//exploration level.
		if (optimizations.getBoolean("distanceHint")) {
			DISTANCE_HINT = true;
			NUMBER_OF_GRIDS = (int) Math.ceil(100 / optimizations.getDouble("distance")); //we want the ceiling of the integer
		}                                                                                //in case the division is not exact in order to make
		//enough grids to discover the area

		HISTOGRAM_SAMPLING = controller.getBoolean("histogramSampling");
		DO_Object = controller.getBoolean("doObject");
		SKIP_OBJECTDISCOVERY = controller.getBoolean("skipObjectDiscovery");
		SKIP_MISCLASSIFIEDEXPLOITATION = controller.getBoolean("skipMisclassifiedExploitation");
		SKIP_BOUNDARYEXPLOITATION = controller.getBoolean("skipBoundaryExploitation");
		STEP_BY_STEP = controller.getBoolean("stepByStep");
		DRIVER_VERSION = 0;        //At first, it should be original version, which is 0. By kemi
		SHOW_STATUS_EVERY_ITERATION = controller.getBoolean("showStatusEveryIteration");
		CMDCONTROLLER = new CMDController();    //initialize command controller, by Kemi
		//	readFocsDomains();                        // by kemi, read focus domains from config file

		JSONArray arrayVisual = queryFE.getJSONArray("visualAttributes");
		//attributes selected by the user as interesting
		visualAttributes = new ArrayList<Attribute>();
		for (int i = 0; i < arrayVisual.length(); i++) {
			String theAttr = arrayVisual.getString(i);
			Attribute attr = new Attribute(theAttr, null); //no need for the domain values of the visual attributes
			visualAttributes.add(attr);
		}
		createFolder(GRID_FOLDER, false);
		createFolder(CLUSTER_FOLDER, false);
		createFolder(CACHED_FILE_FOLDER, true);

		//TABLE_ATTR_STAT = new TableAttrStat();
		TARGET_QUERY = targetQuery; // deleted by kemi
	}
	
	public Global(JSONObject config, JSONObject configFrontEnd) throws JSONException {
		JSONObject algorithm = config.getJSONObject("algorithm");
		QUERYNUMBER = algorithm.getInt("queryNumber");
		
		QUERIES = new JSONObject [QUERYNUMBER];
		String standard_query_pre = new String("query_");
		for (int idx=0; idx<QUERYNUMBER; idx++) {
			QUERIES[idx] = config.getJSONObject(standard_query_pre + idx);
		}
	}

	private static void createFolder(String folderName, boolean f) {		
		if(f)
			folderName = ""+GRID_FOLDER+"/"+CACHED_FILE_FOLDER; 

		File file = new File(""+folderName);
		if (!file.exists()) {
			if (file.mkdir()) {
				System.out.println("Directory "+folderName+" is created!");
			} else {
				System.out.println("Failed to create directory!");
			}
		}
	}

	/**
	 * This method loads the entire data space into an arff file
	 * in order to be used by the clustering exploration technique
	 */
	private static void loadDataSpace() {  
		StringBuilder fileName = new StringBuilder();
		for(int i=0; i<attributes.size(); i++){
			fileName.append(attributes.get(i).getName());
		}
		fileName.append("wholeSpace.arff");
		DATA_SPACE_FILE = fileName.toString();
		ArffFile arffFile = new ArffFile(DATA_SPACE_FILE);
		ArrayList<String> dataSpace = new ArrayList<String>();
		if (!arffFile.exists()) {
			System.out.println("Loading the whole data space file...");
			arffFile.createDataFileForKmeans();
			Connection connection = DBConnection.getConnection();
			Statement statement2 = null;
			try {
				statement2 = connection.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);
				String query = "SELECT ";
				for (int i = 0; i < Global.attributes.size(); i++) {
					if (i != Global.attributes.size() - 1)
						query += Global.attributes.get(i).getName() + " , ";
					else
						query += Global.attributes.get(i).getName();
				}
				query += " FROM " + Global.TABLE_NAME;
				ResultSet resultSet = null;
				resultSet = statement2.executeQuery(query);

				while (resultSet.next()) {
					StringBuilder result = new StringBuilder();
					for (int i = 1; i <= attributes.size(); i++) {
						if (!resultSet.getString(i).contains("null") && i < attributes.size()) {
							result.append(resultSet.getString(i) + " , ");
						} else if (i == attributes.size()) {
							result.append(resultSet.getString(i));
						}
					}
					dataSpace.add(result.toString());
				}
				resultSet.close();
				statement2.close();
			} catch (Exception e) {
				e.printStackTrace();
			}
			arffFile.appendStringArrayList(dataSpace); //append the entire data space to the arff file
		}
	}

	/**
	 * Trim the domains of all attributes to be within the specified ranges.
	 *
	 * @param o JSONObject to read info about the ranges of each attribute.
	 * @throws JSONException
	 */
	private static void trimDomains(JSONObject o) throws JSONException {
		JSONArray array = o.getJSONArray("lowerBounds");
		JSONArray array1 = o.getJSONArray("upperBounds");

		for (int i = 0; i < attributes.size(); i++) {
			attributes.get(i).trimDomain(array.getDouble(i), array1.getDouble(i));
		}
	}

	/**
	 * by Kemi
	 * Finish the same job, but for other CMDController object to call.
	 *
	 * @throws JSONException
	 */
	public static void trimDomains() {

		for (int i = 0; i < attributes.size(); i++) {
			for (int n = 0; n < m_domains.length; n++) {
				if (m_domains[n].name.equals(attributes.get(i).getName())) {
					attributes.get(i).trimDomain(m_domains[n].val1, m_domains[n].val2);
					break;
				}
			}
		}
	}

	public static void resetDomains() throws JSONException {
		for (int i = 0; i < attributes.size(); i++) {
			attributes.get(i).resetDomain();
		}
	}

	public static String attriFocsDomains() {
		String res = "";
		for (int i = 0; i < m_domains.length; i++) {
			res += m_domains[i].name;
			res += ": ";
			res += Double.toString(m_domains[i].val1);
			res += " to ";
			res += Double.toString(m_domains[i].val2);
			if (i != attributes.size() - 1) res += "\n";
		}
		return res;
	}

	public static boolean setFocsDomains(String name, double val1, double val2) {
		boolean res = false;
		for (int i = 0; i < m_domains.length; i++) {
			if (m_domains[i].name.equals(name)) {
				res = true;
				m_domains[i].val1 = val1;
				m_domains[i].val2 = val2;
				break;
			}
		}

		if (FOCUSED_EXPLORATION) {
			trimDomains();
		}

		return res;
	}

	//	private void readFocsDomains() throws JSONException {
	//		JSONObject o = m_config.getJSONObject("optimizations");
	//		m_domains = new AttriFocsDomain[attributes.size()];
	//		for (int i = 0; i < attributes.size(); i++) {
	//			AttriFocsDomain domains = new AttriFocsDomain();
	//			JSONArray array = o.getJSONArray(attributes.get(i).getName());
	//			domains.name = attributes.get(i).getName();
	//			domains.val1 = array.getDouble(0);
	//			domains.val2 = array.getDouble(1);
	//			m_domains[i] = domains;
	//		}
	//	}


	/**
	 * Executes a query that brings the domain of the specified attribute from the db and returns
	 * it as an arraylist.
	 *
	 * @param attr the name of the attribute as a String
	 * @return an arraylist that contains the domain of the attribute. Each value will be a String
	 */
	private static ArrayList<Object> getDomain(String attr) {
		ArrayList<Object> attributeDomain = new ArrayList<Object>();
		OutputFile attrFile = new OutputFile(attr + ".txt");
		if (!attrFile.exists()) { //if the attribute file doesn't exist then send a query to the database
			//to fetch the entire domain of the attribute and store it in memory.
			System.out.println("Fetching domain for attribute: \"" + attr + "\" from the database.");
			Connection connection = DBConnection.getConnection();
			Statement statement2 = null;
			try {
				statement2 = connection.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);

				String query = "SELECT DISTINCT " + attr + " FROM " + Global.TABLE_NAME + " ORDER BY " + attr;
				ResultSet resultSet = null;
				resultSet = statement2.executeQuery(query);

				while (resultSet.next()) {
					if (resultSet.getString(1) != null && !resultSet.getString(1).contains("null")) {  //zhan: when run ra, resultSet.getString(1) could equal to null
						StringBuilder result = new StringBuilder();
						result.append(resultSet.getString(1));
						attributeDomain.add(result.toString());
					}
				}
				resultSet.close();
				statement2.close();
				//write the domain into a file named: "attributeName.txt". For example "rowc.txt".
				attrFile.writeArrayList(attributeDomain);
			} catch (Exception e) {
				e.printStackTrace();
			}
		} else { //if the domain file exists, read the values of the domain into an arraylist and return it
			try {
				attributeDomain = attrFile.readFileIntoArrayList();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		return attributeDomain;
	}


	/**
	 * Executes the TargetQuery and fills in a set with the target samples
	 *
	 * @throws IOException
	 * @throws SQLException
	 */
	public static void executeTargetQuery() throws IOException, SQLException {
		targetSamples = new HashSet<Tuple>();
		//System.out.println("Fetching target samples");
		Connection connection = DBConnection.getConnection();
		Statement statement = connection.createStatement();
		String targetQueryWithKey = "SELECT "+Global.OBJECT_KEY+" , "+targetQuery.substring(6); //adds the key to the targetQuery.
		System.out.println("Executing target query: "+targetQueryWithKey);
		ResultSet rs = statement.executeQuery(targetQueryWithKey);
		while (rs.next()) {
			Object key = rs.getString(1);
			Object[] attrValues = new Object[Global.attributes.size()];
			for(int m=1; m<=Global.attributes.size(); m++){
				attrValues[m-1] = rs.getString(m+1); 
			}
			Tuple tuple = new Tuple(key, attrValues);

			targetSamples.add(tuple);
		}
		System.out.println("TargetSamples size: "+targetSamples.size());
	}

}


//"user_km": "kermit",
//"user_zhan": "zhanli",
//"pwd_km": "n71lGEt!",
//"pwd_zhan": "FnoD58ej",