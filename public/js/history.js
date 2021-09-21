// Getting required elements from document
const tbody = document.getElementById('tableBody');
const historyContainer = document.getElementById('historyContainer');
const closeReplayButton = document.getElementById('closeReplay');
const dateTime = document.getElementById('dateTime');
const timeTaken = document.getElementById('timeTaken');
const mode = document.getElementById('mode');
const result = document.getElementById('result');
const cells = document.getElementsByClassName('cell');
const checkAll = document.getElementById('check-head');
const checkBox = document.getElementsByClassName('delete-check');
const deleteButton = document.getElementById('deleteButton');
const deleteDialog = document.getElementById('deleteDialog');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

// Initialising variables and constants
let intervalId;
let origBoard;
const winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
let games;
let selectedRows = [];

var requestOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};
fetch('/history-data', requestOptions)
  .then((response) => response.json())
  .then((data) => (games = data.games))
  .then(() => initializeHistory())
  .catch((error) => console.log('error', error));

// Renders All Previous Games in Table
function initializeHistory() {
  tbody.innerHTML = '';
  games.forEach((game, index) => {
    const tr = document.createElement('tr');
    let text = `<td class="col-delete"><input type="checkbox" id="check-${index}" class="delete-check" onchange="deleteRow(this)"></td>
  <td class="col-replay" id="td-${index}" onclick="handleClick(this)">▶</td>
        <td class="col-date">${game.date}</td>
        <td class="col-mode">${
          game.mode === 1
            ? 'Easy'
            : game.mode === 2
            ? 'Medium'
            : game.mode === 3
            ? 'Hard'
            : 'Manual'
        }</td>
        <td class="col-time">${game.time}s</td>
        <td class="result-data${game.result} col-result">${
      game.result === 1 ? 'Won' : game.result === -1 ? 'Lost' : 'Tie'
    }</td>`;
    tr.innerHTML = text;
    tr.id = `tr-${index}`;
    tbody.appendChild(tr);
  });
}

// Replays Selected Game on click in 1 second Interval
function handleClick(e) {
  historyContainer.style.visibility = 'hidden';
  for (let j = 0; j < cells.length; j++) {
    cells[j].innerText = '';
    cells[j].style.removeProperty('background-color');
  }
  origBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  let gameId = parseInt(e.id.split('-')[1]);
  let currGame = games[gameId];
  result.innerHTML = `<b>Result:</b> ${
    currGame.result === 1 ? 'Won' : currGame.result === -1 ? 'Lost' : 'Tie'
  }`;
  mode.innerHTML = `<b>Mode:</b> ${
    currGame.mode === 1
      ? 'Easy'
      : currGame.mode === 2
      ? 'Medium'
      : currGame.mode === 3
      ? 'Hard'
      : 'Manual'
  }`;
  dateTime.innerHTML = `<b>Date & Time:</b> ${currGame.date}`;
  timeTaken.innerHTML = `<b>Time Taken:</b> ${currGame.time}s`;
  let moves = currGame.moves;
  intervalId = setInterval(replayMoves, 1000);
  let i = 0;
  let player = 'X';
  function replayMoves() {
    if (i === moves.length) {
      clearInterval(intervalId);
      historyContainer.style.visibility = 'visible';
    } else {
      origBoard[moves[i]] = player;
      cells[moves[i]].innerText = player;
      let gameWon = onCheckWin(origBoard, player);
      if (gameWon) {
        onGameOver(gameWon);
      }
      if (player === 'X') {
        player = 'O';
      } else if (player === 'O') {
        player = 'X';
      }
      i++;
    }
  }
}

// Checks for Win in every move
function onCheckWin(board, player) {
  let gameWon = false;
  for (let [index, win] of winCombos.entries()) {
    if (
      board[win[0]] === player &&
      board[win[1]] === player &&
      board[win[2]] === player
    ) {
      gameWon = {
        index: index,
        player: player,
      };
      break;
    }
  }
  return gameWon;
}

// Game Over Game Won
function onGameOver({ index, player }) {
  for (let i of winCombos[index]) {
    const color =
      player === 'X' ? 'rgba(40, 167, 69, 0.8)' : 'rgba(255, 7, 58, 0.8)';
    document.getElementById(i).style.backgroundColor = color;
  }
}

// Stops Replay and Opens Game History
closeReplayButton.addEventListener('click', () => {
  clearInterval(intervalId);
  historyContainer.style.visibility = 'visible';
});

checkAll.addEventListener('change', () => {
  if (checkAll.checked === true) {
    for (let i = 0; i < checkBox.length; i++) {
      checkBox[i].checked = true;
      if (!selectedRows.includes(i)) {
        selectedRows.push(i);
      }
    }
  } else {
    for (let i = 0; i < checkBox.length; i++) {
      checkBox[i].checked = false;
    }
    selectedRows = [];
  }
  if (selectedRows.length === 0) {
    deleteButton.disabled = true;
  } else {
    deleteButton.disabled = false;
  }
});

function deleteRow(e) {
  let rowId = parseInt(e.id.split('-')[1]);
  if (e.checked === true) {
    if (!selectedRows.includes(rowId)) {
      selectedRows.push(rowId);
    }
  } else {
    let idx = selectedRows.indexOf(rowId);
    if (idx > -1) {
      selectedRows.splice(idx, 1);
    }
  }
  if (selectedRows.length === 0) {
    deleteButton.disabled = true;
  } else {
    deleteButton.disabled = false;
  }
}

deleteButton.addEventListener('click', () => {
  deleteDialog.show();
});

confirmYes.addEventListener('click', () => {
  selectedRows.sort(function (a, b) {
    return b - a;
  });
  selectedRows.forEach((element) => {
    games.splice(element, 1);
  });
  selectedRows = [];
  checkAll.checked = false;
  deleteButton.disabled = true;
  deleteDialog.close();
  deleteInServer();
  initializeHistory();
});

confirmNo.addEventListener('click', () => {
  deleteDialog.close();
});

function deleteInServer() {
  var requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(games),
  };
  fetch('/delete', requestOptions).catch((error) =>
    console.log('error', error)
  );
}
