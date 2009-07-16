In2iGui.List = function(options) {
	this.options = n2i.override({url:null,source:null},options);
	this.element = $(options.element);
	this.name = options.name;
	this.state = options.state;
	if (this.options.source) {
		this.options.source.addDelegate(this);
	}
	this.url = options.url;
	this.table = this.element.select('table')[0];
	this.head = this.element.select('thead')[0];
	this.body = this.element.select('tbody')[0];
	this.columns = [];
	this.rows = [];
	this.selected = [];
	this.navigation = this.element.select('.in2igui_list_navigation')[0];
	this.count = this.navigation.select('.in2igui_list_count')[0];
	this.windowPage = this.navigation.select('.window_page')[0];
	this.windowPageBody = this.navigation.select('.window_page_body')[0];
	this.parameters = {};
	this.sortKey = null;
	this.sortDirection = null;
	
	this.window = {size:null,page:0,total:0};
	if (options.windowSize!='') {
		this.window.size = parseInt(options.windowSize);
	}
	In2iGui.extend(this);
	if (this.url) this.refresh();
}

In2iGui.List.create = function(options) {
	options = n2i.override({},options);
	var e = options.element = new Element('div',{'class':'in2igui_list'});
	e.update('<div class="in2igui_list_navigation"><div class="in2igui_list_selection window_page"><div><div class="window_page_body"></div></div></div><span class="in2igui_list_count"></span></div><div class="in2igui_list_body"'+(options.maxHeight>0 ? ' style="max-height: '+options.maxHeight+'px;"' : '')+'><table cellspacing="0" cellpadding="0"><thead><tr></tr></thead><tbody></tbody></table></div>');
	return new In2iGui.List(options);
}

