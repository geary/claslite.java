// claslite.js
// Copyright 2010 Carnegie Institution for Science and Michael Geary
// Use under any Open Source license:
// http://www.opensource.org/licenses/

(function() {
	
	var app;
	var layout = {
		sidebarWidth: 350
	};
	
	S.extend( $.fn.mColorPicker.defaults, {
		imageFolder: 'images/mColorPicker/'
	});
	S.extend( $.fn.mColorPicker.init, {
		replace: '.color-picker',
		showLogo: false
	});

	//var monthNames = [
	//	'January', 'February', 'March', 'April', 'May', 'June',
	//	'July', 'August', 'September', 'October', 'November', 'December'
	//];
	
	$.fn.dateSelect = function( years, initial, changed ) {
		return this
			.html( years.map( function( year ) {
				return S(
					//'<option value="', year, '-', padDigits( month, 2 ), '">',
					//	monthNames[ month - 1 ], ' ', year,
					//'</option>'
					'<option value="', year, '">',
						year,
					'</option>'
				);
			}).join('') )
			.val( initial )
			.bind( 'change keyup', function( event ) {
				changed && changed.apply( this, arguments );
			});
	}
	
	$().ready( initUI );
	
	function initUI() {
		initVars();
		initTabs();
		initRangeInputs();
		initDateSelects();
		initLegends();
		initSizer();
		resize();
		initMap();
		$('#outermost').show();
		resize();
	}
	
	function initVars() {
		app = {
			$window: $(window),
			$main: $('#main'),
			$tabs: $('#tabs'),
			$sidebarOuter: $('#sidebar-outer'),
			$sidebar: $('#sidebar'),
			$forestCoverDate: $('#forestcover-date'),
			$forestChangeStart: $('#forestchange-date-start'),
			$forestChangeEnd: $('#forestchange-date-end'),
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
	
	function initRangeInputs() {
		$("input:range").rangeinput();
	}
	
	function initDateSelects() {
		initForestCoverDateSelect();
		initForestChangeDateSelect();
	}
	
	function initForestCoverDateSelect() {
		app.$forestCoverDate
			.dateSelect( [ 2007, 2008, 2009 ], 2009, function( event ) {
			});
	}
	
	function initForestChangeDateSelect() {
		app.$forestChangeStart
			.dateSelect( [ 2007, 2008 ], 2007, function( event ) {
				if( +this.value >= +app.$forestChangeEnd.val() )
					app.$forestChangeEnd.val( +this.value + 1 );
			});
		
		app.$forestChangeEnd
			.dateSelect( [ 2008, 2009 ], 2009, function( event ) {
				if( +this.value <= +app.$forestChangeStart.val() )
					app.$forestChangeStart.val( +this.value - 1 );
			});
	}
	
	function padDigits( value, digits ) {
		return ( '' + ( value + 100000000 ) ).slice( -digits );
	}
	
	function initLegends() {
		addLegend( '#deforestation-legend' );
		addLegend( '#disturbance-legend' );
	}
	
	function addLegend( legend ) {
		var colors = [ '#FF0000', '#FF4400', '#FF8800', '#FFCC00', '#FFFF00' ];
		$.S(
			'<div class="legend-colors">',
				colors.map( function( color, i ) {
					return S(
						'<div class="legend-color" style="background-color:', color, '">',
						'</div>',
						'<div class="legend-label">',
							i == 0 ? 'Recent' : i == colors.length - 1 ? 'Oldest' : '',
						'</div>',
						'<div class="clear-both">',
						'</div>'
					)
				}).join(''),
			'</div>'
		).appendTo( legend );
	}
	
	function initMap() {
		//var bounds = [ -26, -80, 5, -35 ];
		var bounds = [ -13.186159, -70.962916, -10.960249, -68.705582 ];
		app.map = new S.Map( app.$mapwrap );
		app.map.fitBounds.apply( app.map, bounds );
		// HACK FOR V2 MAPS API:
		setTimeout( function() {
			app.map.fitBounds.apply( app.map, bounds );
		}, 100 );
		// END HACK
		
		app.map.geoclick({
			form: '#location-search-form',
			input: '#location-search-input',
			list: '#location-results-list',
			onclick: function() {
				app.tabs.select( 'location' );
			}
		});
		
		app.forestcoverLayer = 
			app.map.addLayer({
				minZoom: 6,
				maxZoom: 14,
				opacity: $('#forestcover-opacity').data('rangeinput').getValue() / 100,
				//tiles: 'http://claslite.geary.joyeurs.com/tiles/peru_redd_2007_mosaic_frac_tif/{Z}/{X}/{Y}.png'
				tiles: 'http://claslite.geary.joyeurs.com/tiles/peru_redd_2009_peru_redd_forestcover_geotiff_rgb/{Z}/{X}/{Y}.png'
			});
			
		$('#forestcover-opacity').bind( 'onSlide change', function( event, value ) {
			app.forestcoverLayer.setOpacity( value / 100 );
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
