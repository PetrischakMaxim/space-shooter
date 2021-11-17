import {
    game
} from "./library/engine.js";

let gameSize = 512;

let g = game(
    gameSize, gameSize, setup,
    [
        "images/asteroid-1.png",
        "images/asteroid-2.png",
        "images/heart.png",
        "images/spaceship.png",
        "images/main-bg.jpg",
        "images/fire.png",
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
    multipleCircleCollision,
    randomFloat
} = g;

let rocket, background, gameScene, bullets, asteroids, rocketHit, score, scoreMessage, healthBar;
let font = "20px puzzler";

let topOffset = 40;
let localBounds = {x: 0, y: topOffset, width: stage.width, height: stage.height};

g.start();

g.scaleToWindow();

window.addEventListener("resize", () => {
    g.scaleToWindow("#000");
});


function load() {
    progressBar.create(canvas, assets);
    progressBar.update();
}

function setup() {
    progressBar.remove();

    bullets = [];
    asteroids = [];
    background = sprite(assets["images/main-bg.jpg"]);

    let topBar = rectangle(gameSize, topOffset, "white");

    healthBar = initHealthBar();
    topBar.addChild(healthBar);

    initScore();
    topBar.addChild(scoreMessage);

    rocket = initRocket();
    stage.putCenter(rocket);
    gameScene = group(background, rocket, topBar);

    generateAsteroids();
    setEvents(rocket, rocket.shotBullet);

    g.state = play;
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
    fire = setupFire();
    rocket.addChild(fire);

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

    rocket.shotBullet = () => {
        shoot(
            rocket,
            rocket.rotation,
            50,
            5,
            bullets,
            () => circle(randomInt(5, 10), 'yellow')
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
    }

    function isHit() {
        if (rocketHit) {
            rocket.alpha = 0.5;
        } else {
            rocket.alpha = 1;
        }
        return rocketHit;
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

function bulletsFly() {
    bullets = bullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        bulletHitWithAsteroid(bullet, asteroids)
        let boundsContain = contain(bullet, localBounds);
        if (boundsContain) {
            remove(bullet);
            return false;
        }

        return true;
    });
}

function bulletHitWithAsteroid(bullet, asteroids) {
    hit(bullet, asteroids, false, false, false,
        (collision, asteroid) => {
            destroyAsteroid(asteroid);
            updateScore();
        }
    );
}

function initHealthBar() {
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

function initScore() {
    score = 0;
    scoreMessage = text(`Score: ${score}`, font, "purple");
    scoreMessage.x = 10;
    scoreMessage.y = 10;
}

function generateAsteroids() {
    let numberOfAsteroids = randomInt(3, 5);

    for (let i = 0; i < numberOfAsteroids; i++) {
        let asteroid = sprite(assets[`images/asteroid-${randomInt(1, 2)}.png`]);
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
}


function updateScore() {
    score++;
    scoreMessage.content = `Score: ${score}`;
}

function destroyAsteroid(asteroid) {
    let hitAsteroid = asteroids.indexOf(asteroid);
    asteroids.splice(hitAsteroid, 1);
    remove(asteroid);
}

function asteroidsFly() {
    rocketHit = false;

    multipleCircleCollision(asteroids);
    asteroids.forEach(asteroid => {
        asteroid.x += asteroid.vx;
        asteroid.y += asteroid.vy;

        let hitEdge = contain(asteroid, localBounds, true);
        if (hitEdge === "top" || hitEdge === "bottom") {
            asteroid.vy *= asteroid.frictionY;
        }
        if (hitEdge === "left" || hitEdge === "right") {
            asteroid.vx *= asteroid.frictionX;
        }

        if (hit(rocket, asteroid, true, true, false)) {
            rocketHit = true;
            destroyAsteroid(asteroid);
        }
    });
}

function play() {
    rocket.fly(() => healthBar.children.pop());
    bulletsFly();
    asteroidsFly();
}