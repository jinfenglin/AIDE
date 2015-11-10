package visualization;

import java.util.ArrayList;

import mainPackage.Attribute;
import configuration.Global;
//import system.Context;
//import system.SystemConfig;
//import weka.core.Attribute;

public class TableAttrStat {
	public final String tbl_name;
	public final ArrayList<Attribute> attrs;
	public final int dim;
	//public final long min_row_id, max_row_id;
	public final double [] lowerB, upperB;

	public TableAttrStat() {
		this.tbl_name = Global.TABLE_NAME;
		this.attrs = Global.attributes;
		this.dim = Global.attributes.size();
		System.out.println("Attributes: "+Global.attributes.size());

		lowerB = new double [dim];
		upperB = new double [dim];
		for(int i=0; i<dim; i++) {
			System.out.println("Attribute: "+attrs.get(i).getName()+" size of domain: "+attrs.get(i).getDomain().size());
			lowerB[i] = Double.parseDouble(""+attrs.get(i).getMinValue());
			upperB[i] = Double.parseDouble(""+attrs.get(i).getMaxValue());
		}
	}
}
