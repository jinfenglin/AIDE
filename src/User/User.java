package User;

import java.util.HashSet;

import mainPackage.Tuple;

public interface User {
	
	public int setClass(Tuple sample);
	public HashSet<Long> getLabeledKeys();
	public int getPositiveCount();
	public int getNegativeCount();
	public void increasePosCount();
	public void increaseNegCount();

}
