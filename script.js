// Obtenemos referencias al canvas y su contexto
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

// Configuración de la cuadrícula
const gridSize = 40; // Tamaño de cada celda (40x40px)
const rows = canvas.height / gridSize;
const cols = canvas.width / gridSize;

// Matriz para almacenar los obstáculos y el grid completo
const obstacles = [];
const grid = Array.from({ length: rows }, () =>
  Array.from({ length: cols }, () => ({ isObstacle: false, isPath: false }))
);

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
      if (grid[row][col].isPath) {
        fillCell(col, row, 'blue'); // Mostrar camino en azul
      } else {
        ctx.strokeRect(col * gridSize, row * gridSize, gridSize, gridSize);
      }
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
      grid[row][col].isObstacle = true; // Marcar celda como obstáculo
    } else if (index !== -1) {
      obstacles.splice(index, 1); // Remover obstáculo si ya existe
      grid[row][col].isObstacle = false; // Desmarcar celda como obstáculo
    }
  }

  // Si estamos seleccionando el punto de inicio
  if (mode === 'start') {
    if (!obstacles.some(obstacle => obstacle.x === col && obstacle.y === row) &&
      (!endPoint || (endPoint.x !== col || endPoint.y !== row))) {
      startPoint = { x: col, y: row };
    }
  }

  // Si estamos seleccionando el punto de destino
  if (mode === 'end') {
    if (!obstacles.some(obstacle => obstacle.x === col && obstacle.y === row) &&
      (!startPoint || (startPoint.x !== col || startPoint.y !== row))) {
      endPoint = { x: col, y: row };
    }
  }

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
  grid.forEach(row => row.forEach(cell => {
    cell.isObstacle = false;
    cell.isPath = false;
  }));
  drawGrid(); // Redibujar la cuadrícula vacía
});

// Función heurística (distancia de Manhattan)
function heuristic(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

// Función para obtener los vecinos de un nodo
function getNeighbors(node) {
  const [x, y] = node;
  const neighbors = [];

  // Arriba
  if (x > 0 && !grid[x - 1][y].isObstacle) {
    neighbors.push([x - 1, y]);
  }
  // Abajo
  if (x < rows - 1 && !grid[x + 1][y].isObstacle) {
    neighbors.push([x + 1, y]);
  }
  // Izquierda
  if (y > 0 && !grid[x][y - 1].isObstacle) {
    neighbors.push([x, y - 1]);
  }
  // Derecha
  if (y < cols - 1 && !grid[x][y + 1].isObstacle) {
    neighbors.push([x, y + 1]);
  }

  return neighbors;
}

// Función A* para encontrar el camino más corto
function aStar(start, end) {
  let openSet = [start];
  let cameFrom = {};
  let gScore = {};
  let fScore = {};

  gScore[start] = 0;
  fScore[start] = heuristic(start, end);

  while (openSet.length > 0) {
    let current = openSet.reduce((prev, curr) => fScore[curr] < fScore[prev] ? curr : prev);

    if (current[0] === end[0] && current[1] === end[1]) {
      return reconstructPath(cameFrom, current);
    }

    openSet = openSet.filter(node => node !== current);
    let neighbors = getNeighbors(current);

    for (let neighbor of neighbors) {
      let tentativeGScore = gScore[current] + 1;
      if (!(neighbor in gScore) || tentativeGScore < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeGScore;
        fScore[neighbor] = gScore[neighbor] + heuristic(neighbor, end);

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return null; // No se encontró un camino
}

// Reconstruir el camino desde el final hacia el inicio
function reconstructPath(cameFrom, current) {
  let totalPath = [current];
  while (current in cameFrom) {
    current = cameFrom[current];
    totalPath.push(current);
  }
  return totalPath.reverse();
}

// Visualizar el camino encontrado
function visualizePath(path) {
  let i = 0;
  const interval = setInterval(() => {
    if (i >= path.length) {
      clearInterval(interval);
      return;
    }
    const [x, y] = path[i];
    grid[x][y].isPath = true;
    drawGrid();
    i++;
  }, 100);
}

// Ejecutar el algoritmo A* y visualizar el resultado
document.getElementById('runAStar').addEventListener('click', function () {
  if (startPoint && endPoint) {
    const startNode = [startPoint.y, startPoint.x];
    const endNode = [endPoint.y, endPoint.x];
    const path = aStar(startNode, endNode);
    if (path) {
      visualizePath(path);
    } else {
      alert('No se encontró un camino.');
    }
  } else {
    alert('Por favor, selecciona un punto de inicio y un punto de destino.');
  }
});

// Dibujar la cuadrícula inicial
drawGrid();
