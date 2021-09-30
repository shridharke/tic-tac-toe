// Requiring fs module for file handling
const fs = require('fs');

/**
 * @desc validating login details by checking in data.json
 * @param {String} user Username provided
 * @param {String} pass Password provided
 * @returns {Boolean} Checks if Username and Password entered are correct
 */
function validateUser(user, pass) {
  const array = getData();
  if (array.find((x) => x.username === user && x.password === pass)) {
    return true;
  } else {
    return false;
  }
}

/**
 * @desc Adds new user to the data file
 * @param {String} username Username to Add
 * @param {String} password Password provided
 * @param {Array} array Array of all users objects
 */
function addUser(username, password, array) {
  array.push({ username: username, password: password, games: [] });
  fs.writeFile('./data.json', JSON.stringify(array, null, 2), (err) => {
    if (err) {
      console.log(err);
    }
  });
}

/**
 * @desc Gets the array of all user objects
 * @returns {Array} Array of all User Objects
 */
function getData() {
  let val;
  try {
    const test = fs.readFileSync('./data.json');
    val = JSON.parse(test);
  } catch (err) {
    console.log(err);
  }
  return val;
}

/**
 * @desc Checks if Username already exists
 * @param {String} user Username Provided
 * @param {Array} array Array of User Objects
 * @returns {Object} User Object if already exists
 */
function findIfExists(user, array) {
  return array.find((x) => x.username === user);
}

/**
 *
 * @param {Array} array Array of User Objects
 * @param {String} username Username of User
 * @param {Object} details Game Details Object to be added to the History
 */
function saveGame(array, username, details) {
  array.find((o, i) => {
    if (o.username === username) {
      array[i].games.unshift(details);
      return true;
    }
  });
  fs.writeFile('./data.json', JSON.stringify(array, null, 2), (err) => {
    if (err) {
      console.log(err);
    }
  });
}

function deleteGame(array, username, games) {
  array.find((o, i) => {
    if (o.username === username) {
      array[i].games = games;
      return true;
    }
  });
  fs.writeFileSync('./data.json', JSON.stringify(array, null, 2), (err) => {
    if (err) {
      console.log(err);
    }
  });
}

// Exporting Functions as a Module
module.exports = {
  saveGame,
  findIfExists,
  addUser,
  getData,
  validateUser,
  deleteGame,
};
