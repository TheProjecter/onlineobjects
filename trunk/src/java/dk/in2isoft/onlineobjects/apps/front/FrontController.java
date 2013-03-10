package dk.in2isoft.onlineobjects.apps.front;

import java.io.IOException;

import dk.in2isoft.onlineobjects.apps.videosharing.Path;
import dk.in2isoft.onlineobjects.core.exceptions.EndUserException;
import dk.in2isoft.onlineobjects.ui.Blend;
import dk.in2isoft.onlineobjects.ui.Request;
import dk.in2isoft.onlineobjects.ui.ScriptWriter;


public class FrontController extends FrontControllerBase {

	protected static final Blend publicScript;
	
	static {

		publicScript = new Blend("front_public_script");
		publicScript.addPath("hui","js","hui.js");
		publicScript.addPath("hui","js","hui_animation.js");
		//publicScript.addPath("hui","js","hui_color.js");
		publicScript.addPath("hui","js","ui.js");
		publicScript.addPath("hui","js","Drawing.js");
		publicScript.addPath("WEB-INF","apps","front","web","animation.js");
	}

	@Path(expression="/script.[0-9]+.js")
	public void script(Request request) throws IOException, EndUserException {
		ScriptWriter writer = new ScriptWriter(request, configurationService);
		writer.write(publicScript);
	}
}