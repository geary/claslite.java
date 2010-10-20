// Scriptino Map
// Copyright 2010 Michael Geary
// Use under any Open Source license:
// http://www.opensource.org/licenses/

(function( S, $ ) {
	
	var gm = google.maps, gme = gm.event;
	if( ! gme ) {
		var v2 = true;
		gme = gm.Event;
	}
	
	S.Map = function( $map ) {
		var sm = this;
		$map = $($map);
		
		if( v2 ) {
			if( ! GBrowserIsCompatible() ) return;
			var map = sm.map = new GMap2( $map[0] );
			//map.addMapType(G_PHYSICAL_MAP);
			//map.setMapType(G_NORMAL_MAP);
			map.enableContinuousZoom();
			map.enableDoubleClickZoom();
			//map.enableScrollWheelZoom();
			map.addControl( new GLargeMapControl );
			//map.addControl( new GLargeMapControl3D );
			map.addControl( new GMapTypeControl );
		}
		else {
			var map = sm.map = new gm.Map( $map[0], {
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});
		}
		
		S.extend( sm, {
			addLayer: function( opt ) {
				if( v2 ) {
					
					var tlo = new GTileLayerOverlay(
						new GTileLayer(
							new GCopyrightCollection(''), opt.minZoom, opt.maxZoom, {
								tileUrlTemplate: opt.tiles,
								isPng: true,
								opacity: 1.0
							}
						)
					);
					
					map.addOverlay( tlo );
					
					//var layer = new GTileLayer(
					//	new GCopyrightCollection(''),
					//	opt.minZoom, opt.maxZoom
					//);
					//var mercator = new GMercatorProjection( opt.maxZoom + 1 );
					//layer.getTileUrl = function( tile, zoom ) {
					//	if( zoom < opt.minZoom  ||  zoom > opt.maxZoom )
					//		return "http://www.maptiler.org/img/none.png";
					//	var ymax = 1 << zoom;
					//	var y = ymax - tile.y - 1;
					//	var tileBounds = new GLatLngBounds(
					//		mercator.fromPixelToLatLng( new GPoint( (tile.x)*256, (tile.y+1)*256 ) , zoom ),
					//		mercator.fromPixelToLatLng( new GPoint( (tile.x+1)*256, (tile.y)*256 ) , zoom )
					//	);
					//	//if (mapBounds.intersects(tileBounds)) {
					//		return 'http://claslite.geary.joyeurs.com/tiles/peru_redd_2007_mosaic_frac_tif/' + zoom + '/' + tile.x + '/' + tile.y + '.png'
					//	//} else {
					//	//	return "http://www.maptiler.org/img/none.png";
					//	//}
					//}
					//// IE 7-: support for PNG alpha channel
					//// Unfortunately, the opacity for whole overlay is then not changeable, either or...
					//layer.isPng = function() { return true;};
					//layer.getOpacity = function() { return .5 /*opacity*/; }
					//
					//overlay = new GTileLayerOverlay( layer );
					//map.addOverlay(overlay);
					
				}
				else {
					var layerMapType = new gm.ImageMapType({
						minZoom: opt.minZoom,
						maxZoom: opt.maxZoom,
						tileSize: new gm.Size( 256, 256 ),
						isPng: true,
						getTileUrl: function( coord, zoom ) {
							return opt.tiles
								.replace( '{X}', coord.x )
								.replace( '{Y}', coord.y )
								.replace( '{Z}', zoom );
						}
					});
					sm.map.overlayMapTypes.insertAt( 0, layerMapType );
				}
			},
			
			fitBounds: function( s, w, n, e ) {
				var bounds = new gm.LatLngBounds(
					new gm.LatLng( s, w ),
					new gm.LatLng( n, e )
				);
				if( v2 ) {
					var zoom = map.getBoundsZoomLevel( bounds );
					map.setCenter( bounds.getCenter(), zoom || 4 );
				}
				else {
					map.fitBounds( bounds );
				}
			},
			
			geoclick: function( opt ) {
				var $form = $(opt.form), $input = $(opt.input), $list = $('<div>');
				$(opt.list).html( $list );
				sm.geocoder = sm.geocoder || new S.Geocoder;
				
				sm.clickCoder = sm.clickCoder  ||
					gme.addListener( sm.map, 'click', function( event, latlng ) {
						if( ! v2 ) latlng = event.latLng;
						geocode({ address: latlng.lat() + ',' + latlng.lng() });
					});
				
				$form.submit( function( event ) {
					event.preventDefault();
					geocode({ address: $input.val() });
				});
				
				function geocode( request ) {
					sm.geocoder.geocode( request, function( results, status ) {
						var $ul = $('<ul>');
						if( status == gm.GeocoderStatus.OK ) {
							results.forEach( function( result ) {
								var $li = $('<li>').text( result.formatted_address ).appendTo($ul);
							});
						}
						$list.html( $ul );
					});
				}
			},
			
			resize: function() {
				if( v2 ) map.checkResize();
				else gme.trigger( map, 'resize' );
			}
		});
		
		function cancelClick() {
			if( sm.clicker ) {
				clearTimeout( sm.clicker );
				delete sm.clicker;
			}
		}
		
		gme.addListener( sm.map, 'click', function( event ) {
			//console.log( 'click', event.latLng );
			cancelClick();
			sm.clicker = setTimeout( function() {
				gme.trigger( sm.map, 'Scriptino_singleclick', event );
			}, 500 );
		});
		
		gme.addListener( sm.map, 'dblclick', function( event ) {
			//console.log( 'dblclick', event.latLng );
			cancelClick();
		});
		
		gme.addListener( sm.map, 'Scriptino_singleclick', function( event ) {
			//console.log( 'Scriptino_singleclick', event.latLng );
		});
	};
	
	S.Geocoder = function() {
		var sg = this;
		if( v2 ) {
			var frame;
			
			function loadFrame( callback ) {
				S.Geocoder.ready = function( _frame ) {
					callback( frame = _frame );
				};
				if( frame ) {
					callback( frame );
				}
				else {
					$('<iframe>').html( S(
						'<html>',
							'<head>',
								'<script type="text/javascript">',
									'function ready() { parent.Scriptino.Geocoder.ready(window); }',
								'</script>',
								'<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false&callback=ready"></script>',
							'</head>',
							'<body>',
							'</body>',
						'</html>'
					) ).appendTo('body');
				}
			}
			
			var geocoder = this;
			var framecoder;
			
			S.extend( sg, {
				geocode: function( request, callback ) {
					loadFrame( function( frame ) {
						framecoder = framecoder || new frame.google.maps.Geocoder;
						framecoder.geocode( request, callback );
					});
				}
			});
		}
		else {
			var geocoder = new gm.Geocoder();
			
			S.extend( sg, {
				geocode: function( request, callback ) {
					geocoder.geocode( request, callback );
				}
			});
		}
	};
	
})( Scriptino, jQuery );