package Server;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

import org.json.JSONObject;

public class DriverServer {

	public static void main(String[] args) throws Exception {

		if (args.length != 2) {
			System.err.println("Usage: java  <port number> <config file> <front end config file>");
			System.exit(1);
		}

		int portNumber = Integer.parseInt(args[0]); //port number:
		String config1 = args[1]; //config file for the algorithm
		//String configFrontEnd = args[1];
		System.out.println("Waiting for connection...");
		try ( 
				ServerSocket serverSocket = new ServerSocket(portNumber);
				Socket clientSocket = serverSocket.accept();
				OutputStreamWriter out =
						new OutputStreamWriter(clientSocket.getOutputStream(), StandardCharsets.UTF_8);
				BufferedReader in = new BufferedReader(
						new InputStreamReader(clientSocket.getInputStream()));
				) {
			System.out.println("Connected...");
			String inputLine;
			String outputLine = "";
			Driver d = null;
			while((inputLine = in.readLine()) != null){
				d = new Driver(config1, inputLine);
				break;
			}
			//System.out.println("I run the configuration...");
			// Initiate conversation with client
			Protocol protocol = new Protocol();
			JSONObject jObj = protocol.processInput(null, d);
			System.out.println("Sending this ..."+jObj.toString());
			out.write(jObj.toString()+"\n");
			out.flush();
			//System.out.println("Here");
			while ((inputLine = in.readLine()) != null) {
				jObj = protocol.processInput(inputLine, d);
				String s = jObj.toString();
				System.out.println("Sending this ... :"+s);
				out.write(s+"\n"); 
				out.flush();
				if (outputLine.equals("Bye."))
					break;
			}
		} catch (IOException e) {
			System.out.println("Exception caught when trying to listen on port "
					+ portNumber + " or listening for a connection");
			System.out.println(e.getMessage());
		}
	}
}

