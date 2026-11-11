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

// respawn settings
const boostRespawnDelay = 8000;
const obstacleRespawnDelay = 6000;

// obstacle destruction settings
const attackRange = 45;

// store pressed keys
const keys = {};


// objective - add movement functionality with smoother movement

// detect when key is pressed

border.addEventListener("click", (event) => {
    const rect = border.getBoundingClientRect();

    targetX = event.clientX - rect.left - border.clientLeft - player.offsetWidth / 2;
    targetY = event.clientY - rect.top - border.clientTop - player.offsetHeight / 2;

});


// detect when key is pressed
document.addEventListener("keydown", (event) => {

// destroy obstacles with spacebar
if (event.code === "Space") {
    event.preventDefault();

    if (!event.repeat) {
        destroyNearbyObstacle();
    }

    return;
}

// arrow key movement
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
    obstacle.style.display !== "none" &&
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
    obstacle.style.display !== "none" &&
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

// check if speed boost is collected
if (
    speedBoost &&
    speedBoost.style.display !== "none" &&
    isColliding(x, y, speedBoost)
) {

    // activate speed boost for 4 seconds
    boostUntil = performance.now() + boostDuration;

    // hide collected booster
    speedBoost.style.display = "none";

    // respawn booster after 8 seconds
    setTimeout(() => {
        placeRandomly(speedBoost);
    }, boostRespawnDelay);
}

// change player color when boost is obtained
player.style.backgroundColor = boosted ? "orange" : "royalblue";

// update player CSS position
player.style.left = x + "px";
player.style.top = y + "px";



// request next animation frame
requestAnimationFrame(update);

}

// destroy obstacle near player
function destroyNearbyObstacle() {

    const playerCenterX = x + player.offsetWidth / 2;
    const playerCenterY = y + player.offsetHeight / 2;

    // find a nearby obstacle
    const nearbyObstacle = [...obstacles].find(obstacle => {

        // ignore destroyed obstacles
        if (obstacle.style.display === "none") {
            return false;
        }

        // find closest point on obstacle
        const closestX = Math.max(
            obstacle.offsetLeft,
            Math.min(playerCenterX, obstacle.offsetLeft + obstacle.offsetWidth)
        );

        const closestY = Math.max(
            obstacle.offsetTop,
            Math.min(playerCenterY, obstacle.offsetTop + obstacle.offsetHeight)
        );

        // calculate distance
        const distance = Math.hypot(
            playerCenterX - closestX,
            playerCenterY - closestY
        );

        return distance <= attackRange;
    });

    // destroy nearby obstacle
    if (nearbyObstacle) {

        nearbyObstacle.style.display = "none";

        // respawn after 6 seconds
        setTimeout(() => {
            placeRandomly(nearbyObstacle);
        }, obstacleRespawnDelay);
    }
}


// check if two rectacles overlap
function rectanglesOverlap (ax, ay, aw, ah, bx, by, bw, bh) {

    return (
        ax < bx + bw &&
        ax + aw > bx &&
        ay < by + bh &&
        ay + ah > by
    );
}

// place an element randomly inside the play area
function placeRandomly(element) {

    if (!element) return;

    // make the element visible for measurement
    element.style.display = "";

    const width = element.offsetWidth;
    const height = element.offsetHeight;

    const maxX = border.clientWidth - width;
    const maxY = border.clientHeight - height;

    // ensure the element fits inside the arena
    if (maxX < 0 || maxY < 0) {
        element.style.display = "none";
        return;
    }

    const paddingX = Math.min(15, maxX / 2);
    const paddingY = Math.min(15, maxY / 2);


    // all objects we need to avoid
    const objects = [...obstacles, speedBoost].filter(Boolean);

    let validPosition = false;

    // attempt to find a free position
    for (let attempts = 0; attempts < 100; attempts++) {

        const spawnX = paddingX + Math.random() * (maxX - paddingX * 2);
        const spawnY = paddingY + Math.random() * (maxY - paddingY * 2);

    // check player overlap
    const hitsPlayer = rectanglesOverlap(
        spawnX, spawnY, width, height,
        x, y, player.offsetWidth, player.offsetHeight
    );

    // check overlap with other active objects
    const hitsObject = objects.some(other => {

        if (other === element || other.style.display === "none") {
            return false;
        }

        return rectanglesOverlap(
            spawnX, spawnY, width, height,
            other.offsetLeft, other.offsetTop,
            other.offsetWidth, other.offsetHeight
        );
        });

    // accept valid position
    if (!hitsPlayer && !hitsObject) {

        element.style.left = spawnX + "px";
        element.style.top = spawnY + "px";

        validPosition = true;
        break;
    }

}

// hide object if no free position was found
if (!validPosition) {
    element.style.display = "none";
    console.warn("Could not find a valid spawn position.");
}

}

// hide objects before random placement
obstacles.forEach(obstacle => {
    obstacle.style.display = "none";
});

if (speedBoost) {
    speedBoost.style.display = "none";
}

// randomize obstacle positions
obstacles.forEach(obstacle => {
    placeRandomly(obstacle);
});

// randomize booster position
placeRandomly(speedBoost);

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
