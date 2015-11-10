package mainPackage;

import java.io.IOException;
import java.util.ArrayList;

import metrics.OutputFile;

public class FirstScenario {
	
	
	
	public ArrayList<Tuple> readSamplesFromFile(int iter) throws IOException{
		//ArrayList<Tuple> t = new ArrayList<Tuple>();
		String fileName = "";
		if(iter == 1){
			System.out.println("Reading first file");
			fileName = "SamplesForScenario1/1_iteration.txt";
		}else if(iter == 2){
			System.out.println("Reading 2 file");

			fileName = "SamplesForScenario1/2_iteration.txt";
		}else if(iter == 3){
			System.out.println("Reading 3 file");

			fileName = "SamplesForScenario1/3_iteration.txt";
		}else if(iter == 4){
			System.out.println("Reading 4 file");

			fileName = "SamplesForScenario1/4_iteration.txt";
		}else if(iter == 5){
			System.out.println("Reading 5 file");

			fileName = "SamplesForScenario1/5_iteration.txt";
		}else if(iter == 6){
			System.out.println("Reading 6 file");
			fileName = "SamplesForScenario1/6_iteration.txt";
		}
		else if(iter == 7){
			System.out.println("Reading 7 file");
			fileName = "SamplesForScenario1/7_iteration.txt";
		}else if(iter == 8){
			System.out.println("Reading 8 file");
			fileName = "SamplesForScenario1/8_iteration.txt";
		}else if(iter == 9){
			System.out.println("Reading 9 file");
			fileName = "SamplesForScenario1/9_iteration.txt";
		}else if(iter == 10){
			System.out.println("Reading 10 file");
			fileName = "SamplesForScenario1/10_iteration.txt";
		}else if(iter == 11){
			System.out.println("Reading 11 file");
			fileName = "SamplesForScenario1/11_iteration.txt";
		}
		OutputFile f = new OutputFile(fileName);
		ArrayList<Tuple> t = f.readFileIntoArrayListOfTuples();
		System.out.println("Read and returning..");
		return t;
	}

}
