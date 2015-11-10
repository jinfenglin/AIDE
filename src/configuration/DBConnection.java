package configuration;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.json.JSONObject;



public class DBConnection {
	public static Connection connection = null;

	/**	It connects to postgres using jdbc. Information about the database are read from the config file.
	 * 
	 * @param config 	the configuration file object.
	 * @throws SQLException  if we cannot connect to the database.
	 */
	public void connect(JSONObject config) throws SQLException{
		try{
			JSONObject db = config.getJSONObject("db");
			String host = db.getString("host");
			String user = db.getString("user");
			String password = db.getString("pwd");
			String dbName = db.getString("db");
			String driver = "org.postgresql.Driver";
			int port = db.getInt("port");

			Class.forName(driver).newInstance();
			connection = DriverManager.getConnection("jdbc:postgresql://"+host+":"+port+"/"+dbName, user, password);


			//connect to mysql
			//Class.forName("com.mysql.jdbc.Driver").newInstance();
			//connection = DriverManager.getConnection("jdbc:mysql://xcn02.cs-i.brandeis.edu:3306/sdssData?user=kiki&password=bbBPu39wy>ds");

			if (connection != null){
				System.out.println("Connected");
			}else
				System.out.println("Connection Failed!");
		}
		catch(Exception e){
			e.printStackTrace();
		}
	}

	/**Returns the connection object to the database.
	 * 
	 * @return a Connection object.
	 */
	public static Connection getConnection(){
		return connection;
	}

}
