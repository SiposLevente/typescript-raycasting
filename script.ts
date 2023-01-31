class Color {
    Red: number;
    Green: number;
    Blue: number;
    Alpha: number;

    constructor(red: number, green: number, blue: number, alpha: number) {
        this.Red = red;
        this.Green = green;
        this.Blue = blue;
        this.Alpha = alpha;

    }
}

class Position {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public Distance(otherPoint: Position): number {
        return Math.sqrt(Math.pow((otherPoint.x - this.x), 2) + Math.pow(otherPoint.y - this.y, 2));
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
    startPoint: Position;
    endPoint: Position;

    constructor(start: Position, end: Position) {
        this.startPoint = new Position(start.x, start.y);
        this.endPoint = new Position(end.x, end.y);
    }

    public Draw() {
        DrawLine(this.startPoint, this.endPoint, red);
    }

    public Intersects(boundry: Line): Position | null {
        // this start x1 y1 -  end x2 y2
        // boundry x3 y3 -  end x4 y4
        let t = ((this.startPoint.x - boundry.startPoint.x) * (boundry.startPoint.y - boundry.endPoint.y) - (this.startPoint.y - boundry.startPoint.y) * (boundry.startPoint.x - boundry.endPoint.x)) / ((this.startPoint.x - this.endPoint.x) * (boundry.startPoint.y - boundry.endPoint.y) - (this.startPoint.y - this.endPoint.y) * (boundry.startPoint.x - boundry.endPoint.x));
        let u = ((this.startPoint.x - boundry.startPoint.x) * (this.startPoint.y - this.endPoint.y) - (this.startPoint.y - boundry.startPoint.y) * (this.startPoint.x - this.endPoint.x)) / ((this.startPoint.x - this.endPoint.x) * (boundry.startPoint.y - boundry.endPoint.y) - (this.startPoint.y - this.endPoint.y) * (boundry.startPoint.x - boundry.endPoint.x));

        let pxTop: number = (this.startPoint.x * this.endPoint.y - this.startPoint.y * this.endPoint.x) * (boundry.startPoint.x - boundry.endPoint.x) - (this.startPoint.x - this.endPoint.x) * (boundry.startPoint.x * boundry.endPoint.y - boundry.startPoint.y * boundry.endPoint.x);
        let pxBottom: number = (this.startPoint.x - this.endPoint.x) * (boundry.startPoint.y - boundry.endPoint.y) - (this.startPoint.y - this.endPoint.y) * (boundry.startPoint.x - boundry.endPoint.x);
        let pyTop: number = (this.startPoint.x * this.endPoint.y - this.startPoint.y * this.endPoint.x) * (boundry.startPoint.y - boundry.endPoint.y) - (this.startPoint.y - this.endPoint.y) * (boundry.startPoint.x * boundry.endPoint.y - boundry.startPoint.y * boundry.endPoint.x);
        let pyBottom: number = (this.startPoint.x - this.endPoint.x) * (boundry.startPoint.y - boundry.endPoint.y) - (this.startPoint.y - this.endPoint.y) * (boundry.startPoint.x - boundry.endPoint.x);

        if ((pxBottom == 0 || pyBottom == 0) || (t < 0 || t > 1) || ((u < 0 || u > 1))) {
            return null;
        }

        return (
            new Position(
                pxTop / pxBottom,
                pyTop / pyBottom
            )
        )
    }
}

enum Direction {
    Forward,
    Backwards
}

class Player {
    position: Position;
    view_direction: number;
    speed: number;


    constructor(x: number, y: number) {
        this.position = new Position(x, y);
        this.speed = 10;
        this.view_direction = 0;

    }

    public GetViewDirection(): number {
        return this.view_direction % 360;
    }

    public Turn(degree: number) {
        this.view_direction = (this.view_direction + degree) % 360;
    }

    public Forward() {
        this.Go(player.speed);
    }

    public Backwards() {
        this.Go(-player.speed);
    }

    public GoRight() {
        this.GoSideWays(player.speed)
    }

    public GoLeft() {
        this.GoSideWays(-player.speed)
    }

