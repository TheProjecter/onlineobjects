package dk.in2isoft.onlineobjects.util;import org.mortbay.jetty.Connector;import org.mortbay.jetty.Server;import org.mortbay.jetty.nio.SelectChannelConnector;import org.mortbay.jetty.webapp.WebAppContext;public class JettyRunner {	public static void main(String[] args) {		try {			System.setProperty("org.mortbay.http.HttpRequest.maxFormContentSize", "2000000000");						SelectChannelConnector connector = new SelectChannelConnector();			String path = "src/main/webapp";			int port = 8080;			String host = "127.0.0.1";			String context = "";			String cookieDomain = ".onlineobjects.se";			connector.setPort(port);						connector.setHost(host);			WebAppContext appContext = new WebAppContext(path, context);			appContext.getSessionHandler().getSessionManager().setSessionDomain(cookieDomain);			Server server = new Server();			server.setConnectors(new Connector[] { connector});			server.addHandler(appContext);			server.start();		} catch (Exception ex) {			ex.printStackTrace();			throw new RuntimeException("Server startup failed", ex);		}	}}