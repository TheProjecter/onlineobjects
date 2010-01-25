package dk.in2isoft.onlineobjects.apps.community;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.google.common.collect.Lists;

import dk.in2isoft.onlineobjects.core.EndUserException;
import dk.in2isoft.onlineobjects.core.ModelService;
import dk.in2isoft.onlineobjects.importing.ImportListerner;
import dk.in2isoft.onlineobjects.model.Image;
import dk.in2isoft.onlineobjects.ui.Request;
import dk.in2isoft.onlineobjects.util.images.ImageService;

class ImageImporter implements ImportListerner {

	protected ModelService modelService;
	private ImageService imageService;
	private List<Image> importedImages;
	private List<String> mimeTypes;

	public ImageImporter(ModelService modelService, ImageService imageService) {
		super();
		this.modelService = modelService;
		this.imageService = imageService;
		importedImages = new ArrayList<Image>();
		mimeTypes = Lists.newArrayList("image/jpeg", "image/png", "image/gif");
	}

	public void processFile(File file, String mimeType, String name, Map<String, String> parameters, Request request) throws IOException, EndUserException {
		if (!mimeTypes.contains(mimeType)) {
			return;
		}
		Image image = new Image();
		modelService.createItem(image, request.getSession());
		image.setName(name);
		imageService.changeImageFile(image, file, mimeType);
		imageService.synchronizeMetaData(image, request.getSession());
		modelService.updateItem(image, request.getSession());
		modelService.commit();
		importedImages.add(image);
		postProcessImage(image, parameters, request);
	}

	protected void postProcessImage(Image image, Map<String, String> parameters, Request request) throws EndUserException {
		// Override this
	}

	public String getProcessName() {
		return "imageImport";
	}

	public List<Image> getImportedImages() {
		return importedImages;
	}
}