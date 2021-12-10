import {gameSize, messages} from "./constants.js";
import {Rectangle, rectangle, sprite} from "../library/display.js";

export default class HealthBar {
    constructor(points = 6) {
        this.points = points;
        this.spriteSize = 20;
        this.width = this.points * this.spriteSize + this.points;
        this.rect = new Rectangle(this.width, this.spriteSize, "transparent");
        this.rect.x = gameSize - this.width - this.spriteSize / 2;
        this.rect.y = this.spriteSize / 2;
    }

    addSprite(stage,spriteSource) {
        stage.addChild(this.rect);
        for (let i = 0; i < this.points; i++) {
            const child = sprite(spriteSource);
            child.width = this.spriteSize;
            child.height = this.spriteSize;
            child.x = i * this.spriteSize + i;
            child.y = 0;
            this.rect.addChild(child);
        }
    }

    checkPoints(callback) {
        if (this.rect.children.length === 1) {
            callback();
            return;
        }
        this.rect.children.pop();
    }
}
