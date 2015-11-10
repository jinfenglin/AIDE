package mainPackage;

import java.util.ArrayList;

import org.json.JSONArray;
import org.json.JSONException;

public interface UserModel extends Cloneable {
	
	public String translateToSQL();

	public ArrayList<Tuple> getMissclassified() throws Exception;
	
	public Object clone();
	
	public Integer labelObject(double[] o) throws Exception;
	
	public JSONArray getRanges(String query) throws JSONException;
	
	public JSONArray getRelevantAttributes(String query);

}
