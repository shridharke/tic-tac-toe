const startButton = document.getElementById('startGame');
const modeContainer = document.getElementById('modeContainer');
const closeButton = document.getElementById('closeButton');

startButton.addEventListener('click', () => {
    modeContainer.style.visibility = 'visible';
})

closeButton.addEventListener('click', () => {
    modeContainer.style.visibility = 'hidden';
})