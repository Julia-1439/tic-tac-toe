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
    let numMarks = 0;

    const isBlank = function (i, j) {
        if (i < 0 || j < 0 || i > 2 || j > 2)
            throw Error("Grid indices must be between 0 and 2, inclusive")

        return grid[i][j] === null;
    };
    
    const placeMark = function (i, j, mark) {
        if (i < 0 || j < 0 || i > 2 || j > 2)
            throw Error("Grid indices must be between 0 and 2, inclusive")
        if (!isBlank(i, j)) {
            throw Error(`Grid cell (${i}, ${j}) is not blank`);
        }

        grid[i][j] = mark;
        numMarks++;
    };

    const resetBoard = function () {
        grid.forEach((row, i) => grid[i] = [null, null, null]);
        numMarks = 0; // find out more about primitives and how they work with closures
    };


    return {
        isBlank, placeMark, resetBoard,
        grid,  // for testing only
    };
})();

/* ========================================================================== */
/* TESTING */
/* ========================================================================== */

function log(thing) {
    console.log(thing);
}

gameBoard.placeMark(0,0,"x");
gameBoard.placeMark(2,2,"o");

log(gameBoard.isBlank(0,2));
log(gameBoard.isBlank(2,2));