var in2igui = {};

/**
  The base class of the In2iGui framework
  @constructor
 */
function In2iGui() {
	/** {boolean} Is true when the DOM is loaded */
	this.domLoaded = false;
	/** @private */
	this.overflows = null;
	/** @private */
	this.delegates = [];
	/** @private */
	this.objects = $H();
	this.addBehavior();
}

/** @private */
In2iGui.latestObjectIndex = 0;
/** @private */
In2iGui.latestIndex = 500;
/** @private */
In2iGui.latestPanelIndex = 1000;
/** @private */
In2iGui.latestAlertIndex = 1500;
/** @private */
In2iGui.latestTopIndex = 2000;
/** @private */
In2iGui.toolTips = {};

/** Gets the one instance of In2iGui */
In2iGui.get = function(name) {
	if (!In2iGui.instance) {
		In2iGui.instance = new In2iGui();
	}
	if (name) {
		return In2iGui.instance.objects.get(name);
	} else {
		return In2iGui.instance;
	}
};

document.observe('dom:loaded', function () {
	In2iGui.get().ignite();
});

In2iGui.prototype = {
	/** @private */
	ignite : function() {
		if (window.dwr) {
			if (dwr && dwr.engine && dwr.engine.setErrorHandler) {
				dwr.engine.setErrorHandler(function(msg,e) {
					n2i.log(msg);
					n2i.log(e);
					In2iGui.get().showAlert({title:'An unexpected error occurred!',text:msg,emotion:'gasp'});
				});
			}
		}
		this.domLoaded = true;
		In2iGui.domReady = true;
		this.resize();
		In2iGui.callSuperDelegates(this,'interfaceIsReady');
	},
	/** @private */
	addBehavior : function() {
		Event.observe(window,'resize',this.resize.bind(this));
	},
	/** Adds a global delegate */
	addDelegate : function(delegate) {
		this.delegates.push(delegate);
	},
	getTopPad : function(element) {
		var all,top;
		all = parseInt(n2i.getStyle(element,'padding'),10);
		top = parseInt(n2i.getStyle(element,'padding-top'),10);
		if (all) {return all;}
		if (top) {return top;}
		return 0;
	},
	getBottomPad : function(element) {
		var all,bottom;
		all = parseInt(n2i.getStyle(element,'padding'),10);
		bottom = parseInt(n2i.getStyle(element,'padding-bottom'),10);
		if (all) {return all;}
		if (bottom) {return bottom;}
		return 0;
	},
	/** @private */
	resize : function() {
		if (!this.overflows) {return;}
		var height = n2i.getInnerHeight();
		this.overflows.each(function(overflow) {
			if (n2i.browser.webkit || n2i.browser.gecko) {
				overflow.element.style.display='none';
				overflow.element.style.width = overflow.element.parentNode.clientWidth+'px';
				overflow.element.style.display='';
			}
			overflow.element.style.height = height+overflow.diff+'px';
		});
	},
	registerOverflow : function(id,diff) {
		if (!this.overflows) {this.overflows=[];}
		var overflow = $(id);
		this.overflows.push({element:overflow,diff:diff});
	},
	/** @private */
	alert : function(options) {
		if (!this.alertBox) {
			this.alertBox = In2iGui.Alert.create(null,options);
			this.alertBoxButton = In2iGui.Button.create({name:'in2iGuiAlertBoxButton',text : 'OK'});
			this.alertBoxButton.addDelegate(this);
			this.alertBox.addButton(this.alertBoxButton);
		} else {
			this.alertBox.update(options);
		}
		this.alertBoxCallBack = options.onOK;
		this.alertBoxButton.setText(options.button ? options.button : 'OK');
		this.alertBox.show();
	},
	/** @private */
	click$in2iGuiAlertBoxButton : function() {
		In2iGui.get().alertBox.hide();
		if (this.alertBoxCallBack) {
			this.alertBoxCallBack();
			this.alertBoxCallBack = null;
		}
	},
	confirm : function(options) {
		var name = options.name || 'in2iguiConfirm';
		var alert = In2iGui.get(name);
		if (!alert) {
			alert = In2iGui.Alert.create(name,options);
			var cancel = In2iGui.Button.create({name:name+'_cancel',text : options.cancel || 'Cancel',highlighted:options.highlighted==='cancel'});
			cancel.addDelegate({buttonWasClicked:function(){
				alert.hide();
				if (options.onCancel) {
					options.onCancel();
				}
				In2iGui.callDelegates(alert,'cancel');
			}});
			alert.addButton(cancel);
		
			var ok = In2iGui.Button.create({name:name+'_ok',text : options.ok || 'OK',highlighted:options.highlighted==='ok'});
			ok.addDelegate({buttonWasClicked:function(){
				alert.hide();
				if (options.onOK) {
					options.onOK();
				}
				In2iGui.callDelegates(alert,'ok');
			}});
			alert.addButton(ok);
		} else {
			alert.update(options);
			In2iGui.get(name+'_ok').setText(options.ok || 'ok');
			In2iGui.get(name+'_ok').setHighlighted(options.highlighted=='ok');
			In2iGui.get(name+'_cancel').setText(options.ok || 'cancel');
			In2iGui.get(name+'_cancel').setHighlighted(options.highlighted=='cancel');
			if (options.cancel) {In2iGui.get(name+'_cancel').setText(options.cancel);}
		}
		alert.show();
	},
	changeState : function(state) {
		if (this.state==state) {return;}
		var objects = this.objects.values();
		objects.each(function(obj) {
			if (obj.state) {
				if (obj.state==state) {obj.show();}
				else {obj.hide();}
			}
		});
	},
	getDescendants : function(widget) {
		var desc = [],e = widget.getElement(),self = this;
		if (e) {
			var d = e.descendants();
			d.each(function(node) {
				self.objects.values().each(function(obj) {
					if (obj.getElement()==node) {
						desc.push(obj);
					}
				});
			});
		}
		return desc;
	},
	/** Gets all ancestors of a widget
		@param {Widget} A widget
		@returns {Array} An array of all ancestors
	*/
	getAncestors : function(widget) {
		var desc = [];
		var e = widget.getElement();
		if (e) {
			var d = e.ancestors();
			d.each(function(node) {
				this.objects.values().each(function(obj) {
					if (obj.getElement()==node) {
						desc.push(obj);
					}
				});
			}.bind(this));
		}
		return desc;
	},
	getAncestor : function(widget,cls) {
		var a = this.getAncestors(widget);
		for (var i=0; i < a.length; i++) {
			if (a[0].getElement().hasClassName(cls)) {
				return a[0];
			}
		};
		return null;
	}
};

