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
    width: number,
    height: number,
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

    for (let _ = 0; _ < 3; _++) {

        let color: Color = {
            Red: GenerateRandomNumber(0, 255),
            Green: GenerateRandomNumber(0, 255),
            Blue: GenerateRandomNumber(0, 255),
            Alpha: GenerateRandomNumber(0, 255),
        }

        let width: number = GenerateRandomNumber(10, 1000);
        let height: number = GenerateRandomNumber(10, 700);

        let position: Position = { x: GenerateRandomNumber(0, canvasWidth - width), y: GenerateRandomNumber(0, canvasHeight - height) };

        AddBody(position, color, width, height);
    }

    document.addEventListener('mousemove', onMouseUpdate, false);
    document.addEventListener('mouseenter', onMouseUpdate, false);

}


async function scan(precision: number, start_position: Position, segments: number) {

    for (let i = 0; i < canvasWidth / precision; i++) {
        DrawLine(start_position, { x: i * precision, y: 0 }, red, segments);
        //await sleep(sleep_time);
    }


    for (let i = 0; i < canvasHeight / precision; i++) {
        DrawLine(start_position, { x: canvasWidth, y: i * precision }, white, segments);
        //await sleep(sleep_time);
    }

    for (let i = 0; i < canvasWidth / precision; i++) {
        DrawLine(start_position, { x: canvasWidth - (i * precision), y: canvasHeight }, blue, segments);
        //await sleep(sleep_time);
    }

    for (let i = 0; i < canvasHeight / precision; i++) {
        DrawLine(start_position, { x: 0, y: canvasHeight - (i * precision) }, green, segments);
        //await sleep(sleep_time);
    }
}

function AddBody(position: Position, color: Color, width: number, height: number) {
    bodies.push({
        color: color,
        position: position,
        width: width,
        height: height,
    });
}

function BodyContainsPoint(body: CanvasBody, position: Position): boolean {
    return (body.position.x <= position.x && body.position.y <= position.y && body.position.x + body.width >= position.x && body.position.y + body.height >= position.y);
}

function DrawDot(position: Position, color: Color, radius: number) {
    ctx.beginPath();
    ctx.fillStyle = `rgb(${color.Red},${color.Green},${color.Blue},${color.Alpha})`;
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    ctx.fill();
}

function DrawLine(start: Position, end: Position, color: Color, segments: number = 1) {
    if (segments > 1) {
        let segment_size: Position = { x: (end.x - start.x) / segments, y: (end.y - start.y) / segments }
        let stop_iteration = false;
        let previous_position_start: Position = { x: start.x, y: start.y };
        let index = 0;
        while (index < segments && !stop_iteration) {
            ctx.beginPath();
            ctx.moveTo(previous_position_start.x, previous_position_start.y);

            previous_position_start.x += segment_size.x;
            previous_position_start.y += segment_size.y;

            for (let i = 0; i < bodies.length; i++) {
                if (BodyContainsPoint(bodies[i], previous_position_start)){
                    stop_iteration= true;

                    break;
                }
            }

            if (!stop_iteration) {
                ctx.lineTo(previous_position_start.x, previous_position_start.y);
                ctx.strokeStyle = `rgb(${color.Red},${color.Green},${color.Blue},${color.Alpha})`;
                ctx.stroke();
                index++;
            }
        }


    } else {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = `rgb(${color.Red},${color.Green},${color.Blue},${color.Alpha})`;
        ctx.stroke();
    }

}

function ClearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}


function Sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function onMouseUpdate(e: MouseEvent) {
    mouse_position = { x: e.pageX, y: e.pageY };
    DrawScan(100, mouse_position);

}

function DrawScan(segments: number = 1, mouse_position: Position) {
    //ClearCanvas();
    scan(10, mouse_position, segments);
}
