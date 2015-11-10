package mainPackage;

public class Tuple{
	private Object[] attrValues;
	private Object key;

	public Tuple(Object key, Object[] values){
		this.setKey(key);
		this.setAttrValues(values);
	}

	public Object[] getAttrValues() {
		return attrValues;
	}

	public void setAttrValues(Object[] attrValues) {
		this.attrValues = attrValues;
	}

	public Object valueAt(int i){
		return attrValues[i];
	}
	
	@Override
	public String toString(){
		StringBuilder theString = new StringBuilder();
		for(int i=0; i<attrValues.length; i++){
			if(i!=attrValues.length-1)
				theString.append(""+attrValues[i]+" , ");
			else
				theString.append(""+attrValues[i]);
		}
		return theString.toString();
	}

	@Override
	public int hashCode() {
		int hash = 5;
		for(int i=0; i<attrValues.length; i++){
			hash = 89 + this.attrValues[i].hashCode();
		}
		return hash;
	}

//	@Override
	public boolean isEqual(Object o){
		if (o == this) {
			return true;
		}
		if (!(o instanceof Tuple)) {
			return false;
		}
		Tuple other = (Tuple)o;
		boolean isSame = true;
		for(int i=0; i<attrValues.length; i++){
			if(!this.attrValues[i].equals(other.attrValues[i])){
				isSame = false;
			}
		}
		return isSame;	
	}
	
	@Override
	public boolean equals(Object o){
		if (o == this) {
			return true;
		}
		if (!(o instanceof Tuple)) {
			return false;
		}
		Tuple other = (Tuple)o;

		return this.key.equals(other.key);	
	}

	public Object getKey() {
		return key;
	}

	public void setKey(Object key) {
		this.key = key;
	}
}
