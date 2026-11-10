const player = document.querySelector("#player");

let x = 100;
let y = 100;

const speed = 10;

// add movement functionality
document.addEventListener("keydown", (event) => {

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
    }

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

    // Keep player inside boundaries
    x = Math.max(0, Math.min(x, border.clientWidth - player.offsetWidth));
    y = Math.max(0, Math.min(y, border.clientHeight - player.offsetHeight));

    player.style.left = x + "px";
    player.style.top = y + "px";

});