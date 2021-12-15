import {Sprite} from "../library/display.js";
import {randomInt} from "../library/utilities.js";

export default class Asteroid extends Sprite {
    constructor(source, x, y) {
        super(source);
        this.x = x;
        this.y = y;
        this.friction = 0.85;
        this.velocity = randomInt(-3, 3);
        this.size = randomInt(15, 40);
        this.width = this.size;
        this.height = this.size;
        this.circular = true;
        this.vx = this.velocity;
        this.vy = this.velocity;
        this.frictionX = this.friction;
        this.frictionY = this.friction;
        this.mass = 0.5 + (this.diameter / 32);
    }

    fly() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += 0.01;
    }

    updateVelocity(velocityAxis, frictionAxis) {
        this[velocityAxis] *= this[frictionAxis];
    }
}