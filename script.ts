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

        const lS = this.startPoint;
        const lE = this.endPoint;
        const bS = boundry.startPoint;
        const bE = boundry.endPoint

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

        return new Position(pxTop / divisor, pyTop / divisor)
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

    private Move(angle: number, amount: number) {
        this.position = new Position(
            this.position.x + (amount * Math.sin(angle)), 
            this.position.y + (amount * Math.cos(angle))
        );
    }

    Go(amount: number) {
        const angle = this.view_direction * Math.PI / 180;
        this.Move(angle, amount);
    }

    GoSideWays(amount: number) {
        const angle = (this.view_direction + 90) % 360 * Math.PI / 180
        this.Move(angle, amount);
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
    setInterval(GameLoop, 100);
}

function GameLoop() {
    ClearCanvas();
    HandleKeys();
    DrawGround();
    Scan(player);
    if (keyController.keys.get("m")) {
        bodies.forEach(body => {
            body.Draw();
        });
    }
}

async function Scan(player: Player) {
    let lineLengthMultiplier = 10000;
    let iterating_number = 0.025;

    let centerCounter = canvasWidth - (canvasWidth / (canvasWidth / viewAngle / iterating_number)) / 2;
    for (let i = -viewAngle / 2; i < (viewAngle) / 2; i += iterating_number) {
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
    let width: number = (canvasWidth / viewAngle * modifier)+1;
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
    const rayEnd = getIntersectingPosition(start, end);
    DrawLine(start, rayEnd, color);
}

function getIntersectingPosition(start: Position, end: Position): Position {
    const line = new Line(start, end);

    let closestPoint = end;
    let closestDistance = start.Distance(end);

    for (const body of bodies) {
        for (const side of body.sides) {
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

function getDistanceForSegment(start: Position, end: Position): number {
    const startLine = new Line(start, end);
    const closestPoint = getIntersectingPosition(start, end);

    return start.Distance(closestPoint);
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
    const keys: string[] = ["s", "m", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"] satisfies Array<KeyboardEvent["key"]>;

    if (keys.includes(e.key)) {
        keyController.keys.set(e.key, modificationType);
    }
}