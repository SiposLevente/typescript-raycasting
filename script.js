"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function GenerateRandomNumber(min, max) {
    if (max >= min) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    else {
        throw new RangeError("ERROR! Minimum number must be smaller or equal to maximum number!");
    }
}
// -------------------------------------------------------
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
canvas.height = screen.height;
canvas.width = screen.width;
let canvasWidth = canvas.width;
let canvasHeight = canvas.height;
let mouse_position;
let bodies = [];
let white = {
    Red: 255,
    Green: 255,
    Blue: 255,
    Alpha: 255,
};
let red = {
    Red: 255,
    Green: 0,
    Blue: 0,
    Alpha: 255,
};
let green = {
    Red: 0,
    Green: 255,
    Blue: 0,
    Alpha: 255,
};
let blue = {
    Red: 0,
    Green: 0,
    Blue: 255,
    Alpha: 255,
};
main();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let _ = 0; _ < 3; _++) {
            let color = {
                Red: GenerateRandomNumber(0, 255),
                Green: GenerateRandomNumber(0, 255),
                Blue: GenerateRandomNumber(0, 255),
                Alpha: GenerateRandomNumber(0, 255),
            };
            let width = GenerateRandomNumber(10, 1000);
            let height = GenerateRandomNumber(10, 700);
            let position = { x: GenerateRandomNumber(0, canvasWidth - width), y: GenerateRandomNumber(0, canvasHeight - height) };
            AddBody(position, color, width, height);
        }
        document.addEventListener('mousemove', onMouseUpdate, false);
        document.addEventListener('mouseenter', onMouseUpdate, false);
    });
}
function scan(precision, start_position, segments) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
function AddBody(position, color, width, height) {
    bodies.push({
        color: color,
        position: position,
        width: width,
        height: height,
    });
}
function BodyContainsPoint(body, position) {
    return (body.position.x <= position.x && body.position.y <= position.y && body.position.x + body.width >= position.x && body.position.y + body.height >= position.y);
}
function DrawDot(position, color, radius) {
    ctx.beginPath();
    ctx.fillStyle = `rgb(${color.Red},${color.Green},${color.Blue},${color.Alpha})`;
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    ctx.fill();
}
function DrawLine(start, end, color, segments = 1) {
    if (segments > 1) {
        let segment_size = { x: (end.x - start.x) / segments, y: (end.y - start.y) / segments };
        let stop_iteration = false;
        let previous_position_start = { x: start.x, y: start.y };
        let index = 0;
        while (index < segments && !stop_iteration) {
            ctx.beginPath();
            ctx.moveTo(previous_position_start.x, previous_position_start.y);
            previous_position_start.x += segment_size.x;
            previous_position_start.y += segment_size.y;
            for (let i = 0; i < bodies.length; i++) {
                if (BodyContainsPoint(bodies[i], previous_position_start)) {
                    stop_iteration = true;
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
    }
    else {
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
function Sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function onMouseUpdate(e) {
    mouse_position = { x: e.pageX, y: e.pageY };
    DrawScan(100, mouse_position);
}
function DrawScan(segments = 1, mouse_position) {
    //ClearCanvas();
    scan(10, mouse_position, segments);
}
