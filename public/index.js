const startButton = document.getElementById('startGame');
const modeContainer = document.getElementById('modeContainer');
const closeButton = document.getElementById('closeButton');
const easySelect = document.getElementById('easySelect');
const mediumSelect = document.getElementById('mediumSelect');
const hardSelect = document.getElementById('hardSelect');
const manualSelect = document.getElementById('manualSelect');

let scores;
let player;
let level;

startButton.addEventListener('click', () => {
    modeContainer.style.visibility = 'visible';
})

closeButton.addEventListener('click', () => {
    modeContainer.style.visibility = 'hidden';
})

easySelect.addEventListener('click', () => {
    modeContainer.style.visibility = 'hidden';
    scores=[10,-10,0];
    level=1;
    currentPlayer='X';
    onStartGame();
})

mediumSelect.addEventListener('click', () => {
    modeContainer.style.visibility='hidden';
    level=2;
    currentPlayer='X';
    onStartGame()
})

hardSelect.addEventListener('click', () => {
    modeContainer.style.visibility = 'hidden';
    scores=[-10,10,0];
    level=3;
    currentPlayer='X';
    onStartGame();
})

manualSelect.addEventListener('click', () => {
    modeContainer.style.visibility = 'hidden';
    level=4;
    currentPlayer='X';
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
        cells[i].addEventListener('click', onTurnClick);
        cells[i].addEventListener('mouseover', onCellMouseOver);
        cells[i].addEventListener('mouseout', onCellMouseOut);
    }
}

function onCellMouseOver(e){
    const { id: squareId } = e.target;
    cells[squareId].innerText=currentPlayer;
    cells[squareId].style.color = 'rgba(0,0,0,0.3)';
}

function onCellMouseOut(e){
    const { id: squareId } = e.target;
    cells[squareId].innerText='';
}

function onTurnClick(e) {
    const { id: squareId } = e.target;
    onTurn(squareId, currentPlayer);
    playerSwitch();
    if(level!==4){
        let currentSpot = getCurrentSpot();
        if(currentSpot || currentSpot===0){
            onTurn(currentSpot, currentPlayer);
            playerSwitch();
        }
    }
}

function playerSwitch(){
    if(currentPlayer==='X'){
        currentPlayer='O';
    } else if(currentPlayer==='O'){
        currentPlayer='X';
    }
}

function onTurn(squareId, player) {
    console.log(squareId);
    cells[squareId].style.color='black';
    cells[squareId].removeEventListener('click', onTurnClick);
    cells[squareId].removeEventListener('mouseout', onCellMouseOut);
    cells[squareId].removeEventListener('mouseover', onCellMouseOver);
    origBoard[squareId] = player;
    document.getElementById(squareId).innerText = player;
    onCheckGameTie(player);
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
        cells[i].removeEventListener('mouseout', onCellMouseOut);
        cells[i].removeEventListener('mouseover', onCellMouseOver);
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

function onCheckGameTie(player) {
    let isGameWon = onCheckWin(origBoard, player);
    if (isGameWon) {
        onGameOver(isGameWon);
    } else {
        if (emptySquares().length === 0) {
            for (let i = 0; i < cells.length; i++) {
                cells[i].style.backgroundColor = 'rgba(108, 117, 125, 0.5)';
            }
            onDeclareWinner('A Tie');
        }
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