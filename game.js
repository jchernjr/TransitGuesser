// First define a Viewer mode and Game mode to choose from
class RouteMapGame {
  constructor(leafletMap) {
    this.map = leafletMap;
  }

  setRouteData(routeDataDict) {
    /* Format of {"route_name": {"lats": [...], "lons": [...]}} */
    this.routeData = routesData; // Dict of route objects

    // TODO: center the map on the routes
  }

  getRouteOptions() {
    throw new Error("getRouteOptions must be implemented by subclass");
  }

  selectRoute(route) {
    throw new Error("selectRoute must be implemented by subclass");
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

  selectRoute(route) {
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

  selectRoute(route) {
    // Allow selecting multiple routes
    console.log(`Selected route: ${route.name}`);

    // TODO: keep track of what was already selected
    // TODO: be able to de-select routes to remove from map

    // Plot the selected route on the map
    this.plotRoutes([route]);
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
const map = L.map('map').setView([37.7749, -122.4194], 13);
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
function displayRoute(routeShapeDict) {
  if (currentLayer) {
    map.removeLayer(currentLayer);
  }
  const shape = coordsToGeoJsonDict(routeShapeDict.lats, routeShapeDict.lons)
  console.log(shape);
  currentLayer = L.geoJSON(shape).addTo(map);
}

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
function displayOptions(correctAnswer) {
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';

  // shuffledOptions.forEach(option => {
  //   const button = document.createElement('button');
  //   button.innerText = option;
  //   button.onclick = () => checkAnswer(option, correctAnswer);
  //   optionsDiv.appendChild(button);
  // });
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