///////////////////////////////// Indexes /////////////////////////////

In2iGui.nextIndex = function() {
	In2iGui.latestIndex++;
	return 	In2iGui.latestIndex;
};

In2iGui.nextPanelIndex = function() {
	In2iGui.latestPanelIndex++;
	return 	In2iGui.latestPanelIndex;
};

In2iGui.nextAlertIndex = function() {
	In2iGui.latestAlertIndex++;
	return 	In2iGui.latestAlertIndex;
};

In2iGui.nextTopIndex = function() {
	In2iGui.latestTopIndex++;
	return 	In2iGui.latestTopIndex;
};

///////////////////////////////// Curtain /////////////////////////////

In2iGui.showCurtain = function(widget,zIndex) {
	if (!widget.curtain) {
		widget.curtain = new Element('div',{'class':'in2igui_curtain'}).setStyle({'z-index':'none'});
		widget.curtain.onclick = function() {
			if (widget.curtainWasClicked) {
				widget.curtainWasClicked();
			}
		};
		document.body.appendChild(widget.curtain);
	}
	widget.curtain.style.height=n2i.getDocumentHeight()+'px';
	widget.curtain.style.zIndex=zIndex;
	n2i.setOpacity(widget.curtain,0);
	widget.curtain.style.display='block';
	n2i.ani(widget.curtain,'opacity',0.7,1000,{ease:n2i.ease.slowFastSlow});
};

In2iGui.hideCurtain = function(widget) {
	if (widget.curtain) {
		n2i.ani(widget.curtain,'opacity',0,200,{hideOnComplete:true});
	}
};

//////////////////////////////// Message //////////////////////////////

In2iGui.alert = function(o) {
	In2iGui.get().alert(o);
};

In2iGui.showMessage = function(options) {
	if (typeof(options)=='string') {
		// TODO: Backwards compatibility
		options={text:options};
	}
	if (!In2iGui.message) {
		In2iGui.message = new Element('div',{'class':'in2igui_message'}).update('<div><div></div></div>');
		if (!n2i.browser.msie) {
			In2iGui.message.setStyle({opacity:0});
		}
		document.body.appendChild(In2iGui.message);
	}
	In2iGui.message.select('div')[1].update(options.text);
	In2iGui.message.setStyle({'display':'block',zIndex:In2iGui.nextTopIndex()});
	In2iGui.message.setStyle({marginLeft:(In2iGui.message.getWidth()/-2)+'px',marginTop:n2i.getScrollTop()+'px'});
	if (!n2i.browser.msie) {
		n2i.ani(In2iGui.message,'opacity',1,300);
	}
	window.clearTimeout(In2iGui.messageTimer);
	if (options.duration) {
		In2iGui.messageTimer = window.setTimeout(In2iGui.hideMessage,options.duration);
	}
};

