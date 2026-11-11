const player = document.querySelector("#player");
const border = document.querySelector("#border");
const obstacles = document.querySelectorAll(".obstacle");
const speedBoost = document.querySelector("#speedBoost");

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

// power-up settings
let boostUntil = 0;
const boostDuration = 4000;

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

    // check if speed bost is active
const boosted = performance.now() < boostUntil;

// adjust movement settings
const currentAcceleration = boosted ? acceleration * 2 : acceleration;
const currentMaxSpeed = boosted ? maxSpeed * 1.5 : maxSpeed;

// accelerate in different directions when keys are pressed

if(keys["ArrowRight"]) vx += currentAcceleration;
if(keys["ArrowLeft"]) vx -= currentAcceleration;
if(keys["ArrowUp"]) vy -= currentAcceleration;
if(keys["ArrowDown"]) vy += currentAcceleration;

// mouse movement target clicked location
if (targetX !== null && targetY !== null) {

    const dx = targetX - x;
    const dy = targetY - y;

    const distance = Math.hypot(dx,dy);


if (distance > 5) {

    vx += (dx / distance) * currentAcceleration;
    vy += (dy / distance) * currentAcceleration;
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
vx = Math.max(-currentMaxSpeed, Math.min(vx, currentMaxSpeed));
vy = Math.max(-currentMaxSpeed, Math.min(vy, currentMaxSpeed));

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

if (speedBoost && speedBoost.isConnected && isColliding(x, y, speedBoost)) {

    // activate speed boost for 4 seconds
    boostUntil = performance.now() + boostDuration;

    // remove collected power-up
    speedBoost.remove();

}

// change player color when boost is obtained
player.style.backgroundColor = boosted ? "orange" : "royalblue";

// update player CSS position
player.style.left = x + "px";
player.style.top = y + "px";



// request next animation frame
requestAnimationFrame(update);

}

// random booster location
// random booster location
function spawnSpeedBoost() {

    const maxX = border.clientWidth - speedBoost.offsetWidth;
    const maxY = border.clientHeight - speedBoost.offsetHeight;

    let spawnX;
    let spawnY;
    let validPosition = false;
    let attempts = 0;

    // try finding a valid position
    while (!validPosition && attempts < 100) {

        // generate random coordinates
        const padding = 15;

        spawnX = padding + Math.random() * Math.max(0, maxX - padding * 2);
        spawnY = padding + Math.random() * Math.max(0, maxY - padding * 2);

        // check collision with obstacles
        const hitsObstacle = [...obstacles].some(obstacle =>
            spawnX < obstacle.offsetLeft + obstacle.offsetWidth &&
            spawnX + speedBoost.offsetWidth > obstacle.offsetLeft &&
            spawnY < obstacle.offsetTop + obstacle.offsetHeight &&
            spawnY + speedBoost.offsetHeight > obstacle.offsetTop
        );

        // check collision with player
        const hitsPlayer =
            spawnX < x + player.offsetWidth &&
            spawnX + speedBoost.offsetWidth > x &&
            spawnY < y + player.offsetHeight &&
            spawnY + speedBoost.offsetHeight > y;

        // accept position if nothing overlaps
        if (!hitsObstacle && !hitsPlayer) {
            validPosition = true;
        }

        attempts++;
    }

    // apply the random position
    if (validPosition) {
        speedBoost.style.left = spawnX + "px";
        speedBoost.style.top = spawnY + "px";
    } else {
        speedBoost.style.display = "none";
        console.warn("No valid booster position found.");
    }
}

// random booster placement
spawnSpeedBoost();

// start movement loop
update();

function isColliding (x, y, obstacle) {

    return (
        x < obstacle.offsetLeft + obstacle.offsetWidth &&
        x + player.offsetWidth > obstacle.offsetLeft &&
        y < obstacle.offsetTop + obstacle.offsetHeight &&
        y + player.offsetHeight > obstacle.offsetTop
    );
};
