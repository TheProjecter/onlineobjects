package dk.in2isoft.onlineobjects.apps.words.views;

import java.util.List;

import org.apache.commons.lang.math.NumberUtils;
import org.springframework.beans.factory.InitializingBean;

import com.google.common.collect.Lists;

import dk.in2isoft.commons.jsf.AbstractView;
import dk.in2isoft.onlineobjects.core.ModelException;
import dk.in2isoft.onlineobjects.core.ModelService;
import dk.in2isoft.onlineobjects.core.SearchResult;
import dk.in2isoft.onlineobjects.modules.language.WordListPerspective;
import dk.in2isoft.onlineobjects.services.LanguageService;
import dk.in2isoft.onlineobjects.ui.Request;
import dk.in2isoft.onlineobjects.ui.jsf.model.Option;

public class WordsIndexView extends AbstractView implements InitializingBean {

	private static final int PAGING = 10;
	private ModelService modelService;
	private LanguageService languageService;
	
	private List<WordListPerspective> list;
	private List<?> alphabeth;
	private int count;
	private int page;
	private String character;
	
	private int pageSize = 20;
	private List<Option> pages;
			
	public void afterPropertiesSet() throws Exception {
		this.alphabeth = modelService.querySQL("select distinct substring(lower(text) from 1 for 1) as text from word order by text");
	}
	
	public List<WordListPerspective> getList() throws ModelException {
		if (this.list==null) {
			
			Request request = getRequest();
			String[] localPath = request.getLocalPath();
			if (localPath.length>2) {
				character = request.getLocalPath()[2];
			}
			page = 0;
			if (localPath.length>3) {
				page = Math.max(0, NumberUtils.toInt(localPath[3])-1);
			}
			WordListPerspectiveQuery query = new WordListPerspectiveQuery().withPaging(page, 20).startingWith(character).orderByText();
			SearchResult<WordListPerspective> result = modelService.search(query);
			this.list = result.getList();
			this.count = result.getTotalCount();
		}
		return this.list;
	}
	
	public List<Option> getPages() {
		
		if (pages==null) {
			pages = Lists.newArrayList();
			int pageCount = (int) Math.ceil(count/pageSize)+1;
			if (pageCount>1) {
			
				int min = Math.max(1,page-PAGING);
				int max = Math.min(pageCount, page+PAGING);
				if (min>1) {
					pages.add(buildOption(1));
				}
				if (min>2) {
					pages.add(null);
				}
				for (int i = min; i <= max; i++) {
					pages.add(buildOption(i));
				}
				if (max<pageCount-1) {
					pages.add(null);
				}
				if (max<pageCount) {
					pages.add(buildOption(pageCount));
				}
			}
		}
		return pages;
	}
	
	private Option buildOption(int num) {
		Option option = new Option();
		option.setValue("/"+getRequest().getLanguage()+"/index/"+character+"/"+num);
		option.setLabel(num+"");
		option.setSelected(page==num-1);
		return option;
	}
	
	public int getCount() {
		return count;
	}
	
	public String getCharacter() {
		return character;
	}
	
	public void setModelService(ModelService modelService) {
		this.modelService = modelService;
	}
	
	public void setLanguageService(LanguageService languageService) {
		this.languageService = languageService;
	}
	
	public List<?> getAlphabeth() {
		return alphabeth;
		//return Lists.newArrayList("a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","w","x","y","z");
	}
}