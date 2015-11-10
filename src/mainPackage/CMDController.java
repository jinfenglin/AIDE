package mainPackage;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Scanner;

import org.json.JSONException;

import metrics.EvaluateModel;
import configuration.DBConnection;
import configuration.Global;

public class CMDController {
	private List<String> m_validCmds = new LinkedList<String> ();
	private boolean m_isExit;
	private UserModel m_model;
	private HashMap<Integer, State> m_stateMap;
	int m_iterNum;
	int m_numSkip;
	public CMDController() {
		m_validCmds.add("exit");	
		m_validCmds.add("cont");
		m_validCmds.add("obj");
		m_validCmds.add("mis");
		m_validCmds.add("bound");
		m_validCmds.add("exptech");
		//m_validCmds.add("mistech");    // zhan: overlap with clusterMis
		m_validCmds.add("status");
		m_validCmds.add("back");
		m_validCmds.add("switch");
		m_validCmds.add("focshint");
		m_validCmds.add("dishint");
		m_validCmds.add("distance");
		m_validCmds.add("focus");
		m_validCmds.add("adapt");
		m_validCmds.add("rnbound");
		m_validCmds.add("clusterMis");   // zhan: turn on/off clustering-based misclassified
		m_isExit = false;
		m_model = null;
		m_stateMap = null;
		m_iterNum = 0;
		m_numSkip = 0;
	}
	public int readInput(HashMap<Integer, State> stateMap, int iterNum) {
		
		m_stateMap = stateMap;
		m_iterNum = iterNum;
		
		String [] cmdAndArgs = null;
		Scanner sc = new Scanner(System.in);
		int resIter = -1;
		if(m_numSkip == 0) {
			do {
				System.out.print(">");
				
				String cmdline = sc.nextLine();
				
				cmdAndArgs = cmdline.split("\\s+");
				
				if(cmdAndArgs[0].equals("back")) {
					if (cmdAndArgs.length != 1) {
						int targetIterNum = m_iterNum - Integer.parseInt(cmdAndArgs[1]) - 1;
						
						if(m_stateMap.containsKey(targetIterNum)) {
							resIter = targetIterNum;
						}
					}
				}
				
				if(cmdAndArgs[0].equals("switch")) {
					if(Global.DRIVER_VERSION == 0){
						resIter = m_stateMap.size() - 1;
					}else {
						resIter = -2;
					}
				}
			} while (!processCmd(cmdAndArgs));
			
			 
		} else {
			m_numSkip--;
		}	
		return resIter;
	}
	
