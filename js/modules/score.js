import {colors, fontFamily} from "./constants.js";
import Text from "../library/display.js"

export default class Score {

    constructor() {
        this.init();
    }

    init() {
        this.value = 0;
        this.message = new Text(`Score: ${this.value}`, `20px ${fontFamily}`, colors["primary"]);
        this.message.x = 10;
        this.message.y = 10;
    }

    update() {
        this.value++;
        this.message.content = `Score: ${this.value}`;
    }
}