In2iGui.hideMessage = function() {
	if (In2iGui.message) {
		if (!n2i.browser.msie) {
			n2i.ani(In2iGui.message,'opacity',0,300,{hideOnComplete:true});
		} else {
			In2iGui.message.setStyle({display:'none'});
		}
	}
};

In2iGui.showToolTip = function(options) {
	var key = options.key || 'common';
	var t = In2iGui.toolTips[key];
	if (!t) {
		t = new Element('div',{'class':'in2igui_tooltip'}).update('<div><div></div></div>').setStyle({display:'none'});
		document.body.appendChild(t);
		In2iGui.toolTips[key] = t;
	}
	t.onclick = function() {In2iGui.hideToolTip(options);};
	var n = $(options.element);
	var pos = n.cumulativeOffset();
	t.select('div')[1].update(options.text);
	if (t.style.display=='none' && !n2i.browser.msie) {t.setStyle({opacity:0});}
	t.setStyle({'display':'block',zIndex:In2iGui.nextTopIndex()});
	t.setStyle({left:(pos.left-t.getWidth()+4)+'px',top:(pos.top+2-(t.getHeight()/2)+(n.getHeight()/2))+'px'});
	if (!n2i.browser.msie) {
		n2i.ani(t,'opacity',1,300);
	}
};

In2iGui.hideToolTip = function(options) {
	var key = options ? options.key || 'common' : 'common';
	var t = In2iGui.toolTips[key];
	if (t) {
		if (!n2i.browser.msie) {
			n2i.ani(t,'opacity',0,300,{hideOnComplete:true});
		} else {
			t.setStyle({display:'none'});
		}
	}
};

/////////////////////////////// Utilities /////////////////////////////

In2iGui.isWithin = function(e,element) {
	Event.extend(e);
	var offset = element.cumulativeOffset();
	var dims = element.getDimensions();
	return e.pointerX()>offset.left && e.pointerX()<offset.left+dims.width && e.pointerY()>offset.top && e.pointerY()<offset.top+dims.height;
};

In2iGui.getIconUrl = function(icon,size) {
	return In2iGui.context+'/In2iGui/icons/'+icon+size+'.png';
};

In2iGui.createIcon = function(icon,size) {
	return new Element('span',{'class':'in2igui_icon in2igui_icon_'+size}).setStyle({'backgroundImage':'url('+In2iGui.getIconUrl(icon,size)+')'});
};

In2iGui.onDomReady = function(func) {
	if (In2iGui.domReady) {return func();}
	if (n2i.browser.gecko && document.baseURI.endsWith('xml')) {
		window.setTimeout(func,1000);
		return;
	}
	document.observe('dom:loaded', func);
};

In2iGui.wrapInField = function(e) {
	var w = new Element('div',{'class':'in2igui_field'}).update(
		'<span class="in2igui_field_top"><span><span></span></span></span>'+
		'<span class="in2igui_field_middle"><span class="in2igui_field_middle"><span class="in2igui_field_content"></span></span></span>'+
		'<span class="in2igui_field_bottom"><span><span></span></span></span>'
	);
	w.select('span.in2igui_field_content')[0].insert(e);
	return w;
};

In2iGui.addFocusClass = function(o) {
	var ce = o.classElement || o.element, c = o['class'];
	o.element.observe('focus',function() {
		ce.addClassName(c);
	}).observe('blur',function() {
		ce.removeClassName(c);
	});
};

/////////////////////////////// Animation /////////////////////////////

In2iGui.fadeIn = function(node,time) {
	if ($(node).getStyle('display')=='none') {
		node.setStyle({opacity:0,display:''});
	}
	n2i.ani(node,'opacity',1,time);
};

In2iGui.fadeOut = function(node,time) {
	n2i.ani(node,'opacity',0,time,{hideOnComplete:true});
};

//////////////////////////// Positioning /////////////////////////////

In2iGui.positionAtElement = function(element,target,options) {
	options = options || {};
	element = $(element);
	target = $(target);
	var origDisplay = element.getStyle('display');
	if (origDisplay=='none') {
		element.setStyle({'visibility':'hidden','display':'block'});
	}
	var pos = target.cumulativeOffset(),left = pos.left,top = pos.top;
	var vert=options.vertical || null;
	if (options.horizontal && options.horizontal=='right') {
		left = left+target.getWidth()-element.getWidth();
	}
	if (vert=='topOutside') {
		top = top-element.getHeight();
	} else if (vert=='bottomOutside') {
		top = top+target.getHeight();
	}
	left+=(options.left || 0);
	top+=(options.top || 0);
	element.setStyle({'left':left+'px','top':top+'px'});
	if (origDisplay=='none') {
		element.setStyle({'visibility':'visible','display':'none'});
	}
};


