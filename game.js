let routesData = [];

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
  const [routeOptions, routeAnswer] = getRandomOptionsAndGoalAnswer();
  console.log(`Options for today: ${routeOptions}`);
  displayRoute(randomRoute.shape);
  displayOptions(randomRoute.route_number);
}

// Get Random Routes
function getRandomOptionsAndGoalAnswer(data, numOptions) {
  const seed = getSeedFromDate();
  var rng = Math.seedrandom(seed); // Seed the random generator
  const shuffled = [...data].sort(() => rng.int32()); // Shuffle deterministically
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
function displayRoute(shape) {
  if (currentLayer) {
    map.removeLayer(currentLayer);
  }
  currentLayer = L.geoJSON(shape).addTo(map);
}

// Display Options
function displayOptions(correctAnswer) {
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';

  const shuffledOptions = shuffleOptions([correctAnswer, ...generateFakeOptions(correctAnswer)]);

  shuffledOptions.forEach(option => {
    const button = document.createElement('button');
    button.innerText = option;
    button.onclick = () => checkAnswer(option, correctAnswer);
    optionsDiv.appendChild(button);
  });
}

// Generate Fake Options
function generateFakeOptions(correctAnswer) {
  const fakeOptions = [];
  while (fakeOptions.length < 3) {
    const fake = Math.floor(Math.random() * 50) + 1; // Random route numbers 1-50
    if (fake !== correctAnswer && !fakeOptions.includes(fake)) {
      fakeOptions.push(fake.toString());
    }
  }
  return fakeOptions;
}

// Shuffle Options
function shuffleOptions(options) {
  return options.sort(() => Math.random() - 0.5);
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
