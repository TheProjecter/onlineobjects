/**
 * @class
 * This is a formula
 */
In2iGui.Formula = function(o) {
	this.element = $(o.element);
	this.name = o.name;
	this.addBehavior();
	In2iGui.extend(this);
}

/** @static Creates a new formula */
In2iGui.Formula.create = function(o) {
	o = o || {};
	o.element = new Element('form',{'class':'in2igui_formula'});
	return new In2iGui.Formula(o);
}

In2iGui.Formula.prototype = {
	/** @private */
	addBehavior : function() {
		this.element.onsubmit=function() {
			this.fire('submit');
			return false
		}.bind(this);
	},
	/** Returns a map of all values of descendants */
	getValues : function() {
		var data = {};
		var d = In2iGui.get().getDescendants(this);
		for (var i=0; i < d.length; i++) {
			if (d[i].options&& d[i].options.key && d[i].getValue) {
				data[d[i].options.key] = d[i].getValue();
			} else if (d[i].name && d[i].getValue) {
				data[d[i].name] = d[i].getValue();
			}
		};
		return data;
	},
	/** Returns a map of all values of descendants */
	setValues : function(values) {
		var d = In2iGui.get().getDescendants(this);
		for (var i=0; i < d.length; i++) {
			if (d[i].options && d[i].options.key) {
				var key = d[i].options.key;
				if (key && values[key]!=undefined) {
					d[i].setValue(values[key]);
				}
			}
		}
	},
	/** Resets all descendants */
	reset : function() {
		var d = In2iGui.get().getDescendants(this);
		for (var i=0; i < d.length; i++) {
			if (d[i].reset) d[i].reset();
		}
	},
	/** Adds a widget to the form */
	add : function(widget) {
		this.element.insert(widget.getElement());
	},
	/** Creates a new form group and adds it to the form
	 * @returns {'In2iGui.Formula.Group'} group
	 */
	createGroup : function(options) {
		var g = In2iGui.Formula.Group.create(null,options);
		this.add(g);
		return g;
	},
	/** Builds and adds a new group according to a recipe
	 * @returns {'In2iGui.Formula.Group'} group
	 */
	buildGroup : function(options,recipe) {
		var g = this.createGroup(options);
		recipe.each(function(item) {
			var w = In2iGui.Formula[item.type].create(item.options);
			g.add(w);
		});
		return g;
	},
	/** @private */
	childValueChanged : function(value) {
		this.fire('valuesChanged',this.getValues());
	}
}

///////////////////////// Group //////////////////////////


In2iGui.Formula.Group = function(elementOrId,name,options) {
	this.name = name;
	this.element = $(elementOrId);
	this.body = this.element.select('tbody')[0];
	this.options = n2i.override({above:true},options);
	In2iGui.extend(this);
}

In2iGui.Formula.Group.create = function(name,options) {
	options = n2i.override({above:true},options);
	var element = new Element('table',
		{'class':'in2igui_formula_group'}
	);
	if (options.above) {
		element.addClassName('in2igui_formula_group_above');
	}
	element.insert(new Element('tbody'));
	return new In2iGui.Formula.Group(element,name,options);
}

In2iGui.Formula.Group.prototype = {
	add : function(widget) {
		var tr = new Element('tr');
		this.body.insert(tr);
		if (widget.getLabel) {
			var label = widget.getLabel();
			if (label) {
				var th = new Element('th');
				th.insert(new Element('label').insert(label));
				tr.insert(th);
			}
		}
		var td = new Element('td');
		td.insert(new Element('div',{'class':'in2igui_formula_item'}).insert(widget.getElement()));
		if (this.options.above) {
			tr = new Element('tr');
			this.body.insert(tr);
		}
		tr.insert(td);
	},
	createButtons : function(options) {
		var tr = new Element('tr');
		this.body.insert(tr);
		var td = new Element('td',{colspan:this.options.above?1:2});
		tr.insert(td);
		var b = In2iGui.Buttons.create(options);
		td.insert(b.getElement());
		return b;
	}
}

/********************** Text ***********************/

In2iGui.Formula.Text = function(o) {
	this.options = n2i.override({label:null,key:null},o);
	this.name = o.name;
	this.element = $(o.element);
	this.input = this.element.select('.in2igui_formula_text')[0];
	this.value = this.input.value;
	In2iGui.extend(this);
	this.addBehavior();
}

