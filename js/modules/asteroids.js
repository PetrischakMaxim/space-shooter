import Asteroid from "./asteroid.js";
import {assets, randomInt, contain} from "../library/utilities.js"
import {multipleCircleCollision, hit} from "../library/collision.js";
import {remove} from "../library/display.js";
import {destroySound} from "./sounds.js";

export default class Asteroids {

    constructor(bounds) {
        this.bounds = bounds;
        this.elements = [];
    }

    generate(count, scene, startX, endX, startY, endY) {
        for (let i = 0; i < count; i++) {
            const asteroid = new Asteroid(
                assets[`assets/images/asteroid-${randomInt(1, 5)}.png`],
                randomInt(startX, endX),
                randomInt(startY, endY),
            );
            this.elements.push(asteroid);
            scene.addChild(asteroid);
        }
    }

    fly(target, callback) {
        multipleCircleCollision(this.elements);

        this.elements = this.elements.filter(asteroid => {
            asteroid.fly();

            const hitEdge = contain(asteroid, this.bounds, true);

            if (hitEdge === "top" || hitEdge === "bottom") {
                asteroid.updateVelocity(["vy", "frictionY"]);
            }

            if (hitEdge === "left" || hitEdge === "right") {
                asteroid.updateVelocity(["vx", "frictionX"]);
            }

            if (hit(target, asteroid, true, true, false)) {
                callback();
                this.destroy(asteroid);
                return false;
            }
            return true;
        });
    }

    destroy(asteroid) {
        remove(asteroid);
        destroySound();
    }

}