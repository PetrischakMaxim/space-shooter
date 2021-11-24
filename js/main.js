import {game} from "./library/engine.js";

let startScene, gameScene, titleMessage, asteroids, healthBar, rocket, playButton;
let gameSize = 512;

let fontFamily = "Ubuntu,Arial,sans-serif";
let topOffset = 40;
let fps = 30;
let easing = ["decelerationCubed"];

let colors = {
    "dark": "#00000080",
    "light": "#FFFFFF",
    "primary": "#FFA500"
}

let g = game(
    gameSize, gameSize, setup,
    [
        "images/asteroid-1.png",
        "images/asteroid-2.png",
        "images/asteroid-3.png",
        "images/heart.png",
        "images/spaceship.png",
        "images/main-bg.jpg",
        "images/fire.png",
        "images/title.png",
        "images/up.png",
        "images/over.png",
        "images/down.png",
        "fonts/ubuntu.woff2"
    ],
    load
);

//Game variables
const {
    canvas,
    rectangle,
    progressBar,
    assets,
    text,
    sprite,
    keyboard,
    stage,
    circle,
    group,
    remove,
    contain,
    randomInt,
    hit,
    shoot,
    slide,
    button,
    multipleCircleCollision,
    randomFloat
} = g;

let localBounds = {x: 0, y: topOffset, width: stage.width, height: stage.height};

let score = {
    value: 0,
    message: null,

    init() {
        this.message = text(`Score: ${this.value}`, `20px ${fontFamily}`, colors["primary"]);
        this.message.x = 10;
        this.message.y = 10;
    },

    update() {
        this.value++;
        this.message.content = `Score: ${this.value}`;
    }
};

g.start();

g.scaleToWindow();

window.addEventListener("resize", () => {
    g.scaleToWindow(colors["dark"]);
});

function load() {
    progressBar.create(canvas, assets);
    progressBar.update();
}

function setup() {
    progressBar.remove();
    let background = sprite(assets["images/main-bg.jpg"]);
    // Start scene
    let title = sprite(assets["images/title.png"]);
    title.scaleX = 0.8;
    title.scaleY = 0.8;
    titleMessage = text("START GAME", `36px ${fontFamily}`, colors["light"]);

    playButton = button([
        assets["images/up.png"],
        assets["images/over.png"],
        assets["images/down.png"]
    ]);

    slide(titleMessage, (gameSize / 2 - playButton.halfWidth), title.height + 50, fps, easing);
    slide(playButton, (gameSize / 2 - playButton.halfWidth), 350, fps, easing);
    startScene = group(background, title, titleMessage, playButton,);

    playButton.press = () => {
        //if (!music.playing) music.play();
        g.state = play;
        changeScene();
    };

    // g.state = play;
}

function changeScene() {
    slide(startScene, gameSize, 0, fps, easing);
    setupGameScene();
    slide(gameScene, 0, 0, fps, easing);
}

function setupGameScene() {
    let background = sprite(assets["images/main-bg.jpg"]);
    let topBar = rectangle(gameSize, topOffset, colors["dark"]);

    healthBar = generateHeathBar();
    topBar.addChild(healthBar);

    score.init();
    topBar.addChild(score.message);

    rocket = initRocket();
    stage.putCenter(rocket);

    setEvents(rocket, rocket.shotBullet);

    gameScene = group(background, rocket, topBar);
    asteroids = generateAsteroids();
    gameScene.x = gameSize * -1;
}