In2iGui.Formula.Text.create = function(options) {
	options = n2i.override({lines:1},options);
	if (options.lines>1) {
		var input = new Element('textarea',
			{'class':'in2igui_formula_text','rows':options.lines}
		);
	} else {
		var input = new Element('input',
			{'class':'in2igui_formula_text'}
		);		
	}
	options.element = In2iGui.wrapInField(input);
	return new In2iGui.Formula.Text(options);
}

In2iGui.Formula.Text.prototype = {
	addBehavior : function() {
		In2iGui.addFocusClass({element:this.input,classElement:this.element,'class':'in2igui_field_focused'});
		this.input.observe('keyup',this.valueMightHaveChanged.bind(this));
	},
	valueMightHaveChanged : function() {
		if (this.input.value==this.value) return;
		this.value=this.input.value;
		In2iGui.callAncestors(this,'childValueChanged',this.input.value);
		this.fire('valueChanged',this.input.value);
	},
	updateFromNode : function(node) {
		if (node.firstChild) {
			this.setValue(node.firstChild.nodeValue);
		} else {
			this.setValue(null);
		}
	},
	updateFromObject : function(data) {
		this.setValue(data.value);
	},
	focus : function() {
		try {
			this.input.focus();
		} catch (e) {}
	},
	select : function() {
		try {
			this.input.select();
		} catch (e) {}
	},
	reset : function() {
		this.setValue('');
	},
	setValue : function(value) {
		this.value = value;
		this.input.value = value;
	},
	getValue : function() {
		return this.input.value;
	},
	getLabel : function() {
		return this.options.label;
	},
	isEmpty : function() {
		return n2i.isEmpty(this.input.value);
	}
}

/********************** Dat time ***********************/

In2iGui.Formula.DateTime = function(o) {
	this.inputFormats = ['d-m-Y','d/m-Y','d/m/Y','d-m-Y H:i:s','d/m-Y H:i:s','d/m/Y H:i:s','d-m-Y H:i','d/m-Y H:i','d/m/Y H:i','d-m-Y H','d/m-Y H','d/m/Y H','d-m','d/m','d','Y','m-d-Y','m-d','m/d'];
	this.outputFormat = 'd-m-Y H:i:s';
	this.name = o.name;
	this.element = $(o.element);
	this.input = this.element.select('input')[0];
	this.options = n2i.override({returnType:null,label:null},o);
	this.value = null;
	In2iGui.extend(this);
	this.addBehavior();
}

In2iGui.Formula.DateTime.prototype = {
	addBehavior : function() {
		In2iGui.addFocusClass({element:this.input,classElement:this.element,'class':'in2igui_field_focused'});
		this.input.observe('blur',this.check.bind(this));
	},
	updateFromNode : function(node) {
		if (node.firstChild) {
			this.setValue(node.firstChild.nodeValue);
		} else {
			this.setValue(null);
		}
	},
	updateFromObject : function(data) {
		this.setValue(data.value);
	},
	focus : function() {
		try {this.input.focus();} catch (ignore) {}
	},
	reset : function() {
		this.setValue('');
	},
	setValue : function(value) {
		if (!value) {
			this.value = null;
		} else if (value.constructor==Date) {
			this.value = value;
		} else {
			this.value = new Date();
			this.value.setTime(parseInt(value)*1000);
		}
		this.updateUI();
	},
	check : function() {
		var str = this.input.value;
		var parsed = null;
		for (var i=0; i < this.inputFormats.length && parsed==null; i++) {
			parsed = Date.parseDate(str,this.inputFormats[i]);
		};
		this.value = parsed;
		this.updateUI();
	},
	getValue : function() {
		if (this.value!=null && this.options.returnType=='seconds') {
			return Math.round(this.value.getTime()/1000);
		}
		return this.value;
	},
	getElement : function() {
		return this.element;
	},
	getLabel : function() {
		return this.options.label;
	},
	updateUI : function() {
		if (this.value) {
			this.input.value = this.value.dateFormat(this.outputFormat);
		} else {
			this.input.value = ''
		}
	}
}

/************************************* DropDown *******************************/