//////////////////////////////// Drag drop //////////////////////////////

In2iGui.getDragProxy = function() {
	if (!In2iGui.dragProxy) {
		In2iGui.dragProxy = new Element('div',{'class':'in2igui_dragproxy'}).setStyle({'display':'none'});
		document.body.appendChild(In2iGui.dragProxy);
	}
	return In2iGui.dragProxy;
};

In2iGui.startDrag = function(e,element,options) {
	var info = element.dragDropInfo;
	In2iGui.dropTypes = In2iGui.findDropTypes(info);
	if (!In2iGui.dropTypes) return;
	var proxy = In2iGui.getDragProxy();
	Event.observe(document.body,'mousemove',In2iGui.dragListener);
	Event.observe(document.body,'mouseup',In2iGui.dragEndListener);
	In2iGui.dragInfo = info;
	if (info.icon) {
		proxy.style.backgroundImage = 'url('+In2iGui.getIconUrl(info.icon,1)+')';
	}
	In2iGui.startDragPos = {top:Event.pointerY(e),left:Event.pointerX(e)};
	proxy.innerHTML = '<span>'+info.title+'</span>' || '###';
	In2iGui.dragging = true;
	document.body.onselectstart = function () { return false; };
};

In2iGui.findDropTypes = function(drag) {
	var gui = In2iGui.get();
	var drops = null;
	for (var i=0; i < gui.delegates.length; i++) {
		if (gui.delegates[i].dragDrop) {
			for (var j=0; j < gui.delegates[i].dragDrop.length; j++) {
				var rule = gui.delegates[i].dragDrop[j];
				if (rule.drag==drag.kind) {
					if (drops==null) drops={};
					drops[rule.drop] = {};
				}
			};
		}
	}
	return drops;
};

In2iGui.dragListener = function(e) {
	var event = Event.extend(e);
	In2iGui.dragProxy.style.left = (event.pointerX()+10)+'px';
	In2iGui.dragProxy.style.top = event.pointerY()+'px';
	In2iGui.dragProxy.style.display='block';
	var target = In2iGui.findDropTarget(event.element());
	if (target && In2iGui.dropTypes[target.dragDropInfo['kind']]) {
		if (In2iGui.latestDropTarget) {
			In2iGui.latestDropTarget.removeClassName('in2igui_drop');
		}
		target.addClassName('in2igui_drop');
		In2iGui.latestDropTarget = target;
	} else if (In2iGui.latestDropTarget) {
		In2iGui.latestDropTarget.removeClassName('in2igui_drop');
		In2iGui.latestDropTarget = null;
	}
	return false;
};

In2iGui.findDropTarget = function(node) {
	while (node) {
		if (node.dragDropInfo) {
			return node;
		}
		node = node.parentNode;
	}
	return null;
};

In2iGui.dragEndListener = function(event) {
	Event.stopObserving(document.body,'mousemove',In2iGui.dragListener);
	Event.stopObserving(document.body,'mouseup',In2iGui.dragEndListener);
	In2iGui.dragging = false;
	if (In2iGui.latestDropTarget) {
		In2iGui.latestDropTarget.removeClassName('in2igui_drop');
		In2iGui.callDelegatesDrop(In2iGui.dragInfo,In2iGui.latestDropTarget.dragDropInfo);
		In2iGui.dragProxy.style.display='none';
	} else {
		n2i.ani(In2iGui.dragProxy,'left',(In2iGui.startDragPos.left+10)+'px',200,{ease:n2i.ease.fastSlow});
		n2i.ani(In2iGui.dragProxy,'top',(In2iGui.startDragPos.top-5)+'px',200,{ease:n2i.ease.fastSlow,hideOnComplete:true});
	}
	In2iGui.latestDropTarget=null;
	document.body.onselectstart=null;
};

In2iGui.dropOverListener = function(event) {
	if (In2iGui.dragging) {
		//this.style.backgroundColor='#3875D7';
	}
};

In2iGui.dropOutListener = function(event) {
	if (In2iGui.dragging) {
		//this.style.backgroundColor='';
	}
};

//////////////////// Delegating ////////////////////

