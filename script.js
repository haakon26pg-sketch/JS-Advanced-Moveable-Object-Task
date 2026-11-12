
// Select game elements
const player = document.querySelector("#player");
const border = document.querySelector("#border");
const obstacles = document.querySelectorAll(".obstacle");
const speedBoosts = document.querySelectorAll(".speed-boost");
const attackPrompt = document.querySelector("#attackPrompt");

// Player position
let x = 100;
let y = 100;

// Player velocity
let vx = 0;
let vy = 0;

// Mouse movement target
let targetX = null;
let targetY = null;

// Movement settings
const acceleration = 0.6;
const friction = 0.85;
const maxSpeed = 7;

// Power-up settings
let boostUntil = 0;
const boostDuration = 4000;

// Respawn settings
const boostRespawnDelay = 8000;
const obstacleRespawnDelay = 2500;

// Obstacle destruction settings
const attackRange = 45;

// Store pressed arrow keys
const keys = {};

// Click to move: convert mouse coordinates to positions inside the arena
border.addEventListener("click", (event) => {
    const rect = border.getBoundingClientRect();

    targetX = event.clientX - rect.left - border.clientLeft - player.offsetWidth / 2;
    targetY = event.clientY - rect.top - border.clientTop - player.offsetHeight / 2;
});

// Detect movement and attacks
// Only ONE keydown listener is needed
document.addEventListener("keydown", (event) => {
    // Press Spacebar to destroy a nearby obstacle
    if (event.code === "Space") {
        event.preventDefault();

        if (!event.repeat) {
            destroyNearbyObstacle();
        }
        return;
    }

    // Pressing an arrow key cancels click-to-move
    if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        targetX = null;
        targetY = null;
        keys[event.key] = true;
    }
});

// Stop accelerating when an arrow key is released
document.addEventListener("keyup", (event) => {
    if (event.key.startsWith("Arrow")) {
        keys[event.key] = false;
    }
});

// Avoid stuck movement when switching away from the tab
window.addEventListener("blur", () => {
    for (const key of Object.keys(keys)) {
        keys[key] = false;
    }
});

// Main animation loop
function update() {
    // Check whether the speed boost is active
    const boosted = performance.now() < boostUntil;
    const currentAcceleration = boosted ? acceleration * 2 : acceleration;
    const currentMaxSpeed = boosted ? maxSpeed * 1.5 : maxSpeed;

    // Accelerate in the direction of held arrow keys
    if (keys["ArrowRight"]) vx += currentAcceleration;
    if (keys["ArrowLeft"]) vx -= currentAcceleration;
    if (keys["ArrowUp"]) vy -= currentAcceleration;
    if (keys["ArrowDown"]) vy += currentAcceleration;

    // Click-to-move movement
    if (targetX !== null && targetY !== null) {
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.hypot(dx, dy);

        if (distance > 5) {
            vx += (dx / distance) * currentAcceleration;
            vy += (dy / distance) * currentAcceleration;
        } else {
            targetX = null;
            targetY = null;
            vx = 0;
            vy = 0;
        }
    }

    // Apply friction for smooth stopping
    vx *= friction;
    vy *= friction;

    // Limit maximum movement speed
    vx = Math.max(-currentMaxSpeed, Math.min(vx, currentMaxSpeed));
    vy = Math.max(-currentMaxSpeed, Math.min(vy, currentMaxSpeed));

    // Calculate player's next position
    const nextX = x + vx;
    const nextY = y + vy;

    // Check horizontal collision with visible obstacles
    const collisionX = [...obstacles].some(obstacle =>
        obstacle.style.display !== "none" && isColliding(nextX, y, obstacle)
    );

    if (!collisionX) {
        x = nextX;
    } else {
        vx = 0;
    }

    // Check vertical collision with visible obstacles
    const collisionY = [...obstacles].some(obstacle =>
        obstacle.style.display !== "none" && isColliding(x, nextY, obstacle)
    );

    if (!collisionY) {
        y = nextY;
    } else {
        vy = 0;
    }

    // Keep player inside the arena
    const maxX = Math.max(0, border.clientWidth - player.offsetWidth);
    const maxY = Math.max(0, border.clientHeight - player.offsetHeight);

    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    // Stop velocity when touching an outer wall
    if (x === 0 || x === maxX) vx = 0;
    if (y === 0 || y === maxY) vy = 0;

// check all speed boosters for collection
speedBoosts.forEach(boost => {

    // only check boosters that are visible
    if (
        boost.style.display !== "none" &&
        isColliding(x, y, boost)
    ) {

        // activate speed boost for 4 seconds
        boostUntil = performance.now() + boostDuration;

        // hide collected booster
        boost.style.display = "none";

        // respawn this booster after 8 seconds
        setTimeout(() => {
            placeRandomly(boost);
        }, boostRespawnDelay);
    }

});

    // Update the player's appearance and position
    player.style.backgroundColor = performance.now() < boostUntil ? "orange" : "royalblue";
    player.style.left = x + "px";
    player.style.top = y + "px";

    // Show the Spacebar prompt only when near an obstacle
    if (attackPrompt) {
        attackPrompt.style.display = findNearbyObstacle() ? "block" : "none";
    }

    requestAnimationFrame(update);
}

