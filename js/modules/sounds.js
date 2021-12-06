import {soundEffect} from "../library/sound.js";

export const shootSound = () => {
    soundEffect(
        880, //frequency
        0, //attack
        0.5, //decay
        "sawtooth", //waveform
        1, //Volume
        -0.8, //pan
        0, //wait before playing
        1500, //frequency bend amount
        false, //reverse bend
        0, //random frequency range
        10, //dissonance
        [0.2, 0.2, 1000], //echo array: [delay, feedback, filter]
        undefined //reverb array: [duration, decay, reverse?]
    );
}

export const destroySound = () => {
    soundEffect(
        16, //frequency
        0, //attack
        1, //decay
        "sawtooth", //waveform
        1, //volume
        0, //pan
        0, //wait before playing
        0, //frequency bend amount
        true, //reverse
        0, //random frequency range
        50, //dissonance
        undefined //echo: [delay, feedback, filter]
    );
}