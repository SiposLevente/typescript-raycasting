interface Color {
    Red: number,
    Green: number,
    Blue: number,
    Alpha: number,
}

class Position {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public Distance(other_pount: Position): number {
        return Math.sqrt(Math.pow((other_pount.x - this.x), 2) + Math.pow(other_pount.y - this.y, 2));
    }
}

class CanvasBody {
    sides: Line[];

    constructor() {
        this.sides = []
    }

    public AddSide(line: Line) {
        this.sides.push(line);
    }

    public Draw() {
        this.sides.forEach(line => {
            line.Draw();
        });
    }
}

class Line {
    start_point: Position;
    end_point: Position;

    constructor(start: Position, end: Position) {
        this.start_point = new Position(start.x, start.y);
        this.end_point = new Position(end.x, end.y);
    }

    public Draw() {
        DrawLine(this.start_point, this.end_point, red);
    }

    public Intersects(boundry: Line): Position | null {
        // this start x1 y1 -  end x2 y2
        // boundry x3 y3 -  end x4 y4
        let t = ((this.start_point.x - boundry.start_point.x) * (boundry.start_point.y - boundry.end_point.y) - (this.start_point.y - boundry.start_point.y) * (boundry.start_point.x - boundry.end_point.x)) / ((this.start_point.x - this.end_point.x) * (boundry.start_point.y - boundry.end_point.y) - (this.start_point.y - this.end_point.y) * (boundry.start_point.x - boundry.end_point.x));
        let u = ((this.start_point.x - boundry.start_point.x) * (this.start_point.y - this.end_point.y) - (this.start_point.y - boundry.start_point.y) * (this.start_point.x - this.end_point.x)) / ((this.start_point.x - this.end_point.x) * (boundry.start_point.y - boundry.end_point.y) - (this.start_point.y - this.end_point.y) * (boundry.start_point.x - boundry.end_point.x));

        let px_top: number = (this.start_point.x * this.end_point.y - this.start_point.y * this.end_point.x) * (boundry.start_point.x - boundry.end_point.x) - (this.start_point.x - this.end_point.x) * (boundry.start_point.x * boundry.end_point.y - boundry.start_point.y * boundry.end_point.x);
        let px_bottom: number = (this.start_point.x - this.end_point.x) * (boundry.start_point.y - boundry.end_point.y) - (this.start_point.y - this.end_point.y) * (boundry.start_point.x - boundry.end_point.x);
        let py_top: number = (this.start_point.x * this.end_point.y - this.start_point.y * this.end_point.x) * (boundry.start_point.y - boundry.end_point.y) - (this.start_point.y - this.end_point.y) * (boundry.start_point.x * boundry.end_point.y - boundry.start_point.y * boundry.end_point.x);
        let py_bottom: number = (this.start_point.x - this.end_point.x) * (boundry.start_point.y - boundry.end_point.y) - (this.start_point.y - this.end_point.y) * (boundry.start_point.x - boundry.end_point.x);

        if ((px_bottom == 0 || py_bottom == 0) || (t < 0 || t > 1) || ((u < 0 || u > 1))) {
            return null;
        }

        return (
            new Position(
                px_top / px_bottom,
                py_top / py_bottom
            )
        )
    }
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
let black: Color = {
    Red: 0,
    Green: 0,
    Blue: 0,
    Alpha: 0,
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

function setup() {
    let l1 = new Line(new Position(0, 0), new Position(canvasWidth, 0));
    let l2 = new Line(new Position(canvasWidth, 0), new Position(canvasWidth, canvasHeight));
    let l3 = new Line(new Position(canvasWidth, canvasHeight), new Position(0, canvasHeight),);
    let l4 = new Line(new Position(0, canvasHeight), new Position(0, 0));
    let body = new CanvasBody();
    body.AddSide(l1);
    body.AddSide(l2);
    body.AddSide(l3);
    body.AddSide(l4);
    body.Draw();
    bodies.push(body);

    let divider = 50;
    let x_min = canvasWidth / divider;
    let y_min = canvasHeight / divider;

    let x_max = canvasWidth - x_min;
    let y_max = canvasHeight - y_min;

    for (let i = 0; i < GenerateRandomNumber(1, 2); i++) {
        let lines: Line[] = [new Line(new Position(GenerateRandomNumber(x_min, x_max), GenerateRandomNumber(y_min, y_max)), new Position(GenerateRandomNumber(x_min, x_max), GenerateRandomNumber(y_min, y_max)))]
        let body = new CanvasBody();
        let j = 0;
        for (; j < GenerateRandomNumber(1, 4); j++) {
            lines.push(new Line(lines[j].end_point, new Position(GenerateRandomNumber(x_min, x_max), GenerateRandomNumber(y_min, y_max))));
        }
        //lines.push(new Line(lines[j].end_point, lines[0].start_point));

        lines.forEach(line => {
            body.AddSide(line)
        });
        body.Draw();
        bodies.push(body);
    }

}

async function main() {
    setup();

    document.addEventListener('mouseenter', onMouseUpdate, false);
    document.addEventListener('mousemove', onMouseUpdate, false);

}


async function scan(start_position: Position) {
    let line_length_multipier = 10000;
    for (let i = 0; i < 361; i++) {
        DrawRay(start_position, new Position(start_position.x + Math.sin(i) * line_length_multipier, start_position.y + Math.cos(i) * line_length_multipier), white);
    }
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
}

function DrawRay(start: Position, end: Position, color: Color) {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    let start_line = new Line(start, end);
    let end_point: Position = end;
    let intersecting_points: Position[] = [end];
    bodies.forEach(body => {
        body.sides.forEach(line => {
            let intersecting_point = start_line.Intersects(line);
            if (intersecting_point) {

                intersecting_points.push(intersecting_point);
            }
        });
    });

    intersecting_points.forEach(point => {
        if (start.Distance(end_point) > start.Distance(point)) {
            end_point = point;
        }
    });
    ctx.lineTo(end_point.x, end_point.y);
    ctx.strokeStyle = `rgb(${color.Red},${color.Green},${color.Blue},${color.Alpha})`;
    ctx.stroke();
    
}

function ClearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}


function Sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function onMouseUpdate(e: MouseEvent) {
    mouse_position = new Position(e.pageX, e.pageY);
    DrawScan(mouse_position);

}

function DrawScan(mouse_position: Position) {
    ClearCanvas();
    scan(mouse_position);
    // bodies.forEach(body => {
    //     body.Draw();
    // });
}