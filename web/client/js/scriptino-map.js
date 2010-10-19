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
			
			geocoder: new gm.Geocoder(),
			
			map: new gm.Map( $map[0], {
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}),
			
			fitBounds: function( s, w, n, e ) {
				sm.map.fitBounds(
					new gm.LatLngBounds(
						new gm.LatLng( s, w ),
						new gm.LatLng( n, e )
					)
				);
			},
			
			resize: function() {
				gm.event.trigger( sm.map, 'resize' );
			}
		});
		
		function cancelClick() {
			if( sm.clicker ) {
				clearTimeout( sm.clicker );
				delete sm.clicker;
			}
		}
		
		gme.addListener( sm.map, 'click', function( event ) {
			console.log( 'click', event.latLng );
			cancelClick();
			sm.clicker = setTimeout( function() {
				gme.trigger( sm.map, 'Scriptino_singleclick', event );
			}, 500 );
		});
		
		gme.addListener( sm.map, 'dblclick', function( event ) {
			console.log( 'dblclick', event.latLng );
			cancelClick();
		});
		
		gme.addListener( sm.map, 'Scriptino_singleclick', function( event ) {
			console.log( 'Scriptino_singleclick', event.latLng );
		});
	};
	
})( Scriptino, jQuery );
