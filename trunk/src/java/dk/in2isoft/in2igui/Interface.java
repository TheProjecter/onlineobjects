package dk.in2isoft.in2igui;

import java.io.File;
import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

public interface Interface {

	public void render(HttpServletResponse response) throws IOException;
	
	public File getFile();
}