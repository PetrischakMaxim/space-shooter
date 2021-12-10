import Game from "./library/engine.js";
import Score from "./modules/score.js";
import Asteroids from "./modules/asteroids.js";
import Rocket from "./modules/rocket.js";
import HealthBar from "./modules/healthBar.js";
import {gameSize, fontFamily, topOffset, fps, easing, colors, messages, assetsToLoad} from "./modules/constants.js"

const game = new Game(gameSize, gameSize, setup, assetsToLoad, load);

const {
    canvas,
    rectangle,
    progressBar,
    assets,
    text,
    sprite,
    stage,
    group,
    remove,
    randomInt,
    hit,
    slide
} = game;

const localBounds = {
    x: 0,
    y: topOffset,
    width: stage.width,
    height: stage.height
};

const score = new Score();
const healthBar = new HealthBar();
const asteroids = new Asteroids(localBounds);

//Game variables
let startScene, mainScene, endScene, rocket;

game.start();

game.scaleToWindow();

window.addEventListener("resize", () => {
    game.scaleToWindow(colors["dark"]);
});

function load() {
    progressBar.create(canvas, assets);
    progressBar.update();
}

function setup() {
    progressBar.remove();
    initStartScene();
}

function initStartScene() {
    let music = assets["assets/sounds/theme.mp3"];
    let logo = sprite(assets["assets/images/title.png"], 0, topOffset);
    logo.scaleX = 0.8;
    logo.scaleY = 0.8;

    let titleOffset = topOffset * 2 + logo.height;
    let title = text(messages["start"], `36px ${fontFamily}`, colors["light"], titleOffset, titleOffset);

    let buttonOffset = titleOffset * 1.2;
    let startButton = game.button([
        assets["assets/images/up.png"],
        assets["assets/images/over.png"],
        assets["assets/images/down.png"]
    ], buttonOffset * -1, buttonOffset);
    let buttonXOffset = gameSize / 2 - startButton.halfWidth;

    slide(title, (buttonXOffset), titleOffset, fps, easing);
    slide(startButton, (buttonXOffset), buttonOffset, fps, easing);
    startScene = group(logo, title, startButton);

    startButton.press = () => {
        if (!music.playing) music.play();
        game.state = play;
        startScene.visible = false;
        initMainScene();
    };
}

function initMainScene() {
    const topBar = rectangle(gameSize, topOffset, colors["dark"]);

    healthBar.addSprite(topBar, assets["assets/images/heart.png"]);
    topBar.addChild(healthBar);

    score.init();
    topBar.addChild(score.message);

    rocket = new Rocket(
        assets["assets/images/rocket.png"],
        assets["assets/images/fire.png"],
        assets["assets/sounds/fly.wav"],
        localBounds
    );

    stage.putTop(rocket);

    mainScene = group(rocket, topBar);

    asteroids.generate(
        randomInt(6, 10),
        mainScene,
        0,
        canvas.width - topOffset,
        topOffset + rocket.height,
        canvas.height,
    )
}

function initEndScene(message) {
    let title = text(message, `36px ${fontFamily}`, colors["light"], 150, 150);
    let finalScore = score.message;
    finalScore.content = `YOUR SCORE IS ${score.value}`;
    finalScore.x = 150;
    finalScore.y = 200;

    endScene = group(title, finalScore);
    mainScene.visible = false;
}

function hitBulletWithAsteroid(bullet, asteroids) {
    hit(bullet, asteroids, false, false, false,
        (collision, asteroid) => {
            asteroids.destroy(asteroid);
            score.update();
            remove(bullet);
        }
    );
}

function play() {

    rocket.fly(() =>
        healthBar.checkPoints(() =>
            end(messages['end'])
        ),
    );

    rocket.bulletsFly(
        hitBulletWithAsteroid,
        asteroids.elements
    );

    asteroids.fly(rocket, () => {
            rocket.hit = true
        }
    )

    if (!asteroids.elements.length) {
        end(messages["win"])
    }
}

function end(message) {
    game.paused = true;
    initEndScene(message);
    game.wait(1500).then(() => location.reload());
}