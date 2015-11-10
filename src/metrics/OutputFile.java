package metrics;

import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Scanner;

import configuration.Global;


import mainPackage.Tuple;


public class OutputFile {
	String fileName;

	public OutputFile(String aName){
		this.fileName = aName;
	}

	//writes to a file
	public void write(String toWrite) throws IOException{
		FileWriter fstream = new FileWriter(fileName, true);
		fstream.write(toWrite +"\n");
		fstream.close();
	}
	
	//writes an arraylist to a file
	public void writeArrayList(ArrayList<Object> list) throws IOException{
		FileWriter fstream = new FileWriter(fileName, true);

		for(int k=0; k<list.size(); k++){
			fstream.append(list.get(k)+"\n");
		}
		fstream.close();
	}
	
	//writes an arraylist to a file
		public void writeArrayListOfTuples(ArrayList<Tuple> list) throws IOException{
			FileWriter fstream = new FileWriter(fileName, true);

			for(int k=0; k<list.size(); k++){
				fstream.append(list.get(k).getKey()+" , "+list.get(k).toString()+"\n");
			}
			fstream.close();
		}

	//writes an arraylist to a file and erases everything else that was on the file
	public void writeArrayListErasePrevious(ArrayList<String> list) throws IOException{
		FileWriter fstream = new FileWriter(fileName, false);

		for(int k=0; k<list.size(); k++){
			fstream.write(list.get(k)+"\n");
		}
		fstream.close();
	}

	//reads the contents of a file into an arraylist
	public ArrayList<Object> readFileIntoArrayList() throws IOException{
		ArrayList<Object> a = new ArrayList<Object>();

		FileInputStream fstream = new FileInputStream(fileName);
		DataInputStream in = new DataInputStream(fstream);
		BufferedReader br = new BufferedReader(new InputStreamReader(in));
		String strLine;
		while ((strLine = br.readLine()) != null){
			if(!strLine.equalsIgnoreCase("null") && !strLine.equalsIgnoreCase("")){
				a.add(strLine);
			}
		}
		br.close();
		in.close(); 
		fstream.close();

		return a;
	}
	
	//reads a file into an arraylist of tuples
	public ArrayList<Tuple> readFileIntoArrayListOfTuples() throws IOException{
		ArrayList<Tuple> a = new ArrayList<Tuple>();

		FileInputStream fstream = new FileInputStream(fileName);
		DataInputStream in = new DataInputStream(fstream);
		BufferedReader br = new BufferedReader(new InputStreamReader(in));
		String strLine;
		while ((strLine = br.readLine()) != null){
			if(!strLine.equalsIgnoreCase("null") && !strLine.equalsIgnoreCase("") && !strLine.contains("null")){
				@SuppressWarnings("resource")
				Scanner s = new Scanner(strLine);
				Object[] attrValues = new Object[Global.attributes.size()];
				s.useDelimiter(" , ");
				Object  key = s.next();
				for(int i=0; i<attrValues.length; i++){
					attrValues[i] = s.next();
				}
				Tuple t = new Tuple(key, attrValues);
				a.add(t);
			}
		}
		br.close();
		in.close(); 
		fstream.close();

		return a;
	}
	
	public Boolean exists(){
		File f = new File(this.fileName);
		return f.exists();
	}

}
