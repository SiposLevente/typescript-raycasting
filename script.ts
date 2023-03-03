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
            let newLine = new Line(lines[i].endPoint, new Point(GenerateRandomNumber(xMin, xMax), GenerateRandomNumber(yMin, yMax)));
            if (!allowIntersection) {
                if (i != 0) {
                    let validLine = false;
                    while (!validLine) {
                        let invalidLine = false;
                        for (let j = 0; j < lines.length - 1; j++) {
                            if (newLine.Intersects(lines[j])) {
                                invalidLine = true;
                            }
                        }
                        if (invalidLine) {
                            newLine = new Line(lines[i].endPoint, new Point(GenerateRandomNumber(xMin, xMax), GenerateRandomNumber(yMin, yMax)));
                        }
                        else {
                            validLine = true;
                        }
                    }
                }
            }

            lines.push(newLine);
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
    viewDirection: number;
    speed: number;
    turnSpeed: number;

    constructor(x: number, y: number) {
        this.position = new Point(x, y);
        this.speed = 100;
        this.turnSpeed = 5;
        this.viewDirection = 0;
    }

    public GetViewDirection(): number {
        return this.viewDirection % 360;
    }

    public GetNextPosition(direction: Direction, delta: number): Point {
        let nextPosition: Point;

        switch (direction) {
            case Direction.Forward:
                nextPosition = this.Go(delta, Direction.Forward);
                break;

            case Direction.Backwards:
                nextPosition = this.Go(delta, Direction.Backwards);
                break;

            case Direction.Left:
                nextPosition = this.GoSideWays(delta, Direction.Left);
                break;

            case Direction.Right:
                nextPosition = this.GoSideWays(delta, Direction.Right);
                break;
        }
        return nextPosition;
    }

    public Go(delta: number, direction: Direction.Forward | Direction.Backwards): Point {
        let angle = ConvertDegreeToRadian(this.viewDirection);
        let multiplier = 1;
        if (direction == Direction.Backwards) {
            multiplier = -1
        }
        return this.position.AddVector(angle, multiplier * player.speed * delta)
    }

    public GoSideWays(delta: number, direction: Direction.Left | Direction.Right): Point {
        let angle = ConvertDegreeToRadian((this.viewDirection + 90) % 360);
        let multiplier = 1;
        if (direction == Direction.Left) {
            multiplier = -1
        }
        return this.position.AddVector(angle, multiplier * player.speed * delta);
    }

    public Turn(degree: number) {
        const newAngle = (this.viewDirection + degree * this.turnSpeed) % 360;
        this.viewDirection = (newAngle < 0) ? (360 + newAngle) : newAngle;
    }

    public SetPosition(newPosition: Point) {
        player.position = newPosition;
    }

    // public Forward(delta: number) {
    //     this.Go(player.speed * delta);
    // }

    // public Backwards(delta: number) {
    //     this.Go(-player.speed * delta);
    // }

    // public GoRight(delta: number) {
    //     this.GoSideWays(player.speed * delta)
    // }

    // public GoLeft(delta: number) {
    //     this.GoSideWays(-player.speed * delta)
    // }

    // private Move(angle: number, amount: number) {
    //     this.position = this.position.AddVector(angle, amount);
    // }

    // private Go(amount: number) {
    //     const angle = this.view_direction * Math.PI / 180;
    //     this.Move(angle, amount);
    // }

    // private GoSideWays(amount: number) {
    //     const angle = (this.view_direction + 90) % 360 * Math.PI / 180;
    //     this.Move(angle, amount);
    // }
}

// -------------------------------- Keypress Controller Class --------------------------------

const sprintKey = "s";
const strafeKey = "a";
const turnLeftKey = "ArrowLeft";
const turnRightKey = "ArrowRight";
const goForwardKey = "ArrowUp";
const goBackwardsKey = "ArrowDown";
const showMapKey = "t";

class KeyPressController {
    private static keys: Map<string, boolean> = new Map();
    private constructor() { }

    public static HandleKeys(delta: number) {
        let multiplier = this.getKey(sprintKey) ? 2 : 1;

        const ifValidMove = (direction: Direction) => {
            let nextPosition: Point = player.GetNextPosition(direction, delta * multiplier);
            let movementVector = new Line(player.position, nextPosition)
            let bodyCounter = 0;
            let sideCounter = 0;
            let invalidMovement = false;
            while (bodyCounter <= bodies.length - 1 && !invalidMovement) {
                sideCounter = 0;
                while (sideCounter <= bodies[bodyCounter].sides.length - 1 && !invalidMovement) {
                    if (bodies[bodyCounter].sides[sideCounter].Intersects(movementVector) != null) {
                        nextPosition = player.position;
                        invalidMovement = true;
                    }
                    sideCounter++;
                }
                bodyCounter++;
            }

            if (!invalidMovement) {
                player.SetPosition(nextPosition);
            }
        }

        const keyBinds = new Map([
            [turnLeftKey, () => {
                if (this.getKey(strafeKey)) {
                    ifValidMove(Direction.Left);
                } else {
                    player.Turn(-8 * delta * multiplier)
                }
            }],
            [turnRightKey, () => {
                if (this.getKey(strafeKey)) {
                    ifValidMove(Direction.Right);
                } else {
                    player.Turn(8 * delta * multiplier)
                }
            }],
            [goForwardKey, () => {
                ifValidMove(Direction.Forward);


            }],
            [goBackwardsKey, () => {
                ifValidMove(Direction.Backwards);
            }],
        ])

        this.keys.forEach((value, key) => {
            const bind = keyBinds.get(key);

            if (bind && value) {
                CanvasManager.isRefreshNeeded = true;
                bind()
            }
        });
    }

