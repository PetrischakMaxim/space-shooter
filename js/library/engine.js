import * as utilities from "./utilities.js";
import * as display from "./display.js";
import * as tween from "./tween.js";
import {makePointer} from "./interactive.js";

export default class Game {
    constructor(width = 256, height = 256, setup, assetsToLoad, load) {

        Object.assign(this, utilities);
        Object.assign(this, display);
        Object.assign(this, tween);

        //Make the canvas and initialize the stage
        this.canvas = this.makeCanvas(width, height, "none");

        this.canvas.style.backgroundColor = "white";
        this.stage.width = this.canvas.width;
        this.stage.height = this.canvas.height;

        //Make the pointer
        this.pointer = makePointer(this.canvas);

        //Set the game `state`
        this.state = undefined;

        //Set the user-defined `load` and `setup` states
        this.load = load;
        this.setup = setup;

        //Get a reference to the `assetsToLoad` array
        this.assetsToLoad = assetsToLoad;

        //A Boolean to let us pause the game
        this.paused = false;

        //The `setup` function is required, so throw an error if it's
        //missing
        if (!setup) {
            throw new Error(
                "Please supply the setup function in the constructor"
            );
        }
    }

    //The game loop
    gameLoop() {
        requestAnimationFrame(this.gameLoop.bind(this));

        //Update all the buttons
        if (this.buttons.length > 0) {
            this.canvas.style.cursor = "auto";
            this.buttons.forEach(button => {
                button.update(this.pointer, this.canvas);
                if (button.state === "over" || button.state === "down") {
                    if (button.parent !== undefined) {
                        this.canvas.style.cursor = "pointer";
                    }
                }
            });
        }

        //Update all the tweens
        if (this.tweens.length > 0) {
            for (let i = this.tweens.length - 1; i >= 0; i--) {
                let tween = this.tweens[i];
                if (tween) tween.update();
            }
        }

        //Run the current game `state` function if it's been defined and
        //the game isn't `paused`
        if (this.state && !this.paused) {
            this.state();
        }

        //Render the canvas
        this.render(this.canvas);
    }

    //The `start` method that gets the whole engine going. This needs to
    //be called by the user from the game application code, right after
    //the engine is instantiated
    start() {
        if (this.assetsToLoad) {

            //Use the supplied file paths to load the assets then run
            //the user-defined `setup` function
            this.assets.load(this.assetsToLoad).then(() => {

                //Clear the game `state` function for now to stop the loop.
                this.state = undefined;

                //Call the `setup` function that was supplied by the user in
                //`Game` class's constructor
                this.setup();
            });

            //While the assets are loading, set the user-defined `load`
            //function as the game state. That will make it run in a loop.
            //You can use the `load` state to create a loading progress bar
            if (this.load) {
                this.state = this.load;
            }
        }

            //If there aren't any assets to load,
        //just run the user-defined `setup` function
        else {
            this.setup();
        }

        //Start the game loop
        this.gameLoop();
    }

    //Pause and resume methods
    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    scaleToWindow() {
        const scaleX = window.innerWidth / this.canvas.offsetWidth;
        const scaleY = window.innerHeight / this.canvas.offsetHeight;
        const scale = Math.min(scaleX, scaleY);
        this.canvas.style.transform = "scale(" + scale + ")";
    }
}
