/* ========================================================================== */
/* Factory functions & IIFE modules */
/* Includes basic error checking which may/may not be necessary */
/* ========================================================================== */

/**
 * This module is to be controlled by a game controller that will supply 
 * correct inputs in a valid order as defined by the rules of tic-tac-toe.
 * 
 * This module's functions offer minimal error checking: checking if arguments
 * are valid at face-value but not whether they are part of a valid game of 
 * tic-tac-toe. 
 */
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
    const state = {
        xWin: "xWin",
        oWin: "oWin",
        tie: "tie",
        ongoing: "ongoing"
    };

    /**
     * 
     * @param {Number} i 
     * @param {Number} j 
     * @returns Boolean
     */
    function isBlank(i, j) {
        if (i < 0 || j < 0 || i > 2 || j > 2)
            throw Error("Grid indices must be between 0 and 2, inclusive");

        return grid[i][j] === null;
    }
    
    /**
     * 
     * @param {Number} i 
     * @param {Number} j 
     * @param {String} mark 
     */
    function placeMark(i, j, mark) {
        if (i < 0 || j < 0 || i > 2 || j > 2)
            throw Error("Grid indices must be between 0 and 2, inclusive");
        if (mark !== MARK_X && mark !== MARK_O) 
            throw Error(`Mark must be either '${MARK_X}' or '${MARK_O}'`);
        if (!isBlank(i, j)) 
            throw Error(`Grid cell (${i}, ${j}) is not blank`);

        grid[i][j] = mark;
        numMarks++;
    }

    function resetBoard() {
        grid.forEach((row, i) => grid[i] = [null, null, null]);
        numMarks = 0; 
    }

    /**
     * 
     * @returns one of "xWin", "oWin", "tie", or "ongoing"
     */
    function getGameState() {
        const winner = getGameWinner();
        const isTie = winner === null && numMarks === 9;
        
        if (winner) {
            return winner === MARK_X ? state.xWin : state.oWin;
        }
        else if (isTie) {
            return state.tie;
        }
        else {
            return state.ongoing;
        }
    }

    /**
     * This function assumes at most 1 winner (that is: no winner or one of "x"
     * or "o" is the winner)
     * @returns "x" or "o" or null
     */
    function getGameWinner() {
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
    }

    return {
        isBlank, placeMark, resetBoard, getGameState
    };
})();

function createPlayer(name, mark) {
    if (typeof name !== "string")
        throw Error("Player name must be a string type");
    // @TODO connect this to GameBoard perhaps. it can return a getter for valid
    // marks
    if (mark !== "x" && mark !== "o")
        throw Error("Player mark must be either 'x' or 'o'");

    function getName() {
        return name;
    }
    function getMark() {
        return mark;
    }

    return {
        getName, getMark
    };
}

/* ========================================================================== */
/* TESTING */
/* ========================================================================== */

function log(expression) {
    console.log(expression);
}

