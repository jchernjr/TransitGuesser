let routesData = {};
const NUM_OPTIONS = 6

// Initialize Map
const map = L.map('map').setView([37.7749, -122.4194], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
let currentLayer = null;

// Load Routes Data
fetch('ACTransit/shapes.json')
  .then(response => response.json())
  .then(data => {
    routesData = data;
    startGame();
  });

// Start Game
function startGame() {
  const [routeOptions, routeAnswer] = getRandomOptionsAndGoalAnswer(routesData, NUM_OPTIONS);
  console.log(`Options for today: ${routeOptions}`);
  console.log(`Answer for today: ${routeAnswer}`);

  displayRoute(routesData[routeAnswer]);
  displayOptions(routeOptions);
}

// Get Random Routes
function getRandomOptionsAndGoalAnswer(data, numOptions) {
  const seed = getSeedFromDate();
  var rng = new Math.seedrandom(seed); // Seed the random generator
  const shuffled = [...Object.keys(data)].sort(() => rng.int32()); // Shuffle deterministically
  options = shuffled.slice(0, numOptions); // Select the first N options

  goalIndex = Math.floor(rng() * numOptions)
  goalAnswer = options[goalIndex]
  return [options, goalAnswer]
}

function getSeedFromDate() {
  const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
  return today.split('-').join(''); // Convert to a number-like string, e.g., 20250103
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
