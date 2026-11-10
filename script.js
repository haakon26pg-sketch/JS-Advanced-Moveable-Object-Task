const player = document.querySelector("#player");

let x = 100;
let y = 100;

const speed = 10;

// add movement functionality

document.addEventListener("keydown", (event) => {
    console.log(event.key);

if (event.key === "ArrowRight") {
    x += speed;
}

if (event.key === "ArrowLeft") {
    x -= speed;
}

if (event.key === "ArrowUp") {
    y -= speed;
}

if (event.key === "ArrowDown") {
    y += speed;
}

player.style.left = x + "px";
player.style.top = y + "px";

});