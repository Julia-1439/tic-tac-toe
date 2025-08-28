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
 * tic-tac-toe. The game flow is instead dicated by the game controller module.
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
    function getPossibleStates() {
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
     * @NOTE room for optimization: moving ongoing case upward
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
     * This function returns at most 1 winner (that is: no winner or one of "x"
     * or "o" is the winner, but no two winners)
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
        placeMark, computeState, resetBoard, 
        getPossibleStates, getValidMarks
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

const gameControl = (function () {
    let player1;
    let player2;
    let turn = null; // used as a proxy for whether a game has started
    const [MARK_X, MARK_O] = gameBoard.getValidMarks();
    const boardStates = gameBoard.getPossibleStates();

    function hasGameBegun() {
        return turn !== null;
    }

    function toggleTurn() {
        if (!hasGameBegun()) 
            throw Error("A game has not started yet");

        turn = (turn === 1) ? 2 : 1;
    }

    /**
     * Error handling on the arguments are done by the createPlayer factory func
     * @param {String} name1 
     * @param {String} name2 
     */
    function createPlayers(name1, name2) {
        if (player1 !== undefined && player2 !== undefined)
            throw Error("The players are already created");
        if (hasGameBegun()) 
            throw Error("A game is already in progress");

        player1 = createPlayer(name1, MARK_X);
        player2 = createPlayer(name2, MARK_O);
    }

    function playGame() {
        if (player1 === undefined || player2 === undefined)
            throw Error("Players must be created first");
        if (hasGameBegun())
            throw Error("A game is already in progress");

        gameBoard.resetBoard();
        turn = 1;
    }

    /**
     * Error handling for the indices is done by the gameBoard module,
     * including collision checking
     * @param {Number} i 
     * @param {Number} j 
     */
    function playTurn(i, j) {
        if (!hasGameBegun())
            throw Error("A game has not started yet");
        
        const markToPlace = 
            (turn === 1) ? player1.getMark() : player2.getMark();
        gameBoard.placeMark(i, j, markToPlace);
        
        const gameState = gameBoard.computeState();
        switch (gameState) {
            case boardStates.ongoing: 
                toggleTurn();
                break;
            case boardStates.xWin:
                console.log(`X has won the game!`);
                concludeGame();
                break;
            case boardStates.oWin:
                console.log(`O has won the game!`);
                concludeGame();
                break;
            case boardStates.tie:
                console.log(`The game is a tie!`);
                concludeGame();
                break;
        }
    }

    function concludeGame() {
        turn = null;
    }

    return {
        createPlayers, playGame, playTurn
    };
    
})();

/* ========================================================================== */
/* TESTING */
/* ========================================================================== */

function log(expression) {
    console.log(expression);
}

