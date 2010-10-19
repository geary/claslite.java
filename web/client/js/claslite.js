// claslite.js
// Copyright 2010 Carnegie Institution for Science and Michael Geary
// Use under any Open Source license:
// http://www.opensource.org/licenses/

(function() {
	
	var app;
	var layout = {
		sidebarWidth: 350
	};
	
	$().ready( initUI );
	
	function initUI() {
		initVars();
		initTabs();
		initSizer();
		resize();
		initMap();
		$('#outermost').show();
	}
	
	function initVars() {
		app = {
			$window: $(window),
			$main: $('#main'),
			$tabs: $('#tabs'),
			$sidebarOuter: $('#sidebar-outer'),
			$sidebar: $('#sidebar'),
			$mapwrap: $('#mapwrap'),
			_: null
		};
	}
	
	function initTabs() {
		app.tabs = S.Tabs({
			parent: '#tabs',
			panels: '#sidebar',
			tabs: {
				location: 'Location',
				forestcover: 'Forest Cover',
				forestchange: 'Forest Change',
				help: 'Help'
			},
			click: function( id ) {
				//$('#sidebar').html( this.tabs[id] );
			}
		});
		
		app.tabs.select( 'location' );
	}
	
	function initMap() {
		app.map = new S.Map( app.$mapwrap );
		app.map.fitBounds( -26, -80, 5, -35 );
		app.map.geoclick({
			form: '#location-search-form',
			input: '#location-search-input',
			list: '#location-results-list',
			click: function() {
			}
		});
	}
	
	function initSizer() {
		$(window).resize( resize );
	}
	
	function resize() {
		var ww = app.$window.width(), wh = app.$window.height();
		app.$main.css({ height: wh - app.$main.offset().top });
		app.$mapwrap.css({ width: ww - layout.sidebarWidth - 1 });
		app.map && app.map.resize();
	}
	
})();
