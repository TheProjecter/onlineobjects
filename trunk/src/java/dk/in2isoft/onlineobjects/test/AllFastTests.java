package dk.in2isoft.onlineobjects.test;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.junit.runners.Suite.SuiteClasses;

import dk.in2isoft.onlineobjects.test.data.TestNeo4j;
import dk.in2isoft.onlineobjects.test.plain.TestApplicationUrl;
import dk.in2isoft.onlineobjects.test.plain.TestFileService;
import dk.in2isoft.onlineobjects.test.plain.TestGraphService;
import dk.in2isoft.onlineobjects.test.plain.TestImageService;
import dk.in2isoft.onlineobjects.test.plain.TestLangUtil;
import dk.in2isoft.onlineobjects.test.plain.TestRegExp;
import dk.in2isoft.onlineobjects.test.plain.TestRegExpUtil;
import dk.in2isoft.onlineobjects.test.plain.TestRestUtil;
import dk.in2isoft.onlineobjects.test.plain.TestSemanticService;
import dk.in2isoft.onlineobjects.test.plain.TestURLUtil;
import dk.in2isoft.onlineobjects.test.plain.TestYoutubeService;

@RunWith(Suite.class)
@SuiteClasses({TestNeo4j.class,
	TestApplicationUrl.class, 
	TestFileService.class, 
	TestGraphService.class,
	TestImageService.class,
	TestLangUtil.class,
	TestRegExp.class, 
	TestRegExpUtil.class, 
	TestRestUtil.class,
	TestSemanticService.class,
	TestURLUtil.class,
	TestYoutubeService.class})
public class AllFastTests {

}
