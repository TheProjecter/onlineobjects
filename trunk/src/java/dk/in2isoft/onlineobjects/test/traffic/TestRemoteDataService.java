package dk.in2isoft.onlineobjects.test.traffic;

import java.util.List;

import org.junit.Test;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import org.springframework.beans.factory.annotation.Autowired;

import dk.in2isoft.onlineobjects.core.EndUserException;
import dk.in2isoft.onlineobjects.model.RemoteAccount;
import dk.in2isoft.onlineobjects.services.RemoteDataService;
import dk.in2isoft.onlineobjects.test.AbstractTestCase;
import dk.in2isoft.onlineobjects.util.remote.RemoteAccountInfo;
import dk.in2isoft.onlineobjects.util.remote.RemoteImageGallery;

public class TestRemoteDataService extends AbstractTestCase {

	@Autowired
	private RemoteDataService remoteDataService;

	@Test
	public void testVelocity() throws EndUserException {
		RemoteAccount account = new RemoteAccount();
		account.setDomain("google.com");
		account.setUsername("jonasmunk");
		RemoteAccountInfo info = remoteDataService.getInfo(account);
		List<RemoteImageGallery> imageGalleries = info.getImageGalleries();
		assertTrue(imageGalleries.size()>0);
	}

	public void setRemoteDataService(RemoteDataService remoteDataService) {
		this.remoteDataService = remoteDataService;
	}

	public RemoteDataService getRemoteDataService() {
		return remoteDataService;
	}
}