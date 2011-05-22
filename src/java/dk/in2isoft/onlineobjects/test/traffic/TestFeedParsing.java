package dk.in2isoft.onlineobjects.test.traffic;

import java.io.IOException;
import java.net.URL;
import java.util.List;

import junit.framework.Assert;

import org.apache.log4j.Logger;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.sun.syndication.feed.WireFeed;
import com.sun.syndication.feed.rss.Channel;
import com.sun.syndication.feed.rss.Item;
import com.sun.syndication.io.FeedException;
import com.sun.syndication.io.WireFeedInput;
import com.sun.syndication.io.XmlReader;

import dk.in2isoft.onlineobjects.core.EndUserException;
import dk.in2isoft.onlineobjects.services.SemanticService;
import dk.in2isoft.onlineobjects.test.AbstractTestCase;

public class TestFeedParsing extends AbstractTestCase {
	
	private static Logger log = Logger.getLogger(TestFeedParsing.class);
	
	@Autowired
	private SemanticService semanticService;
	
	@SuppressWarnings("unchecked")
	@Test
	public void testAlistApartFeed() throws EndUserException, IllegalArgumentException, FeedException, IOException {
		URL feedUrl = new URL("http://www.alistapart.com/feed/rss.xml");

        WireFeedInput input = new WireFeedInput();
        WireFeed feed = input.build(new XmlReader(feedUrl));
        if (feed instanceof Channel) {
        	Channel channel = (Channel) feed;
        	List<Item> items = channel.getItems();
        	Assert.assertTrue(items.size()>0);
        	for (Item item : items) {
		        log.info(item.getLink());
			}
        }
	}

	public void setSemanticService(SemanticService semanticService) {
		this.semanticService = semanticService;
	}

	public SemanticService getSemanticService() {
		return semanticService;
	}
}