package dk.in2isoft.onlineobjects.ui.jsf;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.el.ValueExpression;
import javax.faces.component.FacesComponent;
import javax.faces.component.UIComponent;
import javax.faces.component.UIComponentBase;
import javax.faces.context.FacesContext;
import javax.faces.render.Renderer;

import dk.in2isoft.commons.jsf.TagWriter;
import dk.in2isoft.onlineobjects.model.Image;
import dk.in2isoft.onlineobjects.ui.jsf.model.ImageContainer;

@FacesComponent(value = "onlineobjects.gallery")
public class GalleryComponent<T> extends UIComponentBase {

	private static final String FAMILY = "onlineobjects.gallery";
	private String var;

	@Override
	public void restoreState(FacesContext context, Object state) {
		Object[] stt = (Object[]) state;
		super.restoreState(context, stt[0]);
		var = (String) stt[1];
	}

	@Override
	public Object saveState(FacesContext context) {
		return new Object[] { super.saveState(context), var };
	}

	@Override
	public String getFamily() {
		return FAMILY;
	}

	public String getVar() {
		return var;
	}

	public void setVar(String var) {
		this.var = var;
	}

	@Override
	public void encodeBegin(FacesContext context) throws IOException {
	}

	@Override
	protected Renderer getRenderer(FacesContext context) {
		return null;
	}

	@Override
	public boolean getRendersChildren() {
		return true;
	}

	@SuppressWarnings("unchecked")
	private ListModel<Image> getModel() {
		ValueExpression expression = getValueExpression("model");
		Object value = expression.getValue(getFacesContext().getELContext());
		return (ListModel<Image>) value;
	}

	@Override
	public void encodeChildren(FacesContext context) throws IOException {
		TagWriter writer = new TagWriter(this, context);
		ListModel<Image> model = getModel();
		if (model == null) {
			writer.write("NO MODEL!!");
			return;
		}
		decodeRequest(context, model);
		ListModelResult<?> result = model.getResult();
		String id = getClientId();
		writer.startDiv("oo_gallery").withId(id);
		encodePaging(writer, result.getTotalCount(), model.getPage(), model.getPageSize());
		writer.startOl();
		List<UIComponent> children = getChildren();
		StringBuilder imageArray = new StringBuilder();
		imageArray.append("[");
		int num = 0;
		for (Object object : result.getList()) {
			/*StringBuilder src = new StringBuilder();
			src.append(context.getExternalContext().getRequestContextPath());
			src.append("/service/image/id").append(image.getId()).append("thumbnail68cropped.jpg");
			writer.startA();
			writer.startElement("img").withAttribute("src", src).endElement("img");
			writer.endA();*/
			writer.startLi();
			context.getExternalContext().getRequestMap().put(var, object);
			for (UIComponent child : children) {
				child.encodeAll(context);
			}
			writer.endLi();
			if (num>0) {
				imageArray.append(",");
			}
			Image image = null;
			if (object instanceof Image) {
				image = (Image) object;
			}
			if (object instanceof ImageContainer) {
				image = ((ImageContainer) object).getImage();
			}
			if (image!=null) {
				imageArray.append("{id:").append(image.getId()).append(",width:")
				.append(image.getWidth()).append(",height:")
				.append(image.getHeight()).append("}");
				num++;
			}
		}
		imageArray.append("]");
		writer.endOl();
		writer.endDiv();
		writer.startScopedScript();
		writer.write("new oo.Gallery({element:'" + id + "',images:"+imageArray+"});");
		writer.endScopedScript();
	}

	private void encodePaging(TagWriter writer, int totalCount, int page,
			int pageSize) throws IOException {
		if (totalCount==0) {
			return;
		}
		int pages = (int) Math.ceil((double) totalCount / (double) pageSize);
		writer.startDiv("oo_gallery_navigator");
		if (pages > 1) {
			writer.startSpan("oo_gallery_pages");
			for (int i = 0; i < pages; i++) {
				writer.startA().withHref("?page=" + (i + 1));
				if (page == i) {
					writer.withClass("oo_selected");
				}
				writer.write(String.valueOf(i + 1));
				writer.endA();
			}
			writer.endSpan();
		}
		writer.startVoidA("oo_gallery_slideshow").startSpan().write(
				"Lysbillede-show").endSpan().endA();
		writer.endDiv();
	}

	@Override
	public void encodeEnd(FacesContext context) throws IOException {
	}

	private void decodeRequest(FacesContext context, ListModel<Image> model) {
		Map<String, String> map = context.getExternalContext().getRequestParameterMap();
		if (map.containsKey("page")) {
			try {
				int page = Integer.parseInt(map.get("page"));
				model.setPage(page - 1);
			} catch (NumberFormatException ignore) {
			}
		}
	}
}