In2iGui.List.prototype = {
	hide : function() {
		this.element.hide();
	},
	show : function() {
		this.element.show();
	},
	registerColumn : function(column) {
		this.columns.push(column);
	},
	getSelection : function() {
		var items = [];
		for (var i=0; i < this.selected.length; i++) {
			items.push(this.rows[this.selected[i]]);
		};
		return items;
	},
	getFirstSelection : function() {
		var items = this.getSelection();
		if (items.length>0) return items[0];
		else return null;
	},
	setParameter : function(key,value) {
		this.parameters[key]=value;
	},
	loadData : function(url) {
		this.setUrl(url);
	},
	setSource : function(source) {
		if (this.options.source!=source) {
			if (this.options.source) {
				this.options.source.removeDelegate(this);
			}
			source.addDelegate(this);
			this.options.source = source;
			source.refresh();
		}
	},
	setUrl : function(url) {
		if (this.options.source) {
			this.options.source.removeDelegate(this);
			this.options.source=null;
		}
		this.url = url;
		this.selected = [];
		this.sortKey = null;
		this.sortDirection = null;
		this.resetState();
		this.refresh();
	},
	resetState : function() {
		this.window = {size:null,page:0,total:0};
		In2iGui.firePropertyChange(this,'state',this.window);
		In2iGui.firePropertyChange(this,'window.page',this.window.page);
	},
	valueForProperty : function(p) {
		if (p=='window.page') return this.window.page;
		else if (p=='sort.key') return this.sortKey;
		else if (p=='sort.direction') return (this.sortDirection || 'ascending');
		else return this[p];
	},
	/**
	 * @private
	 */
	refresh : function() {
		if (this.options.source) {
			this.options.source.refresh();
			return;
		}
		if (!this.url) return;
		var url = this.url;
		if (typeof(this.window.page)=='number') {
			url+=url.indexOf('?')==-1 ? '?' : '&';
			url+='windowPage='+this.window.page;
		}
		if (this.window.size) {
			url+=url.indexOf('?')==-1 ? '?' : '&';
			url+='windowSize='+this.window.size;
		}
		if (this.sortKey) {
			url+=url.indexOf('?')==-1 ? '?' : '&';
			url+='sort='+this.sortKey;
		}
		if (this.sortDirection) {
			url+=url.indexOf('?')==-1 ? '?' : '&';
			url+='direction='+this.sortDirection;
		}
		for (key in this.parameters) {
			url+=url.indexOf('?')==-1 ? '?' : '&';
			url+=key+'='+this.parameters[key];
		}
		In2iGui.request({
			url:url,
			onJSON : this.objectsLoaded.bind(this),
			onXML : this.listLoaded.bind(this)
		});
	},
	sort : function(index) {
		var key = this.columns[index].key;
		if (key==this.sortKey) {
			this.sortDirection = this.sortDirection=='ascending' ? 'descending' : 'ascending';
			In2iGui.firePropertyChange(this,'sort.direction',this.sortDirection);
		} else {
			In2iGui.firePropertyChange(this,'sort.key',key);
		}
		this.sortKey = key;
	},

	/**
	 * @private
	 */
	listLoaded : function(doc) {
		this.selected = [];
		this.parseWindow(doc);
		this.buildNavigation();
		this.body.update();
		this.head.update();
		this.rows = [];
		this.columns = [];
		var headTr = new Element('tr');
		var sort = doc.getElementsByTagName('sort');
		this.sortKey=null;
		this.sortDirection=null;
		if (sort.length>0) {
			this.sortKey=sort[0].getAttribute('key');
			this.sortDirection=sort[0].getAttribute('direction');
		}
		var headers = doc.getElementsByTagName('header');
		for (var i=0; i < headers.length; i++) {
			var className = '';
			var th = new Element('th');
			var width = headers[i].getAttribute('width');
			var key = headers[i].getAttribute('key');
			var sortable = headers[i].getAttribute('sortable')=='true';
			if (width && width!='') {
				th.style.width=width+'%';
			}
			if (sortable) {
				var self = this;
				th.in2iguiIndex = i;
				th.onclick=function() {self.sort(this.in2iguiIndex)};
				className+='sortable';
			}
			if (key==this.sortKey) {
				className+=' sort_'+this.sortDirection;
			}
			th.className=className;
			var span = new Element('span');
			th.appendChild(span);
			span.appendChild(document.createTextNode(headers[i].getAttribute('title')));
			headTr.appendChild(th);
			this.columns.push({'key':key,'sortable':sortable,'width':width});
		};
		this.head.appendChild(headTr);
		var frag = document.createDocumentFragment();
		var rows = doc.getElementsByTagName('row');
		for (var i=0; i < rows.length; i++) {
			var cells = rows[i].getElementsByTagName('cell');
			var row = new Element('tr');
			var icon = rows[i].getAttribute('icon');
			var title = rows[i].getAttribute('title');
			for (var j=0; j < cells.length; j++) {
				var td = new Element('td');
				this.parseCell(cells[j],td);
				row.insert(td);
				if (!title) title = cells[j].innerText;
				if (!icon && cells[j].getAttribute('icon')) icon = cells[j].getAttribute('icon');
			};
			var info = {id:rows[i].getAttribute('id'),kind:rows[i].getAttribute('kind'),icon:icon,title:title,index:i};
			row.dragDropInfo = info;
			this.addRowBehavior(row,i);
			frag.appendChild(row);
			//this.body.insert(row);
			this.rows.push(info);
		};
		this.body.appendChild(frag);
		this.fire('selectionReset');
	},
	
	objectsLoaded : function(data) {
		if (data.constructor == Array) {
			this.setObjects(data);
		} else {
			this.setData(data);
		}
		this.fire('selectionReset');
	},
	sourceIsBusy : function() {
		//this.element.addClassName('in2igui_list_busy');
	},
	sourceIsNotBusy : function() {
		//this.element.removeClassName('in2igui_list_busy');
	},
	
	filter : function(str) {
		var len = 20;
		var regex = new RegExp("[\\w]{"+len+",}","g");
		var match = regex.exec(str);
		if (match) {
			for (var i=0; i < match.length; i++) {
				var rep = '';
				for (var j=0; j < match[i].length; j++) {
					rep+=match[i][j];
					if ((j+1)%len==0) rep+='\u200B';
				};
				str = str.replace(match[i],rep);
			};
		}
		return str;
	}
};

