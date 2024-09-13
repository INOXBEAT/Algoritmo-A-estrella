// Obtenemos referencias al canvas y su contexto
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

// Configuración de la cuadrícula
const gridSize = 40; // Tamaño de cada celda (40x40px)
const rows = canvas.height / gridSize;
const cols = canvas.width / gridSize;

// Matriz para almacenar los obstáculos
const obstacles = [];

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
}

// Función para llenar una celda con un color
function fillCell(col, row, color) {
    ctx.fillStyle = color;
    ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
    ctx.strokeRect(col * gridSize, row * gridSize, gridSize, gridSize); // Redibujar el borde
}

// Evento para colocar obstáculos en la cuadrícula al hacer clic
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Determinar en qué celda se hizo clic
    const col = Math.floor(x / gridSize);
    const row = Math.floor(y / gridSize);

    // Evitar duplicados
    const exists = obstacles.some(obstacle => obstacle.x === col && obstacle.y === row);
    if (!exists) {
        obstacles.push({ x: col, y: row });
        fillCell(col, row, 'black'); // Rellenar la celda como obstáculo
    }
});

// Función para reiniciar la cuadrícula
document.getElementById('resetButton').addEventListener('click', () => {
    obstacles.length = 0; // Vaciar la lista de obstáculos
    drawGrid(); // Redibujar la cuadrícula vacía
});

// Dibujar la cuadrícula al cargar la página
drawGrid();
