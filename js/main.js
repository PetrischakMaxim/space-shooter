import Game from "./library/engine.js";
import Score from "./modules/score.js";
import Asteroids from "./modules/asteroids.js";
import Rocket from "./modules/rocket.js";
import HealthBar from "./modules/healthBar.js";
import {progressBar, rectangle, button, sprite, text, remove} from "./library/display.js";
import {wait} from "./library/utilities.js";
import {hit} from "./library/collision.js";
import {
    gameSize,
    fontFamily,
    topOffset,
    fps,
    easing,
    colors,
    titles,
    assetsToLoad,
    delay,
    initialPoints
} from "./modules/constants.js";

//Game variables
const game = new Game(gameSize, gameSize, setup, assetsToLoad, load);

const {
    canvas,
    assets,
    stage,
    group,
    slide,
} = game;

const localBounds = {
    x: 0,
    y: topOffset,
    width: stage.width,
    height: stage.height
};

const startScene = group();
const mainScene = group();
const endScene = group();
const score = new Score();
const healthBar = new HealthBar(initialPoints);
const asteroids = new Asteroids(localBounds);

game.rocket = null;

game.start();
game.scaleToWindow();

function load() {
    progressBar.create(canvas, assets);
    progressBar.update();
}

function setup() {
    progressBar.remove();
    initStartScene();
}

function changeScene(prevScene, nextScene) {
    slide(prevScene, gameSize * -1, 0, fps, easing);
    prevScene.visible = false;
    slide(nextScene, 0, 0, fps, easing);
}

function initStartScene() {
    const music = assets["assets/sounds/theme.mp3"];
    const logo = sprite(assets["assets/images/title.png"], 0, topOffset);
    logo.scaleX = 0.8;
    logo.scaleY = 0.8;

    const titleOffset = topOffset * 2 + logo.height;
    const title = text(titles["start"], `36px ${fontFamily}`, colors.light, titleOffset, titleOffset);

    const buttonOffset = titleOffset * 1.2;
    const startButton = button([
        assets["assets/images/up.png"],
        assets["assets/images/over.png"],
        assets["assets/images/down.png"]
    ], buttonOffset * -1, buttonOffset);
    const buttonXOffset = gameSize / 2 - startButton.halfWidth;

    slide(title, buttonXOffset, titleOffset, fps, easing);
    slide(startButton, buttonXOffset + 15, buttonOffset, fps, easing);

    startScene.addChild(logo);
    startScene.addChild(title);
    startScene.addChild(startButton);

    startButton.press = () => {
        if (!music.playing) music.play();
        game.state = play;
        changeScene(startScene, mainScene);
        initMainScene();
    };
}

function initMainScene() {
    const example = sprite(assets["assets/images/controls.png"], gameSize / 2 - 120, gameSize - 120);
    example.scaleX = 0.5;
    example.scaleY = 0.5;

    const topBar = rectangle(gameSize, topOffset, colors["dark"]);
    healthBar.addSprite(topBar, assets["assets/images/heart.png"]);
    topBar.addChild(healthBar);
    topBar.addChild(score.message);

    game.rocket = new Rocket(
        assets["assets/images/rocket.png"],
        assets["assets/images/fire.png"],
        assets["assets/sounds/fly.wav"],
        localBounds
    );
    stage.putTop(game.rocket);

    mainScene.addChild(example);
    mainScene.addChild(game.rocket);
    mainScene.addChild(topBar);

    asteroids.generate(
        mainScene,
        0,
        canvas.width - topOffset,
        topOffset + game.rocket.height,
        canvas.height,
        initialPoints,
    );
}

function initEndScene(message) {
    const title = text(message, `36px ${fontFamily}`, colors["light"], gameSize / 2 - 80, 160);

    const finalScore = score.message;
    finalScore.content = `SCORE IS ${score.value}`;

    finalScore.x = gameSize / 2 - finalScore.width;
    finalScore.y = 200;

    endScene.addChild(title);
    endScene.addChild(finalScore);
}

function hitBulletWithAsteroid(bullet, asteroids) {
    hit(bullet, asteroids.elements, false, false, false,
        (collision, asteroid) => {
            asteroids.destroy(asteroid);
            score.update();
            remove(bullet);
        }
    );
}

function play() {

    game.rocket.fly(() =>
        healthBar.checkPoints(() =>
            end(titles.end)
        ),
    );

    game.rocket.fireBullets(
        hitBulletWithAsteroid,
        asteroids
    );

    asteroids.fly(game.rocket, () => {
            game.rocket.hit = true
        }
    )

    if (!asteroids.elements.length) {
        end(titles.win)
    }
}

function end(message) {
    game.paused = true;
    changeScene(mainScene, endScene);
    initEndScene(message);
    wait(delay).then(() => location.reload());
}

window.addEventListener("resize", () => {
    game.scaleToWindow();
});