	private boolean processCmd(String [] cmdAndArgs) {
		if (cmdAndArgs == null) {
			return false;
		}
		
		if(!m_validCmds.contains(cmdAndArgs[0])) {
			System.out.println("Invalid Command");
			return false;
		}
		
		if(cmdAndArgs[0].equals("exit")) {
			m_isExit = true;
			return true;
		}
		
		if(cmdAndArgs[0].equals("cont")) {
			if (cmdAndArgs.length > 1) {
				m_numSkip = Integer.parseInt(cmdAndArgs[1]) - 1;
			} else {
				m_numSkip = 0;
			}
			
			if (m_numSkip < 0) m_numSkip = 0;
			return true;
		}
		
		if(cmdAndArgs[0].equals("obj")) {
			if(cmdAndArgs.length == 1) {
				System.out.println("SKIP_OBJECTDISCOVERY = "+ Global.SKIP_OBJECTDISCOVERY);
				return false;
			}
			if (cmdAndArgs[1].equals("off")) {
				Global.SKIP_OBJECTDISCOVERY = true;
				return false;
			} else if (cmdAndArgs[1].equals("on")) {
				Global.SKIP_OBJECTDISCOVERY = false;
				return false;
			} else {
				System.out.println("Invalid argument");
				return false;
			}
		}
		
		if(cmdAndArgs[0].equals("mis")) {
			if(cmdAndArgs.length == 1) {
				System.out.println("SKIP_MISCLASSIFIEDEXPLOITATION = "+ Global.SKIP_MISCLASSIFIEDEXPLOITATION);
				return false;
			}
			if (cmdAndArgs[1].equals("off")) {
				Global.SKIP_MISCLASSIFIEDEXPLOITATION = true;
				return false;
			} else if (cmdAndArgs[1].equals("on")) {
				Global.SKIP_MISCLASSIFIEDEXPLOITATION = false;
				return false;
			} else {
				System.out.println("Invalid argument");
				return false;
			}
		}
		
		if(cmdAndArgs[0].equals("exptech")) {
			if(cmdAndArgs.length == 1) {
				switch (Global.EXPLORATION_TECHNIQUE) {
				case 0: {
					System.out.println("grid");
					return false;
				}
				case 1:{
					System.out.println("cluster");
					return false;
				}
				case 2:{
					System.out.println("hybrid");
					return false;
				}
				default:{
					System.out.println("It should never be here");
					return false;
				}
				}
			} else {
				if (Integer.parseInt(cmdAndArgs[1]) >=0 && Integer.parseInt(cmdAndArgs[1])<3) {
					Global.EXPLORATION_TECHNIQUE = Integer.parseInt(cmdAndArgs[1]);
					return false;
				} else {
					System.out.println("Only support grid(0), cluster(1), and hygrid(2)");
					return false;
				}
				
			}
		}
		
		if(cmdAndArgs[0].equals("clusterMis")) {
			if(cmdAndArgs.length == 1) {
				switch (Global.MISCLASSIFIED_TECHNIQUE) {
				case 0: {
					System.out.println("no clustering exploration");
					return false;
				}
				case 1:{
					System.out.println("clustering exploration");
					return false;
				}
				default:{
					System.out.println("It should never be here");
					return false;
				}
				}
			} else {
				switch (cmdAndArgs[1]) {
					case "on": {
						Global.MISCLASSIFIED_TECHNIQUE = 1;
						return false;
					}
					case "off": {
						Global.MISCLASSIFIED_TECHNIQUE = 0;
						return false;
					}
					default:{
						System.out.println("Invalid command! Please specify on/off");
						return false;
					}

				}
			}
		}
		
		if(cmdAndArgs[0].equals("focshint")) {
			try {
				if(cmdAndArgs.length == 1) {
					System.out.println(Global.FOCUSED_EXPLORATION);
					return false;
				} else {
					if (cmdAndArgs[1].equals("off")) {
						Global.FOCUSED_EXPLORATION = false;
						Global.resetDomains();
						return false;
					} else if (cmdAndArgs[1].equals("on")) {
						Global.FOCUSED_EXPLORATION = true;
						Global.trimDomains();
						return false;
					} else {
						System.out.println("Invalid argument");
						return false;
					}
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		if(cmdAndArgs[0].equals("dishint")) {
			if(cmdAndArgs.length == 1) {
				System.out.println(Global.DISTANCE_HINT);
				return false;
			} else {
				if (cmdAndArgs[1].equals("off")) {
					Global.DISTANCE_HINT = false;
					return false;
				} else if (cmdAndArgs[1].equals("on")) {
					Global.DISTANCE_HINT = true;
					Global.NUMBER_OF_GRIDS = (int)Math.ceil(100/Global.DISTANCE);
					return false;
				} else {
					System.out.println("Invalid argument");
					return false;
				}
			}
		}

		if(cmdAndArgs[0].equals("distance")) {
			if(cmdAndArgs.length == 1) {
				System.out.println(Global.DISTANCE);
				return false;
			} else {
				Global.DISTANCE = Double.parseDouble(cmdAndArgs[1]);
				
				if(Global.DISTANCE_HINT) {
					Global.NUMBER_OF_GRIDS = (int)Math.ceil(100/Global.DISTANCE);
				}
				return false;
			}
		}
		
		if(cmdAndArgs[0].equals("focus")) {
			if(cmdAndArgs.length == 1) {			
				System.out.println(Global.attriFocsDomains());
				return false;
			} else if(cmdAndArgs.length > 3) {
				if(!Global.setFocsDomains(cmdAndArgs[1], Double.parseDouble(cmdAndArgs[2]), Double.parseDouble(cmdAndArgs[3]))) {
					System.out.println("Atrribute name is incorrect!");
				}
				return false;
			} else {
				System.out.println("Invalid arguments!");
			}
		}
		
		if(cmdAndArgs[0].equals("adapt")) {
			if(cmdAndArgs.length == 1) {
				System.out.println(Global.ADAPTIVE_BOUNDARY);
				return false;
			}
			if (cmdAndArgs[1].equals("off")) {
				Global.ADAPTIVE_BOUNDARY = false;
				return false;
			} else if (cmdAndArgs[1].equals("on")) {
				Global.ADAPTIVE_BOUNDARY = true;
				return false;
			} else {
				System.out.println("Invalid argument");
				return false;
			}
		}
		
		if(cmdAndArgs[0].equals("rnbound")) {
			if(cmdAndArgs.length == 1) {
				System.out.println(Global.RANDOM_AROUND_BOUNDARIES);
				return false;
			} else {
				Global.RANDOM_AROUND_BOUNDARIES = Integer.parseInt(cmdAndArgs[1]);
				return false;
			}
		}
		
		if(cmdAndArgs[0].equals("bound")) {
			if(cmdAndArgs.length == 1) {
				System.out.println("SKIP_BOUNDARYEXPLOITATION = "+ Global.SKIP_BOUNDARYEXPLOITATION);
				return false;
			}
			if (cmdAndArgs[1].equals("off")) {
				Global.SKIP_BOUNDARYEXPLOITATION = true;
				return false;
			} else if (cmdAndArgs[1].equals("on")) {
				Global.SKIP_BOUNDARYEXPLOITATION = false;
				return false;
			} else {
				System.out.println("Invalid argument");
				return false;
			}
		}
		
		if(cmdAndArgs[0].equals("status")) {
			if (m_model == null) {
				System.out.println("User model is not built yet.");
				return false;
			}
			
			printStatus();
			return false;
		}
		
		if(cmdAndArgs[0].equals("back")) {
			if (cmdAndArgs.length == 1) {
				System.out.println("Invalid argument");
				return false;
			}
			
			int targetIterNum = m_iterNum - Integer.parseInt(cmdAndArgs[1]) - 1;
			
			State state = null;
			if(m_stateMap.containsKey(targetIterNum)){
				state = m_stateMap.get(targetIterNum);
			} else {
				System.out.println("Iteration number is wrong!");
				return false;
			}
			
			try {
				FileWriter fwriter = new FileWriter(Global.SHADOW_TRAINING_FILE_NAME, false);
				BufferedReader freader = new BufferedReader(new FileReader(Global.TRAINING_FILE_NAME));
				
				for(int lineNum=0; lineNum<state.getOffset(); lineNum++) {
					String line = freader.readLine();
					fwriter.write(line + "\n");
				}
				
				fwriter.close();
				freader.close();
				
				Global.DRIVER_VERSION = 1; //1 read everything from shadow training
				
				m_model = new DTUserModel();
				((DTUserModel) m_model).buildTree();
			
				
			} catch (Exception e) {
				e.printStackTrace();
			}
			
			return false;
		}
		if(cmdAndArgs[0].equals("switch")) {
			Global.DRIVER_VERSION = (Global.DRIVER_VERSION+1)%2;
			m_model = new DTUserModel();
			try {
				((DTUserModel) m_model).buildTree();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			return false;
		}
		return false;
	}
	
	public EvaluateModel printStatus(){
		String predictQuery = "";
		predictQuery = m_model.translateToSQL();
		
		ArrayList<Tuple> samples = new ArrayList<Tuple>();
		try {
			samples.addAll(runQuery(predictQuery));
		} catch (Exception e) {
			//e.printStackTrace();
		}

		EvaluateModel evaluater = new EvaluateModel(samples);
		System.out.println("Precision of this iteration is " + evaluater.precision());
		System.out.println("Recall of this iteration is " + evaluater.recall());
		System.out.println("F-measure of this iteration is " + evaluater.fmeasure());
		
		return evaluater;
	}
	
	public void updateModel(UserModel model) {
		m_model = model;
	}
	
	/**Sends the query to the database and returns an arraylist with the tuples
	 * that the query returned.
	 * 
	 * @param query  the query to send to the db
	 */
	public ArrayList<Tuple> runQuery(String predictedQuery) throws SQLException, IOException {
		if(predictedQuery.equals("") || predictedQuery.equals("null") || predictedQuery.equals(null) || predictedQuery.equals("Empty") || predictedQuery.endsWith("WHERE ") || predictedQuery.endsWith("WHERE"))return new ArrayList<Tuple>();
		StringBuilder q = new StringBuilder();
		q.append("SELECT "+Global.OBJECT_KEY+", ");
		q.append(predictedQuery.substring(15));
		ArrayList<Tuple> toReturn = new ArrayList<Tuple>();
		Connection connection = DBConnection.getConnection();
		Statement statement = connection.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_READ_ONLY);
		ResultSet rs = statement.executeQuery(q.toString());
		while(rs.next()){
			Object key = rs.getString(1);
			Object[] attrValues = new Object[Global.attributes.size()];
			for(int m=1; m<=Global.attributes.size(); m++){
				attrValues[m-1] = rs.getString(m+1); 
			}
			Tuple tuple = new Tuple(key, attrValues);
			toReturn.add(tuple);
		}
		return toReturn;
	}
	
	public boolean isExit() {
		return m_isExit;
	}
}
