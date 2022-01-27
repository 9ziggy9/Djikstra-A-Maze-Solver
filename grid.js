const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

const CELL_SIZE = 30;
const CELL_GAP = 3;
const GRID = [];
let OBSTACLES = [];
let ENDPOINTS = [];
let PATH = [];

// Edit modes
let MODE = 'obstacles';

// 2D Boolean array of accessible cells
const last_y = canvas.height / CELL_SIZE;
const last_x = canvas.width / CELL_SIZE;

const mouse = {
    x: undefined,
    y: undefined,
    width: 0.1,
    height: 0.1,
}
let canvasPosition = canvas.getBoundingClientRect();

class GridGraph {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        //Build 2d array
        this.grid = new Array(this.height);
        for (let y = 0; y <= this.height; y++)
            this.grid[y] = new Array(this.width);
    }

    initialize(value) {
        for (let y = 0; y <= this.height; y++)
            for (let x = 0; x <= this.width; x++)
                this.grid[y][x] = value;
    }

    // A* heuristic : Euclidean distance
    d = (a, b) => Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))

    neighbors(cell, access, target = {
        x: 0,
        y: 0
    }) {
        const {
            x,
            y
        } = cell.point;
        const neighbors = [];
        // console.log(`{${x}, ${y}}`);
        if (x + 1 <= this.width && access[y][x + 1]) {
            access[y][x + 1] = false;
            neighbors.push({
                point: {
                    x: x + 1,
                    y: y
                },
                parent: {
                    x: x,
                    y: y
                },
                distance: this.d({
                    x: x + 1,
                    y: y
                }, target)
            });
        }
        if (x - 1 >= 0 && access[y][x - 1]) {
            access[y][x - 1] = false;
            neighbors.push({
                point: {
                    x: x - 1,
                    y: y
                },
                parent: {
                    x: x,
                    y: y
                },
                distance: this.d({
                    x: x - 1,
                    y: y
                }, target)
            });
        }
        if (y + 1 <= this.height && access[y + 1][x]) {
            access[y + 1][x] = false;
            neighbors.push({
                point: {
                    x: x,
                    y: y + 1
                },
                parent: {
                    x: x,
                    y: y
                },
                distance: this.d({
                    x: x,
                    y: y + 1
                }, target)
            });
        }
        if (y - 1 >= 0 && access[y - 1][x]) {
            access[y - 1][x] = false;
            neighbors.push({
                point: {
                    x: x,
                    y: y - 1
                },
                parent: {
                    x: x,
                    y: y
                },
                distance: this.d({
                    x: x,
                    y: y - 1
                }, target)
            });
        }
        return neighbors;
    }

    reconstructPath(history) {
        const path = [];
        //grab last of visited paths
        let next = history[history.length - 1];
        const end = history[0];
        while (next !== end) {
            path.push(next.point);
            next = history.find(prev => next.parent.x === prev.point.x &&
                next.parent.y === prev.point.y);
        }
        path.push(end.point);
        return path;
    }

    bfs(start, end, access) {
        let queue = [];
        let visited = [];
        const path = [];
        queue.push(start);
        let previous = start;
        while (queue.length > 0) {
            let current = queue[0];
						visited.push(current);
            if (current.point.x === end.point.x && current.point.y === end.point.y) {
                console.log(`DISCOVERED CELL: {${end.point.x},${end.point.y}}`);
                const path = this.reconstructPath(visited);
                return path;
            }
            queue.push(...this.neighbors(current, access));
            queue.shift();
        }
        return visited;
    }

    aStar(start, end, access) {
        let queue = [];
        let visited = [];
        const path = []
        queue.push(start);
        let previous = start;
        while (queue.length > 0) {
            let current = queue[0];
						visited.push(current);
            if (current.point.x === end.point.x && current.point.y === end.point.y) {
                console.log(`DISCOVERED CELL: {${end.point.x},${end.point.y}}`);
                const path = this.reconstructPath(visited);
                return path;
            }
            queue.push(...this.neighbors(current, access, {
                x: end.point.x,
                y: end.point.y
            }));
            queue.shift();
            queue.sort((cell1, cell2) => cell1.distance - cell2.distance);
        }
    }
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CELL_SIZE;
        this.height = CELL_SIZE;
    }
    draw() {
        if (mouse.x && mouse.y && rectCollision(this, mouse)) {
            ctx.strokeStyle = 'green';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
    drawPath() {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Obstacle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CELL_SIZE;
        this.height = CELL_SIZE;
    }
    draw() {
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Endpoint extends Cell {
    constructor(x, y, type) {
        super(x, y);
        this.type = type;
    }
    draw() {
        if (this.type === 'start') {
            ctx.fillStyle = 'blue'
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

// INITIALIZE GRID GRAPH
let g = new GridGraph(last_x, last_y);
g.initialize(true);
let ACCESSIBLE = g.grid;

// EVENT HANDLING
window.addEventListener('keypress', e => {
    console.log(e);
    // TOGGLE INSERTION MODE
    if (e.code === 'Space') {
        PATH = [];
        if (MODE !== 'ends') {
            MODE = 'ends'
        } else MODE = 'obstacles';
        console.log(MODE);
    }
    // CLEAR END POINTS AND BOUNDARIES
    if (e.key === 'q') {
				ENDPOINTS = [];
				PATH = [];
				g.initialize(true);
				OBSTACLES.forEach(o => {
					ACCESSIBLE[o.y/CELL_SIZE][o.x/CELL_SIZE] = false;
				});
				console.log(ACCESSIBLE);
				console.log('Cleared path.')
        if (MODE === 'obstacles') {
            OBSTACLES = [];
            g.initialize(true);
            console.log('Cleared obstacles arr');
        }
    }

    if (e.code === 'Enter' && ENDPOINTS.length === 2) {
        const [sEndpoint, eEndpoint] = ENDPOINTS;
        const start = {
            point: {
                x: sEndpoint.x / CELL_SIZE,
                y: sEndpoint.y / CELL_SIZE
            },
            parent: null
        };
        const end = {
            point: {
                x: eEndpoint.x / CELL_SIZE,
                y: eEndpoint.y / CELL_SIZE
            },
            parent: null
        };
        g.bfs(start, end, ACCESSIBLE).forEach(p =>
            PATH.push(new Cell(CELL_SIZE * p.x, CELL_SIZE * p.y)));
				ENDPOINTS = [];
        console.log(PATH);
    }
});
canvas.addEventListener('mousemove', e => {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', e => {
    mouse.x = undefined;
    mouse.y = undefined;
})
canvas.addEventListener('mousedown', e => {
});
canvas.addEventListener('click', e => {
    const gridPositionX = mouse.x - (mouse.x % CELL_SIZE);
    const gridPositionY = mouse.y - (mouse.y % CELL_SIZE);
    const Y = gridPositionY / CELL_SIZE;
    const X = gridPositionX / CELL_SIZE;
    // BOUNDARY INPUT
    if (MODE === 'obstacles') {
        if (ACCESSIBLE[Y][X]) {
            OBSTACLES.push(new Obstacle(gridPositionX, gridPositionY));
            ACCESSIBLE[Y][X] = false;
        } else {
            OBSTACLES.forEach((obs, n) => {
                if (obs.x === gridPositionX && obs.y === gridPositionY)
                    OBSTACLES.splice(n, 1);
            });
            ACCESSIBLE[Y][X] = true;
        }
    }
    // ENDS INPUT
    if (MODE === 'ends') {
        if (ACCESSIBLE[Y][X] && !ENDPOINTS.find(point => point.type === 'start')) {
            ENDPOINTS.push(new Endpoint(gridPositionX, gridPositionY, 'start'));
            console.log(ENDPOINTS);
        } else if (ACCESSIBLE[Y][X] && !ENDPOINTS.find(point => point.type === 'end')) {
            ENDPOINTS.push(new Endpoint(gridPositionX, gridPositionY, 'end'));
            console.log(ENDPOINTS);
        } else {
            console.log('Endpoints defined; press escape to clear, return to run.');
        }
    }
});


// INITIALIZING
function createGrid() {
    for (let y = 0; y < canvas.height; y += CELL_SIZE) {
        for (let x = 0; x < canvas.width; x += CELL_SIZE) {
            GRID.push(new Cell(x, y));
        }
    }
}

// DRAWING/HANDLING
const handleGrid = () => GRID.forEach(cell => cell.draw());
const handleObstacles = () => OBSTACLES.forEach(obs => obs.draw());
const handleEndpoints = () => ENDPOINTS.forEach(point => point.draw());
const handlePath = () => PATH.forEach(point => point.drawPath());

// CANVAS MESSAGES
function setModeText(mode) {
    ctx.font = "20px Courier"
    ctx.fillStyle = "green";
    ctx.textAlign = "right";
    ctx.fillText(mode, canvas.width, 20);
}

// LOGIC/PHYSICS
function rectCollision(first, second) {
    if (!(first.x > second.x + second.width ||
            first.x + first.width < second.x ||
            first.y > second.y + second.height ||
            first.y + first.height < second.y)) {
        return true;
    }
    return false;
}

function run() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleGrid();
    handleObstacles();
    handleEndpoints();
    handlePath();
    setModeText(MODE);
    requestAnimationFrame(run);
}

createGrid();
// run it
run();
