const startButton = document.getElementById('startGame');
const modeContainer = document.getElementById('modeContainer');
const closeButton = document.getElementById('closeButton');
const hardSelect = document.getElementById('hardSelect');
const easySelect = document.getElementById('easySelect');

let scores;

startButton.addEventListener('click', () => {
    modeContainer.style.visibility = 'visible';
})

closeButton.addEventListener('click', () => {
    modeContainer.style.visibility = 'hidden';
})

easySelect.addEventListener('click', () => {
    modeContainer.style.visibility = 'hidden';
    scores=[10,-10,0];
    onStartGame();
})

hardSelect.addEventListener('click', () => {
    modeContainer.style.visibility = 'hidden';
    scores=[-10,10,0];
    onStartGame();
})

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

const cells = document.getElementsByClassName('cell');
const resultContainer = document.getElementById('result');

function onStartGame() {
    origBoard = [0,1,2,3,4,5,6,7,8];
    resultContainer.style.visibility = 'hidden';
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener('click', onTurnClick, { once:true });
    }
}

function onTurnClick(e) {
    const { id: squareId } = e.target;
    if (typeof origBoard[squareId] === 'number') {
        onTurn(squareId, HUMAN_PLAYER);
        if (!onCheckGameTie()) {
            onTurn(getCurrentSpot(), AI_PLAYER);
        }
    } else {
        const message = 'That spot is already taken, click somewhere else';
        alert(message);
    }
}

function onTurn(squareId, player) {
    origBoard[squareId] = player;
    console.log(squareId);
    document.getElementById(squareId).innerText = player;
    let isGameWon = onCheckWin(origBoard, player);
    if (isGameWon) {
        onGameOver(isGameWon);
    }
}

function onCheckWin(board, player) {
    let gameWon = false;
    for (let [index, win] of winCombos.entries()) {
        if(board[win[0]]=== player && board[win[1]]=== player && board[win[2]]=== player){
            gameWon = {
                index: index,
                player: player,
            }
            break;
        }
    }
    return gameWon;
}

function onGameOver({ index, player }) {
    for (let i of winCombos[index]) {
        const color = player === HUMAN_PLAYER ? 'rgba(40, 167, 69, 0.8)' : 'rgba(255, 7, 58, 0.8)';
        document.getElementById(i).style.backgroundColor = color;
    }
    for (let i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', onTurnClick);
    }

    const result = player === HUMAN_PLAYER ? 'You Win' : 'You Lose';
    onDeclareWinner(result);
}

function onDeclareWinner(res) {
    resultContainer.style.visibility = 'visible';
    let bg;
    if(res=='You Win'){
        bg = 'rgba(40, 167, 69)';
    } else if(res=='You Lose') {
        bg = 'rgba(255, 7, 58)'
    } else if(res=='A Tie'){
        bg = 'rgba(108, 117, 125)'
    }
    resultContainer.style.backgroundColor = bg;
    resultContainer.innerText = res;
}

function onCheckGameTie() {
    if (emptySquares().length === 0) {
        for (let i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = 'rgba(108, 117, 125, 0.5)';
            cells[i].removeEventListener('click', onTurnClick);
        }
        onDeclareWinner('A Tie');
        return true;
    } else {
        return false;
    }
}

function emptySquares() {
    return origBoard.filter((item) => typeof item === 'number');
}

function getCurrentSpot() {
    return minimax(origBoard, AI_PLAYER).index;
}

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