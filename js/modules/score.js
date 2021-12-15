import {Color, fontFamily} from "./constants.js";
import Text from "../library/display.js"

export default class Score {

    constructor() {
        this.value = 0;
        this.message = new Text(`Score: ${this.value}`, `20px ${fontFamily}`, Color.Primary);
        this.message.x = 10;
        this.message.y = 10;
    }

    update() {
        this.value++;
        this.message.content = `Score: ${this.value}`;
    }
}