/* ========================================================================== */
/* Factory functions & IIFE modules */
/* ========================================================================== */

const gameBoard = (function () {
    const grid = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ];
    const winnerConfigs = [
        // horizontals
        [true , true , true , false, false, false, false, false, false], 
        [false, false, false, true , true , true , false, false, false], 
        [false, false, false, false, false, false, true , true , true ], 
        // verticals
        [true , false, false, true , false, false, true , false, false], 
        [false, true , false, false, true , false, false, true , false], 
        [false, false, true , false, false, true , false, false, true ], 
        // diagonals
        [true , false, false, false, true , false, false, false, true ], 
        [false, false, true , false, true , false, true , false, false]
    ];
    let p1Mark;
    let p2Mark;

    return {};
})();

/* ========================================================================== */
/* TESTING */
/* ========================================================================== */

function log(thing) {
    console.log(thing);
}
