// Importing Requires Modules
const express = require('express');
const sessions = require('express-session');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const {
  saveGame,
  findIfExists,
  addUser,
  getData,
  validateUser,
  deleteGame,
} = require('./fileHandler');

// Initialising Modules
const app = express();
app.set('view engine', 'ejs');
app.use(
  sessions({
    secret: 'mysecretkey',
    saveUninitialized: true,
    resave: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(flash());

var session;
var PORT = 3000;

// Home Route renders Dashboard if already logged in or redirects to login page
app.get('/', (req, res) => {
  session = req.session;
  if (session.userid) {
    res.render('index.ejs');
  } else {
    res.redirect('/login');
  }
});

// Login User Page
app.get('/login', (req, res) => {
  session = req.session;
  if (session.userid) {
    res.redirect('/');
  } else {
    res.render('login.ejs');
  }
});

// Login Post method for validating user and logging in
app.post('/login', (req, res) => {
  if (validateUser(req.body.username, req.body.password)) {
    session = req.session;
    session.userid = req.body.username;
    res.redirect('/');
  } else {
    req.flash('error', '*incorrect username or password');
    res.render('login.ejs');
  }
});

// Register User Page
app.get('/register', (req, res) => {
  session = req.session;
  if (session.userid) {
    res.redirect('/');
  } else {
    res.render('register.ejs');
  }
});

// Register method for registering user if not present already
app.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const array = getData();
  if (findIfExists(username, array)) {
    req.flash('error', '*username already exists');
    res.render('register.ejs');
  } else {
    addUser(username, password, array);
    res.redirect('/login');
  }
});

// Saves Game data for getting historical data
app.post('/savegame', (req, res) => {
  const details = req.body;
  const uname = req.session.userid;
  const array = getData();
  saveGame(array, uname, details);
  res.send('Game Saved');
});

// History page for showing Game History
app.get('/history', (req, res) => {
  session = req.session;
  if (session.userid) {
    res.render('history.ejs');
  } else {
    res.redirect('/login');
  }
});

app.post('/history-data', (req, res) => {
  const array = getData();
  let user = array.find((x) => x.username === session.userid);
  res.json(user);
});

app.post('/delete', (req, res) => {
  let games = req.body;
  let uname = req.session.userid;
  let array = getData();
  deleteGame(array, uname, games);
  res.send('Deleted');
});

// Log Out current session
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`Listening on Port: ${PORT}`);
});
