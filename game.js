// First define a Viewer mode and Game mode to choose from
class RouteMapGame {
  constructor(leafletMap) {
    this.map = leafletMap;
  }

  setRouteData(routeDataDict) {
    /* Format of {"route_name": {"lats": [...], "lons": [...]}} */
    this.routeData = routesData; // Dict of route objects

    // TODO: center the map on the routes

    // Keep track of which routes are selected (maps to 'layer' plotted on mapbox)
    this.selectedRouteKeys = {}
  }

  getRouteOptions() {
    throw new Error("getRouteOptions must be implemented by subclass");
  }

  onRouteOptionClicked(routeKey) {
    throw new Error("onRouteOptionClicked must be implemented by subclass");
  }

  plotRoutes() {
    throw new Error("plotRoutes must be implemented by subclass");
  }
}


class GameMode extends RouteMapGame {
  constructor(leafletMap) {
    super(leafletMap);
  }

  getRouteOptionsAndAnswer() {
    // Return 6 random routes and the answer
    const NUM_OPTIONS = 6;
    return this.getRandomChoicesAndGoalAnswer(self.routesData, NUM_OPTIONS)
  }

  getRandomChoicesAndGoalAnswer(data, numOptions) {
    const seed = this.getSeedFromDate();
    var rng = new Math.seedrandom(seed); // Seed the random generator
    const shuffled = [...Object.keys(data)].sort(() => rng.int32()); // Shuffle deterministically
    options = shuffled.slice(0, numOptions); // Select the first N options

    goalIndex = Math.floor(rng() * numOptions)
    goalAnswer = options[goalIndex]
    return [options, goalAnswer]
  }

  getSeedFromDate() {
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
    return today.split('-').join(''); // Convert to a number-like string, e.g., 20250103
  }

  onRouteOptionClicked(routeKey) {
    // Allow selecting one new route at a time
    console.log(`Selected route: ${route.name}`);

    // TODO: keep track of existing selections

    // Plot the selected route
    // TODO: if wrong, plot red, if right plot blue and go to end game
    // TODO: (out of guesses also go to end game)
    this.plotRoutes([route]);
  }

  plotRoutes(routes) {
    // TODO:
  }
}


class ViewerMode extends RouteMapGame {
  constructor(leafletMap) {
    super(leafletMap);

    // Viewer mode has street map tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {attribution: '© OpenStreetMap contributors'}).addTo(leafletMap);
  }

  getRouteOptions() {
    // Return all route names, with null answer
    console.log(this.routeData)
    return [Object.keys(this.routeData), null];
  }

  onRouteOptionClicked(routeKey) {
    // Allow selecting (or deselecting) one additional route at a time.
    console.log(`Clicked route: ${routeKey}`);

    if (routeKey in this.selectedRouteKeys) {
      // Already selected: deselect and remove from map
      var layer = this.selectedRouteKeys[routeKey]
      delete this.selectedRouteKeys[routeKey]
      this.map.removeLayer(layer);
    } else {
      // Not yet selected: add
      var routeShapeDict = this.routeData[routeKey];
      var shape = coordsToGeoJsonDict(routeShapeDict.lats, routeShapeDict.lons);
      var layer = L.geoJSON(shape).addTo(map);
      this.selectedRouteKeys[routeKey] = layer;
    }
  }

  plotRoutes(routes) {
    // Use Leaflet to plot the selected routes
    routes.forEach((route) => {
      const latLngs = route.coordinates.map(([lon, lat]) => [lat, lon]);
      L.polyline(latLngs, { color: "blue", weight: 2 }).addTo(this.map);
    });
  }
}


// Initialize Map
const map = L.map('map').setView([37.7615,-122.2324], 11);
let currentLayer = null;

// Choose game mode
mode = new ViewerMode(map)

// Load Routes Data
let routesData = {};
fetch('ACTransit/shapes.json')
  .then(response => response.json())
  .then(data => {
    routesData = data;
    mode.setRouteData(data);
    startGame();
  });

// Start Game
function startGame() {
  const [routeOptions, routeAnswer] = mode.getRouteOptions();
  console.log(`Options for today: ${routeOptions}`);
  console.log(`Answer for today: ${routeAnswer}`);

  // displayRoute(routesData[routeAnswer]);
  displayOptions(routeOptions);
}

// Display Route on Map
function coordsToGeoJsonDict(lats, lons) {
  // Combine latitude and longitude into coordinates
  const coordinates = zip(lons, lats);  // GeoJSON uses lon/lat not lat/lon

  // Create a GeoJSON LineString
  return geojsonLineString = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: coordinates,
        },
        properties: {} // Add any properties you want here
      }
    ]
  };
}

function zip(arr1, arr2) {
  return arr1.map((item, index) => [item, arr2[index]]);
}

// Display Options
function displayOptions(routeOptions) {
  // routeOptions should be list of available route keys for choosing
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';

  routeOptions.forEach(routeKey => {
    const button = document.createElement('button');
    button.innerText = routeKey;
    button.onclick = () => mode.onRouteOptionClicked(routeKey);
    optionsDiv.appendChild(button);
  });
}


// Check Answer
function checkAnswer(selected, correct) {
  const feedback = document.getElementById('feedback');
  if (selected === correct.toString()) {
    feedback.textContent = 'Correct!';
  } else {
    feedback.textContent = 'Wrong, try again!';
  }
}