    public static Listen(e: KeyboardEvent, modificationType: boolean) {
        const keys: string[] = [strafeKey, sprintKey, showMapKey, turnLeftKey, turnRightKey, goForwardKey, goBackwardsKey];

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

function ConvertDegreeToRadian(degree: number): number {
    return degree * Math.PI / 180;
}

// -------------------------------- Drawing --------------------------------

class Segment {
    distance: number;
    position: Point;
    modifier: number;

    constructor(distance: number, position: Point, iterating_num: number) {
        this.distance = distance;
        this.position = position;
        this.modifier = iterating_num;
    }
}

class CanvasManager {
    private static canvas: HTMLCanvasElement;
    private static ctx: CanvasRenderingContext2D;
    public static isRefreshNeeded: boolean;

    private constructor() { };

    public static Setup(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth;
        this.isRefreshNeeded = true;

        this.ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    }

    public static GetWidth() { return this.canvas.width; }
    public static GetHeight() { return this.canvas.height; }

    static DrawFrame(player: Player) {
        if (this.isRefreshNeeded) {
            this.ClearCanvas();

            const [canvasWidth, canvasHeight] = [this.canvas.width, this.canvas.height];

            const lineLengthMultiplier = 10000;
            const iteratingNumber = 0.01;
            const segmentWidth = canvasWidth / viewAngle * iteratingNumber;

            const getPosition = (i: number) => {
                const angle = ConvertDegreeToRadian(i + player.viewDirection);
                return player.position.AddVector(angle, lineLengthMultiplier);
            }

            let centerCounter = segmentWidth / 2;
            let segmentArray: Segment[] = [];
            for (let i = -viewAngle / 2; i < (viewAngle + 1) / 2; i += iteratingNumber) {
                let distance = this.getDistanceForSegment(player.position, getPosition(i)) * Math.cos(ConvertDegreeToRadian(i));
                segmentArray.push(new Segment(distance, new Point(centerCounter, canvasHeight / 2), iteratingNumber))
                centerCounter += segmentWidth;
            }

            segmentArray.sort((x, y) => y.distance - x.distance).forEach(segment => {
                this.DrawSegment(segment)
            });


            if (KeyPressController.getKey(showMapKey)) {
                // for (let i = -viewAngle / 2; i < (viewAngle + 1) / 2; i += iteratingNumber) {
                //     this.DrawRay(player.position, getPosition(i), green);
                // }

                this.DrawPlayerArrow(player);

                if (KeyPressController.getKey(showMapKey)) {
                    bodies.forEach(body => {
                        body.Draw();
                    });
                }
            }
            console.log("redrawn")
            this.isRefreshNeeded = false;
        }
    }

    static DrawPlayerArrow(player: Player) {
        let line_length = 3;
        const rotatePoint = (point: Point) => {
            const player_rotation_x = -Math.sin(ConvertDegreeToRadian(player.GetViewDirection()))
            const player_rotation_y = Math.cos(ConvertDegreeToRadian(player.GetViewDirection()))
            let nx = (player_rotation_y * (point.x - player.position.x)) + (player_rotation_x * (point.y - player.position.y)) + player.position.x;
            let ny = (player_rotation_y * (point.y - player.position.y)) - (player_rotation_x * (point.x - player.position.x)) + player.position.y;
            return new Point(nx, ny);
        }

        const line_start_position = rotatePoint(new Point(player.position.x - line_length, player.position.y));
        const line_end_position = rotatePoint(new Point(player.position.x + line_length, player.position.y));

        const arrow_head_left = rotatePoint(new Point(player.position.x + line_length / 2, player.position.y + line_length / 2))
        const arrow_head_right = rotatePoint(new Point(player.position.x + line_length / 2, player.position.y - line_length / 2))

        this.DrawLine(line_start_position, line_end_position, red);
        this.DrawLine(arrow_head_left, line_end_position, red);
        this.DrawLine(arrow_head_right, line_end_position, red);
    }

    static DrawSegment(segment: Segment) {
        const [canvasWidth, canvasHeight] = [this.canvas.width, this.canvas.height];

        const width: number = (canvasWidth / viewAngle * segment.modifier) + 1;
        const distancePercent = (1500 / segment.distance) * 15;
        const height: number = Math.min(canvasHeight, distancePercent);
        const color = 255 - (255 * (1 - distancePercent / 500));

        this.ctx.fillStyle = `rgb(${color},${color},${color},255)`;
        this.ctx.fillRect(segment.position.x - width / 2, segment.position.y - height / 2, width, height);
    }

    static DrawRect(start: Point, width: number, height: number, color: Color) {
        this.setColor(color);
        this.ctx.fillRect(start.x, start.y, width, height);
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
        this.isRefreshNeeded = true;
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

CanvasManager.Setup(<HTMLCanvasElement>document.getElementById("wallCanvas"))

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

function Main() {
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
            //CanvasManager.ClearCanvas();
            KeyPressController.HandleKeys(elapsed / 1000);
            CanvasManager.DrawFrame(player);


            lastTime = now;
        }
    }

    loop(0)
}

Main();