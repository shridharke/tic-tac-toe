// Getting required elements from document
const startButton = document.getElementById('startGame');
const modeContainer = document.getElementById('modeContainer');
const closeButton = document.getElementById('closeButton');
const easySelect = document.getElementById('easySelect');
const mediumSelect = document.getElementById('mediumSelect');
const hardSelect = document.getElementById('hardSelect');
const manualSelect = document.getElementById('manualSelect');
const cells = document.getElementsByClassName('cell');
const resultContainer = document.getElementById('result');

// Initailising variables and constants
let scores;
let currentPlayer;
let level;
let startTime;
let movesmade;
let origBoard;
const HUMAN_PLAYER = 'X';
const AI_PLAYER = 'O';
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

// On click Listeners for all buttons
startButton.addEventListener('click', () => {
  modeContainer.style.visibility = 'visible';
});

closeButton.addEventListener('click', () => {
  modeContainer.style.visibility = 'hidden';
});

easySelect.addEventListener('click', () => {
  modeContainer.style.visibility = 'hidden';
  scores = [10, -10, 0];
  level = 1;
  currentPlayer = 'X';
  onStartGame();
});

mediumSelect.addEventListener('click', () => {
  modeContainer.style.visibility = 'hidden';
  level = 2;
  scores = [10, 10, 0];
  currentPlayer = 'X';
  onStartGame();
});

hardSelect.addEventListener('click', () => {
  modeContainer.style.visibility = 'hidden';
  scores = [-10, 10, 0];
  level = 3;
  currentPlayer = 'X';
  onStartGame();
});

manualSelect.addEventListener('click', () => {
  modeContainer.style.visibility = 'hidden';
  level = 4;
  currentPlayer = 'X';
  onStartGame();
});

// Start Game: Clears Board and sets event listeners for cells
function onStartGame() {
  origBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  movesmade = [];
  resultContainer.style.visibility = 'hidden';
  startTime = new Date();
  for (let i = 0; i < cells.length; i++) {
    cells[i].innerText = '';
    cells[i].style.removeProperty('background-color');
    cells[i].addEventListener('click', onTurnClick);
    cells[i].addEventListener('mouseover', onCellMouseOver);
    cells[i].addEventListener('mouseout', onCellMouseOut);
  }
}

// Previews move when hovering over the cell
function onCellMouseOver(e) {
  const { id: squareId } = e.target;
  cells[squareId].innerText = currentPlayer;
  cells[squareId].style.color = 'rgba(0,0,0,0.3)';
}

function onCellMouseOut(e) {
  const { id: squareId } = e.target;
  cells[squareId].innerText = '';
}

// Sets Player on Clicked Cell
function onTurnClick(e) {
  const { id: squareId } = e.target;
  onTurn(parseInt(squareId), currentPlayer);
  playerSwitch();
  if (level !== 4) {
    let currentSpot = getCurrentSpot();
    if (currentSpot || currentSpot === 0) {
      onTurn(currentSpot, currentPlayer);
      playerSwitch();
    }
  }
}

// Switches Player for every turn
function playerSwitch() {
  if (currentPlayer === 'X') {
    currentPlayer = 'O';
  } else if (currentPlayer === 'O') {
    currentPlayer = 'X';
  }
}

// Sets player and remove event listeners for clicked cell
function onTurn(squareId, player) {
  cells[squareId].style.color = 'black';
  cells[squareId].removeEventListener('click', onTurnClick);
  cells[squareId].removeEventListener('mouseout', onCellMouseOut);
  cells[squareId].removeEventListener('mouseover', onCellMouseOver);
  origBoard[squareId] = player;
  movesmade.push(squareId);
  document.getElementById(squareId).innerText = player;
  onCheckGameTie(player);
}

// Checks if Player has Won
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

// Game Over if player won
function onGameOver({ index, player }) {
  for (let i of winCombos[index]) {
    const color =
      player === HUMAN_PLAYER
        ? 'rgba(40, 167, 69, 0.8)'
        : 'rgba(255, 7, 58, 0.8)';
    document.getElementById(i).style.backgroundColor = color;
  }
  for (let i = 0; i < cells.length; i++) {
    cells[i].removeEventListener('click', onTurnClick);
    cells[i].removeEventListener('mouseout', onCellMouseOut);
    cells[i].removeEventListener('mouseover', onCellMouseOver);
  }

  const resObj =
    player === HUMAN_PLAYER
      ? { message: '🥳 You Win', result: 1 }
      : { message: '☹️ You Lose', result: -1 };
  onDeclareWinner(resObj);
}

// Displays winner in result container
function onDeclareWinner({ message, result }) {
  resultContainer.style.visibility = 'visible';
  let bg;
  if (result === 1) {
    bg = 'rgba(40, 167, 69)';
  } else if (result === -1) {
    bg = 'rgba(255, 7, 58)';
  } else if (result === 0) {
    bg = 'rgba(108, 117, 125)';
  }
  resultContainer.style.backgroundColor = bg;
  resultContainer.innerText = message;
  let timetaken = Math.round((new Date() - startTime) / 1000);
  let currDate = getDate();
  let gameDetails = {
    result: result,
    mode: level,
    date: currDate,
    time: timetaken,
    moves: movesmade,
  };
  sendToServer(gameDetails);
}

// Getting Formatted Date for saving in server
const getDate = () => {
  let newDate = new Date().toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    [splitDate, splitTime] = newDate.split(',');
  [month, day, year] = [...splitDate.slice().split('/')];
  let months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${day} ${months[parseInt(month) - 1]} ${year} -${splitTime}`;
};

// Sends Game Details to server for Storing
function sendToServer(details) {
  var requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(details),
  };
  fetch('/savegame', requestOptions)
    .then((response) => response.text())
    .catch((error) => console.log('error', error));
}

// Checks if Game is Tie
function onCheckGameTie(player) {
  let isGameWon = onCheckWin(origBoard, player);
  if (isGameWon) {
    onGameOver(isGameWon);
  } else {
    if (emptySquares().length === 0) {
      for (let i = 0; i < cells.length; i++) {
        cells[i].style.backgroundColor = 'rgba(108, 117, 125, 0.5)';
      }
      onDeclareWinner({ message: '🤝 A Tie', result: 0 });
    }
  }
}

// Returns array of all empty cells in board
function emptySquares() {
  return origBoard.filter((item) => typeof item === 'number');
}

// Gets Best Move for corresponding levels
function getCurrentSpot() {
  if (level === 2) {
    let spots = emptySquares();
    return spots[Math.floor(Math.random() * spots.length)];
  }
  return minimax(origBoard, AI_PLAYER).index;
}

// Minimax Algorithm for Finding Best Move
function minimax(newBoard, player) {
  let availableSpots = emptySquares();
  if (onCheckWin(newBoard, HUMAN_PLAYER)) {
    return { score: scores[0] };
  } else if (onCheckWin(newBoard, AI_PLAYER)) {
    return { score: scores[1] };
  } else if (availableSpots.length === 0) {
    return { score: scores[2] };
  }
  let moves = [];
  for (let i = 0; i < availableSpots.length; i++) {
    let move = {};
    move.index = newBoard[availableSpots[i]];
    newBoard[availableSpots[i]] = player;
    if (player === AI_PLAYER) {
      let result = minimax(newBoard, HUMAN_PLAYER);
      move.score = result.score;
    } else {
      let result = minimax(newBoard, AI_PLAYER);
      move.score = result.score;
    }
    newBoard[availableSpots[i]] = move.index;
    moves.push(move);
  }
  let bestMove;
  if (player === AI_PLAYER) {
    let bestScore = -10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = 10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
}
