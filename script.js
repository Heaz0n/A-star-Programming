// Выслушано с показа задания: Необходимо исправить кнопку создании матрицы и подкоректировать работоспособность, добавления стенки(препяствия) и ....
// Константы
const MAP_SIZE = 20;
const CELL_SIZE = 25;
const START_NODE = {x: 0, y: 0};
const END_NODE = {x: MAP_SIZE - 1, y: MAP_SIZE - 1};
const HEURISTICS = {
    manhattan: function(a, b) {
        return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
    },
    euclidean: function(a, b) {
        return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    },
    chebyshev: function(a, b) {
        return Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    }
};
// Переменные
let map = [];
const startNode = START_NODE;
const endNode = END_NODE;
let heuristic = HEURISTICS.manhattan;
let animationInterval;
let animationSpeed = 50;
// Функции
function initMap() {
    let mapDiv = document.getElementById("map");
    mapDiv.onclick = event => {
        let cellDiv = event.target;
        if (cellDiv.classList.contains("cell")) {
            let idParts = cellDiv.id.split("_");
            let i = parseInt(idParts[1]);
            let j = parseInt(idParts[2]);
            toggleBlock(i, j);
        }
    };
    for (let i = 0; i < MAP_SIZE; i++) {
        map[i] = [];
        for (let j = 0; j < MAP_SIZE; j++) {
            let cellDiv = document.createElement("div");
            cellDiv.classList.add("cell");
            cellDiv.id = "cell_" + i + "_" + j;
            mapDiv.appendChild(cellDiv);
            map[i][j] = {x: i, y: j, blocked: false, g: Infinity, f: Infinity, parent: null};
        }
        mapDiv.appendChild(document.createElement("br"));
    }
}

function setStart(square) {
    if (start) {
        start.classList.remove('start');
    }
    start = square;
    start.classList.add('start');
}

// Установка конечной точки
function setFinish(square) {
    if (finish) {
        finish.classList.remove('finish');
    }
    finish = square;
    finish.classList.add('finish');
}
function drawMap() {
    for (let i = 0; i < MAP_SIZE; i++) {
        for (let j = 0; j < MAP_SIZE; j++) {
            let cell = map[i][j];
            let cellDiv = document.getElementById("cell_" + i + "_" + j);
            cellDiv.classList.remove("start", "end", "blocked", "open", "closed", "path");
            if (cell.x === startNode.x && cell.y === startNode.y) {
                cellDiv.classList.add("start");
            } else if (cell.x === endNode.x && cell.y === endNode.y) {
                cellDiv.classList.add("end");
            } else if (cell.blocked) {
                cellDiv.classList.add("blocked");
            } else if (cell.f !== Infinity) {
                if (cell.closed) {
                    cellDiv.classList.add("closed");
                } else if (cell.open) {
                    cellDiv.classList.add("open");
                } else if (cell.path) {
                    cellDiv.classList.add("path");
                }
            }
        }
    }
}
function toggleBlock(i, j) {
    let cell = map[i][j];
    cell.blocked = !cell.blocked;
    drawMap();
}
function findPath() {
    resetMap();
    let openSet = [startNode];
    startNode.g = 0;
    startNode.f = heuristic(startNode, endNode);
    while (openSet.length > 0) {
        let currentNode = getLowestF(openSet);
        if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
            drawPath(currentNode);
            return;
        }
        removeFromArray(openSet, currentNode);
        currentNode.closed = true;
        let neighbors = getNeighbors(currentNode);
        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];
            if (!neighbor.blocked && !neighbor.closed) {
                let tentativeG = currentNode.g + 1;
                if (tentativeG < neighbor.g) {
                    neighbor.parent = currentNode;
                    neighbor.g = tentativeG;
                    neighbor.f = neighbor.g + heuristic(neighbor, endNode);
                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                        neighbor.open = true;
                    }
                }
            }
        }
    }
    alert("Маршрута не существует!");
}

function handleSquareClick(event) {
    const square = event.target;
    let clickCount = square.dataset.clicks ? parseInt(square.dataset.clicks) : 0;
    if (event.shiftKey) {
        setStart(square);
    } else if (event.altKey) {
        setFinish(square);
    } else {
        if (clickCount % 2 === 0) {
            square.classList.remove('obstacle');
        } else {
            square.classList.add('obstacle');
        }
        clickCount++;
        square.dataset.clicks = clickCount;
    }
}
function getLowestF(nodes) {
    let lowestF = Infinity;
    let lowestNode = null;
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if (node.f < lowestF) {
            lowestF = node.f;
            lowestNode = node;
        }
    }
    return lowestNode;
}
function getNeighbors(node) {
    let neighbors = [];
    if (node.x > 0) {
        neighbors.push(map[node.x - 1][node.y]);
    }
    if (node.y > 0) {
        neighbors.push(map[node.x][node.y - 1]);
    }
    if (node.x < MAP_SIZE - 1) {
        neighbors.push(map[node.x + 1][node.y]);
    }
    if (node.y < MAP_SIZE - 1) {
        neighbors.push(map[node.x][node.y + 1]);
    }
    return neighbors;
}
function drawPath(node) {
    while (node.parent !== null) {
        node.path = true;
        node = node.parent;
    }
    drawMap();
}
function resetMap() {
    clearInterval(animationInterval);
    animationInterval = null;
    for (let i = 0; i < MAP_SIZE; i++) {
        for (let j = 0; j < MAP_SIZE; j++) {
            let cell = map[i][j];
            cell.g = Infinity;
            cell.f = Infinity;
            cell.parent = null;
            cell.open = false;
            cell.closed = false;
            cell.path = false;
        }
    }
}
function startAnimation() {
    resetMap();
    let openSet = [startNode];
    startNode.g = 0;
    startNode.f = heuristic(startNode, endNode);
    animationInterval = setInterval(function() {
        if (openSet.length > 0) {
            let currentNode = getLowestF(openSet);
            if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
                clearInterval(animationInterval);
                drawPath(currentNode);
            } else {
                removeFromArray(openSet, currentNode);
                currentNode.closed = true;
                let neighbors = getNeighbors(currentNode);
                for (let i = 0; i < neighbors.length; i++) {
                    let neighbor = neighbors[i];
                    if (!neighbor.blocked && !neighbor.closed) {
                        let tentativeG = currentNode.g + 1;
                        if (tentativeG < neighbor.g) {
                            neighbor.parent = currentNode;
                            neighbor.g = tentativeG;
                            neighbor.f = neighbor.g + heuristic(neighbor, endNode);
                            if (!openSet.includes(neighbor)) {
                                openSet.push(neighbor);
                                neighbor.open = true;
                            }
                        }
                    }
                }
                drawMap();
            }
        } else {

            clearInterval(animationInterval);
            alert("Маршрута не существует!");
        }
    }, animationSpeed);
}
function removeFromArray(array, element) {
    let index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
    }
}
document.getElementById('create-btn').addEventListener('click', () => {
    size = parseInt(prompt('Введите размер матрицы (от 5 до 20):'));
    if (size >= 5 && size <= 20) {
        createMatrix();
    } else {
        alert('Некорректный размер матрицы!');
    }
});
// Инициализация
initMap();
drawMap();
document.getElementById("startBtn").onclick = startAnimation;
document.getElementById("resetBtn").onclick = function() {
    resetMap();
    drawMap();

};
document.getElementById("heuristicSelect").onchange = function() {
    heuristic = HEURISTICS[this.value];
    resetMap();
    drawMap();
};
document.getElementById("startBtn").addEventListener("click", startAlgorithm);
document.getElementById("resetBtn").addEventListener("click", resetGrid);
