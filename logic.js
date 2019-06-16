// Retrieving all earthquakes from the past day
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Define colors for circles
function magColor(mag) {
  return mag >= 8 ? "#FF4500":
          mag > 7 ?  "#FF6347":
          mag > 6 ?  "#FF7F50":
          mag > 5 ?  "#FFA07A":
          mag > 4 ?  "#FFB6C1":
          mag <= 3 ? "#FFBAB9":
                     '#FED976';
}

function createFeatures(earthquakeData) {
  //console.log(earthquakeData);
  // The functiona runs once for each feature in the features array
  // The popup describes the place and time of the earthquake

  function functiona(feature, layer) {
    //console.log(feature.geometry.coordinates, feature.properties.time, feature.properties.mag);
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "<p> Magnitude: " + feature.properties.mag + "</p>");
    //console.log(marker.feature.geometry.coordinates);
  }
  
  function circleSize(mag) {
    return mag * 1.5;
}

function magcircleMarker(feature, latlng) {
    let options = {
        radius: circleSize(feature.properties.mag),
        fillColor: magColor(feature.properties.mag),
        color: "#000000",
        weight: 1,
        opacity: 0.5,
        fillOpacity: 0.75
    }
    return L.circleMarker(latlng, options);
  }
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var geojson_result = L.geoJSON(earthquakeData, {
    onEachFeature: functiona,
    pointToLayer: magcircleMarker
  });

  // Sending our earthquakes layer to the createMap function
  createMap(geojson_result);
}

function createMap(geojson_result) {

  // Define satellite, greyscale and outdoor layers
  var streetSat = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets-satellite",
    accessToken: API_KEY
  });

  var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var greyscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": streetSat,
    "Outdoors": outdoors,
    "Greyscale": greyscale
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: geojson_result
  };

  // Create the map, opening with the street satellite and earthquakes layers
  var myMap = L.map("map", {
    center: [
      20, -95.71
    ],
    zoom: 3,
    layers: [streetSat, geojson_result]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


    // Legend
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend'),
        magscale = [3, 4, 5, 6, 7];
           
        div.innerHTML += '<b>Magnitudes</b><br><hr>'   

        for (var i = 0; i < magscale.length; i++) {
            div.innerHTML +=
                '<i style="background:' + magColor(magscale[i] + 1) + '"></i> ' +
                + magscale[i] + (magscale[i + 1] ? "&ndash;" + magscale[i + 1] + '<br>' : ' + ');
        }

        return div;
    };

    legend.addTo(myMap);
  }
