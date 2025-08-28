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
    const states = {
        xWin: "xWin",
        oWin: "oWin",
        tie: "tie",
        ongoing: "ongoing"
    };

    function getValidMarks() {
        return [MARK_X, MARK_O];
    }
    function getGameStates() {
        return states;
    }

    /**
     * 
     * @param {Number} i 
     * @param {Number} j 
     * @returns Boolean
     */
    function isBlank(i, j) {
        if (i < 0 || j < 0 || i > 2 || j > 2 || 
            !Number.isInteger(i) || !Number.isInteger(j)
        )
            throw Error("Grid indices must be integers between 0 and 2, inclusive");

        return grid[i][j] === null;
    }
    
    /**
     * 
     * @param {Number} i 
     * @param {Number} j 
     * @param {String} mark 
     */
    function placeMark(i, j, mark) {
        if (i < 0 || j < 0 || i > 2 || j > 2 || 
            !Number.isInteger(i) || !Number.isInteger(j)
        )
            throw Error("Grid indices must be integers between 0 and 2, inclusive");
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
    function computeState() {
        const winningMark = computeWinningMark();
        const isTie = winningMark === null && numMarks === 9;
        
        if (winningMark) {
            return winningMark === MARK_X ? states.xWin : states.oWin;
        }
        else if (isTie) {
            return states.tie;
        }
        else {
            return states.ongoing;
        }
    }

    /**
     * This function assumes at most 1 winner (that is: no winner or one of "x"
     * or "o" is the winner)
     * @returns "x" or "o" or null
     */
    function computeWinningMark() {
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
        placeMark, resetBoard, computeState,
        getGameStates, getValidMarks
    };
})();

function createPlayer(name, mark) {
    const validMarks = gameBoard.getValidMarks();

    if (typeof name !== "string")
        throw Error("Player name must be a string type");
    if (!validMarks.includes(mark))
        throw Error(`Player mark must be one of ${validMarks}`);

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

