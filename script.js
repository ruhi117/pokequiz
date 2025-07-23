const pokemonImage = document.getElementById('pokemon-image');
const optionsContainer = document.getElementById('options-container');
const feedback = document.getElementById('feedback');
const resultCard = document.getElementById('result-card');
const scoreDisplay = document.getElementById('score');
const finalFeedback = document.getElementById('final-feedback');
const funFactBox = document.getElementById('funFactBox');

let score = 0;
let currentPokemon = {};
let totalQuestions = 5;
let currentQuestion = 0;

async function getRandomPokemonIds(count = 4) {
  const maxPokemonId = 151;
  const ids = new Set();
  while (ids.size < count) {
    ids.add(Math.floor(Math.random() * maxPokemonId) + 1);
  }
  return [...ids];
}

async function getPokemonById(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();
  return {
    name: data.name,
    image: data.sprites.other['official-artwork'].front_default
  };
}

async function getPokemonFunFact(name) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name.toLowerCase()}`);
    const data = await response.json();
    const flavorEntry = data.flavor_text_entries.find(entry => entry.language.name === "en");
    return flavorEntry ? flavorEntry.flavor_text.replace(/\f/g, ' ') : "No fun fact available.";
  } catch {
    return "Fun fact couldn't be loaded.";
  }
}

async function loadQuestion() {
  currentQuestion++;
  feedback.classList.add('hidden');
  optionsContainer.innerHTML = '';
  funFactBox.classList.add('hidden');
  funFactBox.textContent = '';

  const ids = await getRandomPokemonIds();
  const pokemons = await Promise.all(ids.map(id => getPokemonById(id)));
  currentPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];

  pokemonImage.classList.remove('reveal', 'pokemon-reveal-anim');
  pokemonImage.classList.add('silhouette');
  pokemonImage.style.transform = 'scale(1)';
  pokemonImage.src = currentPokemon.image;

  pokemons
    .sort(() => Math.random() - 0.5)
    .forEach(poke => {
      const btn = document.createElement('button');
      btn.textContent = poke.name.toUpperCase();
      btn.onclick = () => checkAnswer(poke.name);
      optionsContainer.appendChild(btn);
    });
}

async function checkAnswer(selectedName) {
  const isCorrect = selectedName === currentPokemon.name;

  feedback.textContent = isCorrect ? 'Correct!' : `Wrong! It was ${currentPokemon.name.toUpperCase()}`;
  feedback.classList.remove('hidden');
  feedback.classList.remove('correct', 'wrong');
  feedback.classList.add(isCorrect ? 'correct' : 'wrong');

  if (isCorrect) score++;

  // Reveal image
  pokemonImage.classList.remove('silhouette');
  pokemonImage.classList.add('reveal');
  pokemonImage.style.transform = 'scale(1.2)';

  // Disable buttons after answer
  document.querySelectorAll('#options-container button').forEach(btn => btn.disabled = true);

  // Show fun fact
  const fact = await getPokemonFunFact(currentPokemon.name);
  funFactBox.textContent = `Fun Fact: ${fact}`;
  funFactBox.classList.remove('hidden');

  setTimeout(() => {
    if (currentQuestion < totalQuestions) {
      loadQuestion();
    } else {
      showResult();
    }
  }, 4000); // more time to read the fun fact
}

function showResult() {
  document.querySelector('.card').classList.add('hidden');
  resultCard.classList.remove('hidden');
  scoreDisplay.textContent = `Your Score: ${score} / ${totalQuestions}`;
  finalFeedback.textContent = score === totalQuestions
    ? 'You’re a true Pokémon Master!'
    : 'Keep training, Trainer!';

  if (score > 1) {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function startGame() {

  document.getElementById('loader').style.display = 'flex';

setTimeout(() => {
  loadQuestion().then(() => {
    document.getElementById('loader').style.display = 'none';
  });
}, 1000);

  score = 0;
  currentQuestion = 0;
  resultCard.classList.add('hidden');
  document.querySelector('.card').classList.remove('hidden');
  loadQuestion();
}

window.onload = startGame;
