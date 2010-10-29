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
		initColorPickers();
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
			$sidebarScrolling: $('#sidebar-scrolling'),
			$forestCoverDate: $('#forestcover-date'),
			$forestChangeStart: $('#forestchange-date-start'),
			$forestChangeEnd: $('#forestchange-date-end'),
			$deforestationRadio: $('#deforestation-radio'),
			$disturbanceRadio: $('#disturbance-radio'),
			$mapwrap: $('#mapwrap'),
			_: null
		};
	}
	
	var tileBase = 'http://claslite.geary.joyeurs.com/tiles/';
	var activateTab = {
		location: function() {
			enableGeoclick();
			removeLayer();
		},
		forestcover: function() {
			disableGeoclick();
			addLayer( 'forestcover', S(
				'forestcover/peru_redd_',
				app.$forestCoverDate.val(),
				'_forestcover_geotiff_rgb/'
			) );
		},
		forestchange: function() {
			disableGeoclick();
			addLayer( 'forestchange', S(
				'forestchange/',
				app.$forestChangeStart.val().slice(-2),
				'_',
				app.$forestChangeEnd.val().slice(-2),
				'_',
				app.$deforestationRadio.is(':checked') ? 'deforestation' : 'disturbance',
				'/'
			) );
		},
		statistics: function() {
			disableGeoclick();
		},
		help: function() {
			disableGeoclick();
		}
	};
	
	function initTabs() {
		app.tabOpts = {
			parent: '#tabs',
			panels: '#sidebar-scrolling',
			tabs: {
				location: 'Location',
				forestcover: 'Forest Cover',
				forestchange: 'Forest Change',
				statistics: 'Statistics',
				help: 'Help'
			},
			click: function( id ) {
				var activate = activateTab[id];
				activate && activate();
			}
		};
		app.tabs = S.Tabs( app.tabOpts );
		
		$('form.input-form').submit( function( event ) {
			event.preventDefault();
			// TODO: this could be cleaner
			app.tabOpts.click( app.tabs.selected );
		});
		
		app.tabs.select( 'location' );
	}
	
	function initRangeInputs() {
		$('input:range').rangeinput();
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
	
	function initColorPickers() {
		$('input.mColorPickerInput').click( function( event ) {
			$(this).next().trigger( 'click', event );
		});
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
	
	function enableGeoclick() {
		app.geoclick && app.geoclick.enable();
	}
	
	function disableGeoclick() {
		app.geoclick && app.geoclick.disable();
	}
	
	function addLayer( id, path ) {
		removeLayer();
		app.layer = app.map.addLayer({
			minZoom: 6,
			maxZoom: 14,
			opacity: $('#'+id+'-opacity').data('rangeinput').getValue() / 100,
			tiles: tileBase + path + '{Z}/{X}/{Y}.png'
		});
	}
	
	function removeLayer() {
		app.layer && app.layer.remove();
		delete app.layer;
	}
	
	function initMap() {
		//var bounds = [ -26, -80, 5, -35 ];
		var bounds = [ -13.186159, -70.962916, -10.960249, -68.705582 ];
		var mt = google.maps.MapTypeId;
		app.map = new S.Map( app.$mapwrap, {
			v3: {
				mapTypeId: mt.ROADMAP,
				streetViewControl: false,
				mapTypeControlOptions: {
					mapTypeIds: [
						mt.ROADMAP, mt.SATELLITE, mt.HYBRID, mt.TERRAIN,
						'black', 'white'
					]
				}
			}
		});
		
		if( S.Map.v3 ) {
			addSolidMapType( 'black', '#000000', 'Black', 'Show solid black background' );
			addSolidMapType( 'white', '#FFFFFF', 'White', 'Show solid white background' );
		}
		
		app.map.fitBounds.apply( app.map, bounds );
		if( app.map.v2 ) {
			// HACK FOR V2 MAPS API:
			setTimeout( function() {
				app.map.fitBounds.apply( app.map, bounds );
			}, 100 );
			// END HACK
		}
		
		app.geoclick = new app.map.Geoclick({
			form: '#location-search-form',
			input: '#location-search-input',
			list: '#location-results-list',
			onclick: function() {
				app.tabs.select( 'location' );
			}
		});
		
		$('input.layer-slider').bind( 'onSlide change', function( event, value ) {
			app.layer && app.layer.setOpacity( value / 100 );
		});
	}
	
	function addSolidMapType( id, color, name, alt ) {
		app.map.map.mapTypes.set( id,
			new S.Map.v3.SolidMapType({ color:color, name:name, alt:alt })
		);
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
