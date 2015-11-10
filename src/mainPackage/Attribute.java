package mainPackage;

import java.util.ArrayList;

import configuration.Global;

public class Attribute {
	
	private String name;
	private ArrayList<Object> domain;
	private ArrayList<Object> originalDomain;
	
	/**Creates a new attribute.
	 * 
	 * @param name   The name of the attribute
	 * @param domain The entire domain of the attribute in an arraylist
	 * 				 stored in increasing order.
	 */
	public Attribute(String name, ArrayList<Object> domain){
		this.name = name;
		this.domain = domain;
		this.originalDomain = domain;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public ArrayList<Object> getDomain() {
		return domain;
	}

	public void setDomain(ArrayList<Object> domain) {
		this.domain = domain;
	}
	
	public void resetDomain() {
		this.domain = this.originalDomain;
	}
	
	/**It trims the domain of the attribute starting 
	 * from the start value up to the end value.
	 * 
	 * @param start  The new starting value of the domain will be the first
	 * 				 larger than start value in the domain .
	 * @param end	 The new ending value of the domain will be the least smallest value of the end.
	 */
	public void trimDomain(Double start, Double end){
		ArrayList<Object> a = new ArrayList<Object>();
		for(int i=0; i<this.originalDomain.size(); i++){
			if(Double.parseDouble(""+originalDomain.get(i))>=start 
					&& Double.parseDouble(""+originalDomain.get(i))<=end){
				a.add(this.originalDomain.get(i));
			}
		}
		this.setDomain(a);
	}
	
	public Object getMinValue(){
		return domain.get(0);
	}
	
	public Object getMaxValue(){
		return domain.get(domain.size()-1);
	}

}
