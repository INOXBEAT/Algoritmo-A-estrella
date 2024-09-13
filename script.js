// Obtenemos referencias al canvas y su contexto
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

// Configuración de la cuadrícula
const gridSize = 40; // Tamaño de cada celda (40x40px)
const rows = canvas.height / gridSize;
const cols = canvas.width / gridSize;

// Función para dibujar la cuadrícula
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiamos el canvas
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.strokeRect(col * gridSize, row * gridSize, gridSize, gridSize);
        }
    }
}

// Dibujar la cuadrícula al cargar la página
drawGrid();

// Función para reiniciar la cuadrícula
document.getElementById('resetButton').addEventListener('click', drawGrid);
