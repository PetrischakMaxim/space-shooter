import {Sprite, circle} from "../library/display.js";
import Fire from "./fire.js";
import {keyboard} from "../library/interactive.js";
import {randomFloat, contain, shoot} from "../library/utilities.js";
import {colors} from "./constants.js";
import {shootSound} from "./sounds.js";


export class Rocket extends Sprite {
    _ratio = 2;

    constructor(source, fireSource, soundSource, bounds) {
        super(source);
        this.bounds = bounds;
        this.rotateStep = 0.05;
        this.rotationSpeed = 0;
        this.friction = 0.97;
        this.acceleration = 0.35;

        this.width = 186 / this._ratio;
        this.height = 95 / this._ratio;
        this.accelerationX = this.acceleration;
        this.accelerationY = this.acceleration;
        this.frictionX = this.friction;
        this.frictionY = this.friction;
        this.rotationSpeed = 0;
        this.moveForward = false;
        this.hit = false;
        this.immortal = false;
        this.sound = soundSource;
        this.fire = new Fire(fireSource, this);
        this.firePower = 0;
        this.bullets = [];
        this.controls = {
            left: keyboard(37),
            up: keyboard(38),
            right: keyboard(39),
            space: keyboard(32),
        }

        this.addChild(this.fire);
        this.setEvents(this.controls);
    }

    setEvents({left, right, up, space}) {
        left.press = () => this.turnLeft();
        left.release = () => {
            if (!right.isDown) this.stop();
        }
        right.press = () => this.turnRight();
        right.release = () => {
            if (!left.isDown) this.stop();
        }
        up.press = () => this.toggleMovement(true);
        up.release = () => this.toggleMovement(false);
        space.press = () => this.shootBullet();
    }

    turnLeft() {
        this.rotationSpeed = this.rotateStep * -1;
    }

    turnRight() {
        this.rotationSpeed = this.rotateStep;
    }

    stop() {
        this.rotationSpeed = 0;
    }

    toggleMovement(flag) {
        this.moveForward = flag;
        if (flag) {
            this.sound.play();
        }
    }

    startMovement() {
        this.rotation += this.rotationSpeed;
        if (this.moveForward) {
            this.vx += this.accelerationX * Math.cos(this.rotation);
            this.vy += this.accelerationY * Math.sin(this.rotation);
        } else {
            this.vx *= this.frictionX;
            this.vy *= this.frictionY;
        }
        this.x += this.vx;
        this.y += this.vy;
    }

    fly(callback) {
        this.fire.burn(1);

        this.startMovement();
        contain(this, this.bounds);

        if (this.isHit()) {
            callback();
        }
        this.hit = false;
    }

    shootBullet = () => {
        shoot(
            this,
            this.rotation,
            50,
            5,
            this.bullets,
            this.shoot,
        );
        shootSound();
    }

    shoot = () => {
        return circle(5, colors["primary"]);
    }

    isHit() {
        if (this.hit) {
            this.alpha = 0.5;
        } else {
            this.alpha = 1;
        }
        return this.hit;
    }
}

