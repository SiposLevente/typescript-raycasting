// -------------------------------- Geometry Objects --------------------------------
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

class Point {
    constructor(public x: number, public y: number) { }

    public Distance(otherPoint: Point): number {
        return Math.sqrt(Math.pow((otherPoint.x - this.x), 2) + Math.pow(otherPoint.y - this.y, 2));
    }
}

class CanvasBody {
    constructor(public sides: Line[]) { }

    generateSides(xMin: number, xMax: number, yMin: number, yMax: number, allowIntersection: boolean = false) {
        const lines: Line[] = [
            new Line(
                new Point(GenerateRandomNumber(xMin, xMax), GenerateRandomNumber(yMin, yMax)),
                new Point(GenerateRandomNumber(xMin, xMax), GenerateRandomNumber(yMin, yMax)))]

        let i = 0;
        const sides = GenerateRandomNumber(1, 16);
        for (; i < sides; i++) {
            let new_line = new Line(lines[i].endPoint, new Point(GenerateRandomNumber(xMin, xMax), GenerateRandomNumber(yMin, yMax)));
            if (!allowIntersection) {
                if (i != 0) {
                    let validLine = false;
                    while (!validLine) {
                        let invalidLine = false;
                        for (let j = 0; j < lines.length - 1; j++) {
                            if (new_line.Intersects(lines[j])) {
                                invalidLine = true;
                            }
                        }
                        if (invalidLine) {
                            new_line = new Line(lines[i].endPoint, new Point(GenerateRandomNumber(xMin, xMax), GenerateRandomNumber(yMin, yMax)));
                        }
                        else {
                            validLine = true;
                        }
                    }
                }
            }

            lines.push(new_line);
        }

        if (GenerateRandomNumber(0, 6) == 0) {
            lines.push(new Line(lines[i].endPoint, lines[0].startPoint));
        }

        this.sides = lines;
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
    startPoint: Point;
    endPoint: Point;

    constructor(start: Point, end: Point) {
        this.startPoint = new Point(start.x, start.y);
        this.endPoint = new Point(end.x, end.y);
    }

    public Draw() {
        DrawLine(this.startPoint, this.endPoint, red);
    }

    public Intersects(boundary: Line): Point | null {
        // this start x1 y1 -  end x2 y2
        // boundry x3 y3 -  end x4 y4

        const lS = this.startPoint;
        const lE = this.endPoint;
        const bS = boundary.startPoint;
        const bE = boundary.endPoint

        const divisor = (lS.x - lE.x) * (bS.y - bE.y) - (lS.y - lE.y) * (bS.x - bE.x)

        if (divisor == 0) {
            return null;
        }

        const lbSXDist = lS.x - bS.x;
        const lbSYDist = lS.y - bS.y;

        const t = (lbSXDist * (bS.y - bE.y) - lbSYDist * (bS.x - bE.x)) / divisor;
        const u = (lbSXDist * (lS.y - lE.y) - lbSYDist * (lS.x - lE.x)) / divisor;

        if ((t < 0 || t > 1) || ((u < 0 || u > 1))) {
            return null;
        }

        const lMul = (lS.x * lE.y - lS.y * lE.x)
        const bMul = (bS.x * bE.y - bS.y * bE.x)

        const pxTop: number = lMul * (bS.x - bE.x) - bMul * (lS.x - lE.x);
        const pyTop: number = lMul * (bS.y - bE.y) - bMul * (lS.y - lE.y);

        return new Point(pxTop / divisor, pyTop / divisor)
    }
}

// -------------------------------- Player Class --------------------------------

const enum Direction {
    Forward,
    Backwards
}

class Player {
    position: Point;
    view_direction: number;
    speed: number;
    turn_speed: number;

    constructor(x: number, y: number) {
        this.position = new Point(x, y);
        this.speed = 10;
        this.turn_speed = 5;
        this.view_direction = 0;
    }

    public GetViewDirection(): number {
        return this.view_direction % 360;
    }

