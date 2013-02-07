package dk.in2isoft.onlineobjects.modules.scheduling;

import org.quartz.Job;

public class JobDescription {
	
	private Class<? extends Job> jobClass;
	
	private String group;
	
	private String name;
	
	private String cron;
	
	private int repeatMinutes;

	public Class<? extends Job> getJobClass() {
		return jobClass;
	}

	public void setJobClass(Class<? extends Job> jobClass) {
		this.jobClass = jobClass;
	}

	public String getGroup() {
		return group;
	}

	public void setGroup(String group) {
		this.group = group;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getCron() {
		return cron;
	}

	public void setCron(String cron) {
		this.cron = cron;
	}

	public int getRepeatMinutes() {
		return repeatMinutes;
	}

	public void setRepeatMinutes(int repeatMinutes) {
		this.repeatMinutes = repeatMinutes;
	}
}
