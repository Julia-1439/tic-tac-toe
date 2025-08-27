/* ========================================================================== */
/* Factory functions & IIFE modules */
/* Includes basic error checking which may/may not be necessary */
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
    const MARK_X = "x";
    const MARK_O = "o";

    /**
     * 
     * @param {Number} i 
     * @param {Number} j 
     * @returns Boolean
     */
    const isBlank = function (i, j) {
        if (i < 0 || j < 0 || i > 2 || j > 2)
            throw Error("Grid indices must be between 0 and 2, inclusive");

        return grid[i][j] === null;
    };
    
    /**
     * 
     * @param {Number} i 
     * @param {Number} j 
     * @param {String} mark 
     */
    const placeMark = function (i, j, mark) {
        if (i < 0 || j < 0 || i > 2 || j > 2)
            throw Error("Grid indices must be between 0 and 2, inclusive");
        if (mark !== MARK_X && mark !== MARK_O) 
            throw Error(`Mark must be either '${MARK_X}' or '${MARK_O}'`);
        if (!isBlank(i, j)) 
            throw Error(`Grid cell (${i}, ${j}) is not blank`);

        grid[i][j] = mark;
        numMarks++;
    };

    const resetBoard = function () {
        grid.forEach((row, i) => grid[i] = [null, null, null]);
        numMarks = 0; 
    };

    /**
     * This function assumes at most 1 winner (that is: no winner or one of "x"
     * or "o" is the winner)
     * @returns "x" or "o" or null
     */
    const getGameWinner = function () {
        const gridFlat = grid.flat();
        
        // Check the grid against the winning configurations until one is found 
        // or all are exhausted with no winner found
        for (config of winnerConfigs) {
            for (mark of [MARK_X, MARK_O]) {
                const isMarkWinner = gridFlat
                    .map((val, i) => val === mark && config[i])
                    .every((maskedVal, i) => maskedVal === config[i]);
                if (isMarkWinner) return mark;
            }
        }
        return null;
    };

    return {
        isBlank, placeMark, resetBoard, 
        grid,  // for testing only
    };
})();

/* ========================================================================== */
/* TESTING */
/* ========================================================================== */

function log(expression) {
    console.log(expression);
}

