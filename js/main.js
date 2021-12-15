import Game from "./library/engine.js";
import Score from "./modules/score.js";
import Asteroids from "./modules/asteroids.js";
import Rocket from "./modules/rocket.js";
import HealthBar from "./modules/healthBar.js";
import {progressBar, rectangle, button, sprite, text, remove} from "./library/display.js";
import {wait} from "./library/utilities.js";
import {hit} from "./library/collision.js";
import {gameSize, fontFamily, topOffset, fps, easing, Color, Title, assetsToLoad,delay} from "./modules/constants.js";

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

const Scene = {
    Start: group(),
    Main: group(),
    End: group(),
};

const Component = {
    Score: new Score(),
    HealthBar: new HealthBar(),
    Asteroids: new Asteroids(localBounds),
    Rocket: null,
}

game.start();

game.scaleToWindow();

window.addEventListener("resize", () => {
    game.scaleToWindow(Color.Dark);
});

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
    const title = text(Title["Start"], `36px ${fontFamily}`, Color.Light, titleOffset, titleOffset);

    const buttonOffset = titleOffset * 1.2;
    const startButton = button([
        assets["assets/images/up.png"],
        assets["assets/images/over.png"],
        assets["assets/images/down.png"]
    ], buttonOffset * -1, buttonOffset);
    const buttonXOffset = gameSize / 2 - startButton.halfWidth;

    slide(title, buttonXOffset, titleOffset, fps, easing);
    slide(startButton, buttonXOffset + 15, buttonOffset, fps, easing);

    Scene.Start.addChild(logo);
    Scene.Start.addChild(title);
    Scene.Start.addChild(startButton);

    startButton.press = () => {
        if (!music.playing) music.play();
        game.state = play;
        changeScene(Scene.Start, Scene.Main);
        initMainScene();
    };
}

function initMainScene() {
    const example = sprite(assets["assets/images/controls.png"], gameSize / 2 - 120, gameSize - 120);
    example.scaleX = 0.5;
    example.scaleY = 0.5;

    const topBar = rectangle(gameSize, topOffset, Color["Dark"]);
    Component.HealthBar.addSprite(topBar, assets["assets/images/heart.png"]);
    topBar.addChild(Component.HealthBar);
    topBar.addChild(Component.Score.message);

    Component.Rocket = new Rocket(
        assets["assets/images/rocket.png"],
        assets["assets/images/fire.png"],
        assets["assets/sounds/fly.wav"],
        localBounds
    );

    stage.putTop(Component.Rocket);

    Scene.Main.addChild(example);
    Scene.Main.addChild(Component.Rocket);
    Scene.Main.addChild(topBar);

    Component.Asteroids.generate(
        Scene.Main,
        0,
        canvas.width - topOffset,
        topOffset + Component.Rocket.height,
        canvas.height,
    );
}

function initEndScene(message) {
    const title = text(message, `36px ${fontFamily}`, Color["Light"], gameSize / 2 - 80, 160);

    const finalScore = Component.Score.message;
    finalScore.content = `SCORE IS ${Component.Score.value}`;

    finalScore.x = gameSize / 2 - finalScore.width;
    finalScore.y = 200;

    Scene.End.addChild(title);
    Scene.End.addChild(finalScore);
}

function hitBulletWithAsteroid(bullet, asteroids) {
    hit(bullet, asteroids.elements, false, false, false,
        (collision, asteroid) => {
            asteroids.destroy(asteroid);
            Component.Score.update();
            remove(bullet);
        }
    );
}

function play() {

    Component.Rocket.fly(() =>
        Component.HealthBar.checkPoints(() =>
            end(Title.End)
        ),
    );

    Component.Rocket.bulletsFly(
        hitBulletWithAsteroid,
        Component.Asteroids
    );

    Component.Asteroids.fly(Component.Rocket, () => {
            Component.Rocket.hit = true
        }
    )

    if (!Component.Asteroids.elements.length) {
        end(Title.Win)
    }
}

function end(message) {
    game.paused = true;
    changeScene(Scene.Main, Scene.End);
    initEndScene(message);
    wait(delay).then(() => location.reload());
}