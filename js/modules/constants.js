const gameSize = 512;
const fontFamily = "Ubuntu,Arial,sans-serif";
const topOffset = 40;
const fps = 30;
const easing = ["decelerationCubed"];
const delay = 2000;
const initialPoints = 6;

const colors = {
    "dark": "#00000080",
    "light": "#FFFFFF",
    "primary": "#FFA500"
};

const titles = {
    start: "START GAME!",
    end: "GAME OVER!",
    win: "YOU WIN!"
};

const assetsToLoad = [
    "assets/images/asteroid-1.png",
    "assets/images/asteroid-2.png",
    "assets/images/asteroid-3.png",
    "assets/images/asteroid-4.png",
    "assets/images/asteroid-5.png",
    "assets/images/heart.png",
    "assets/images/rocket.png",
    "assets/images/fire.png",
    "assets/images/title.png",
    "assets/images/up.png",
    "assets/images/over.png",
    "assets/images/down.png",
    "assets/images/controls.png",
    "assets/fonts/ubuntu.woff2",
    "assets/sounds/theme.mp3",
    "assets/sounds/fly.wav"
];

export {gameSize, fontFamily, topOffset, fps, easing, colors, titles, assetsToLoad, delay, initialPoints};