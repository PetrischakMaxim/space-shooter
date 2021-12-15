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

    generate(scene, startX, endX, startY, endY) {
        for (let i = 0; i < randomInt(6,10); i++) {
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

        this.elements.forEach(asteroid => {
            asteroid.fly();

            const hitEdge = contain(asteroid, this.bounds, true);

            if (hitEdge === "top" || hitEdge === "bottom") {
                asteroid.updateVelocity(["vy", "frictionY"]);
            }

            if (hitEdge === "left" || hitEdge === "right") {
                asteroid.updateVelocity(["vx", "frictionX"]);
            }

            if (hit(target, asteroid, true, true, false)) {
                this.destroy(asteroid);
                callback();
            }
        });
    }

    destroy(asteroid) {
        const target = this.elements.indexOf(asteroid);
        this.elements.splice(target, 1);
        remove(asteroid);
        destroySound();
    }
}