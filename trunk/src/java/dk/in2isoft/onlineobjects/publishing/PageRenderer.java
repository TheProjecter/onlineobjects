package dk.in2isoft.onlineobjects.publishing;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import nu.xom.Attribute;
import nu.xom.Element;
import dk.in2isoft.commons.xml.XSLTUtil;
import dk.in2isoft.onlineobjects.core.Configuration;
import dk.in2isoft.onlineobjects.core.ConversionFacade;
import dk.in2isoft.onlineobjects.core.Core;
import dk.in2isoft.onlineobjects.core.EndUserException;
import dk.in2isoft.onlineobjects.core.ModelFacade;
import dk.in2isoft.onlineobjects.model.Entity;
import dk.in2isoft.onlineobjects.model.Relation;
import dk.in2isoft.onlineobjects.model.WebNode;
import dk.in2isoft.onlineobjects.model.WebPage;
import dk.in2isoft.onlineobjects.model.WebSite;
import dk.in2isoft.onlineobjects.model.util.WebModelUtil;
import dk.in2isoft.onlineobjects.ui.Request;

public class PageRenderer {

	private static String NAMESPACE = "http://uri.onlineobjects.com/publishing/WebPage/";
	
	private WebPage page;

	public PageRenderer(WebPage page) {
		this.page = page;
	}

	public void render(Request request) throws EndUserException {
		ModelFacade model = Core.getInstance().getModel();
		ConversionFacade converter = Core.getInstance().getConverter();
		// Get the page content
		Entity document = model.getSubEntities(page, Relation.KIND_WEB_CONTENT, request.getSession()).iterator().next();
		//ImageGallery document = (ImageGallery)model.getFirstSubRelation(page, ImageGallery.TYPE, ImageGallery.class);
		if (document==null) {
			throw new EndUserException("The page does not have a document!");
		}
		DocumentBuilder builder = DocumentBuilder.getBuilder(document.getClass());
		
		if (request.isSet("feed") && builder instanceof FeedBuilder) {
			//String format = request.getString("feed");
			FeedBuilder source = (FeedBuilder) builder;
			try {
				FeedWriter writer = new FeedWriter(request.getResponse());
				source.buildFeed((Document) document, writer);
			} catch (IOException e) {
				throw new EndUserException(e);
			}
			return;
		}
		
		// Get the website
		WebSite site = WebModelUtil.getWebSiteOfPage(page);
		// Create root
		Element root = new Element("WebPage", NAMESPACE);
		root.addAttribute(new Attribute("id",String.valueOf(page.getId())));

		Element title = new Element("title", NAMESPACE);
		title.appendChild(page.getTitle());
		
		// Append context
		Element context = new Element("context", NAMESPACE);
		context.appendChild(converter.generateXML(site));
		
		WebNode node = (WebNode)model.getFirstSuperEntity(page,WebNode.class);
		context.appendChild(converter.generateXML(node));
		
		Element nodes = new Element("nodes", NAMESPACE);
		List<WebNode> rootNodes = model.getSubEntities(site, WebNode.class);
		for (Iterator<WebNode> iter = rootNodes.iterator(); iter.hasNext();) {
			WebNode subNode = (WebNode) iter.next();
			nodes.appendChild(converter.generateXML(subNode));
		}
		context.appendChild(nodes);
		root.appendChild(context);
		// Append content
		Element content = new Element("content", NAMESPACE);
		content.addAttribute(new Attribute("id",String.valueOf(document.getId())));
		content.appendChild(builder.build((Document)document));
		root.appendChild(content);
		Configuration conf = Core.getInstance().getConfiguration();
		
		String template = page.getPropertyValue(WebPage.PROPERTY_TEMPLATE);
		if (template==null) template = "basic";
		
		File pageStylesheet = conf.getFile(new String[] {"WEB-INF","apps","community","xslt","page.xsl"});
		File stylesheet = conf.getFile(new String[] {"WEB-INF","apps","community","web","documents",document.getClass().getSimpleName(),"xslt","stylesheet.xsl"});
		File frame = conf.getFile(new String[] {"WEB-INF","apps","community","web","templates",template,"xslt","stylesheet.xsl"});

		Map<String, String> parameters = buildParameters(request);
		parameters.put("privilege-document-modify", String.valueOf(Core.getInstance().getSecurity().canModify(document, request.getSession())));
		try {
			if (request.getBoolean("viewsource")) {
				request.getResponse().setContentType("text/xml");
				request.getResponse().getWriter().write(root.toXML());
			} else {
				XSLTUtil.applyXSLT(root.toXML(), new File[] {pageStylesheet,stylesheet,frame}, request.getResponse(),parameters);				
			}
		} catch (IOException e) {
			throw new EndUserException(e);
		}
	}
	
	public static Map<String, String> buildParameters(Request request) {
		Configuration conf = Core.getInstance().getConfiguration();
		Map<String, String> parameters = new HashMap<String, String>();
		String devmode = String.valueOf(conf.getDevelopmentMode());
		if (request.getBoolean("nodev")) {
			devmode="false";
		}

		parameters.put("app-context", request.getLocalContextPath());
		parameters.put("base-context", request.getBaseContextPath());
		parameters.put("session-user-name", request.getSession().getUser().getUsername());
		parameters.put("development-mode", devmode);
		parameters.put("edit-mode",request.getBoolean("edit") ? "true" : "false");
		
		StringBuilder path = new StringBuilder();
		int level = request.getFullPath().length;
		for (int i = 0; i < level; i++) {
			path.append("../");
		}
		parameters.put("path-application", path.toString());
		parameters.put("path-core", path.toString());
		return parameters;
	}
}