In2iGui.Formula.DropDown = function(o) {
	this.name = o.name;
	var e = this.element = $(o.element);
	this.inner = e.select('strong')[0];
	this.options = n2i.override({label:null},o);
	this.items = o.items || [];
	this.index = -1;
	this.value = this.options.value || null;
	this.dirty = true;
	In2iGui.extend(this);
	this.addBehavior();
	this.updateIndex();
	this.updateUI();
	if (this.options.url) {
		this.options.source = new In2iGui.Source({url:this.options.url,delegate:this});
	} else if (this.options.source) {
		this.options.source.addDelegate(this);	
	}
}

In2iGui.Formula.DropDown.create = function(o) {
	o = o || {};
	o.element = new Element('a',{'class':'in2igui_dropdown',href:'#'}).update(
		'<span><span><strong></strong></span></span>'
	);
	return new In2iGui.Formula.DropDown(o);
}

In2iGui.Formula.DropDown.prototype = {
	addBehavior : function() {
		In2iGui.addFocusClass({element:this.element,'class':'in2igui_dropdown_focused'});
		this.element.observe('click',this.clicked.bind(this));
		this.element.observe('blur',this.hideSelector.bind(this));
	},
	updateIndex : function() {
		this.index=-1;
		this.items.each(function(item,i) {
			if (item.value==this.value) this.index=i;
		}.bind(this));
	},
	updateUI : function() {
		if (this.items[this.index]) {
			this.inner.update(this.items[this.index].title);
		} else {
			this.inner.update();
		}
		if (!this.selector) return;
		this.selector.select('a').each(function(a,i) {
			if (this.index==i) {
				a.addClassName('in2igui_selected');
			}
			else a.className='';
		}.bind(this));
	},
	clicked : function(e) {
		e.stop();
		this.buildSelector();
		var el = this.element,s=this.selector;
		el.focus();
		if (!this.items) return;
		In2iGui.positionAtElement(s,el,{vertical:'bottomOutside',top:-2,left:2});
		s.setStyle({display:'block',width:(el.getWidth()-5)+'px',zIndex:In2iGui.nextTopIndex()});
	},
	getValue : function(value) {
		return this.value;
	},
	setValue : function(value) {
		this.value = value;
		this.updateIndex();
		this.updateUI();
	},
	reset : function() {
		this.setValue(null);
	},
	getLabel : function() {
		return this.options.label;
	},
	refresh : function() {
		if (this.options.source) {
			this.options.source.refresh();
		}
	},
	addItem : function(item) {
		this.items.push(item);
		this.dirty = true;
		this.updateIndex();
		this.updateUI();
	},
	setItems : function(items) {
		this.items = items;
		this.dirty = true;
		this.index = -1;
		this.updateIndex();
		this.updateUI();
	},
	itemsLoaded : function(items) {
		this.setItems(items);
	},
	hideSelector : function() {
		if (!this.selector) return;
		this.selector.hide();
	},
	buildSelector : function() {
		if (!this.dirty || !this.items) return;
		if (!this.selector) {
			this.selector = new Element('div',{'class':'in2igui_dropdown_selector'});
			document.body.appendChild(this.selector);
		} else {
			this.selector.update();
		}
		var self = this;
		this.items.each(function(item,i) {
			var e = new Element('a',{href:'#'}).update(item.title).observe('mousedown',function(e) {
				e.stop();
				self.itemClicked(item,i);
			})
			if (i==self.index) e.addClassName('in2igui_selected');
			self.selector.insert(e);
		});
		this.dirty = false;
	},
	itemClicked : function(item,index) {
		this.index = index;
		this.value = this.items[index].value;
		this.updateUI();
		this.hideSelector();
	}
}

/************************************* Select *******************************/

In2iGui.Formula.Select = function(id,name,options) {
	this.name = name;
	this.options = n2i.override({label:null},options);
	this.element = $(id);
	this.value = this.options.value || null;
	this.invalidValue = false;
	In2iGui.extend(this);
	this.addBehavior();
	this.refresh();
}

In2iGui.Formula.Select.create = function(name,options) {
	var e = new Element('select');
	return new In2iGui.Formula.Select(e,name,options);
}

