/** @constructor */
In2iGui.SearchField = function(options) {
	this.options = n2i.override({expandedWidth:null},options);
	this.element = $(options.element);
	this.name = options.name;
	this.field = this.element.select('input')[0];
	this.value = this.field.value;
	this.adaptive = this.element.hasClassName('in2igui_searchfield_adaptive')
	this.initialWidth=this.element.clientWidth;
	In2iGui.extend(this);
	this.addBehavior();
	this.updateClass()
}

In2iGui.Toolbar.SearchField.create = function(options) {
	options = options || {};
	var e = options.element = new Element('div',{'class': 'in2igui_searchfield'});
	e.update('<div><div><input type="text"/></div></div>');
	return new In2iGui.SearchField(options);
}

In2iGui.SearchField.prototype = {
	/** @private */
	addBehavior : function() {
		var self = this;
		this.field.onkeyup = function() {
			self.fieldChanged();
		}
		var reset = this.element.select('a')[0];
		reset.tabIndex=-1;
		var focus = function() {self.field.focus();self.field.select()};
		this.element.observe('mousedown',focus).observe('mouseup',focus);
		reset.observe('mousedown',function(e) {e.stop();self.reset();focus()});
		this.element.select('em')[0].observe('mousedown',focus);
		this.field.observe('focus',function() {
			self.focused=true;
			self.updateClass();
		});
		this.field.observe('blur',function() {
			self.focused=false;
			self.updateClass();
		});
		if (this.options.expandedWidth>0) {
			this.field.onfocus = function() {
				n2i.ani(self.element,'width',self.options.expandedWidth+'px',500,{ease:n2i.ease.slowFastSlow});
			}
			this.field.onblur = function() {
				n2i.ani(self.element,'width',self.initialWidth+'px',500,{ease:n2i.ease.slowFastSlow,delay:100});
			}
		}
	},
	setValue : function(value) {
		this.field.value=value;
		this.fieldChanged();
	},
	getValue : function() {
		return this.field.value;
	},
	isEmpty : function() {
		return this.field.value=='';
	},
	isBlank : function() {
		return this.field.value.strip()=='';
	},
	reset : function() {
		this.field.value='';
		this.fieldChanged();
	},
	/** @private */
	updateClass : function() {
		var className = 'in2igui_searchfield';
		if (this.adaptive) {
			className+=' in2igui_searchfield_adaptive';
		}
		if (this.focused && this.value!='') {
			className+=' in2igui_searchfield_focus_dirty';
		} else if (this.focused) {
			className+=' in2igui_searchfield_focus';
		} else if (this.value!='') {
			className+=' in2igui_searchfield_dirty';
		}
		this.element.className=className;
	},
	/** @private */
	fieldChanged : function() {
		if (this.field.value!=this.value) {
			this.value=this.field.value;
			this.updateClass();
			this.fire('valueChanged',this.value);
			In2iGui.firePropertyChange(this,'value',this.value);
		}
	}
}

/* EOF */