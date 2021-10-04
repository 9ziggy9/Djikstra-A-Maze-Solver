const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

const CELL_SIZE = 50;
const CELL_GAP = 3;
const GRID = [];
let OBSTACLES = [];
let ENDPOINTS = [];

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
				for (let y = 0; y < this.height; y++)
						this.grid[y] = new Array(this.width);
				}
		initialize(value) {
				for (let y = 0; y < this.height; y++)
						for (let x = 0; x < this.width; x++)
								this.grid[y][x] = value;
		}
}

class Cell {
		constructor(x,y) {
				this.x = x;
				this.y = y;
				this.width = CELL_SIZE;
				this.height = CELL_SIZE;
		}
		draw() {
				if (mouse.x && mouse.y && rectCollision(this, mouse)) {
						ctx.strokeStyle = 'green';
						ctx.strokeRect(this.x,this.y,this.width,this.height);
				}
		}
}

class Obstacle {
		constructor(x,y) {
				this.x = x;
				this.y = y;
				this.width = CELL_SIZE;
				this.height = CELL_SIZE;
		}
		draw() {
				ctx.fillStyle = '#333333';
				ctx.fillRect(this.x,this.y,this.width,this.height);
		}
}

class Endpoint extends Cell {
		constructor(x,y,type) {
				super(x,y);
				this.type = type;
		}
		draw() {
				if (this.type === 'start') {
						ctx.fillStyle = 'green'
						ctx.fillRect(this.x,this.y,this.width,this.height);
				} else {
						ctx.fillStyle = 'red';
						ctx.fillRect(this.x,this.y,this.width,this.height);
				}
		}
}

// INITIALIZE GRID GRAPH
let g = new GridGraph(last_x,last_y);
g.initialize(true);
let ACCESSIBLE = g.grid;

// EVENT HANDLING
window.addEventListener('keypress', e => {
		console.log(e);
		// TOGGLE INSERTION MODE
		if(e.code === 'Space') {
				if(MODE !== 'ends') { MODE = 'ends' }
				else MODE = 'obstacles';
				console.log(MODE);
		}
		// CLEAR END POINTS AND BOUNDARIES
		if(e.key === 'q') {
				if(MODE === 'ends') {
						ENDPOINTS = [];
						console.log('Cleared endpoints arr');
				}
				if(MODE === 'obstacles') {
						OBSTACLES = [];
						g.initialize(true);
						console.log('Cleared obstacles arr');
				}
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
						OBSTACLES.forEach( (obs,n) => {
								if (obs.x === gridPositionX && obs.y === gridPositionY)
										OBSTACLES.splice(n,1);
						});
						ACCESSIBLE[Y][X] = true;
				}
		}
		// ENDS INPUT
		if (MODE === 'ends') {
				if(ACCESSIBLE[Y][X] && !ENDPOINTS.find(point => point.type==='start')) {
						ENDPOINTS.push(new Endpoint(gridPositionX, gridPositionY, 'start'));
						console.log(ENDPOINTS);
				} else if(ACCESSIBLE[Y][X] && !ENDPOINTS.find(point => point.type==='end')) {
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
						GRID.push(new Cell(x,y));
				}
		}
}

// DRAWING/HANDLING
const handleGrid = () => GRID.forEach(cell => cell.draw());
const handleObstacles = () => OBSTACLES.forEach(obs => obs.draw());
const handleEndpoints = () => ENDPOINTS.forEach(point => point.draw());

// CANVAS MESSAGES
function setModeText(mode) {
		ctx.font = "20px Courier"
		ctx.fillStyle = "green";
		ctx.textAlign = "right";
		ctx.fillText(mode, canvas.width, 20);
}

// LOGIC/PHYSICS
function rectCollision(first, second) {
		if (!( first.x > second.x + second.width ||
					 first.x + first.width < second.x ||
					 first.y > second.y + second.height ||
					 first.y + first.height < second.y))
		{
				return true;
		}
		return false;
}

function run() {
		ctx.clearRect(0,0,canvas.width,canvas.height);
		handleGrid();
		handleObstacles();
		handleEndpoints();
		setModeText(MODE);
		requestAnimationFrame(run);
}

createGrid();
// run it
run();
