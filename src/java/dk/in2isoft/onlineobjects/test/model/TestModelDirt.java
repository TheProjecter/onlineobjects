package dk.in2isoft.onlineobjects.test.model;

import static org.junit.Assert.assertTrue;

import org.junit.Test;

import dk.in2isoft.onlineobjects.core.EndUserException;
import dk.in2isoft.onlineobjects.core.Privileged;
import dk.in2isoft.onlineobjects.model.User;
import dk.in2isoft.onlineobjects.test.AbstractTestCase;

public class TestModelDirt extends AbstractTestCase {
    	
	@Test
	public void testThis() throws EndUserException {
		Privileged priviledged = getPublicUser();
		User user = new User();
		user.setUsername("unitTestUser");
		modelService.createItem(user, priviledged);
		modelService.deleteEntity(user, priviledged);
		assertTrue(modelService.isDirty());
		modelService.commit();
		assertTrue(!modelService.isDirty());
	}
}
