//API endpoint
//var geoUrl="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson";
//var geoUrl="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";
var geoUrl="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

function markerSize(mag) {
  return mag * 4;
}
function getColor(i) {
  return i > 5 ? '#F30' :
  i > 4  ? '#F60' :
  i > 3  ? '#F90' :
  i > 2  ? '#FC0' :
  i > 1   ? '#FF0' :
            '#9F3';
}
//earthquake
d3.json(geoUrl,function(data){
  console.log(data);
    console.log(data.features[0].properties.mag);
    createFeatures(data.features);
});
//tectonicplates

var tectonicplates =new L.LayerGroup();
d3.json(tectonicPlatesURL,function(tdata){
  //tectonic lines
  L.geoJson(tdata,{
    color: "yellow",
    weight:2
  })
.addTo(tectonicplates)

});




function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
      
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>" + feature.properties.mag+ "</p>");
    }
   
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: function(feature, latlng) {
        return new L.CircleMarker(latlng, {
            radius: markerSize(feature.properties.mag),
            fillColor: getColor(feature.properties.mag),
            stroke: true,
                color: "black",
                weight: 0.5,
                fillOpacity: 0.8,
        });
      }  
    });
  
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
  }
  
  function createMap(earthquakes) {
  
    // Define satellitemap and outdoorsmap layers
    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.opensatellitemap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: API_KEY
    });
  
    var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.opensatellitemap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.outdoors",
      accessToken: API_KEY
    });
    
    var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.opensatellitemap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
      });
    var darksnightscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.opensatellitemap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
      });
     
    // Define a baseMaps object to hold our base layers
    
    var baseMaps = {
      "Satellite": satellitemap,
      "Outdoors": outdoorsmap,
      "Light":grayscalemap,      
      "Dark":darksnightscalemap
    };
   
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes,
      "Tectonic Plates": tectonicplates
    };
  
    // Create our map, giving it the satellitemap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [satellitemap, earthquakes,tectonicplates]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    //legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
    };

    legend.addTo(myMap);




  }
  