    public Turn(degree: number) {
        this.view_direction = (this.view_direction + degree * this.turn_speed) % 360;
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

    private Move(angle: number, amount: number) {
        this.position = new Point(
            this.position.x + (amount * Math.sin(angle)),
            this.position.y + (amount * Math.cos(angle))
        );
    }

    private Go(amount: number) {
        const angle = this.view_direction * Math.PI / 180;
        this.Move(angle, amount);
    }

    private GoSideWays(amount: number) {
        const angle = (this.view_direction + 90) % 360 * Math.PI / 180
        this.Move(angle, amount);
    }
}

// -------------------------------- Keypress Controller Class --------------------------------

class KeyPressController {
    private static keys: Map<string, boolean> = new Map();
    private constructor() { }

    public static HandleKeys() {
        this.keys.forEach((value, key) => {
            if (value) {
                switch (key) {
                    case "ArrowLeft":
                        if (this.keys.get("s")) {
                            player.GoRight();
                        } else {
                            player.Turn(1);
                        }
                        break;

                    case "ArrowRight":
                        if (this.keys.get("s")) {
                            player.GoLeft();

                        } else {
                            player.Turn(-1);
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

    public static Listen(e: KeyboardEvent, modificationType: boolean) {
        const keys: string[] = ["s", "m", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

        if (keys.includes(e.key)) {
            this.keys.set(e.key, modificationType);
        }
    }

    public static getKey(key: string): boolean {
        return this.keys.get(key) ?? false;
    }
}

// -------------------------------- Genric Functions --------------------------------

function GenerateRandomNumber(min: number, max: number): number {
    if (max >= min) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        throw new RangeError("ERROR! Minimum number must be smaller or equal to maximum number!");
    }
}

function Sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// -------------------------------- Drawing --------------------------------

async function DrawFrame(player: Player) {

    const lineLengthMultiplier = 10000;
    const iteratingNumber = 0.025;
    const segmentWidth = canvasWidth / viewAngle * iteratingNumber;
    const getPosition = (i: number) => { return new Point(player.position.x + Math.sin((i + player.view_direction) * Math.PI / 180) * lineLengthMultiplier, player.position.y + Math.cos((i + player.view_direction) * Math.PI / 180) * lineLengthMultiplier); }

    let centerCounter = canvasWidth - segmentWidth / 2;
    for (let i = -viewAngle / 2; i < (viewAngle + 1) / 2; i += iteratingNumber) {
        let distance = getDistanceForSegment(player.position, getPosition(i))
        DrawSegment(distance, new Point(centerCounter, canvasHeight / 2), iteratingNumber);
        centerCounter -= segmentWidth;
    }

    if (KeyPressController.getKey("m")) {
        for (let i = -viewAngle / 2; i < (viewAngle + 1) / 2; i += iteratingNumber) {
            DrawRay(player.position, getPosition(i), green);
            DrawDot(player.position, red, 2);
        }
    }
}

function DrawSegment(distance: number, center: Point, modifier: number) {
    ctx.beginPath();

    const width: number = (canvasWidth / viewAngle * modifier) + 1;
    const distancePercent = (1500 / distance) * 15;
    const height: number = Math.min(canvasHeight, distancePercent);
    const color = 255 - (255 * (1 - distancePercent / 250));

    ctx.fillStyle = `rgb(${color},${color},${color},255)`;
    ctx.fillRect(center.x - width / 2, center.y - height / 2, width, height);
    ctx.stroke();
}

function DrawRect(start: Point, width: number, height: number, color: Color) {
    ctx.beginPath();
    ctx.fillStyle = `rgb(${color.Red},${color.Green},${color.Blue}, 255)`;
    ctx.fillRect(start.x, start.y, width, height);
    ctx.stroke();
}

function DrawGround() {
    const halfway = new Point(0, canvasHeight / 2);
    const color = 0;
    const segments = 8;
    for (let i = 0; i < segments; i++) {
        const color = 10 + 10 * i;
        DrawRect(new Point(halfway.x, halfway.y), canvasWidth, canvasHeight, { Red: 50 + color, Green: 50 + color, Blue: color, Alpha: 255 });
        halfway.y += canvasHeight / (segments * segments - segments * i)
    }
}

function DrawDot(position: Point, color: Color, radius: number) {
    ctx.beginPath();
    ctx.fillStyle = `rgb(${color.Red},${color.Green},${color.Blue},${color.Alpha})`;
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    ctx.fill();
}

function DrawLine(start: Point, end: Point, color: Color) {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = `rgb(${color.Red},${color.Green},${color.Blue},${color.Alpha})`;
    ctx.stroke();
}

function DrawRay(start: Point, end: Point, color: Color) {
    const rayEnd = getIntersectingPosition(start, end);
    DrawLine(start, rayEnd, color);
}

function getIntersectingPosition(start: Point, end: Point): Point {
    const line = new Line(start, end);

    let closestPoint = end;
    let closestDistance = start.Distance(end);

    for (let body of bodies) {
        for (let side of body.sides) {
            const intersection = line.Intersects(side);

            if (intersection) {
                const distance = start.Distance(intersection)

                if (distance < closestDistance) {
                    closestPoint = intersection;
                    closestDistance = distance;
                }
            }
        }
    }

    return closestPoint;
}

function getDistanceForSegment(start: Point, end: Point): number {
    const closestPoint = getIntersectingPosition(start, end);

    return start.Distance(closestPoint);
}

function ClearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}


// -------------------------------- Event Handling --------------------------------

function WindowResizeListener(e: UIEvent) {
    canvas.width = screen.width;
    canvas.height = screen.height;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
}

// -------------------------------- Global Variables --------------------------------

const white: Color = {
    Red: 255,
    Green: 255,
    Blue: 255,
    Alpha: 255,
}
const black: Color = {
    Red: 0,
    Green: 0,
    Blue: 0,
    Alpha: 0,
}
const red: Color = {
    Red: 255,
    Green: 0,
    Blue: 0,
    Alpha: 255,
}
const green: Color = {
    Red: 0,
    Green: 255,
    Blue: 0,
    Alpha: 255,
}
const blue: Color = {
    Red: 0,
    Green: 0,
    Blue: 255,
    Alpha: 255,
}

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("myCanvas");
const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

let canvasWidth: number = canvas.width;
let canvasHeight: number = canvas.height;

const viewAngle = 45;
const player: Player = new Player(canvasWidth / 2, canvasHeight / 2);
const bodies: CanvasBody[] = [];

// -------------------------------- Game Logic --------------------------------

function Setup() {
    const l1 = new Line(new Point(0, 0), new Point(canvasWidth, 0));
    const l2 = new Line(new Point(canvasWidth, 0), new Point(canvasWidth, canvasHeight));
    const l3 = new Line(new Point(canvasWidth, canvasHeight), new Point(0, canvasHeight),);
    const l4 = new Line(new Point(0, canvasHeight), new Point(0, 0));

    const body = new CanvasBody([l1, l2, l3, l4]);
    bodies.push(body);

    const divider = 50;
    const xMin = canvasWidth / divider;
    const yMin = canvasHeight / divider;

    const xMax = canvasWidth - xMin;
    const yMax = canvasHeight - yMin;

    for (let i = 0; i < GenerateRandomNumber(1, 1); i++) {
        const body = new CanvasBody([])
        body.generateSides(xMin, xMax, yMin, yMax);
        bodies.push(body);
    }
}

async function Main() {
    Setup();

    addEventListener("keydown", (e) => KeyPressController.Listen(e, true), false);
    addEventListener("keyup", (e) => KeyPressController.Listen(e, false), false);
    addEventListener("resize", (e) => WindowResizeListener(e), false);

    setInterval(() => {
        ClearCanvas();
        KeyPressController.HandleKeys();
        DrawGround();
        DrawFrame(player);
        if (KeyPressController.getKey("m")) {
            bodies.forEach(body => {
                body.Draw();
            });
        }
    }, 100);
}

Main();