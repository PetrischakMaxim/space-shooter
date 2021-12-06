import {Sprite} from "../library/display.js";

export default class Fire extends Sprite{
    constructor(source, parent) {
        super(source);
        this.source = source;
        this.width = parent.halfWidth;
        this.height = parent.halfHeight;
        this.x = this.width * -1;
        this.y = this.height / 2;
        this.scale = 0;
        this.scaleX = this.scale;
        this.scaleY = this.scale;
    }

    burn(scale) {
        this.scaleX = scale;
        this.scaleY = scale;
    }
}