// Scriptino Map
// Copyright 2010 Michael Geary
// Use under any Open Source license:
// http://www.opensource.org/licenses/

(function( S, $ ) {
	
	var gm = google.maps;
	
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
	};
	
})( Scriptino, jQuery );
