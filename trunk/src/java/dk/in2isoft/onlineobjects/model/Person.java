package dk.in2isoft.onlineobjects.model;

import org.apache.commons.lang.StringUtils;

import dk.in2isoft.commons.lang.LangUtil;
import dk.in2isoft.onlineobjects.core.IllegalRequestException;

public class Person extends Entity {

	public static String TYPE = Entity.TYPE+"/Person";
	public static String NAMESPACE = Entity.NAMESPACE+"Person/";
	
	private String givenName;
	private String familyName;
	private String additionalName;
	private String namePrefix;
	private String nameSuffix;
	private Boolean sex;

	public Person() {
		super();
	}

	public String getType() {
		return super.getType()+"/Person";
	}

	public String getIcon() {
		return "common/person";
	}
	
	public String getGivenName() {
		return givenName;
	}

	public void setGivenName(String firstName) {
		this.givenName = firstName;
		updateName();
	}

	public String getFamilyName() {
		return familyName;
	}

	public void setFamilyName(String lastName) {
		this.familyName = lastName;
		updateName();
	}

	public String getAdditionalName() {
		return additionalName;
	}

	public void setAdditionalName(String additionalName) {
		this.additionalName = additionalName;
		updateName();
	}

	public String getNamePrefix() {
		return namePrefix;
	}

	public void setNamePrefix(String namePrefix) {
		this.namePrefix = namePrefix;
		updateName();
	}

	public String getNameSuffix() {
		return nameSuffix;
	}

	public void setNameSuffix(String nameSuffix) {
		this.nameSuffix = nameSuffix;
		updateName();
	}
	
	public void setFullName(String fullName) {
		String[] names = StringUtils.split(fullName);
		if (names==null || names.length==0) {
			setGivenName(null);
			setFamilyName(null);
		}
		if (names.length>0) {
			setGivenName(names[0]);
		}
		if (names.length>1) {
			setFamilyName(names[names.length-1]);
		}
	}

	private void updateName() {
		setName(LangUtil.concatWords(new String[] {namePrefix, givenName,additionalName,familyName,nameSuffix}));
	}

	public Boolean getSex() {
		return sex;
	}

	public void setSex(Boolean sex) {
		this.sex = sex;
	}
}
