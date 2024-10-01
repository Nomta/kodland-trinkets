// Ссылки на элементы DOM
const elements = {
  startButton: document.getElementById('start'),
  timeHeader: document.getElementById('time-header'),
  resultHeader: document.getElementById('result-header'),
  timeDisplay: document.getElementById('time'),
  resultDisplay: document.getElementById('result'),
  gameTimeInput: document.getElementById('game-time'),
  gameArea: document.getElementById('game'),
};

// Экзепляр игры
let gameInstance = null;

// Обрабочики событий 
elements.startButton.addEventListener('click', startGame);
elements.gameTimeInput.addEventListener('change', changeTime);

// Запуск игры
function startGame() {
  let gameTime = parseInt(elements.gameTimeInput.value);

  updateTimeDisplay(gameTime);
  startCountdown(gameTime, endGame);

  gameInstance = createGame({ gameArea: elements.gameArea });
  gameInstance.start();
  
  setState('playing');
}

// Завершение игры
function endGame() {
  if (gameInstance) {
    const score = gameInstance.getResult();
    updateResultDisplay(score);

    gameInstance.stop();
    gameInstance = null;
  }
  
  setState('ended');
}

// Изменение времени игры
function changeTime(event) {
  let gameTime = parseInt(event.target.value);
  updateTimeDisplay(gameTime);

  if (!gameInstance) {  // Игра не запущена
    setState('idle');
  }
}

// Функция обратного отсчета времени
function startCountdown(seconds, onStopCountdown) {
  let remainingTime = seconds;
  updateTimeDisplay(remainingTime);

  const timer = setInterval(() => {
    remainingTime -= 0.1;

    if (remainingTime <= 0) {
      clearInterval(timer);
      onStopCountdown();
    } else {
      updateTimeDisplay(remainingTime);
    }
  }, 100);
}

// Вывод количества набранных очков в заголовке
function updateResultDisplay(score) {
  elements.resultDisplay.textContent = score;
}

// Обновление значения таймера в заголовке
function updateTimeDisplay(time) {
  elements.timeDisplay.textContent = time.toFixed(1);
}

// Функция для смены состояний игры (idle, playing, ended)
function setState(stateName) {
  const states = {
    idle: () => {
      elements.startButton.classList.remove('hide');
      elements.timeHeader.classList.remove('hide');
      elements.resultHeader.classList.add('hide');
    },
    playing: () => {
      elements.startButton.classList.add('hide');
      elements.timeHeader.classList.remove('hide');
      elements.resultHeader.classList.add('hide');
    },
    ended: () => {
      elements.startButton.classList.remove('hide');
      elements.timeHeader.classList.add('hide');
      elements.resultHeader.classList.remove('hide');
    }
  };
  
  states[stateName]();
}

// Механика игры
function createGame({ gameArea }) {
  let score = 0;
  let canvas = null;
  let ctx = null;
  let currentSquare = {};
  
  const MIN_SQUARE_SIZE = 20
  const MAX_SQUARE_SIZE = 100

  function start() {
    createCanvas();
    drawSquare();
  }

  function stop() {
    clearGameArea();
  }

  function getResult() {
    return score;
  }

  function createCanvas() {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = gameArea.clientWidth;
    canvas.height = gameArea.clientHeight;
    canvas.style.backgroundColor = 'white';

    gameArea.appendChild(canvas);
    canvas.addEventListener('click', handleCanvasClick);
  }

  function clearGameArea() {
    if (canvas) {
      canvas.removeEventListener('click', handleCanvasClick);
      gameArea.removeChild(canvas);
      canvas = null;
      ctx = null;
    }
  }

  function drawSquare() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const size = getRandomInt(MIN_SQUARE_SIZE, MAX_SQUARE_SIZE);
    const maxX = canvas.width - size;
    const maxY = canvas.height - size;

    const posX = getRandomInt(0, maxX);
    const posY = getRandomInt(0, maxY);
    const color = getRandomColor();

    currentSquare = { x: posX, y: posY, size };
    ctx.fillStyle = color;
    ctx.fillRect(posX, posY, size, size);
  }

  function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (
      x >= currentSquare.x &&
      x <= currentSquare.x + currentSquare.size &&
      y >= currentSquare.y &&
      y <= currentSquare.y + currentSquare.size
    ) {
      score++;
      drawSquare();
    }
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getRandomColor() {   // насыщенные хроматические цвета
    let h = getRandomInt(0, 359);
    let s = getRandomInt(50, 100);
    let l = getRandomInt(50, 80);
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  // Внешний интерфейс
  return { start, stop, getResult };
}