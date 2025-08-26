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

    const isBlank = function (i, j) {
        if (i < 0 || j < 0 || i > 2 || j > 2)
            throw Error("Grid indices must be between 0 and 2, inclusive")
        return grid[i][j] === null;
    };


    return {isBlank};
})();

/* ========================================================================== */
/* TESTING */
/* ========================================================================== */

function log(thing) {
    console.log(thing);
}

log(gameBoard.isBlank(0, 2));
log(gameBoard.isBlank(3, 4));
log(gameBoard.isBlank(3, 2));

