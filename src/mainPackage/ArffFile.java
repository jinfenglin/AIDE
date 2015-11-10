package mainPackage;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;

import configuration.Constants;
import configuration.Global;



public class ArffFile {

	String fileName;

	public ArffFile(String fileName){
		this.fileName = fileName;
	}

	/**Creates the arff training file.
	 * The training file that is created has the following header (where attr1, attr2,..attrn the relevant
	 * attributs):
	 * @RELATION test
	 * @ATTRIBUTE attr1 NUMERIC 
	 * @ATTRIBUTE attr2 NUMERIC 
	 * @ATTRIBUTE class {0,1}
	 * 
	 * @DATA 
	 */
	public void createDataFile(){
		try{
			// Create file 
			FileWriter fstream = new FileWriter(fileName);
			BufferedWriter out = new BufferedWriter(fstream);
			out.write("@RELATION test\n");
			for(int i=0; i<Global.attributes.size();i++)
				out.append("@ATTRIBUTE "+Global.attributes.get(i).getName()+" NUMERIC \n");
			//out.append("\n");
			//@ATTRIBUTE class        {Iris-setosa,Iris-versicolor,Iris-virginica}
			out.append("@ATTRIBUTE class {"+Constants.IRRELEVANT_CLASS+","+Constants.RELEVANT_CLASS+"}");
			out.append("\n");
			out.append("\n");
			out.append("@DATA \n");
			//Close the output stream
			out.close();
		}catch (Exception e){//Catch exception if any
			System.err.println("Error: " + e.getMessage());
		}
	}
	
	
	/**Creates the arff training file.
	 * The training file that is created has the following header (where attr1, attr2,..attrn the relevant
	 * attributs):
	 * @RELATION test
	 * @ATTRIBUTE attr1 NUMERIC 
	 * @ATTRIBUTE attr2 NUMERIC 
	 * @ATTRIBUTE class {0,1}
	 * 
	 * @DATA 
	 */
	public void createDataFileForKmeans(){
		try{
			// Create file 
			FileWriter fstream = new FileWriter(fileName);
			BufferedWriter out = new BufferedWriter(fstream);
			out.write("@RELATION test\n");
			for(int i=0; i<Global.attributes.size();i++)
				out.append("@ATTRIBUTE "+Global.attributes.get(i).getName()+" NUMERIC \n");
			//out.append("\n");
			out.append("\n");
			out.append("\n");
			out.append("@DATA \n");
			//Close the output stream
			out.close();
		}catch (Exception e){//Catch exception if any
			System.err.println("Error: " + e.getMessage());
		}
	}

	/**Appends a bunch of samples with their labels in the training file.
	 * The tuples should have the class in the last attribute position in the arff file.
	 * 
	 * @param samples   The samples that are labeled by the user 
	 * 					about to be written in the training file.
	 * @param labels  	The labels for the samples.
	 */
	public void appendToTrainingFile(ArrayList<Tuple> samples, ArrayList<Integer> labels){
		try{
			FileWriter fstream = new FileWriter(fileName, true);
			for(int i=0; i<samples.size();i++){
				Object[] a = samples.get(i).getAttrValues();
				StringBuilder b = new StringBuilder();
				for(int j=0; j<a.length; j++){
					b.append(a[j]+" , ");
				}
				if(labels.get(i).intValue()==-1)
					b.append(" -1 ");
				else
					b.append(" 1 ");
				//System.out.println("going to write this: "+b.toString());
				fstream.write(b.toString()+"\n");
			}
			//Close the output stream
			fstream.close();
		}catch (Exception e){//Catch exception if any
			System.err.println("Error: " + e.getMessage());
		}
	}

	/**Writes the misclassified samples in an arff file.
	 * 
	 * @param list the misclassified samples to be written
	 * @throws IOException
	 */
	public void writeMisclassifiedToFile(ArrayList<Tuple> list) throws IOException{
		FileWriter fstream1 = new FileWriter(fileName, false);
		fstream1.write("@RELATION test\n");
		for(int i=0; i<Global.attributes.size();i++)
			fstream1.append("@ATTRIBUTE "+Global.attributes.get(i).getName()+" NUMERIC \n");
		fstream1.append("\n");
		fstream1.append("\n");
		fstream1.append("@DATA \n");
		for(int k=0; k<list.size(); k++){
			fstream1.append(list.get(k).toString()+"\n");
		}
		fstream1.close();
	}

	/**Appends an arrayList of String to an arffFile.
	 * Each item in the arraylist will be in a new line
	 * 
	 * @param tuples	the arraylist of strings
	 */
	public void appendStringArrayList(ArrayList<String> tuples){
		try{
			//open file
			FileWriter fstream = new FileWriter(this.fileName, true);
			for(int i=0; i<tuples.size();i++)
				fstream.write(""+tuples.get(i)+"\n");
			//Close the output stream
			fstream.close();
		}catch (Exception e){//Catch exception if any
			System.err.println("Error: " + e.getMessage());
		}
	}

	public boolean exists() {
		File f = new File(this.fileName);
		return f.exists();
	}
}

