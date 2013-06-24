desktop.widget.Bookmarks = function(options) {
	this.options = hui.override({},options);
	this.element = hui.build('div',{'class':'widget widget_links',
		style:'left: 100px;top:100px;',
		parent:document.body,
		html : desktop.widget.Bookmarks.template
	});
	desktop.widget.makeMovable(this);
	this.body = hui.get.firstByClass(this.element,'widget_body');
	this.searchBar = desktop.SearchBar.create({parent:this.body});
	this.source = new hui.ui.Source({url:'listBookmarks'});
	this.list = desktop.List.create({parent:this.body,source:this.source});
	this._attach();
	this.list.refresh();
}

desktop.widget.Bookmarks.template = '<div class="widget_header">'+
		'<span class="widget_left">'+
			'<a class="widget_nodrag" href="javascript://">×</a>'+
		'</span>'+
		'<strong>Bookmarks</strong>'+
		'<span class="widget_right">'+
			'<a href="javascript://" class="widget_nodrag" style="font-weight: 400" data="more">···</a>'+
			'<a href="javascript://" class="widget_nodrag">+</a>'+
		'</span>'+
	'</div>'+
	'<div class="widget_body"></div>';

desktop.widget.Bookmarks.prototype = {
	_attach : function() {
		hui.listen(this.element,'click',this._onClick.bind(this));
		this.searchBar.listen({
			$valueChanged : function(value) {
				this.list.refresh({parameters:{text:value}});
			}.bind(this) 
		});
	},
	_onClick : function(e) {
		e = hui.event(e);
		var a = e.findByTag('a');
		if (a) {
			var data = a.getAttribute('data');
			if (data=='more') {
				hui.cls.toggle(this.element,'widget_searching');
			}
		}
	}
}
