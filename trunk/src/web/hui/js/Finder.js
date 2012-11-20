////////////////////////// Finder ///////////////////////////

/**
 * A "finder" for finding objects
 * @constructor
 */
hui.ui.Finder = function(options) {
	this.options = hui.override({title:'Finder',selection:{},list:{}},options);
	this.name = options.name;
	hui.ui.extend(this);
	if (options.listener) {
		this.listen(options.listener);
	}
}

/**
 * Creates a new finder
 * <pre><strong>options:</strong> {
 *  title : «String»,
 *  selection : {
 *      value : «String»,
 *      url : «String»,
 *      parameter : «String»,
 *      kindParameter : «String»
 *  },
 *  list : { 
 *      url : «String» 
 *  },
 *  search : { 
 *      parameter : «String» 
 *  },
 *  listener : {$select : function(object) {}}
 * }
 * </pre>
 */
hui.ui.Finder.create = function(options) {
	return new hui.ui.Finder(options);
}

hui.ui.Finder.prototype = {
	/** Shows the finder */
	show : function() {
		if (!this.window) {
			this._build();
		}
		this.window.show();
	},
	hide : function() {
		if (this.window) {
			this.window.hide();
		}
	},
	clear : function() {
		this.list.clearSelection();
	},
	_build : function() {
		var win = this.window = hui.ui.Window.create({title:this.options.title,icon:'common/search',width:600});

		
		var layout = hui.ui.Layout.create();
		win.add(layout);

		var left = hui.ui.Overflow.create({height:400});
		layout.addToLeft(left);
		
		var list = this.list = hui.ui.List.create();
		
		this.list.listen({
			$open : function(row) {
				
			},
			
			$select : this._selectionChanged.bind(this)
		})
		
		
		if (this.options.search) {
			var bar = hui.ui.Bar.create({variant:'layout'});
			var search = hui.ui.SearchField.create({expandedWidth:200});
			search.listen({
				$valueChanged : function() {
					list.resetState();
				}
			})
			bar.addToRight(search);
			layout.addToCenter(bar);
		}
		var right = hui.ui.Overflow.create({height:400});
		layout.addToCenter(right);
		right.add(this.list);
		
		this.selection = hui.ui.Selection.create({value : this.options.selection.value});
		this.selection.listen({
			$select : function() {
				list.resetState();
			}
		})
		var src = new hui.ui.Source({url : this.options.selection.url});
		this.selection.addItems({source:src})
		left.add(this.selection);
		
		var parameters = [];
		if (this.options.list.url) {
			parameters = [
				{key:'windowSize',value:10},
				{key:'windowPage',value:'@'+list.name+'.window.page'},
				{key:'direction',value:'@'+list.name+'.sort.direction'},
				{key:'sort',value:'@'+list.name+'.sort.key'}
			];
		}
		if (this.options.selection.parameter) {
			parameters.push({key:this.options.selection.parameter || 'text',value:'@'+this.selection.name+'.value'})
		}
		if (this.options.selection.kindParameter) {
			parameters.push({key:this.options.selection.kindParameter || 'text',value:'@'+this.selection.name+'.kind'})
		}
		
		if (this.options.search) {
			parameters.push({key:this.options.search.parameter || 'text',value:'@'+search.name+'.value'})
		}
		if (this.options.list.pageParameter) {
			parameters.push({key:this.options.list.pageParameter,value:'@'+list.name+'.window.page'})
		}
		
		var listSource = this.options.list.source;
		if (listSource) {
			hui.log(parameters)
			for (var i=0; i < parameters.length; i++) {
				listSource.addParameter(parameters[i]);
			};
		}
		if (this.options.list.url) {
			listSource = new hui.ui.Source({
				url : this.options.list.url,
				parameters : parameters
			});
		}
		this.list.setSource(listSource);
		
		src.refresh();
	},
	
	_selectionChanged : function() {
		var row = this.list.getFirstSelection();
		if (row!=null) {
			this.fire('select',row);
		}
	}
}
