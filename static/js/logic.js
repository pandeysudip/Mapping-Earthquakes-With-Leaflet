// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

    function getColor(d) {
        return d > 500 ? '#7a0177' :
            d > 100 ? '#BD0026' :
                d > 50 ? '#E31A1C' :
                    d > 20 ? '#FC4E2A' :
                        d > 10 ? '#FD8D3C' :
                            d > 5 ? '#FEB24C' :
                                '#FFEDA0';
    }

    function chooseSize(mag) {
        if (mag > 8) return 25;
        else if (mag > 6) return 18;
        else if (mag > 5) return 15;
        else if (mag > 4) return 8;
        else if (mag > 3) return 5;
        else if (mag > 2) return 4;
        else return 2;
    }
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        style: function (feature) {
            return {
                color: getColor(feature.geometry.coordinates[2]),
                radius: chooseSize(feature.properties.mag)
            };
        },
        onEachFeature: onEachFeature,
    });
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Create the tile layer that will be the background of our map.
    var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    // water color 
    var watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        minZoom: 1,
        maxZoom: 16,
        ext: 'jpg'
    });

    // dark map 
    var dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    });

    // google street 
    googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    //google satellite
    googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    // Create a baseMaps object to hold the streetmap layer.
    var baseMaps = {
        "Street Map": streetmap,
        "Water Color": watercolor,
        "Dark": dark,
        "Google Street": googleStreets,
        "Google Sat": googleSat
    };

    // Create an overlay object to hold our overlay.
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 2,
        layers: [googleSat, earthquakes]
    });

    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var legend = L.control({ position: 'bottomright' });

    // Then add all the details for the legend
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");

        var grades = ["-10 - 5", "5 - 10", "10 - 20", "20 - 50", "50-100", "100 - 500", "500+"];
        var colors = [
            '#FFEDA0',
            '#FEB24C',
            '#FD8D3C',
            '#FC4E2A',
            '#E31A1C',
            '#BD0026',
            '#7a0177'
        ];
        var legendInfo = "<h2>Earthquake</h2>" +
            "<div class=\"labels\">" + "</div>";
        var allLabels = [];
        for (var i = 0; i < grades.length; i++) {
            allLabels.push('<li style\="background:' + colors[i] + '"\">' + grades[i] + '</li>');
        }
        div.innerHTML = legendInfo;
        div.innerHTML += "<ul>" + allLabels.join("") + "</ul>";
        return div;

    };

    // Finally, we our legend to the map.
    legend.addTo(myMap);
};