In2iGui.extend = function(obj) {
	if (!obj.name) {
		In2iGui.latestObjectIndex++;
		obj.name = 'unnamed'+In2iGui.latestObjectIndex;
	}
	In2iGui.get().objects.set(obj.name,obj);
	obj.delegates = [];
	obj.addDelegate = function(delegate) {
		n2i.addToArray(this.delegates,delegate);
	}
	obj.removeDelegate = function(delegate) {
		n2i.removeFromArray(this.delegates,delegate);
	}
	obj.fire = function(method,value,event) {
		In2iGui.callDelegates(this,method,value,event);
	}
	obj.fireProperty = function(key,value) {
		In2iGui.firePropertyChange(this,key,value);
	}
	if (!obj.getElement) {
		obj.getElement = function() {
			return this.element;
		}
	}
	if (!obj.valueForProperty) {
		obj.valueForProperty = function(p) {return this[p]};
	}
};

In2iGui.callDelegatesDrop = function(dragged,dropped) {
	var gui = In2iGui.get();
	var result = null;
	for (var i=0; i < gui.delegates.length; i++) {
		if (gui.delegates[i]['$drop$'+dragged.kind+'$'+dropped.kind]) {
			gui.delegates[i]['$drop$'+dragged.kind+'$'+dropped.kind](dragged,dropped);
		}
	}
};

In2iGui.callAncestors = function(obj,method,value,event) {
	if (typeof(value)=='undefined') value=obj;
	var d = In2iGui.get().getAncestors(obj);
	d.each(function(child) {
		if (child[method]) {
			thisResult = child[method](value,event);
		}
	});
};

In2iGui.callDescendants = function(obj,method,value,event) {
	if (typeof(value)=='undefined') value=obj;
	var d = In2iGui.get().getDescendants(obj);
	d.each(function(child) {
		if (child[method]) {
			thisResult = child[method](value,event);
		}
	});
};

In2iGui.callVisible = function(widget) {
	In2iGui.callDescendants(widget,'$visibilityChanged');
}

In2iGui.addDelegate = function(d) {
	In2iGui.get().addDelegate(d);
}

In2iGui.callDelegates = function(obj,method,value,event) {
	if (typeof(value)=='undefined') value=obj;
	var result = null;
	if (obj.delegates) {
		for (var i=0; i < obj.delegates.length; i++) {
			var delegate = obj.delegates[i];
			var thisResult = null;
			if (obj.name && delegate['$'+method+'$'+obj.name]) {
				thisResult = delegate['$'+method+'$'+obj.name](value,event);
			} else if (obj.name && delegate[method+'$'+obj.name]) {
				thisResult = delegate[method+'$'+obj.name](value,event);
			} else if ('$'+obj.name && delegate[method+'$'+obj.name]) {
				thisResult = delegate['$'+method+'$'+obj.name](value,event);
			} else if (obj.kind && delegate[method+'$'+obj.kind]) {
				thisResult = delegate[method+'$'+obj.kind](value,event);
			} else if (delegate[method]) {
				thisResult = delegate[method](value,event);
			} else if (delegate['$'+method]) {
				thisResult = delegate['$'+method](value,event);
			}
			if (result==null && thisResult!=null && typeof(thisResult)!='undefined') {
				result = thisResult;
			}
		};
	}
	var superResult = In2iGui.callSuperDelegates(obj,method,value,event);
	if (result==null && superResult!=null) result = superResult;
	return result;
};

In2iGui.callSuperDelegates = function(obj,method,value,event) {
	if (typeof(value)=='undefined') value=obj;
	var gui = In2iGui.get();
	var result = null;
	for (var i=0; i < gui.delegates.length; i++) {
		var delegate = gui.delegates[i];
		var thisResult = null;
		if (obj.name && delegate['$'+method+'$'+obj.name]) {
			thisResult = delegate['$'+method+'$'+obj.name](value,event);
		} else if (obj.name && delegate[method+'$'+obj.name]) {
			thisResult = delegate[method+'$'+obj.name](value,event);
		} else if (obj.kind && delegate[method+'$'+obj.kind]) {
			thisResult = delegate[method+'$'+obj.kind](value,event);
		} else if (delegate[method]) {
			thisResult = delegate[method](value,event);
		} else if (delegate['$'+method]) {
			thisResult = delegate['$'+method](value,event);
		}
		if (result==null && thisResult!=null && typeof(thisResult)!='undefined') {
			result = thisResult;
		}
	};
	return result;
};

In2iGui.resolveImageUrl = function(widget,img,width,height) {
	for (var i=0; i < widget.delegates.length; i++) {
		if (widget.delegates[i].resolveImageUrl) {
			return widget.delegates[i].resolveImageUrl(img,width,height);
		}
	};
	var gui = In2iGui.get();
	for (var i=0; i < gui.delegates.length; i++) {
		var delegate = gui.delegates[i];
		if (delegate.resolveImageUrl) {
			return delegate.resolveImageUrl(img,width,height);
		}
	}
	return null;
};

