const gameSize = 512;
const fontFamily = "Ubuntu,Arial,sans-serif";
const topOffset = 40;
const fps = 30;
const easing = ["decelerationCubed"];
const delay = 2000;
const Color = {
    "Dark": "#00000080",
    "Light": "#FFFFFF",
    "Primary": "#FFA500"
};

const Title = {
    Start: "START GAME!",
    End: "GAME OVER!",
    Win: "YOU WIN!"
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

export {gameSize, fontFamily, topOffset, fps, easing, Color, Title, assetsToLoad, delay};