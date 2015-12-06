import java.net.*;
import java.io.*;

public class ProxySocket{
	
	public static void main(String[] args) throws IOException{
		
        if (args.length != 2) {
            System.err.println("Usage: java Proxy <server port number> <proxy port number>");
            System.exit(1);
        }
		
		int serverPortNumber = Integer.parseInt(args[0]);
		String serverHostName = "localhost";
		int proxyPortNumber = Integer.parseInt(args[1]);
		
		//Proxy acts as a server to serve clients, and wait for the configuration JSON object string from the client
		ServerSocket proxyConfigSocket = new ServerSocket(proxyPortNumber);
		System.out.println("wait for config string...");
		
		//config string
		String configLine = null;
		
		try{
			
			Socket clientConfigSocket = proxyConfigSocket.accept();     
			
			System.out.println("get one connection...");
			
			try {
	            PrintWriter clientConfigOut = new PrintWriter(clientConfigSocket.getOutputStream(), true);                   
	            BufferedReader clientConfigIn = new BufferedReader(new InputStreamReader(clientConfigSocket.getInputStream()));
				
				configLine = clientConfigIn.readLine();
				
			}
			finally {
				clientConfigSocket.close();
			}
			
			
		} catch (IOException e) {
		            System.out.println("Exception caught when trying to listen on port "
		                + proxyPortNumber + " or listening for a connection");
		            System.out.println(e.getMessage());
		}
		finally {
			proxyConfigSocket.close();
		}
		
		System.out.println("The config string is: " + configLine);
		
		Socket serverSocket = null;
		PrintWriter serverOut = null;
		BufferedReader serverIn = null;
		String initial_data_from_server = "";	
			
		//connect to the backend server 
		try {
            serverSocket = new Socket(serverHostName, serverPortNumber);
            serverOut = new PrintWriter(serverSocket.getOutputStream(), true);
            serverIn = new BufferedReader(new InputStreamReader(serverSocket.getInputStream()));
			
			System.out.println("connected to the server.");
			//serverOut.println("connected to the server!");
			//System.out.println(serverIn.readLine());
			
			//send the config JSON object string to the server
			serverOut.println(configLine);
			
			//this is the JSONObject String with the initial samples and grid points 
            initial_data_from_server = serverIn.readLine();
			System.out.println("got data from the server.");
			
			
			if(initial_data_from_server == null){
				System.out.println("The server is down...");
				serverSocket.close();
				System.exit(0);
			}	
				
		} catch (UnknownHostException e) {
            System.err.println("Don't know about host " + serverHostName);
            System.exit(1);
        } catch (IOException e) {
            System.err.println("Couldn't get I/O for the connection to " +
                serverHostName);
			System.out.println(e.getMessage());
            System.exit(1);
        } 
		
		//Proxy acts as a server to serve clients, and send the data from client to the backend server
		ServerSocket proxySocket = new ServerSocket(proxyPortNumber);
		System.out.println("build server...");
		
		//indicate whether it is the first client connection
		//if true, just send initial samples and grid points
		//if false, first get labeled samples, then send next set of samples and grid point labels
		boolean first_client = true;
		
		try {
            
			while(true){
				System.out.println("wait for connection...");
				
				Socket clientSocket = proxySocket.accept();     
				
				System.out.println("get one connection...");
				try {
		            PrintWriter clientOut = new PrintWriter(clientSocket.getOutputStream(), true);                   
		            BufferedReader clientIn = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
					
					if(first_client == true){
						System.out.println("first connection...");
						//the first time, just send initial data from the backend server to the client
						clientOut.println(initial_data_from_server);
						System.out.println("initial sample data: " + initial_data_from_server);
						System.out.println("send initial sample data to the client...");
						//set to false
						first_client = false;
					}
					else {
						System.out.println("not first connection...");
						//not the first time, 
						//get labeled samples from the client
						String inputLine = clientIn.readLine();
						System.out.println("get labeled samples from client...");
						//get "Stop" message and exit
						if(inputLine.equals("Stop")){
							System.out.println("get stop message from client...");
							clientSocket.close();
							System.exit(0);
						}
						
						//send to the server the labeled samples
		                serverOut.println(inputLine);
						System.out.println("send to server the labeled samples...");
						
						//get from the server and send the content to the client
						//the content is the next set of samples and grid point labels
						System.out.println("before get data from server...");
						String serverLine = serverIn.readLine();
						System.out.println("after get data from server...");
						
						System.out.println("before send data to client...");
						clientOut.println(serverLine);
						System.out.println("after send next set of samples to the client...");
					}
					
		            					
				}
				finally {
					clientSocket.close();
				}
	            
			}
            
            
		} catch (IOException e) {
		            System.out.println("Exception caught when trying to listen on port "
		                + proxyPortNumber + " or listening for a connection");
		            System.out.println(e.getMessage());
		}
		finally {
			proxySocket.close();
		}
        
		
	}
}