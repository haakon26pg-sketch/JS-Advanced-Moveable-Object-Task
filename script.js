const player = document.querySelector("#player");
const border = document.querySelector("#border");
const obstacles = document.querySelectorAll(".obstacle");
const speedBost = document.querySelector("#speedBoost");

// player position
let x = 100;
let y = 100;

// player velocity
let vx = 0;
let vy = 0;

// mouse movement target
let targetX = null;
let targetY = null;

// movement settings

const acceleration = 0.6;
const friction = 0.85;
const maxSpeed = 7;

// store pressed keys
const keys = {};


// objective - add movement functionality with smoother movement

// detect when key is pressed

border.addEventListener("click", (event) => {
    const rect = border.getBoundingClientRect();

    targetX = event.clientX - rect.left - border.clientLeft - player.offsetWidth / 2;
    targetY = event.clientY - rect.top - border.clientTop - player.offsetHeight / 2;

});

document.addEventListener("keydown", (event) => {
    if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        
        targetX = null;
        targetY = null;
        
        keys[event.key] = true;
    }
});

// detect when key is released
document.addEventListener("keyup", (event) => {
    if (event.key.startsWith("Arrow")) {
        keys[event.key] = false;
    }

});

function update() {

// accelerate in different directions when keys are pressed

if(keys["ArrowRight"]) vx += acceleration;
if(keys["ArrowLeft"]) vx -= acceleration;
if(keys["ArrowUp"]) vy -= acceleration;
if(keys["ArrowDown"]) vy += acceleration;

// mouse movement target clicked location
if (targetX !== null && targetY !== null) {

    const dx = targetX - x;
    const dy = targetY - y;

    const distance = Math.hypot(dx,dy);


if (distance > 5) {

    vx += (dx / distance) * acceleration;
    vy += (dy / distance) * acceleration;
} else {

    // destination reached
    targetX = null;
    targetY = null;

    vx = 0;
    vy = 0;
    }

}



// apply friction
vx *= friction;
vy *= friction;

// limit maximum movement speed
vx = Math.max(-maxSpeed, Math.min(vx, maxSpeed));
vy = Math.max(-maxSpeed, Math.min(vy, maxSpeed));

// calculate players next position
const nextX = x + vx;
const nextY = y + vy;

// check for horizontal collision
const collisionX = [...obstacles].some(obstacle =>
    isColliding(nextX, y, obstacle)
);

// only move horizontally if there's no collision
if (!collisionX) {
    x = nextX;
} else {
    vx = 0;
}

// check for vertical collision
const collisionY = [...obstacles].some(obstacle =>
    isColliding(x, nextY, obstacle)
);

// only move vertically if there's no collision
if (!collisionY) {
    y = nextY;
} else {
    vy = 0;
}

// calculate maximum movement boundaries
const maxX = Math.max(0, border.clientWidth - player. offsetWidth);
const maxY = Math.max(0, border.clientHeight - player.offsetHeight);

// keep player inside border
x = Math.max(0, Math.min(x, maxX));
y = Math.max(0, Math.min(y, maxY));

// // stop velocity when touching wall
if (x === 0 || x === maxX) vx = 0;
if (y === 0 || y === maxY) vy = 0;

// update player CSS position
player.style.left = x + "px";
player.style.top = y + "px";

// request next animation frame
requestAnimationFrame(update);

}

update();

function isColliding (x, y, obstacle) {

    return (
        x < obstacle.offsetLeft + obstacle.offsetWidth &&
        x + player.offsetWidth > obstacle.offsetLeft &&
        y < obstacle.offsetTop + obstacle.offsetHeight &&
        y + player.offsetHeight > obstacle.offsetTop
    );
}