////////////////////////////// Bindings ///////////////////////////

In2iGui.firePropertyChange = function(obj,name,value) {
	In2iGui.callDelegates(obj,'propertyChanged',{property:name,value:value});
};

In2iGui.bind = function(expression,delegate) {
	if (expression.charAt(0)=='@') {
		var pair = expression.substring(1).split('.');
		var obj = eval(pair[0]);
		var p = pair.slice(1).join('.');
		obj.addDelegate({
			propertyChanged : function(prop) {
				if (prop.property==p) {
					delegate(prop.value);
				}
			}
		});
		return obj.valueForProperty(p);
	}
	return expression;
};

//////////////////////////////// Data /////////////////////////////

In2iGui.dwrUpdate = function() {
	var func = arguments[0];
	var delegate = {
  		callback:function(data) { In2iGui.handleDwrUpdate(data) }
	}
	var num = arguments.length;
	if (num==1) {
		func(delegate);
	} else if (num==2) {
		func(arguments[1],delegate);
	} else {
		alert('Too many parameters');
	}
};

In2iGui.handleDwrUpdate = function(data) {
	var gui = In2iGui.get();
	for (var i=0; i < data.length; i++) {
		if (gui.objects.get(data[i].name)) {
			gui.objects.get(data[i].name).updateFromObject(data[i]);
		}
	};
};

In2iGui.update = function(url,delegate) {
	var dlgt = {
		onSuccess:function(t) {In2iGui.handleUpdate(t,delegate)}
	}
	$get(url,dlgt);
};

In2iGui.handleUpdate = function(t,delegate) {
	var gui = In2iGui.get();
	var doc = t.responseXML.firstChild;
	var children = doc.childNodes;
	for (var i=0; i < children.length; i++) {
		if (children[i].nodeType==1) {
			var name = children[i].getAttribute('name');
			if (name && name!='' && gui.objects.get(name)) {
				gui.objects.get(name).updateFromNode(children[i]);
			}
		}
	};
	delegate.onSuccess();
};

/** @private */
In2iGui.jsonResponse = function(t,key) {
	if (!t.responseXML || !t.responseXML.documentElement) {
		var str = t.responseText.replace(/^\s+|\s+$/g, '');
		if (str.length>0) {
			var json = t.responseText.evalJSON(true);
		} else {
			json = '';
		}
		In2iGui.callDelegates(json,'success$'+key)
	} else {
		In2iGui.callDelegates(t,'success$'+key)
	}
};

/** @deprecated */
In2iGui.json = function(data,url,delegateOrKey) {
	var options = {method:'post',parameters:{},onException:function(e) {throw e}};
	if (typeof(delegateOrKey)=='string') {
		options.onSuccess=function(t) {In2iGui.jsonResponse(t,delegateOrKey)};
	} else {
		delegate = delegateOrKey;
	}
	for (key in data) {
		options.parameters[key]=Object.toJSON(data[key])
	}
	new Ajax.Request(url,options);
};

In2iGui.jsonRequest = function(o) {
	var options = {method:'post',parameters:{},onException:function(e) {throw e}};
	if (typeof(o.event)=='string') {
		options.onSuccess=function(t) {In2iGui.jsonResponse(t,o.event)};
	} else {
		delegate = delegateOrKey;
	}
	for (key in o.parameters) {
		options.parameters[key]=Object.toJSON(o.parameters[key])
	}
	new Ajax.Request(o.url,options)
};

In2iGui.request = function(options) {
	options = n2i.override({method:'post',parameters:{}},options);
	if (options.jsonParameters) {
		for (key in options.jsonParameters) {
			options.parameters[key]=Object.toJSON(options.jsonParameters[key])
		}
	}
	options.onSuccess=function(t) {
		if (options.successEvent) {
			In2iGui.jsonResponse(t,options.successEvent);
		} else if (t.responseXML && t.responseXML.documentElement.nodeName!='parsererror' && options.onXML) {
			options.onXML(t.responseXML);
		} else if (options.onJSON) {
			var str = t.responseText.replace(/^\s+|\s+$/g, '');
			if (str.length>0) {
				var json = t.responseText.evalJSON(true);
			} else {
				var json = null;
			}
			options.onJSON(json);
		}
	};
	options.onException = function(t,e) {n2i.log(e)};
	new Ajax.Request(options.url,options);
};

In2iGui.parseItems = function(doc) {
	var root = doc.documentElement;
	var out = [];
	In2iGui.parseSubItems(root,out);
	return out;
};

