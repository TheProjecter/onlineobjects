package dk.in2isoft.onlineobjects.util;import org.mortbay.jetty.Connector;import org.mortbay.jetty.Server;import org.mortbay.jetty.nio.SelectChannelConnector;import org.mortbay.jetty.webapp.WebAppContext;public class JettyRunner {	public static void main(String[] args) {		try {			System.setProperty("org.mortbay.http.HttpRequest.maxFormContentSize", "2000000000");			SelectChannelConnector c1 = new SelectChannelConnector();			int port = 9090;			//port = 80;			c1.setPort(port);						String host = "127.0.0.1";			//host = "192.168.1.10";			//host = "10.14.80.142";			//host = "10.14.80.168";			//host = "192.168.1.21";			c1.setHost(host);			//c1.setHost("10.0.1.3");			//c1.setHost("10.0.2.24");			//c1.setHost("10.6.160.147");			String context = "/test";			context = "";			WebAppContext wa1 = new WebAppContext("/Users/jonasmunk/Code/Eclipse/OnlineObjects/src/web", context);			Server server = new Server();			server.setConnectors(new Connector[] { c1});			server.addHandler(wa1);			server.start();			System.out.println("Started: "+host+":"+port);		} catch (Exception ex) {			ex.printStackTrace();			throw new RuntimeException("Server startup failed", ex);		}	}}