In2iGui.List.prototype.parseCell = function(node,cell) {
	var icon = node.getAttribute('icon');
	if (icon!=null && !icon.blank()) {
		cell.insert(In2iGui.createIcon(icon,1));
	}
	for (var i=0; i < node.childNodes.length; i++) {
		var child = node.childNodes[i];
		if (n2i.dom.isDefinedText(child)) {
			n2i.dom.addText(cell,child.nodeValue);
		} else if (n2i.dom.isElement(child,'break')) {
			cell.insert(new Element('br'));
		} else if (n2i.dom.isElement(child,'line')) {
			var line = new Element('p',{'class':'in2igui_list_line'}).insert(n2i.dom.getNodeText(child));
			if (child.getAttribute('dimmed')=='true') {
				line.addClassName('in2igui_list_dimmed')
			}
			cell.insert(line);
		} else if (n2i.dom.isElement(child,'object')) {
			var obj = new Element('div',{'class':'object'});
			if (child.getAttribute('icon')) {
				obj.insert(In2iGui.createIcon(child.getAttribute('icon'),1));
			}
			if (child.firstChild && child.firstChild.nodeType==n2i.TEXT_NODE && child.firstChild.nodeValue.length>0) {
				obj.appendChild(document.createTextNode(child.firstChild.nodeValue));
			}
			cell.insert(obj);
		}
	};
}

/**
 * @private
 */
In2iGui.List.prototype.parseWindow = function(doc) {
	var wins = doc.getElementsByTagName('window');
	if (wins.length>0) {
		var win = wins[0];
		this.window.total = parseInt(win.getAttribute('total'));
		this.window.size = parseInt(win.getAttribute('size'));
		this.window.page = parseInt(win.getAttribute('page'));
	} else {
		this.window.total = 0;
		this.window.size = 0;
		this.window.page = 0;
	}
}

In2iGui.List.prototype.buildNavigation = function() {
	var self = this;
	var pages = this.window.size>0 ? Math.ceil(this.window.total/this.window.size) : 0;
	if (pages<2) {
		this.navigation.style.display='none';
		return;
	}
	this.navigation.style.display='block';
	var from = ((this.window.page)*this.window.size+1);
	this.count.update(from+'-'+Math.min((this.window.page+1)*this.window.size,this.window.total)+' / '+this.window.total);
	var pageBody = this.windowPageBody;
	pageBody.update();
	if (pages<2) {
		this.windowPage.style.display='none';	
	} else {
		$R(0, pages-1).each(function(i){
			var a = document.createElement('a');
			a.appendChild(document.createTextNode(i+1));
			a.onclick = function() {
				self.windowPageWasClicked(this,i);
				return false;
			}
			if (i==self.window.page) {
				a.className='selected';
			}
			pageBody.appendChild(a);
			
		});
		this.windowPage.style.display='block';
	}
}

/********************************** Update from objects *******************************/

In2iGui.List.prototype.setData = function(data) {
	this.selected = [];
	var win = data.window || {};
	this.window.total = win.total || 0;
	this.window.size = win.size || 0;
	this.window.page = win.page || 0;
	this.buildNavigation();
	this.buildHeaders(data.headers);
	this.buildRows(data.rows);
},

In2iGui.List.prototype.buildHeaders = function(headers) {
	this.head.update();
	this.columns = [];
	var tr = new Element('tr');
	this.head.insert(tr);
	headers.each(function(h,i) {
		var th = new Element('th');
		if (h.width) {
			th.setStyle({width:h.width+'%'});
		}
		if (h.sortable) {
			th.observe('click',function() {this.sort(i)}.bind(this));
			th.addClassName('sortable');
		}
		th.insert(new Element('span').update(h.title));
		tr.insert(th);
		this.columns.push(h);
	}.bind(this));
}

