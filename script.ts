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

    public AddVector(angle: number, amount: number): Point {
        return new Point(this.x + amount * Math.cos(angle), this.y + amount * Math.sin(angle))
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
        const sides = GenerateRandomNumber(1, 32);
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

        if (GenerateRandomNumber(0, 10) == 0) {
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
        CanvasManager.DrawLine(this.startPoint, this.endPoint, red);
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
    Backwards,
    Left,
    Right
}

class Player {
    position: Point;
    view_direction: number;
    speed: number;
    turn_speed: number;

    constructor(x: number, y: number) {
        this.position = new Point(x, y);
        this.speed = 100;
        this.turn_speed = 5;
        this.view_direction = 0;
    }

    public GetViewDirection(): number {
        return this.view_direction % 360;
    }

    public Turn(degree: number) {
        const newAngle = (this.view_direction + degree * this.turn_speed) % 360;
        this.view_direction = (newAngle < 0) ? (360 + newAngle) : newAngle;
    }

    public Forward(delta: number) {
        this.Go(player.speed * delta);
    }

    public Backwards(delta: number) {
        this.Go(-player.speed * delta);
    }

    public GoRight(delta: number) {
        this.GoSideWays(player.speed * delta)
    }

    public GoLeft(delta: number) {
        this.GoSideWays(-player.speed * delta)
    }

    private Move(angle: number, amount: number) {
        this.position = this.position.AddVector(angle, amount);
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

    public static HandleKeys(delta: number) {
        let multiplier = 1;
        if (this.getKey("s")) {
            multiplier = 2;
        }

        const keyBinds = new Map([
            ["ArrowLeft", () => { this.getKey("a") ? player.GoLeft(delta * multiplier) : player.Turn(-8 * delta * multiplier) }],
            ["ArrowRight", () => { this.getKey("a") ? player.GoRight(delta * multiplier) : player.Turn(8 * delta * multiplier) }],
            ["ArrowUp", () => { player.Forward(delta * multiplier) }],
            ["ArrowDown", () => { player.Backwards(delta * multiplier) }],
        ])

        this.keys.forEach((value, key) => {
            const bind = keyBinds.get(key);

            if (bind && value) {
                bind()
            }
        });
    }

    public static Listen(e: KeyboardEvent, modificationType: boolean) {
        const keys: string[] = ["a", "s", "m", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

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

class CanvasManager {
    private static canvas: HTMLCanvasElement;
    private static ctx: CanvasRenderingContext2D;

    private constructor() { };

    public static Setup(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth;

        this.ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    }

    public static GetWidth() { return this.canvas.width; }
    public static GetHeight() { return this.canvas.height; }

    static async DrawFrame(player: Player) {
        const [canvasWidth, canvasHeight] = [this.canvas.width, this.canvas.height];

        const lineLengthMultiplier = 10000;
        const iteratingNumber = 0.025;
        const segmentWidth = canvasWidth / viewAngle * iteratingNumber;

        const getPosition = (i: number) => {
            const angle = (i + player.view_direction) * Math.PI / 180
            return player.position.AddVector(angle, lineLengthMultiplier);
        }

        let centerCounter = segmentWidth / 2;
        for (let i = -viewAngle / 2; i < (viewAngle + 1) / 2; i += iteratingNumber) {
            let distance = this.getDistanceForSegment(player.position, getPosition(i)) * Math.cos(i * Math.PI / 180);
            this.DrawSegment(distance, new Point(centerCounter, canvasHeight / 2), iteratingNumber);
            centerCounter += segmentWidth;
        }

        if (KeyPressController.getKey("m")) {
            for (let i = -viewAngle / 2; i < (viewAngle + 1) / 2; i += iteratingNumber) {
                this.DrawRay(player.position, getPosition(i), green);
            }

            this.DrawDot(player.position, red, 2);
        }
    }

    static DrawSegment(distance: number, center: Point, modifier: number) {
        const [canvasWidth, canvasHeight] = [this.canvas.width, this.canvas.height];

        const width: number = (canvasWidth / viewAngle * modifier) + 1;
        const distancePercent = (1500 / distance) * 15;
        const height: number = Math.min(canvasHeight, distancePercent);
        const color = 255 - (255 * (1 - distancePercent / 250));

        this.ctx.fillStyle = `rgb(${color},${color},${color},255)`;
        this.ctx.fillRect(center.x - width / 2, center.y - height / 2, width, height);
    }

    static DrawRect(start: Point, width: number, height: number, color: Color) {
        this.setColor(color);
        this.ctx.fillRect(start.x, start.y, width, height);
    }

    static DrawGround() {
        const [canvasWidth, canvasHeight] = [this.canvas.width, this.canvas.height];
        const halfway = new Point(0, canvasHeight / 2);
        const color = 0;
        const segments = 8;
        for (let i = 0; i < segments; i++) {
            const color = 10 + 10 * i;
            this.DrawRect(new Point(halfway.x, halfway.y), canvasWidth, canvasHeight, { Red: 50 + color, Green: 50 + color, Blue: color, Alpha: 255 });
            halfway.y += canvasHeight / (segments * segments - segments * i)
        }
    }

    static DrawDot(position: Point, color: Color, radius: number) {
        this.ctx.beginPath();
        this.setColorAlpha(color);
        this.ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    static DrawLine(start: Point, end: Point, color: Color) {
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.setColorAlpha(color);
        this.ctx.stroke();
    }

    static DrawRay(start: Point, end: Point, color: Color) {
        const rayEnd = this.getIntersectingPosition(start, end);
        this.DrawLine(start, rayEnd, color);
    }

    static getIntersectingPosition(start: Point, end: Point): Point {
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

    static getDistanceForSegment(start: Point, end: Point): number {
        const closestPoint = this.getIntersectingPosition(start, end);

        return start.Distance(closestPoint);
    }

    static ClearCanvas() {
        const [canvasWidth, canvasHeight] = [this.canvas.width, this.canvas.height];
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    static onResize(e: UIEvent) {
        this.canvas.width = screen.width;
        this.canvas.height = screen.height;
    }

    private static setColor(color: Color) {
        this.ctx.strokeStyle = `rgb(${color.Red},${color.Green},${color.Blue},255)`;
        this.ctx.fillStyle = `rgb(${color.Red},${color.Green},${color.Blue},255)`;
    };

    private static setColorAlpha(color: Color) {
        this.ctx.strokeStyle = `rgb(${color.Red},${color.Green},${color.Blue},${color.Alpha})`;
        this.ctx.fillStyle = `rgb(${color.Red},${color.Green},${color.Blue},${color.Alpha})`;
    };
}

// -------------------------------- Global Variables --------------------------------

const white: Color = new Color(255, 255, 255, 255);
const black: Color = new Color(0, 0, 0, 255);
const red: Color = new Color(255, 0, 0, 255);
const green: Color = new Color(0, 255, 0, 255);
const blue: Color = new Color(0, 0, 255, 255);

CanvasManager.Setup(<HTMLCanvasElement>document.getElementById("myCanvas"))

const viewAngle = 45;
const player: Player = new Player(CanvasManager.GetWidth() / 2, CanvasManager.GetHeight() / 2);
const bodies: CanvasBody[] = [];

// -------------------------------- Game Logic --------------------------------

function Setup() {
    const [cW, cH] = [CanvasManager.GetWidth(), CanvasManager.GetHeight()];
    const l1 = new Line(new Point(0, 0), new Point(cW, 0));
    const l2 = new Line(new Point(cW, 0), new Point(cW, cH));
    const l3 = new Line(new Point(cW, cH), new Point(0, cH));
    const l4 = new Line(new Point(0, cH), new Point(0, 0));

    const body = new CanvasBody([l1, l2, l3, l4]);
    bodies.push(body);

    const divider = 50;
    const xMin = cW / divider;
    const yMin = cH / divider;

    const xMax = cW - xMin;
    const yMax = cH - yMin;

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
    addEventListener("resize", (e) => CanvasManager.onResize(e), false);

    let lastTime = 0;
    let requiredElapsed = 1000 / 60; // 60 FPS

    requestAnimationFrame(loop);

    function loop(now: number) {
        requestAnimationFrame(loop);

        if (!lastTime) { lastTime = now; }
        const elapsed = now - lastTime;

        if (elapsed > requiredElapsed) {
            CanvasManager.ClearCanvas();
            KeyPressController.HandleKeys(elapsed / 1000);
            CanvasManager.DrawGround();
            CanvasManager.DrawFrame(player);
            if (KeyPressController.getKey("m")) {
                bodies.forEach(body => {
                    body.Draw();
                });
            }

            lastTime = now;
        }
    }

    loop(0)
}

Main();