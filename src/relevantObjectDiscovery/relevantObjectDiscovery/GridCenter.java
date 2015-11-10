package relevantObjectDiscovery;


import java.io.IOException;
import java.util.ArrayList;

import configuration.Global;
import mainPackage.Tuple;


public class GridCenter {

	static int n;

	static int[] indices; // Keeps each index in for loops.
	static int[] ranges;  // Range of each index in for loops.


	public ArrayList<Tuple> constructGridCenters(ArrayList<Double> attributeValues, ArrayList<Integer> buckets) throws IOException{
		ArrayList<Tuple> gridCenters = new ArrayList<Tuple>();

		ranges = new int[buckets.size()];
		for(int i=0; i<buckets.size(); i++){
			ranges[i] = buckets.get(i);
		}

		n = buckets.size(); 

		indices = new int[n];

		Object[] a = new Object[Global.attributes.size()];
		Tuple t = new Tuple(null, a);
		int m = 0;
		for(int i=0; i<indices.length; i++){ 
			a[i] = attributeValues.get(indices[i]+m);
			m += buckets.get(i);
		}
		t.setAttrValues(a);
		gridCenters.add(t);
		do {
			Object[] b = new Object[Global.attributes.size()];
			Tuple t1 = new Tuple(null, b);
			advanceIndices();
			//System.out.println( java.util.Arrays.toString(indices) );
			int m1 = 0;
			for(int i=0; i<indices.length; i++){ 
				b[i] = attributeValues.get(indices[i]+m1);
				m1 += buckets.get(i);
			}
			t1.setAttrValues(b);
			gridCenters.add(t1);
		}
		while( !allMaxed() );

		return gridCenters;
	}

	// Advances 'indices' to the next in sequence.
	private static void advanceIndices() {
		for(int i=n-1; i>=0; i--) {
			if(indices[i]+1 == ranges[i]) {
				indices[i] = 0;
			}
			else {
				indices[i] += 1;
				break;
			}
		}
	}

	// Tests if indices are in final position.
	private static boolean allMaxed() {
		for(int i=n-1; i>=0; i--) {
			if(indices[i] != ranges[i]-1) {
				return false;
			}
		}
		return true;
	}
}
