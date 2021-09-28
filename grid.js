const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

const CELL_SIZE = 50;
const CELL_GAP = 3;
const GRID = [];

class Cell {
		constructor(x,y) {
				this.x = x;
				this.y = y;
				this.width = CELL_SIZE;
				this.height = CELL_SIZE;
		}
		draw() {
				ctx.strokeStyle = 'black';
				ctx.strokeRect(this.x,this.y,this.width,this.height);
		}
}

function createGrid() {
		for (let y = 0; y < canvas.height; y += CELL_SIZE) {
				for (let x = 0; x < canvas.width; x += CELL_SIZE) {
						GRID.push(new Cell(x,y));
				}
		}
}

function handleGrid() {
		GRID.forEach(cell => cell.draw());
}

function run() {
		ctx.fillStyle = 'grey';
		ctx.fillRect(0,0,canvas.width,canvas.height);
		handleGrid();
		requestAnimationFrame(run);
}

createGrid();
// run it
run();