// Find the first visible obstacle close enough to destroy
function findNearbyObstacle() {
    const playerCenterX = x + player.offsetWidth / 2;
    const playerCenterY = y + player.offsetHeight / 2;

    return [...obstacles].find(obstacle => {
        if (obstacle.style.display === "none") return false;

        // Closest point on obstacle's rectangle to the player's center
        const closestX = Math.max(
            obstacle.offsetLeft,
            Math.min(playerCenterX, obstacle.offsetLeft + obstacle.offsetWidth)
        );
        const closestY = Math.max(
            obstacle.offsetTop,
            Math.min(playerCenterY, obstacle.offsetTop + obstacle.offsetHeight)
        );

        const distance = Math.hypot(
            playerCenterX - closestX,
            playerCenterY - closestY
        );

        return distance <= attackRange;
    });
}

// Create debris particles for a destroyed obstacle
function createDebris(obstacle) {
    const left = obstacle.offsetLeft;
    const top = obstacle.offsetTop;
    const width = obstacle.offsetWidth;
    const height = obstacle.offsetHeight;

    for (let i = 0; i < 12; i++) {
        const particle = document.createElement("div");
        particle.classList.add("debris");

        particle.style.left = left + Math.random() * width + "px";
        particle.style.top = top + Math.random() * height + "px";

        const dx = Math.random() * 160 - 80;
        const dy = Math.random() * 160 - 80;
        const spin = Math.random() * 720 - 360;

        particle.style.setProperty("--dx", dx + "px");
        particle.style.setProperty("--dy", dy + "px");
        particle.style.setProperty("--spin", spin + "deg");

        border.appendChild(particle);

        particle.addEventListener("animationend", () => {
            particle.remove();
        }, { once: true });
    }
}

// Brief screen shake after destroying an obstacle
function shakeScreen() {
    border.animate([
        { transform: "translate(0, 0)" },
        { transform: "translate(-5px, 3px)" },
        { transform: "translate(5px, -3px)" },
        { transform: "translate(-3px, -2px)" },
        { transform: "translate(3px, 2px)" },
        { transform: "translate(0, 0)" }
    ], {
        duration: 230,
        easing: "ease-out"
    });
}

// Destroy a nearby obstacle with Spacebar
function destroyNearbyObstacle() {
    const nearbyObstacle = findNearbyObstacle();
    if (!nearbyObstacle) return;

    createDebris(nearbyObstacle);
    shakeScreen();
    nearbyObstacle.style.display = "none";

    // Respawn at a new random location after 2.5 seconds
    setTimeout(() => {
        placeRandomly(nearbyObstacle);
    }, obstacleRespawnDelay);
}

// Check whether two rectangles overlap
function rectanglesOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return (
        ax < bx + bw &&
        ax + aw > bx &&
        ay < by + bh &&
        ay + ah > by
    );
}

// Place a booster or obstacle at a random, non-overlapping location
function placeRandomly(element) {
    if (!element) return;

    // Temporarily show the element so its dimensions can be measured
    element.style.display = "";

    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const maxX = border.clientWidth - width;
    const maxY = border.clientHeight - height;

    if (maxX < 0 || maxY < 0) {
        element.style.display = "none";
        return;
    }

    const paddingX = Math.min(15, maxX / 2);
    const paddingY = Math.min(15, maxY / 2);
    
    // all obstacles and boosters to avoid
    const objects = [...obstacles, ...speedBoosts];

    let validPosition = false;

    for (let attempts = 0; attempts < 100; attempts++) {
        const spawnX = paddingX + Math.random() * (maxX - paddingX * 2);
        const spawnY = paddingY + Math.random() * (maxY - paddingY * 2);

        // Don't spawn on top of the player
        const hitsPlayer = rectanglesOverlap(
            spawnX, spawnY, width, height,
            x, y, player.offsetWidth, player.offsetHeight
        );

        // Don't spawn on top of any other visible obstacle or booster
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

        if (!hitsPlayer && !hitsObject) {
            element.style.left = spawnX + "px";
            element.style.top = spawnY + "px";
            validPosition = true;
            break;
        }
    }

    if (!validPosition) {
        element.style.display = "none";
        console.warn("Could not find a valid spawn position.");
    }
}

// Check whether the player's rectangle overlaps a given element
function isColliding(x, y, element) {
    return (
        x < element.offsetLeft + element.offsetWidth &&
        x + player.offsetWidth > element.offsetLeft &&
        y < element.offsetTop + element.offsetHeight &&
        y + player.offsetHeight > element.offsetTop
    );
}

// Initial setup: hide all collectibles and obstacles before random placement
obstacles.forEach(obstacle => {
    obstacle.style.display = "none";
});

speedBoosts.forEach(boost => {
    boost.style.display = "none";
})

// Set the player's initial position before randomizing other elements
player.style.left = x + "px";
player.style.top = y + "px";

// Spawn obstacles and booster at random valid positions
obstacles.forEach(obstacle => {
    placeRandomly(obstacle);
});

speedBoosts.forEach(boost => {
    placeRandomly(boost);
})

// Start the movement loop
update();