In2iGui.parseSubItems = function(parent,array) {
	var children = parent.childNodes;
	for (var i=0; i < children.length; i++) {
		var node = children[i];
		if (node.nodeType==1 && node.nodeName=='item') {
			var sub = [];
			In2iGui.parseSubItems(node,sub);
			array.push({
				title:node.getAttribute('title'),
				value:node.getAttribute('value'),
				icon:node.getAttribute('icon'),
				kind:node.getAttribute('kind'),
				badge:node.getAttribute('badge'),
				children:sub
			});
		}
	};
}

////////////////////////////////// Source ///////////////////////////

In2iGui.Source = function(o) {
	this.options = n2i.override({url:null,dwr:null},o);
	this.name = o.name;
	this.data = null;
	this.parameters = [];
	In2iGui.extend(this);
	if (o.delegate) this.addDelegate(o.delegate);
	this.busy=false;
	In2iGui.onDomReady(this.init.bind(this));
};

In2iGui.Source.prototype = {
	init : function() {
		var self = this;
		this.parameters.each(function(parm) {
			parm.value = In2iGui.bind(parm.value,function(value) {
				self.changeParameter(parm.key,value);
			});
		})
		this.refresh();
	},
	refresh : function() {
		if (this.delegates.length==0) return;
		if (this.busy) {
			this.pendingRefresh = true;
			return;
		}
		this.pendingRefresh = false;
		var self = this;
		if (this.options.url) {
			var url = new n2i.URL(this.options.url);
			this.parameters.each(function(p) {
				url.addParameter(p.key,p.value);
			});
			this.busy=true;
			In2iGui.callDelegates(this,'sourceIsBusy');
			new Ajax.Request(url.toString(), {onSuccess: function(t) {self.parse(t)},onException:function(t,e) {n2i.log(e)}});
		} else if (this.options.dwr) {
			var pair = this.options.dwr.split('.');
			var facade = eval(pair[0]);
			var method = pair[1];
			var args = facade[method].argumentNames();
			for (var i=0; i < args.length; i++) {
				if (this.parameters[i])
					args[i]=this.parameters[i].value || null;
			};
			args[args.length-1]=function(r) {self.parseDWR(r)};
			this.busy=true;
			In2iGui.callDelegates(this,'sourceIsBusy');
			facade[method].apply(facade,args);
		}
	},
	end : function() {
		In2iGui.callDelegates(this,'sourceIsNotBusy');
		this.busy=false;
		if (this.pendingRefresh) {
			this.refresh();
		}
	},
	parse : function(t) {
		if (t.responseXML) {
			this.parseXML(t.responseXML);
		}
		this.end();
	},
	parseXML : function(doc) {
		if (doc.documentElement.tagName=='items') {
			this.data = In2iGui.parseItems(doc);
			this.fire('itemsLoaded',this.data);
		} else if (doc.documentElement.tagName=='list') {
			this.fire('listLoaded',doc);
		} else if (doc.documentElement.tagName=='articles') {
			this.fire('articlesLoaded',doc);
		}
	},
	parseDWR : function(data) {
		this.data = data;
		this.fire('objectsLoaded',data);
		this.end();
	},
	addParameter : function(parm) {
		this.parameters.push(parm);
	},
	changeParameter : function(key,value) {
		this.parameters.each(function(p) {
			if (p.key==key) p.value=value;
		})
		var self = this;
		window.clearTimeout(this.paramDelay);
		this.paramDelay = window.setTimeout(function() {
			this.refresh();
		}.bind(this),100)
	}
}

/////////////////////////////////////// Localization //////////////////////////////////

In2iGui.localize = function(loc) {
	//alert(Object.toJSON(loc));
}

///////////////////////////////////// Common text field ////////////////////////

In2iGui.TextField = function(id,name,options) {
	this.options = n2i.override({placeholder:null,placeholderElement:null},options);
	var e = this.element = $(id);
	this.element.setAttribute('autocomplete','off');
	this.value = this.element.value;
	this.isPassword = this.element.type=='password';
	this.name = name;
	In2iGui.extend(this);
	this.addBehavior();
	if (this.options.placeholderElement && this.value!='') {
		In2iGui.fadeOut(this.options.placeholderElement,0);
	}
	this.checkPlaceholder();
	if (e==document.activeElement) this.focused();
}

