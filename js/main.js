import {Game} from "./library/engine.js";
import {destroySound} from "./modules/sounds.js";
import Score from "./modules/score.js";
import {gameSize, fontFamily, topOffset, fps, easing, colors, messages, assetsToLoad} from "./modules/constants.js"
import {Rocket} from "./modules/rocket.js";

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
    contain,
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


//Game variables
let startScene, mainScene, endScene, asteroids, rocket, healthBar, background;

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

function changeScene() {
    slide(startScene, gameSize, 0, fps, easing);
    initMainScene();
    slide(mainScene, 0, 0, fps, easing);
}

function initStartScene() {
    background = sprite(assets["assets/images/main-bg.jpg"]);
    let music = game.assets["assets/sounds/theme.mp3"];
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
    startScene = group(background, logo, title, startButton);

    startButton.press = () => {
        if (!music.playing) music.play();
        game.state = play;
        changeScene();
    };
}

function initMainScene() {
    let topBar = rectangle(gameSize, topOffset, colors["dark"]);

    healthBar = createHeathBar();
    topBar.addChild(healthBar);

    score.init();
    topBar.addChild(score.message);

    rocket = new Rocket(assets["assets/images/rocket.png"], assets["assets/images/fire.png"], assets["assets/sounds/fly.wav"], localBounds);
    stage.putTop(rocket);

    mainScene = group(background, rocket, topBar);
    asteroids = generateAsteroids();
}

function initEndScene(message) {
    let title = text(message, `36px ${fontFamily}`, colors["light"], 150, 150);
    let finalScore = score.message;
    finalScore.content = `YOUR SCORE IS ${score.value}`;
    finalScore.x = 150;
    finalScore.y = 200;

    endScene = group(background, title, finalScore);

    slide(mainScene, gameSize, 0, fps, easing);
    slide(endScene, 0, 0, fps, easing);
}

function generateAsteroids(count = randomInt(6, 10)) {
    let asteroids = [];

    for (let i = 0; i < count; i++) {
        let asteroid = sprite(assets[`assets/images/asteroid-${randomInt(1, 5)}.png`]);
        let x = randomInt(0, canvas.width - topOffset);
        let y = randomInt(topOffset + rocket.height, canvas.height);
        let friction = 0.85;
        let velocity = randomInt(-3, 3);
        let size = randomInt(15, 40);

        asteroid.width = size;
        asteroid.height = size;
        asteroid.circular = true;
        asteroid.x = x;
        asteroid.y = y;
        asteroid.vx = velocity;
        asteroid.vy = velocity;
        asteroid.frictionX = friction;
        asteroid.frictionY = friction;
        asteroid.mass = 0.5 + (asteroid.diameter / 32);
        asteroids.push(asteroid);
        mainScene.addChild(asteroid);
    }
    return asteroids;
}

function createHeathBar(point = 5) {
    let healthSpriteSize = 20;
    let healthBarWidth = point * healthSpriteSize + point;
    let healthRect = rectangle(healthBarWidth, healthSpriteSize, "transparent");
    healthRect.y = healthSpriteSize / 2;
    healthRect.x = gameSize - healthBarWidth - healthSpriteSize / 2;

    for (let i = 0; i < point; i++) {
        let healthSprite = sprite(assets["assets/images/heart.png"]);
        healthSprite.width = healthSpriteSize;
        healthSprite.height = healthSpriteSize;
        healthSprite.x = i * healthSpriteSize + i;
        healthSprite.y = 0;
        healthRect.addChild(healthSprite);
    }

    return healthRect;
}

function hitBulletWithAsteroid(bullet, asteroids) {
    hit(bullet, asteroids, false, false, false,
        (collision, asteroid) => {
            destroyAsteroid(asteroid);
            score.update();
            remove(bullet);
        }
    );
}

function bulletsFly() {
    rocket.bullets = rocket.bullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        hitBulletWithAsteroid(bullet, asteroids);

        if (contain(bullet, localBounds)) {
            bullet.alpha = 0;
            return false;
        }


        return true;
    });
}

function destroyAsteroid(asteroid) {
    let hitAsteroid = asteroids.indexOf(asteroid);
    asteroids.splice(hitAsteroid, 1);
    remove(asteroid);
    destroySound();
}

function asteroidsFly(target, callback) {
    game.multipleCircleCollision(asteroids);

    asteroids.forEach(asteroid => {
        asteroid.x += asteroid.vx;
        asteroid.y += asteroid.vy;
        asteroid.rotation += 0.01;

        let hitEdge = contain(asteroid, localBounds, true);
        if (hitEdge === "top" || hitEdge === "bottom") {
            asteroid.vy *= asteroid.frictionY;
        }

        if (hitEdge === "left" || hitEdge === "right") {
            asteroid.vx *= asteroid.frictionX;
        }

        if (hit(target, asteroid, true, true, false)) {
            callback();
            if (!target.immortal) {
                destroyAsteroid(asteroid);
            }
        }
    });
}

function play() {

    rocket.fly(() => {
        if (healthBar.children.length === 1) {
            end(messages["end"]);
        }
        healthBar.children.pop();
    });

    bulletsFly();
    asteroidsFly(rocket, () => {
        if (!rocket.immortal) {
            rocket.hit = true
        }
    });

    if (!asteroids.length) {
        end(messages["win"])
    }
}

function end(message) {
    game.paused = true;
    initEndScene(message);
    game.wait(1500).then(() => location.reload());
}