import {Sprite, circle} from "../library/display.js";
import Fire from "./fire.js";
import {keyboard} from "../library/interactive.js";
import {randomFloat, contain, shoot} from "../library/utilities.js";
import {Color} from "./constants.js";
import {shootSound} from "./sounds.js";

export default class Rocket extends Sprite {

    constructor(source, fireSource, soundSource, bounds) {
        super(source);
        this.bounds = bounds;
        this.rotateStep = 0.025;
        this.rotationSpeed = 0;
        this.friction = 0.975;
        this.acceleration = 0.35;
        this.ratio = 2;
        this.width = 186 / this.ratio;
        this.height = 95 / this.ratio;
        this.accelerationX = this.acceleration;
        this.accelerationY = this.acceleration;
        this.frictionX = this.friction;
        this.frictionY = this.friction;
        this.rotationSpeed = 0;
        this.flyForward = false;
        this.hit = false;
        this.sound = soundSource;
        this.fire = new Fire(fireSource, this);
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
        up.press = () => this.toggleFlight(true);
        up.release = () => this.toggleFlight(false);
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

    toggleFlight(flag) {
        this.flyForward = flag;
        if (this.flyForward) {
            this.sound.play();
        }
    }

    updateFlight() {
        this.rotation += this.rotationSpeed;
        if (this.flyForward) {
            this.vx += this.accelerationX * Math.cos(this.rotation);
            this.vy += this.accelerationY * Math.sin(this.rotation);
            this.fire.burn(randomFloat(0.8, 1.5));
        } else {
            this.vx *= this.frictionX;
            this.vy *= this.frictionY;
            this.fire.burn(randomFloat(0.4, 0.7));
        }
        this.x += this.vx;
        this.y += this.vy;
    }

    fly(callback) {
        this.updateFlight();
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

    shoot = () => circle(5, Color.Primary);

    bulletsFly(callback, asteroids) {
        this.bullets = this.bullets.filter(bullet => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;

            callback(bullet, asteroids);

            if (contain(bullet, this.bounds)) {
                bullet.alpha = 0;
                return false;
            }

            return true;
        });
    }

    isHit() {
        (this.hit) ? (this.alpha = 0.5) : (this.alpha = 1);
        return this.hit;
    }
}