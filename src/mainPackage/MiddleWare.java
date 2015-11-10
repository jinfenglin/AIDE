package mainPackage;

import java.util.ArrayList;

public interface MiddleWare {
	
	UserModel classify(ArrayList<Tuple> samples, ArrayList<Integer> labels);
	
	ArrayList<Tuple> explore(UserModel model, int relevantFromExplore);
	
}
