package dk.in2isoft.in2igui.jsf;

import java.io.IOException;

import javax.faces.component.FacesComponent;
import javax.faces.context.FacesContext;

import org.apache.commons.lang.StringEscapeUtils;

import dk.in2isoft.commons.jsf.AbstractComponent;
import dk.in2isoft.commons.jsf.TagWriter;

@FacesComponent(value="hui.locationInput")
public class LocationInputComponent extends AbstractComponent {

	public LocationInputComponent() {
		super("hui.locationInput");
	}

	private String name;
	private String key;

	@Override
	public Object[] saveState() {
		return new Object[] {
			name,key
		};
	}
	
	@Override
	public void restoreState(Object[] state) {
		name = (String) state[0];
		key = (String) state[1];
	}
	
	@Override
	public String getFamily() {
		return "hui.textfield";
	}
	
	@Override
	protected void encodeBegin(FacesContext context, TagWriter out) throws IOException {
		out.startSpan("hui_locationfield").withId(getClientId());
		out.startSpan("hui_field_top").startSpan().startSpan().endSpan().endSpan().endSpan();
		
		out.startSpan("hui_field_middle").startSpan("hui_field_middle").startSpan("hui_field_content");
		
		out.startSpan();
		
		out.startSpan("hui_locationfield_latitude").startSpan().startInput().endInput().endSpan().endSpan();
		
		out.startSpan("hui_locationfield_longitude").startSpan().startInput().endInput().endSpan().endSpan();

		out.endSpan();
		
		out.endSpan().endSpan().endSpan();
		
		out.startSpan("hui_field_bottom").startSpan().startSpan().endSpan().endSpan().endSpan();
		
		out.startVoidA("hui_locationfield_picker").endA();
		out.endSpan();
		out.startScopedScript();
		out.write("new hui.ui.LocationField({element:'").write(getClientId()).write("'");
		if (name!=null) {
			out.write(",name:'"+StringEscapeUtils.escapeJavaScript(name)+"'");
		}
		if (key!=null) {
			out.write(",key:'"+StringEscapeUtils.escapeJavaScript(key)+"'");
		}
		out.write("});");
		out.endScopedScript();
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getName() {
		return name;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public String getKey() {
		return key;
	}
	
}