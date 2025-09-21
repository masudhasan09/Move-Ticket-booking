// Auth Elements
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const userInfo = document.getElementById('user-info');
const authContainer = document.getElementById('auth-container');
const usernameDisplay = document.getElementById('username-display');
const mainContent = document.getElementById('main-content');
const closeButtons = document.querySelectorAll('.close-btn');

// Movie Booking Elements
const container = document.querySelector('.container');
const count = document.getElementById('count');
const total = document.getElementById('total');
const movieGallery = document.querySelector('.movie-gallery');
const bookButton = document.getElementById('confirm-btn');
let seats = document.querySelectorAll('.row .seat:not(.occupied)');

let ticketPrice = 10; // Default price

// --- AUTHENTICATION LOGIC ---

// Event Listeners for Auth
registerBtn.addEventListener('click', () => registerModal.classList.remove('hidden'));
loginBtn.addEventListener('click', () => loginModal.classList.remove('hidden'));
logoutBtn.addEventListener('click', logout);
closeButtons.forEach(btn => btn.addEventListener('click', () => {
  loginModal.classList.add('hidden');
  registerModal.classList.add('hidden');
}));
registerForm.addEventListener('submit', registerUser);
loginForm.addEventListener('submit', loginUser);

function registerUser(e) {
  e.preventDefault();
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  const users = JSON.parse(localStorage.getItem('users')) || [];

  if (users.find(user => user.username === username)) {
    alert('Username already exists!');
    return;
  }

  users.push({ username, password });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Registration successful! Please log in.');
  registerModal.classList.add('hidden');
  registerForm.reset();
}

function loginUser(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    localStorage.setItem('loggedInUser', username);
    updateUIForAuth();
    loginModal.classList.add('hidden');
    loginForm.reset();
  } else {
    alert('Invalid username or password.');
  }
}

function logout() {
  const user = localStorage.getItem('loggedInUser');
  localStorage.removeItem('loggedInUser');
  // Clear user-specific data
  localStorage.removeItem(`selectedSeats_${user}`);
  localStorage.removeItem(`selectedMovieIndex_${user}`);
  localStorage.removeItem(`selectedMoviePrice_${user}`);
  updateUIForAuth();//
}

function updateUIForAuth() {
  const loggedInUser = localStorage.getItem('loggedInUser');
  if (loggedInUser) {
    authContainer.classList.add('hidden');
    mainContent.classList.remove('hidden');
    usernameDisplay.textContent = loggedInUser;
    document.body.style.justifyContent = 'flex-start';
    populateUI();
  } else {
    authContainer.classList.remove('hidden');
    mainContent.classList.add('hidden');
    document.body.style.justifyContent = 'center';
  }
}

// --- MOVIE BOOKING LOGIC ---

// Save selected movie index and price (now user-specific)
function setMovieData(movieIndex, moviePrice) {
  const user = localStorage.getItem('loggedInUser');
  if (!user) return;
  localStorage.setItem(`selectedMovieIndex_${user}`, movieIndex);
  localStorage.setItem(`selectedMoviePrice_${user}`, moviePrice);
}

// Update total and count
function updateSelectedCount() {
  const selectedSeats = document.querySelectorAll('.row .seat.selected');
  const seatsIndex = [...selectedSeats].map(seat => [...seats].indexOf(seat));
  const user = localStorage.getItem('loggedInUser');
  if (!user) return;

  localStorage.setItem(`selectedSeats_${user}`, JSON.stringify(seatsIndex));

  const selectedSeatsCount = selectedSeats.length;
  count.innerText = selectedSeatsCount;
  total.innerText = selectedSeatsCount * ticketPrice;
  
  const movies = Array.from(movieGallery.children);
  const selectedMovie = movieGallery.querySelector('.movie.selected');
  const movieIndex = movies.indexOf(selectedMovie);
  setMovieData(movieIndex, ticketPrice);
}

// Get data from localstorage and populate UI (now user-specific)
function populateUI() {
  const user = localStorage.getItem('loggedInUser');
  if (!user) return;

  document.querySelectorAll('.row .seat.selected').forEach(s => s.classList.remove('selected'));

  const selectedSeats = JSON.parse(localStorage.getItem(`selectedSeats_${user}`));
  if (selectedSeats !== null && selectedSeats.length > 0) {
    seats.forEach((seat, index) => {
      if (selectedSeats.indexOf(index) > -1) {
        seat.classList.add('selected');
      }
    });
  }

  const selectedMovieIndex = localStorage.getItem(`selectedMovieIndex_${user}`);
  const movies = movieGallery.querySelectorAll('.movie');
  if (selectedMovieIndex !== null && movies[selectedMovieIndex]) {
    movies.forEach(m => m.classList.remove('selected'));
    movies[selectedMovieIndex].classList.add('selected');
    ticketPrice = +localStorage.getItem(`selectedMoviePrice_${user}`) || +movies[selectedMovieIndex].dataset.price;
  } else {
    // Default to first movie if nothing is stored
    movies[0].classList.add('selected');
    ticketPrice = +movies[0].dataset.price;
  }
  updateSelectedCount();
}

// Movie select event
movieGallery.addEventListener('click', e => {
  const movieEl = e.target.closest('.movie');
  if (movieEl) {
    movieGallery.querySelectorAll('.movie').forEach(m => m.classList.remove('selected'));
    movieEl.classList.add('selected');
    ticketPrice = +movieEl.dataset.price;
    updateSelectedCount();
  }
});

// Seat click event
container.addEventListener('click', e => {
  if (
    e.target.classList.contains('seat') &&
    !e.target.classList.contains('occupied')
  ) {
    e.target.classList.toggle('selected');
    updateSelectedCount();
  }
});

// Book button click event
bookButton.addEventListener('click', e => {
  const selectedSeats = document.querySelectorAll('.row .seat.selected');
  const user = localStorage.getItem('loggedInUser');

  if (selectedSeats.length > 0) {
    alert('Booking confirmed! Thank you.');

    selectedSeats.forEach(seat => {
      seat.classList.remove('selected');
      seat.classList.add('occupied');
    });

    seats = document.querySelectorAll('.row .seat:not(.occupied)');
    localStorage.removeItem(`selectedSeats_${user}`);
    updateSelectedCount();
  } else {
    alert('Please select seats before booking.');//
  }
});

// --- INITIALIZATION ---
// Check auth status on page load
updateUIForAuth();