In2iGui.TextField.prototype = {
	addBehavior : function() {
		var self = this;
		var e = this.element;
		var p = this.options.placeholderElement;
		e.observe('keyup',this.keyDidStrike.bind(this));
		e.observe('focus',this.focused.bind(this));
		e.observe('blur',this.checkPlaceholder.bind(this));
		if (p) {
			p.setStyle({cursor:'text'});
			p.observe('mousedown',this.focus.bind(this)).observe('click',this.focus.bind(this));
		}
	},
	focused : function() {
		var e = this.element;
		var p = this.options.placeholderElement;
		if (p && e.value=='') {
			In2iGui.fadeOut(p,0);
		}
		if (e.value==this.options.placeholder) {
			e.value='';
			e.removeClassName('in2igui_placeholder');
			if (this.isPassword && !n2i.browser.msie) {
				e.type='password';
				if (n2i.browser.webkit) {
					e.select();
				}
			}
		}
		e.select();		
	},
	checkPlaceholder : function() {
		if (this.options.placeholderElement && this.value=='') {
			In2iGui.fadeIn(this.options.placeholderElement,200);
		}
		if (this.options.placeholder && this.value=='') {
			if (!this.isPassword || !n2i.browser.msie) {
				this.element.value=this.options.placeholder;
				this.element.addClassName('in2igui_placeholder');
			}
			if (this.isPassword && !n2i.browser.msie) {
				this.element.type='text';
			}
		} else {
			this.element.removeClassName('in2igui_placeholder');
			if (this.isPassword && !n2i.browser.msie) {
				this.element.type='password';
			}
		}
	},
	keyDidStrike : function() {
		if (this.value!=this.element.value && this.element.value!=this.options.placeholder) {
			this.value = this.element.value;
			this.fire('valueChanged',this.value);
		}
	},
	getValue : function() {
		return this.value;
	},
	setValue : function(value) {
		if (value==undefined || value==null) value='';
		this.value = value;
		this.element.value = value;
	},
	isEmpty : function() {
		return this.value=='';
	},
	isBlank : function() {
		return this.value.strip()=='';
	},
	focus : function() {
		this.element.focus();
	},
	setError : function(error) {
		var isError = error ? true : false;
		this.element.setClassName('in2igui_field_error',isError);
		if (typeof(error) == 'string') {
			In2iGui.showToolTip({text:error,element:this.element,key:this.name});
		}
		if (!isError) {
			In2iGui.hideToolTip({key:this.name});
		}
	}
};

////////////////////////////////////// Info view /////////////////////////////

In2iGui.InfoView = function(id,name,options) {
	this.options = {clickObjects:false};
	n2i.override(this.options,options);
	this.element = $(id);
	this.body = this.element.select('tbody')[0];
	this.name = name;
	In2iGui.extend(this);
}

In2iGui.InfoView.create = function(name,options) {
	options = options || {};
	var element = new Element('div',{'class':'in2igui_infoview'});
	if (options.height) {
		element.setStyle({height:options.height+'px','overflow':'auto','overflowX':'hidden'});
	}
	if (options.margin) {
		element.setStyle({margin:options.margin+'px'});
	}
	element.update('<table><tbody></tbody></table>');
	return new In2iGui.InfoView(element,name,options);
}

In2iGui.InfoView.prototype = {
	addHeader : function(text) {
		var row = new Element('tr');
		row.insert(new Element('th',{'class' : 'in2igui_infoview_header','colspan':'2'}).insert(text));
		this.body.insert(row);
	},
	addProperty : function(label,text) {
		var row = new Element('tr');
		row.insert(new Element('th').insert(label));
		row.insert(new Element('td').insert(text));
		this.body.insert(row);
	},
	addObjects : function(label,objects) {
		if (!objects || objects.length==0) return;
		var row = new Element('tr');
		row.insert(new Element('th').insert(label));
		var cell = new Element('td');
		var click = this.options.clickObjects;
		objects.each(function(obj) {
			var node = new Element('div').insert(obj.title);
			if (click) {
				node.addClassName('in2igui_infoview_click')
				node.observe('click',function() {
					In2iGui.callDelegates(this,'objectWasClicked',obj);
				});
			}
			cell.insert(node);
		});
		row.insert(cell);
		this.body.insert(row);
	},
	setBusy : function(busy) {
		if (busy) {
			this.element.addClassName('in2igui_infoview_busy');
		} else {
			this.element.removeClassName('in2igui_infoview_busy');
		}
	},
	clear : function() {
		this.body.update();
	},
	update : function(data) {
		this.clear();
		for (var i=0; i < data.length; i++) {
			switch (data[i].type) {
				case 'header': this.addHeader(data[i].value); break;
				case 'property': this.addProperty(data[i].label,data[i].value); break;
				case 'objects': this.addObjects(data[i].label,data[i].value); break;
			}
		};
	}
}


/********************************* Prototype extensions **************************/

Element.addMethods({
	setClassName : function(element,name,set) {
		if (set) {
			element.addClassName(name);
		} else {
			element.removeClassName(name);
		}
		return element;
	}
});

/* EOF */