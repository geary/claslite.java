// Scriptino Map
// Copyright 2010 Michael Geary
// Use under any Open Source license:
// http://www.opensource.org/licenses/

(function( S, $ ) {
	
	var gm = google.maps, gme = gm.event;
	
	S.Map = function( $map ) {
		$map = $($map);
		
		var sm = this;
		S.extend( sm, {
			map: new gm.Map( $map[0], {
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}),
			
			addLayer: function( opt ) {
				var layerMapType = new gm.ImageMapType({
					minZoom: opt.minZoom,
					maxZoom: opt.maxZoom,
					tileSize: new gm.Size( 256, 256 ),
					isPng: true,
					getTileUrl: function( coord, zoom ) {
						return opt.tiles
							.replace( '%x', coord.x )
							.replace( '%y', coord.y )
							.replace( '%z', zoom );
					}
				});
				sm.map.overlayMapTypes.insertAt( 0, layerMapType );
			},
			
			fitBounds: function( s, w, n, e ) {
				sm.map.fitBounds(
					new gm.LatLngBounds(
						new gm.LatLng( s, w ),
						new gm.LatLng( n, e )
					)
				);
			},
			
			geoclick: function( opt ) {
				var $form = $(opt.form), $input = $(opt.input), $list = $('<div>');
				$(opt.list).html( $list );
				sm.geocoder = sm.geocoder || new S.Geocoder;
				
				sm.clickCoder = sm.clickCoder  ||
					gme.addListener( sm.map, 'click', function( event ) {
						geocode({ location: event.latLng });
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
				gme.trigger( sm.map, 'resize' );
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
		S.extend( sg, {
			
			geocoder: new gm.Geocoder(),
			
			geocode: function( request, callback ) {
				sg.geocoder.geocode( request, callback );
			}
		});
	};
	
})( Scriptino, jQuery );
