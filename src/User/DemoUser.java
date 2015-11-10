package User;

import java.util.HashSet;

import mainPackage.Tuple;
import weka.core.Instance;

public class DemoUser implements User {

	@Override
	public int setClass(Tuple sample) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public HashSet<Long> getLabeledKeys() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public int getPositiveCount() {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public int getNegativeCount() {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public void increasePosCount() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void increaseNegCount() {
		// TODO Auto-generated method stub
		
	}

}
