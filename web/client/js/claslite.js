// claslite.js
// Copyright 2010 Carnegie Institution for Science and Michael Geary
// Use under any Open Source license:
// http://www.opensource.org/licenses/

(function() {
	
	var app = {};
	
	$().ready( initUI );
	
	function initUI() {
		initTabs();
		$('#outermost').show();
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
	
})();
