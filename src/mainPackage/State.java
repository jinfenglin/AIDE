package mainPackage;

import weka.classifiers.trees.J48;

public class State {
	private int m_offset;
	//private J48 m_J48;
	private int m_totalSamples;
	private LinearExploration m_exploration;
	public State() {
		m_offset = 0;
		//m_J48 = null;
		m_totalSamples = 0;
		m_exploration = null;
	}
	
	public int getOffset() {
		return m_offset;
	}
	
	public void setOffset(int offsetVal) {
		m_offset = offsetVal;
	}
	
//	public J48 getUserModel() {
//		return m_J48;
//	}
	
//	public void setUserModel(J48 modelVal) {
//		m_J48 = modelVal;
//	}
	
	public int getTotalSamples() {
		return m_totalSamples;
	}
	
	public void setTotalSamples(int totalVal) {
		m_totalSamples = totalVal;
	}
	
	public LinearExploration getExploration() {
		return m_exploration;
	}
	
	public void setExploration(LinearExploration explorationVal) {
		m_exploration = (LinearExploration)explorationVal.clone();
	}
}