function initRocket() {
    let friction = 0.9;
    let acceleration = 0.5;
    let rotateStep = 0.05;
    let coefficient = 1.25;
    let fire = null;

    rocket = sprite(assets["images/spaceship.png"]);
    rocket.width = 93 / coefficient;
    rocket.height = 50 / coefficient;
    rocket.accelerationX = acceleration;
    rocket.accelerationY = acceleration;
    rocket.frictionX = friction;
    rocket.frictionY = friction;
    rocket.mass = acceleration + (rocket.diameter / 32);
    rocket.rotationSpeed = 0;
    rocket.moveForward = false;
    rocket.hit = false;
    rocket.bullets = [];

    fire = setupFire();
    rocket.addChild(fire);

    rocket.shotBullet = () => {
        shoot(
            rocket,
            rocket.rotation,
            50,
            5,
            rocket.bullets,
            () => circle(randomInt(5, 10), colors["primary"])
        );
    }

    rocket.turnLeft = () => rocket.rotationSpeed = rotateStep * -1;
    rocket.turnRight = () => rocket.rotationSpeed = rotateStep;
    rocket.stop = () => rocket.rotationSpeed = 0;
    rocket.toggleMovement = (flag) => rocket.moveForward = flag;

    rocket.startMovement = () => {
        rocket.rotation += rocket.rotationSpeed;
        if (rocket.moveForward) {
            rocket.vx += rocket.accelerationX * Math.cos(rocket.rotation);
            rocket.vy += rocket.accelerationY * Math.sin(rocket.rotation);
        } else {
            rocket.vx *= rocket.frictionX;
            rocket.vy *= rocket.frictionY;
        }
        rocket.x += rocket.vx;
        rocket.y += rocket.vy;
    }

    rocket.fly = (callback) => {
        fire.burn(randomFloat(0.6, 0.99));
        rocket.startMovement();
        contain(rocket, localBounds);
        if (isHit()) {
            callback();
        }
        rocket.hit = false;
    }

    function isHit() {
        if (rocket.hit) {
            rocket.alpha = 0.5;
        } else {
            rocket.alpha = 1;
        }
        return rocket.hit;
    }

    function setupFire() {
        fire = sprite(assets["images/fire.png"]);
        fire.width = 78 / coefficient;
        fire.height = 39 / coefficient;
        fire.x = rocket.width * -1 + 25;
        fire.y = 5;
        fire.burn = (scale = 1) => {
            fire.scaleX = scale;
            fire.scaleY = scale;
        }
        return fire;
    }

    return rocket;
}

function setEvents(sprite, callback) {
    let leftArrow = keyboard(37);
    let upArrow = keyboard(38);
    let rightArrow = keyboard(39);
    let space = keyboard(32);

    leftArrow.press = sprite.turnLeft;
    leftArrow.release = () => {
        if (!rightArrow.isDown) sprite.stop();
    }
    rightArrow.press = sprite.turnRight;
    rightArrow.release = () => {
        if (!leftArrow.isDown) sprite.stop();
    }
    upArrow.press = () => sprite.toggleMovement(true);
    upArrow.release = () => sprite.toggleMovement(false);

    space.press = callback;
}

function generateAsteroids() {
    let asteroids = [];
    let numberOfAsteroids = randomInt(3, 5);

    for (let i = 0; i < numberOfAsteroids; i++) {
        let asteroid = sprite(assets[`images/asteroid-${randomInt(1, 3)}.png`]);
        let x = randomInt(0, canvas.width);
        let y = randomInt(topOffset, canvas.height);
        asteroid.width = randomInt(15, 50);
        asteroid.height = randomInt(15, 50);
        asteroid.circular = true;
        asteroid.x = x;
        asteroid.y = y;
        asteroid.vx = randomInt(-10, 10);
        asteroid.vy = randomInt(-10, 10);
        asteroid.frictionX = 0.99;
        asteroid.frictionY = 0.99;
        asteroid.mass = 0.5 + (asteroid.diameter / 32);
        asteroids.push(asteroid);
        gameScene.addChild(asteroid);
    }
    return asteroids;
}

function generateHeathBar() {
    let healthLifePoint = 5;
    let healthSpriteSize = 20;
    let healthBarWidth = healthLifePoint * healthSpriteSize + healthLifePoint;
    let healthRect = rectangle(healthBarWidth, healthSpriteSize, "transparent");
    healthRect.y = healthSpriteSize / 2;
    healthRect.x = gameSize - healthBarWidth - healthSpriteSize / 2;

    for (let i = 0; i < healthLifePoint; i++) {
        let healthSprite = sprite(assets["images/heart.png"]);
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
        }
    );
}

function bulletsFly() {
    rocket.bullets = rocket.bullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        hitBulletWithAsteroid(bullet, asteroids);
        let boundsContain = contain(bullet, localBounds);
        if (boundsContain) {
            remove(bullet);
            return false;
        }

        return true;
    });
}

function destroyAsteroid(asteroid) {
    let hitAsteroid = asteroids.indexOf(asteroid);
    asteroids.splice(hitAsteroid, 1);
    remove(asteroid);
}

function asteroidsFly(sprite, callback) {
    multipleCircleCollision(asteroids);
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

        if (hit(sprite, asteroid, true, true, false)) {
            callback();
            destroyAsteroid(asteroid);
        }
    });
}

function play() {
    rocket.fly(() => healthBar.children.pop());
    asteroidsFly(rocket, () => rocket.hit = true);
    bulletsFly();
}