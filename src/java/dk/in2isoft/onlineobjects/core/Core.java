package dk.in2isoft.onlineobjects.core;

import java.io.File;

import javax.servlet.ServletContext;

import org.apache.log4j.Logger;

import dk.in2isoft.onlineobjects.model.User;

public class Core {

	private static Logger log = Logger.getLogger(Core.class);
	private static Core instance;
	private static File baseDir;
	private static ServletContext context;
	
	private Configuration config;
	private ModelFacade model;
	private SecurityController security;
	private ConversionFacade converter;
	private StorageManager storage;
	private Priviledged superUser = new SuperUser();
	
	private Core() {
		setupConfiguration();
		ensureUsers();
		storage = new StorageManager(baseDir);
	}
	
	private void setupConfiguration()
	{
		try {
			this.config = new Configuration(baseDir);
		} catch (ConfigurationException e) {
			log.error("Could not init configuration",e);
		}
	}
	
	public static Core getInstance() {
		if (instance==null) {
			instance=new Core();
		}
		return instance;
	}
	
	public static void setup(String basePath,ServletContext context)
	throws IllegalStateException {
		File dir = new File(basePath);
		if (!dir.exists()) {
			throw new IllegalStateException("Invalid base path provided");
		} else {
			log.info("OnlineObjects started at basePath: "+basePath);
			Core.baseDir = dir;
			Core.context = context;
		}
	}

	public Configuration getConfiguration()
	throws ConfigurationException {
		if (config==null) {
			throw new ConfigurationException("System not configured correctly");
		} else {
			return config;
		}
	}
	
	public ServletContext getServletContext() {
		return context;
	}
	
	public ModelFacade getModel() {
		if (model==null) {
			model = new ModelFacade();
		}
		return model;
	}
	
	public SecurityController getSecurity() {
		if (security==null) {
			security = new SecurityController();
		}
		return security;
	}
	
	public ConversionFacade getConverter() {
		if (converter==null) {
			converter = new ConversionFacade();
		}
		return converter;
	}
	
	public StorageManager getStorage() {
		return storage;
	}
	
	private void ensureUsers() {
		User publicUser = getModel().getUser("public");
		if (publicUser==null) {
			log.warn("No public user present!");
			User user = new User();
			user.setUsername(SecurityController.PUBLIC_USERNAME);
			user.setName("Public user");
			getModel().saveItem(user,superUser);
			getModel().commit();
		}
	}
	
	private class SuperUser implements Priviledged {
		public long getIdentity() {
			return -1;
		}
	}
}