In2iGui.List.prototype.buildRows = function(rows) {
	var self = this;
	this.body.update();
	this.rows = [];
	if (!rows) return;
	rows.each(function(r,i) {
		var tr = new Element('tr');
		var icon = r.icon;
		var title = r.title;
		r.cells.each(function(c) {
			var td = new Element('td');
			if (c.icon) {
				td.insert(In2iGui.createIcon(c.icon,1));
				icon = icon || c.icon;
			}
			if (c.text) {
				td.insert(c.text);
				title = title || c.text;
			}
			tr.insert(td);
		})
		self.body.insert(tr);
		// TODO: Memory leak!
		var info = {id:r.id,kind:r.kind,icon:icon,title:title,index:i};
		tr.dragDropInfo = info;
		self.rows.push(info);
		this.addRowBehavior(tr,i);
	}.bind(this));
}


/********************************** Update from objects legacy *******************************/

// TODO: Is this ever used?
In2iGui.List.prototype.setObjects = function(objects) {
	this.selected = [];
	this.body.update();
	this.rows = [];
	for (var i=0; i < objects.length; i++) {
		var row = new Element('tr');
		var obj = objects[i];
		for (var j=0; j < this.columns.length; j++) {
			var cell = new Element('td');
			if (this.builder) {
				cell.update(this.builder.buildColumn(this.columns[j],obj));
			} else {
				var value = obj[this.columns[j].key] || '';
				if (value.constructor == Array) {
					for (var k=0; k < value.length; k++) {
						if (value[k].constructor == Object) {
							cell.insert(this.createObject(value[k]));
						} else {
							cell.insert(new Element('div').update(value));
						}
					};
				} else if (value.constructor == Object) {
					cell.insert(this.createObject(value[j]));
				} else {
					cell.insert(value);
				}
			}
			row.insert(cell);
		};
		this.body.insert(row);
		this.addRowBehavior(row,i);
		this.rows.push(obj);
	};
}

In2iGui.List.prototype.createObject = function(object) {
	var node = new Element('div',{'class':'object'});
	if (object.icon) {
		node.insert(new Element('div',{'class':'icon'}).setStyle({'backgroundImage':'url("'+In2iGui.getIconUrl(object.icon,1)+'")'}));
	}
	return node.insert(object.text || object.name || '');
}

/************************************* Behavior ***************************************/


/**
 * @private
 */
In2iGui.List.prototype.addRowBehavior = function(row,index) {
	var self = this;
	row.onmousedown = function(e) {
		self.rowDown(index);
		In2iGui.startDrag(e,row);
		return false;
	}
	row.ondblclick = function() {
		self.rowDoubleClick(index);
		return false;
	}
}

In2iGui.List.prototype.changeSelection = function(indexes) {
	var rows = this.body.getElementsByTagName('tr');
	for (var i=0;i<this.selected.length;i++) {
		rows[this.selected[i]].removeClassName('selected');
	}
	for (var i=0;i<indexes.length;i++) {
		rows[indexes[i]].addClassName('selected');
	}
	this.selected = indexes;
	this.fire('selectionChanged',this.rows[indexes[0]]);
}

/**
 * @private
 */
In2iGui.List.prototype.rowDown = function(index) {
	this.changeSelection([index]);
}

/**
 * @private
 */
In2iGui.List.prototype.rowDoubleClick = function(index) {
	In2iGui.callDelegates(this,'listRowsWasOpened');
	In2iGui.callDelegates(this,'listRowWasOpened',this.getFirstSelection());
	In2iGui.callDelegates(this,'onRowOpen',this.getFirstSelection());
}

/**
 * @private
 */
In2iGui.List.prototype.windowPageWasClicked = function(tag,index) {
	this.window.page = index;
	In2iGui.firePropertyChange(this,'state',this.window);
	In2iGui.firePropertyChange(this,'window.page',this.window.page);
}

/* EOF */