In2iGui.Formula.Select.prototype = {
	addBehavior : function() {
		var self = this;
		this.element.observe('change',function() {
			self.valueMightChange();
		});
	},
	refresh : function() {
		if (this.options.source) {
			var self = this;
			new Ajax.Request(this.options.source, {onSuccess: function(t) {self.update(t.responseXML)}});
		}
	},
	update : function(doc) {
		for (var i = this.element.options.length - 1; i >= 0; i--){
			this.element.remove(i);
		};
		var items = doc.getElementsByTagName('item');
		for (var i=0; i < items.length; i++) {
			var title = items[i].getAttribute('title');
			var value = items[i].getAttribute('value');
			this.element.options[this.element.options.length] = new Option(title,value);
		};
		this.setValue(this.value);
	},
	valueMightChange : function() {
		if (this.element.value!=this.value) {
			this.value=this.element.value;
			In2iGui.callDelegates(this,'valueDidChange',this.value);
		}
	},
	reset : function() {
		this.element.selectedIndex = 0;
		this.value = null;
	},
	setValue : function(value) {
		value=value+'';
		for (var i=0; i < this.element.options.length; i++) {
			if (this.element.options[i].value==value) {
				this.element.selectedIndex = i;
				this.value = value;
				if (this.invalidValue) {
					this.element.firstDescendant().remove();
				}
				return;
			}
		};
		if (this.invalidValue) {
			this.element.firstDescendant().value=value;
		} else {
			this.element.insert({top:new Element('option',{value:value})});
			this.invalidValue = true;
		}
		this.element.selectedIndex=0;
		this.value = value;
	},
	getValue : function(value) {
		return this.element.value;
	},
	getLabel : function() {
		return this.options.label;
	}
}


/********************************* Radio buttons ****************************/

In2iGui.Formula.Radiobuttons = function(id,name,options) {
	this.options = options;
	this.element = $(id);
	this.name = name;
	this.radios = [];
	this.value = options.value;
	this.defaultValue = this.value;
	In2iGui.extend(this);
}

In2iGui.Formula.Radiobuttons.prototype = {
	click : function() {
		this.value = !this.value;
		this.updateUI();
	},
	updateUI : function() {
		for (var i=0; i < this.radios.length; i++) {
			var radio = this.radios[i];
			$(radio.id).setClassName('in2igui_selected',radio.value==this.value);
		};
	},
	setValue : function(value) {
		this.value = value;
		this.updateUI();
	},
	getValue : function() {
		return this.value;
	},
	reset : function() {
		this.setValue(this.defaultValue);
	},
	registerRadiobutton : function(radio) {
		this.radios.push(radio);
		var element = $(radio.id);
		var self = this;
		element.onclick = function() {
			self.setValue(radio.value);
		}
	}
}


/********************************* Checkboxes ****************************/

In2iGui.Formula.Checkbox = function(id,name,options) {
	this.element = $(id);
	this.control = this.element.select('span')[0];
	this.options = options;
	this.name = name;
	this.value = options.value=='true';
	In2iGui.extend(this);
	this.addBehavior();
}

In2iGui.Formula.Checkbox.prototype = {
	addBehavior : function() {
		In2iGui.addFocusClass({element:this.element,'class':'in2igui_checkbox_focused'});
		this.element.observe('click',this.click.bind(this));
	},
	click : function(e) {
		e.stop();
		this.element.focus();
		this.value = !this.value;
		this.updateUI();
	},
	updateUI : function() {
		this.element.setClassName('in2igui_checkbox_selected',this.value);
	},
	setValue : function(value) {
		this.value = value;
		this.updateUI();
	},
	getValue : function() {
		return this.value;
	},
	reset : function() {
		this.setValue(false);
	}
}

/********************************* Checkboxes ****************************/

In2iGui.Formula.Checkboxes = function(id,name,options) {
	this.options = options;
	this.element = $(id);
	this.name = name;
	this.checkboxes = [];
	this.sources = [];
	this.subItems = [];
	this.values = [];
	In2iGui.extend(this);
}

