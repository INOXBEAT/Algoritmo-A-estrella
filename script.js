// Obtenemos referencias al canvas y su contexto
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

// Configuración de la cuadrícula
const gridSize = 40; // Tamaño de cada celda (40x40px)
const rows = canvas.height / gridSize;
const cols = canvas.width / gridSize;

// Matriz para almacenar los obstáculos
const obstacles = [];

// Variables para el punto de inicio y destino
let startPoint = null;
let endPoint = null;

// Modo actual: 'obstacle', 'start', 'end'
let mode = 'obstacle';

// Función para dibujar la cuadrícula
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiamos el canvas
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.strokeRect(col * gridSize, row * gridSize, gridSize, gridSize);
        }
    }

    // Redibujar los obstáculos después de limpiar el canvas
    obstacles.forEach(obstacle => {
        fillCell(obstacle.x, obstacle.y, 'black'); // Rellenar la celda como obstáculo
    });

    // Dibujar punto de inicio y destino si existen
    if (startPoint) {
        fillCell(startPoint.x, startPoint.y, 'green'); // Color verde para el punto de inicio
    }
    if (endPoint) {
        fillCell(endPoint.x, endPoint.y, 'red'); // Color rojo para el punto de destino
    }
}

// Función para llenar una celda con un color
function fillCell(col, row, color) {
    ctx.fillStyle = color;
    ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
    ctx.strokeRect(col * gridSize, row * gridSize, gridSize, gridSize); // Redibujar el borde
}

// Evento para colocar obstáculos, inicio o destino
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Determinar en qué celda se hizo clic
    const col = Math.floor(x / gridSize);
    const row = Math.floor(y / gridSize);

    // Si el modo es 'obstacle', colocamos o removemos un obstáculo
    if (mode === 'obstacle') {
        const index = obstacles.findIndex(obstacle => obstacle.x === col && obstacle.y === row);
        if (index === -1 && !isPointStartOrEnd(col, row)) {
            obstacles.push({ x: col, y: row });
        } else if (index !== -1) {
            obstacles.splice(index, 1); // Remover obstáculo si ya existe
        }
    }

    // Si estamos seleccionando el punto de inicio
    if (mode === 'start') {
        // Evitar que el punto de inicio sea un obstáculo
        if (!obstacles.some(obstacle => obstacle.x === col && obstacle.y === row) &&
            (!endPoint || (endPoint.x !== col || endPoint.y !== row))) {
            startPoint = { x: col, y: row };
        }
    }

    // Si estamos seleccionando el punto de destino
    if (mode === 'end') {
        // Evitar que el punto de destino sea un obstáculo o el mismo que el inicio
        if (!obstacles.some(obstacle => obstacle.x === col && obstacle.y === row) &&
            (!startPoint || (startPoint.x !== col || startPoint.y !== row))) {
            endPoint = { x: col, y: row };
        }
    }

    // Redibujar la cuadrícula con los cambios
    drawGrid();
});

// Función para verificar si una celda es el inicio o el destino
function isPointStartOrEnd(col, row) {
    return (startPoint && startPoint.x === col && startPoint.y === row) ||
           (endPoint && endPoint.x === col && endPoint.y === row);
}

// Función para cambiar el modo actual
document.getElementById('modeObstacle').addEventListener('click', () => {
    mode = 'obstacle';
});

document.getElementById('modeStart').addEventListener('click', () => {
    mode = 'start';
});

document.getElementById('modeEnd').addEventListener('click', () => {
    mode = 'end';
});

// Función para reiniciar la cuadrícula
document.getElementById('resetButton').addEventListener('click', () => {
    obstacles.length = 0; // Vaciar la lista de obstáculos
    startPoint = null; // Reiniciar punto de inicio
    endPoint = null; // Reiniciar punto de destino
    drawGrid(); // Redibujar la cuadrícula vacía
});

// Dibujar la cuadrícula al cargar la página
drawGrid();