    public NextPosition(direction: Direction): Position {
        let multiplier = 1;
        if (direction == Direction.Backwards) {
            multiplier = -1;
        }
        return new Position(this.position.x + (multiplier * (this.speed) * Math.sin(this.view_direction * Math.PI / 180)), this.position.y + (multiplier * this.speed * Math.cos(this.view_direction * Math.PI / 180)));
    }

    Go(ammount: number) {
        this.position = new Position(this.position.x + (ammount * Math.sin(this.view_direction * Math.PI / 180)), this.position.y + (ammount * Math.cos(this.view_direction * Math.PI / 180)));
    }

    GoSideWays(ammount: number) {
        this.position = new Position(this.position.x + (ammount * Math.sin((this.view_direction + 90) % 360 * Math.PI / 180)), this.position.y + (ammount * Math.cos((this.view_direction + 90) % 360 * Math.PI / 180)));
    }
}


class KeyPressController {
    keys: Map<string, boolean>;

    constructor() {
        this.keys = new Map();
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
let viewAngle = 45;
let canvasWidth: number = canvas.width;
let canvasHeight: number = canvas.height;
let player: Player = new Player(canvasWidth / 2, canvasHeight / 2);
let keyController = new KeyPressController();
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

function Setup() {
    let l1 = new Line(new Position(0, 0), new Position(canvasWidth, 0));
    let l2 = new Line(new Position(canvasWidth, 0), new Position(canvasWidth, canvasHeight));
    let l3 = new Line(new Position(canvasWidth, canvasHeight), new Position(0, canvasHeight),);
    let l4 = new Line(new Position(0, canvasHeight), new Position(0, 0));
    let body = new CanvasBody();
    body.AddSide(l1);
    body.AddSide(l2);
    body.AddSide(l3);
    body.AddSide(l4);
    bodies.push(body);

    let divider = 50;
    let xMin = canvasWidth / divider;
    let yMin = canvasHeight / divider;

    let xMax = canvasWidth - xMin;
    let yMax = canvasHeight - yMin;

    for (let i = 0; i < GenerateRandomNumber(1, 3); i++) {
        let lines: Line[] = [new Line(new Position(GenerateRandomNumber(xMin, xMax), GenerateRandomNumber(yMin, yMax)), new Position(GenerateRandomNumber(xMin, xMax), GenerateRandomNumber(yMin, yMax)))]
        let body = new CanvasBody();
        let j = 0;
        for (; j < GenerateRandomNumber(1, 8); j++) {
            lines.push(new Line(lines[j].endPoint, new Position(GenerateRandomNumber(xMin, xMax), GenerateRandomNumber(yMin, yMax))));
        }

        if (GenerateRandomNumber(0, 4) == 0) {
            lines.push(new Line(lines[j].endPoint, lines[0].startPoint));
        }

        lines.forEach(line => {
            body.AddSide(line)
        });

        bodies.push(body);
    }

}

Main();
async function Main() {
    Setup();
    addEventListener("keydown", (e) => KeyDownListener(e, true), false);
    addEventListener("keyup", (e) => KeyDownListener(e, false), false);
    addEventListener("resize", (e) => WindowResizeListener(e), false);

    setInterval(() => {
        ClearCanvas();
        HandleKeys();
        DrawGround();
        Scan(player);
        if (keyController.keys.get("m")) {
            bodies.forEach(body => {
                body.Draw();
            });
        }
    }, 100);
}

async function Scan(player: Player) {
    let lineLengthMultiplier = 10000;
    let iterating_number = 0.025;
    let centerCounter = canvasWidth - (canvasWidth / (canvasWidth / viewAngle / iterating_number)) / 2;
    for (let i = -viewAngle / 2 / (1080 / canvasWidth); i < (viewAngle) / 2 / (1080 / canvasWidth); i += iterating_number) {
        let distance = getDistanceForSegment(player.position, new Position(player.position.x + Math.sin((i + player.view_direction) * Math.PI / 180) * lineLengthMultiplier, player.position.y + Math.cos((i + player.view_direction) * Math.PI / 180) * lineLengthMultiplier))

        DrawSegment(distance, new Position(centerCounter, canvasHeight / 2), iterating_number);

        centerCounter -= (canvasWidth / (canvasWidth / viewAngle / iterating_number));
    }
    if (keyController.keys.get("m")) {
        for (let i = -viewAngle / 2; i < viewAngle / 2; i += iterating_number) {
            DrawRay(player.position, new Position(player.position.x + Math.sin((i + player.view_direction) * Math.PI / 180) * lineLengthMultiplier, player.position.y + Math.cos((i + player.view_direction) * Math.PI / 180) * lineLengthMultiplier), green);
            DrawDot(player.position, red, 2);
        }
    }
}

function DrawSegment(distance: number, center: Position, modifier: number) {
    ctx.beginPath();
    let width: number = (canvasWidth / viewAngle * modifier) + 1;
    let distancePercent = (1500 / distance) * 15;
    let height: number = distancePercent;
    if (height > canvasHeight) {
        height = canvasHeight;
    }

    let color = 255 - (255 * (1 - distancePercent / 250));

    ctx.fillStyle = `rgb(${color},${color},${color},255)`;
    ctx.fillRect(center.x - width / 2, center.y - height / 2, width, height);
    ctx.stroke();
}

function DrawRect(start: Position, width: number, height: number, color: Color) {
    ctx.beginPath();
    ctx.fillStyle = `rgb(${color.Red},${color.Green},${color.Blue}, 255)`;
    ctx.fillRect(start.x, start.y, width, height);
    ctx.stroke();
}

function DrawGround() {
    let halfway = new Position(0, canvasHeight / 2);
    let color = 0;
    let segments = 8;
    for (let i = 0; i < segments; i++) {
        let color = 10 + 10 * i;
        DrawRect(new Position(halfway.x, halfway.y), canvasWidth, canvasHeight, { Red: 50 + color, Green: 50 + color, Blue: color, Alpha: 255 });
        halfway.y += canvasHeight / (segments * segments - segments * i)
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
    let startLine = new Line(start, end);
    let endPoint: Position = end;
    let intersectingPoints: Position[] = [end];
    bodies.forEach(body => {
        body.sides.forEach(line => {
            let intersectingPoint = startLine.Intersects(line);
            if (intersectingPoint) {

                intersectingPoints.push(intersectingPoint);
            }
        });
    });

    intersectingPoints.forEach(point => {
        if (start.Distance(endPoint) > start.Distance(point)) {
            endPoint = point;
        }
    });
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.strokeStyle = `rgb(${color.Red},${color.Green},${color.Blue},${color.Alpha})`;
    ctx.stroke();
}

function getDistanceForSegment(start: Position, end: Position): number {
    let startLine = new Line(start, end);
    let endPoint: Position = end;
    let intersectingPoints: Position[] = [end];
    bodies.forEach(body => {
        body.sides.forEach(line => {
            let intersectingPoint = startLine.Intersects(line);
            if (intersectingPoint) {

                intersectingPoints.push(intersectingPoint);
            }
        });
    });

    intersectingPoints.forEach(point => {
        if (start.Distance(endPoint) > start.Distance(point)) {
            endPoint = point;
        }
    });
    return start.Distance(endPoint);
}

function ClearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}


function Sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function HandleKeys() {
    keyController.keys.forEach((value, key) => {
        if (value) {
            switch (key) {
                case "ArrowLeft":
                    if (keyController.keys.get("s")) {
                        player.GoRight();
                    } else {
                        player.Turn(5);
                    }
                    break;

                case "ArrowRight":
                    if (keyController.keys.get("s")) {
                        player.GoLeft();

                    } else {
                        player.Turn(-5);
                    }
                    break;

                case "ArrowUp":
                    player.Forward();
                    break;

                case "ArrowDown":
                    player.Backwards();
                    break;
            }
        }
    });
}

function KeyDownListener(e: KeyboardEvent, modificationType: boolean) {
    switch (e.key) {
        case "s":
            keyController.keys.set(e.key, modificationType);
            break;

        case "m":
            keyController.keys.set(e.key, modificationType);
            break;

        case "ArrowLeft":
            keyController.keys.set(e.key, modificationType);
            break;

        case "ArrowRight":
            keyController.keys.set(e.key, modificationType);
            break;

        case "ArrowUp":
            keyController.keys.set(e.key, modificationType);
            break;

        case "ArrowDown":
            keyController.keys.set(e.key, modificationType);
            break;
    }
}

function WindowResizeListener(e: UIEvent) {
    canvas.width = screen.width;
    canvas.height = screen.height;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
}