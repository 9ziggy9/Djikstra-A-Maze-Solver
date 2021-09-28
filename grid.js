const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

const CELL_SIZE = 50;
const CELL_GAP = 3;
const GRID = [];

const mouse = {
		x: undefined,
		y: undefined,
		width: 0.1,
		height: 0.1,
}
let canvasPosition = canvas.getBoundingClientRect();

// EVENT HANDLING
canvas.addEventListener('mousemove', e => {
		mouse.x = e.x - canvasPosition.left;
		mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', e => {
		mouse.x = undefined;
		mouse.y = undefined;
})

class Cell {
		constructor(x,y) {
				this.x = x;
				this.y = y;
				this.width = CELL_SIZE;
				this.height = CELL_SIZE;
		}
		draw() {
				if (rectCollision(this, mouse)) {
						ctx.strokeStyle = 'green';
						ctx.strokeRect(this.x,this.y,this.width,this.height);
				}
		}
}

function createGrid() {
		for (let y = 0; y < canvas.height; y += CELL_SIZE) {
				for (let x = 0; x < canvas.width; x += CELL_SIZE) {
						GRID.push(new Cell(x,y));
				}
		}
}

const handleGrid = () => GRID.forEach(cell => cell.draw());

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
		ctx.fillStyle = 'grey';
		ctx.fillRect(0,0,canvas.width,canvas.height);
		handleGrid();
		requestAnimationFrame(run);
}

createGrid();
// run it
run();
