L.mapbox.accessToken = 'pk.eyJ1IjoiaWFydW5rcCIsImEiOiJjaW5maWo0YTgweTdodmdrdjNpMHRzanNsIn0.QxBfqwHA03To6IdiLa3jpQ';
var mapLeaflet = L.mapbox.map('map-leaflet', 'mapbox.streets', { zoomControl: false  }).setView([12.971599, 77.594563], 8),
mapStatus = false,
prevMarker,
polygon = {},
latlngx,
markers = L.markerClusterGroup(),
poiIcon = L.Icon.extend({
    options: {
        iconSize: [22,32],
        iconAnchor: [-20,0],
        shadowUrl: 'icons/poi_shadow.png',
        shadowSize: [22,13],
        shadowAnchor: [-31,-19],
        popupAnchor: [32,-2]
    }
}),
blackIcon = new poiIcon({iconUrl:'icons/poi_black.png'}),
redIcon   = new poiIcon({iconUrl:'icons/poi_red.png'}),
treeIcon  = new poiIcon({iconUrl:'icons/tree_green.png',shadowUrl:'icons/tree_shadow.png'}),
$vertices_x = [],
$vertices_y = [],
$points_polygon;
// featureGroup = L.featureGroup().addTo(mapLeaflet),
// drawControl = new L.Control.Draw({
//     draw: {
//       rectangle: false,
//       circle: false,
//       marker: false,
//     },
//     position: 'bottomright',
//     edit: {
//       featureGroup: featureGroup
//     }
// }).addTo(mapLeaflet);

// Disable drag and zoom handlers.
mapLeaflet.dragging.disable();
mapLeaflet.touchZoom.disable();
mapLeaflet.doubleClickZoom.disable();
mapLeaflet.scrollWheelZoom.disable();
mapLeaflet.keyboard.disable();

// Disable tap handler, if present.
if (mapLeaflet.tap) mapLeaflet.tap.disable();

// if(!mapStatus) {
//   mapLeaflet.remove();
//   var node  = document.getElementById("map-leaflet");
//   node.parentNode.removeChild(node);
// }

// new L.Control.Zoom({ position: 'bottomright' }).addTo(mapLeaflet);
mapLeaflet.on('draw:created', function(e) {
    var type = e.layerType;
    polygon = e.layer;
    mapLeaflet.addLayer(polygon);
});

function MarkerInPolygon(marker, polyPoints) {
    var polyPoints;
    var x = marker.lat, y = marker.lng;
    var inside = false;
    for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
        var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
        var xj = polyPoints[j].lat, yj = polyPoints[j].lng;
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

$(".icos a").click(function(e){
    e.preventDefault();
    $(".info-box").toggleClass("expanded");
});

function markerClick(e) {
    console.log(this.getLatLng());
}

function insertPoint(position,options) {
    $(".info-box .info-title, .info-box .contain, .dropup .dropdown-toggle").addClass("hidden");
    $(".dropup #cancelMark, .info-box .info-title.add").removeClass("hidden");
    $("#addMarker").removeClass("hidden");
    var point = L.marker(position,options).on("click", markerClick).addTo(mapLeaflet);
    markers.addLayer(point);
    prevMarker = point;
    var geocoder = L.mapbox.geocoder('mapbox.places');
    function showonMap(err, data) {
        $(".pad1 input").val(data.features[0].place_name);
    }
    var lat = position.lat.toString();
    var lng = position.lng.toString();
    geocoder.reverseQuery({
      lat: lat, lng: lng
    }, showonMap);
    if(typeof prevMarker !== "undefined") {
      prevMarker.on('dragend', function(e){
        if(polygon.hasOwnProperty('_latlngs')) {
          if(MarkerInPolygon(e.target._latlng, polygon.getLatLngs())){
            latlngx = e.target._latlng;
          }else {
            alert("You are only allowed to drag and drop the marker inside the polygon.");
            prevMarker.setLatLng(new L.LatLng(latlngx.lat, latlngx.lng));
          }
        }
      });
    }
  }

$("#saved").on("click", function(e){
    e.preventDefault();
    prevMarker.dragging.disable();
    alert("Marker point saved. You can now add more markers.");
    $(".drag").draggable({ disabled: false });
    $(".drag").draggable("enable");
    $("#addMarker, .info-title.add").addClass("hidden");
    $("#default, .info-title.info").removeClass("hidden");
    mapLeaflet.addLayer(markers);
})

$(".drag").draggable({
		helper: 'clone',
		containment: 'mapLeaflet',
		start: function(evt, ui) {
			$('#box').fadeTo('fast', 0.6, function() {});
		},
		stop: function(evt, ui) {
			$('#box').fadeTo('fast', 1.0, function() {});
			var options = {
				type: ui.helper.attr('type'),
				icon: eval(ui.helper.attr('type') + 'Icon'),
				draggable: true
			};
      // if(mapStatus) {
        if(polygon.hasOwnProperty('_latlngs')) {
          if(MarkerInPolygon(mapLeaflet.containerPointToLatLng([ui.offset.left, ui.offset.top]), polygon.getLatLngs())){
            console.log("yes, inside the polygon Area.");
            insertPoint(
  						mapLeaflet.containerPointToLatLng([ui.offset.left, ui.offset.top]),
  						options
  					);
            latlngx = mapLeaflet.containerPointToLatLng([ui.offset.left, ui.offset.top]);
            $(".drag").draggable({ disabled: true });
            $(".drag").draggable("disable");
          }else {
            alert("Not allowed to drop the marker outside the polygon area, Try again.");
          }
        }else {
          insertPoint(
            mapLeaflet.containerPointToLatLng([ui.offset.left, ui.offset.top]),
            options
          );
          $(".drag").draggable({ disabled: true });
          $(".drag").draggable("disable");
        }
      // }else {
      //   alert("no map loaded");
      //
      // }
		}
});
