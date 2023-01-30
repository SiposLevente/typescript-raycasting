interface Color {
    Red: number,
    Green: number,
    Blue: number,
    Alpha: number,
}

interface Position {
    x: number,
    y: number
}

interface CanvasBody {
    color: Color
    position: Position,
    sides: Boundry[]
}

interface Boundry {
    start: Position,
    end: Position
}

function GenerateRandomNumber(min: number, max: number): number {
    if (max >= min) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        throw new RangeError("ERROR! Minimum number must be smaller or equal to maximum number!");
    }
}

// -------------------------------------------------------

let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("myCanvas");
let ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext("2d");
canvas.height = screen.height;
canvas.width = screen.width;
let canvasWidth: number = canvas.width;
let canvasHeight: number = canvas.height;
let mouse_position: Position;
let bodies: CanvasBody[] = [];

let white: Color = {
    Red: 255,
    Green: 255,
    Blue: 255,
    Alpha: 255,
}

let red: Color = {
    Red: 255,
    Green: 0,
    Blue: 0,
    Alpha: 255,
}
let green: Color = {
    Red: 0,
    Green: 255,
    Blue: 0,
    Alpha: 255,
}

let blue: Color = {
    Red: 0,
    Green: 0,
    Blue: 255,
    Alpha: 255,
}

main();

async function main() {

    document.addEventListener('mousemove', onMouseUpdate, false);
    document.addEventListener('mouseenter', onMouseUpdate, false);

}


async function scan(start_position: Position) {

    for (let i = 0; i < 361; i++) {
        DrawLine(start_position, { x: start_position.x + Math.sin(i) * 100, y: start_position.y + Math.cos(i) * 100 }, white);
    }
}

function CastRay(start_position: Position, direction: Position) {

}



function DrawDot(position: Position, color: Color, radius: number) {
    ctx.beginPath();
    ctx.fillStyle = `rgb(${color.Red},${color.Green},${color.Blue},${color.Alpha})`;
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    ctx.fill();
}

function DrawLine(start: Position, end: Position, color: Color) {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = `rgb(${color.Red},${color.Green},${color.Blue},${color.Alpha})`;
    ctx.stroke();

    // for (let i = 0; i < bodies.length; i++) {
    //     if (BodyContainsPoint(bodies[i], previous_position_start) && previous_position_start.x > 0 && previous_position_start.x < canvasWidth && previous_position_start.y > 0 && previous_position_start.x < canvasHeight) {
    //         stop_iteration = true;
    //         break;
    //     }
    // }

}

function ClearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}


function Sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function onMouseUpdate(e: MouseEvent) {
    mouse_position = { x: e.pageX, y: e.pageY };
    DrawScan(mouse_position);

}

function DrawScan(mouse_position: Position) {
    ClearCanvas();
    scan(mouse_position);
}
