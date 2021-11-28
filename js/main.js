import {
    game
} from "./library/engine.js";

let gameSize = 512;
let fontFamily = "Ubuntu,Arial,sans-serif";
let topOffset = 40;
let fps = 30;
let easing = ["decelerationCubed"];
let colors = {
    "dark": "#00000080",
    "light": "#FFFFFF",
    "primary": "#FFA500"
};
let messages = {
    start: "START GAME!",
    end: "GAME OVER!",
    win: "YOU WIN!"
};
let g = game(
    gameSize, gameSize, setup,
    [
        "assets/images/asteroid-1.png",
        "assets/images/asteroid-2.png",
        "assets/images/asteroid-3.png",
        "assets/images/asteroid-4.png",
        "assets/images/asteroid-5.png",
        "assets/images/heart.png",
        "assets/images/rocket.png",
        "assets/images/main-bg.jpg",
        "assets/images/fire.png",
        "assets/images/title.png",
        "assets/images/up.png",
        "assets/images/over.png",
        "assets/images/down.png",
        "assets/fonts/ubuntu.woff2",
        "assets/sounds/theme.mp3",
        "assets/sounds/fly.wav"
    ],
    load
);

const {
    canvas,
    rectangle,
    progressBar,
    assets,
    text,
    sprite,
    keyboard,
    stage,
    group,
    remove,
    contain,
    randomInt,
    hit,
    slide
} = g;

let localBounds = {
    x: 0,
    y: topOffset,
    width: stage.width,
    height: stage.height
};

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
    },
};

//Game variables
let startScene, mainScene, endScene, asteroids, rocket, healthBar, background;

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
    initStartScene();
}

function changeScene() {
    slide(startScene, gameSize, 0, fps, easing);
    initMainScene();
    slide(mainScene, 0, 0, fps, easing);
}

function initStartScene() {
    background = sprite(assets["assets/images/main-bg.jpg"]);
    let music = g.assets["assets/sounds/theme.mp3"];
    let logo = sprite(assets["assets/images/title.png"], 0, topOffset);
    logo.scaleX = 0.8;
    logo.scaleY = 0.8;

    let titleOffset = topOffset * 2 + logo.height;
    let title = text(messages["start"], `36px ${fontFamily}`, colors["light"], titleOffset, titleOffset);

    let buttonOffset = titleOffset * 1.2;
    let startButton = g.button([
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
        g.state = play;
        changeScene();
    };
}

function initMainScene() {
    let topBar = rectangle(gameSize, topOffset, colors["dark"]);

    healthBar = createHeathBar();
    topBar.addChild(healthBar);

    score.init();
    topBar.addChild(score.message);

    rocket = initRocket();
    stage.putTop(rocket);

    setEvents(rocket, rocket.shootBullet);

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

function initRocket() {
    let friction = 0.85;
    let acceleration = 0.15;
    let rotateStep = 0.05;
    let coefficient = 1.25;
    let fire = null;

    rocket = sprite(assets["assets/images/rocket.png"]);
    rocket.width = 100 / coefficient;
    rocket.height = 60 / coefficient;
    rocket.accelerationX = acceleration;
    rocket.accelerationY = acceleration;
    rocket.frictionX = friction;
    rocket.frictionY = friction;
    rocket.mass = acceleration + (rocket.diameter / 32);
    rocket.rotationSpeed = 0;
    rocket.moveForward = false;
    rocket.hit = false;
    rocket.immortal = false;
    rocket.sound = g.assets["assets/sounds/fly.wav"];
    rocket.bullets = [];

    fire = setupFire();
    rocket.addChild(fire);
    rocket.shootBullet = () => {
        g.shoot(
            rocket,
            rocket.rotation,
            50,
            5,
            rocket.bullets,
            rocket.shoot,
        );
        shootSound();
    }

    rocket.shoot = () => g.circle(randomInt(5, 10), colors["primary"]);

    rocket.turnLeft = () => rocket.rotationSpeed = rotateStep * -1;
    rocket.turnRight = () => rocket.rotationSpeed = rotateStep;
    rocket.stop = () => rocket.rotationSpeed = 0;
    rocket.toggleMovement = (flag) => {
        rocket.moveForward = flag
        if (flag) {
            rocket.sound.play();
        }
    };

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
        fire.burn(g.randomFloat(0.6, 0.99));
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
        fire = sprite(assets["assets/images/fire.png"]);
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

function generateAsteroids(count = randomInt(6, 10)) {
    let asteroids = [];
    let numberOfAsteroids = count;

    for (let i = 0; i < numberOfAsteroids; i++) {
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
    let healthLifePoint = point;
    let healthSpriteSize = 20;
    let healthBarWidth = healthLifePoint * healthSpriteSize + healthLifePoint;
    let healthRect = rectangle(healthBarWidth, healthSpriteSize, "transparent");
    healthRect.y = healthSpriteSize / 2;
    healthRect.x = gameSize - healthBarWidth - healthSpriteSize / 2;

    for (let i = 0; i < healthLifePoint; i++) {
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
    g.multipleCircleCollision(asteroids);

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
    g.paused = true;
    initEndScene(message);
    g.wait(1500).then(() => location.reload());
}

function shootSound() {
    g.soundEffect(
        880, //frequency
        0, //attack
        0.5, //decay
        "sawtooth", //waveform
        1, //Volume
        -0.8, //pan
        0, //wait before playing
        1500, //frequency bend amount
        false, //reverse bend
        0, //random frequency range
        10, //dissonance
        [0.2, 0.2, 1000], //echo array: [delay, feedback, filter]
        undefined //reverb array: [duration, decay, reverse?]
    );
}

function destroySound() {
    g.soundEffect(
        16, //frequency
        0, //attack
        1, //decay
        "sawtooth", //waveform
        1, //volume
        0, //pan
        0, //wait before playing
        0, //frequency bend amount
        false, //reverse
        0, //random frequency range
        50, //dissonance
        undefined //echo: [delay, feedback, filter]
    );
}