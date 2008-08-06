package dk.in2isoft.onlineobjects.apps.school;

import java.io.IOException;

import org.quartz.JobDataMap;

import dk.in2isoft.onlineobjects.apps.ApplicationController;
import dk.in2isoft.onlineobjects.core.Core;
import dk.in2isoft.onlineobjects.core.EndUserException;
import dk.in2isoft.onlineobjects.core.Scheduler;
import dk.in2isoft.onlineobjects.ui.Request;

public class SchoolController extends ApplicationController {

	//private final static Logger log = Logger.getLogger(SchoolController.class);
	
	public static final String JOB_SYNCHRONIZER = "Synchronizer";
	
	private String syncUrl;

	public SchoolController() {
		super("school");
		Scheduler scheduler = Core.getInstance().getScheduler();
		String trigger = getConfig().getString("synchronization.trigger");
		JobDataMap map = new JobDataMap();
		String url = getConfig().getString("synchronization.url");
		map.put(UserAndEventSynchronizer.CONFIG_URL, url);
		scheduler.addJob(JOB_SYNCHRONIZER,"school",UserAndEventSynchronizer.class,trigger,map);
	}
	
	public String getSyncUrl() {
		return syncUrl;
	}

	@Override
	public void unknownRequest(Request request)
	throws IOException,EndUserException {
		if (!showGui(request)) {
			throw new EndUserException("Unknown request");
		}
	}
}