import {Sprite} from "../library/display.js";

export default class Fire extends Sprite{
    constructor(source, parent) {
        super(source);
        this.source = source;
        this.width = parent.halfWidth;
        this.height = parent.halfHeight;
        this.x = this.width * -1;
        this.y = this.height / 2;
        this.scaleX = 0;
        this.scaleY = 0;
    }

    burn(scale) {
        this.scaleX = scale;
        this.scaleY = scale;
    }
}