In2iGui.Formula.Checkboxes.prototype = {
	getValue : function() {
		return this.values;
	},
	/** @deprecated */
	getValues : function() {
		return this.values;
	},
	checkValues : function() {
		var newValues = [];
		for (var i=0; i < this.values.length; i++) {
			var value = this.values[i];
			var found = false;
			for (var j=0; j < this.subItems.length; j++) {
				found = found || this.subItems[j].hasValue(value);
			};
			if (found) {
				newValues.push(value);
			}
		};
		this.values=newValues;
	},
	setValue : function(values) {
		this.values=values;
		this.checkValues();
		this.updateUI();
	},
	/** @deprecated */
	setValues : function(values) {
		this.setValue(values);
	},
	flipValue : function(value) {
		n2i.flipInArray(this.values,value);
		this.checkValues();
		this.updateUI();
	},
	updateUI : function() {
		for (var i=0; i < this.subItems.length; i++) {
			this.subItems[i].updateUI();
		};
	},
	refresh : function() {
		for (var i=0; i < this.subItems.length; i++) {
			this.subItems[i].refresh();
		};
	},
	reset : function() {
		this.setValues([]);
	},
	registerSource : function(source) {
		source.parent = this;
		this.sources.push(source);
	},
	registerItems : function(items) {
		items.parent = this;
		this.subItems.push(items);
	},
	itemWasClicked : function(item) {
		this.changeValue(item.in2iGuiValue);
	}
}

/******************************** Checkbox items ****************************/

In2iGui.Formula.Checkboxes.Items = function(id,name,options) {
	this.element = $(id);
	this.name = name;
	this.parent = null;
	this.options = options;
	this.checkboxes = [];
	In2iGui.extend(this);
	if (this.options.source) {
		this.options.source.addDelegate(this);
	}
}

In2iGui.Formula.Checkboxes.Items.prototype = {
	refresh : function() {
		if (this.options.source) {
			this.options.source.refresh();
		}
	},
	itemsLoaded : function(items) {
		this.checkboxes = [];
		this.element.update();
		var self = this;
		items.each(function(item) {
			var node = new Element('a',{'class':'in2igui_checkbox',href:'#'}).update(
				'<span><span></span></span>'+item.title
			).observe('click',function(e) {e.stop();node.focus();self.itemWasClicked(item)});
			In2iGui.addFocusClass({element:node,'class':'in2igui_checkbox_focused'});
			self.element.insert(node);
			self.checkboxes.push({title:item.title,element:node,value:item.value});
		})
		this.parent.checkValues();
		this.updateUI();
	},
	itemWasClicked : function(item) {
		this.parent.flipValue(item.value);
	},
	updateUI : function() {
		for (var i=0; i < this.checkboxes.length; i++) {
			var item = this.checkboxes[i];
			item.element.setClassName('in2igui_checkbox_selected',this.parent.values.indexOf(item.value)!=-1);
		};
	},
	hasValue : function(value) {
		for (var i=0; i < this.checkboxes.length; i++) {
			if (this.checkboxes[i].value==value) {
				return true;
			}
		};
		return false;
	}
}

/**************************** Token ************************/

In2iGui.Formula.Tokens = function(o) {
	this.options = n2i.override({label:null,key:null},o);
	this.element = $(o.element);
	this.name = o.name;
	this.value = [''];
	In2iGui.extend(this);
	this.updateUI();
}

In2iGui.Formula.Tokens.create = function(o) {
	o = o || {};
	o.element = new Element('div').addClassName('in2igui_tokens');
	return new In2iGui.Formula.Tokens(o);
}

In2iGui.Formula.Tokens.prototype = {
	setValue : function(objects) {
		this.value = objects;
		this.value.push('');
		this.updateUI();
	},
	reset : function() {
		this.value = [''];
		this.updateUI();
	},
	getValue : function() {
		var out = [];
		this.value.each(function(value) {
			value = value.strip();
			if (value.length>0) out.push(value);
		})
		return out;
	},
	getLabel : function() {
		return this.options.label;
	},
	updateUI : function() {
		this.element.update();
		this.value.each(function(value,i) {
			var input = new Element('input').addClassName('in2igui_tokens_token');
			if (this.options.width) {
				input.setStyle({width:this.options.width+'px'});
			}
			input.value = value;
			input.in2iguiIndex = i;
			this.element.insert(input);
			input.observe('keyup',function() {this.inputChanged(input,i)}.bind(this));
		}.bind(this));
	},
	/** @private */
	inputChanged : function(input,index) {
		if (index==this.value.length-1 && input.value!=this.value[index]) {
			this.addField();
		}
		this.value[index] = input.value;
	},
	/** @private */
	addField : function() {
		var input = new Element('input').addClassName('in2igui_tokens_token');
		if (this.options.width) {
			input.setStyle({width:this.options.width+'px'});
		}
		var i = this.value.length;
		this.value.push('');
		this.element.insert(input);
		var self = this;
		input.observe('keyup',function() {self.inputChanged(input,i)});
	}
}

/* EOF */