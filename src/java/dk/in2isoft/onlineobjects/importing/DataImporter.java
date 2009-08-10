package dk.in2isoft.onlineobjects.importing;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.ProgressListener;
import org.apache.commons.fileupload.disk.DiskFileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.log4j.Logger;

import dk.in2isoft.onlineobjects.apps.ApplicationController;
import dk.in2isoft.onlineobjects.apps.ApplicationSession;
import dk.in2isoft.onlineobjects.core.EndUserException;
import dk.in2isoft.onlineobjects.core.IllegalRequestException;
import dk.in2isoft.onlineobjects.services.FileService;
import dk.in2isoft.onlineobjects.ui.AsynchronousProcessDescriptor;
import dk.in2isoft.onlineobjects.ui.Request;

public class DataImporter {
	
	private static Logger log = Logger.getLogger(DataImporter.class);
	private ImportListerner listener;
	private FileService fileService;
	
	public DataImporter(FileService fileService) {
		super();
		this.fileService = fileService;
	}

	@SuppressWarnings("unchecked")
	public void importMultipart(ApplicationController controller,Request request) throws IOException, EndUserException {
		log.info("Starting upload");
		ApplicationSession session = request.getSession().getToolSession(controller);
		final AsynchronousProcessDescriptor process = session.createAsynchronousProcessDescriptor(listener.getProcessName());
		if (!ServletFileUpload.isMultipartContent(request.getRequest())) {
			process.setError(true);
			throw new IllegalRequestException("The request is not multi-part!");
		}
		DiskFileItemFactory factory = new DiskFileItemFactory();
		factory.setSizeThreshold(0);
		
		ServletFileUpload upload = new ServletFileUpload(factory);
		ProgressListener progressListener = new ProgressListener() {
			public void update(long pBytesRead, long pContentLength, int pItems) {
				if (pContentLength == -1) {
					process.setValue(0);
				} else {
					process.setValue((float) pBytesRead / (float) pContentLength);
				}

			}
		};
		upload.setProgressListener(progressListener);

		// Parse the request
		try {
			List<DiskFileItem> items = upload.parseRequest(request.getRequest());
			for (DiskFileItem item : items) {
				if (!item.isFormField()) {
					try {
						File file = item.getStoreLocation();
						listener.processFile(file,fileService.getMimeType(file),fileService.cleanFileName(item.getName()), request);
					} catch (Exception e) {
						process.setError(true);
						throw new EndUserException(e);
					}
				}
			}
		} catch (FileUploadException e) {
			process.setError(true);
			throw new EndUserException(e);
		}
		process.setCompleted(true);
	}

	public void setListener(ImportListerner listener) {
		this.listener = listener;
	}

	public ImportListerner getListener() {
		return listener;
	}

	public void setFileService(FileService fileService) {
		this.fileService = fileService;
	}

	public FileService getFileService() {
		return fileService;
	}
}
