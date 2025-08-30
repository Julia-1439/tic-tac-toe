/* ========================================================================== */
/* Factory functions & IIFE modules */
/* Includes basic error checking which may/may not be necessary */
/* ========================================================================== */

/**
 * This module is to be controlled by a game controller that will supply 
 * correct inputs in a valid order as defined by the rules of tic-tac-toe. 
 * @TODO might implement the isBlank check in the game controller. might want
 * them to have the greatest "control". will depend on how displayControl works
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
    function getGridCopy() {
        return [...grid];
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
        placeMark, computeState, resetBoard, getGridCopy,
        getPossibleStates, getValidMarks
    };
})();

function createPlayer(name) {
    if (typeof name !== "string")
        throw Error("Player name must be a string type");

    let score = 0;
    
    function getName() {
        return name;
    }
    function incrementScore() {
        score++;
    }
    function getScore() {
        return score;
    }

    return {
        getName, incrementScore, getScore
    };
}

/**
 * This module provides functions to create players, start/restart a game,
 * and dictate player turn. 
 */
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

        player1 = createPlayer(name1);
        player2 = createPlayer(name2);
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
        
        const markToPlace = (turn === 1) ? MARK_X : MARK_O;
        gameBoard.placeMark(i, j, markToPlace);
        
        const gameState = gameBoard.computeState();
        let statusMsg = null;
        switch (gameState) {
            case boardStates.ongoing: 
                toggleTurn();
                return statusMsg;

            case boardStates.xWin:
                player1.incrementScore();
                statusMsg = 
                    `"${player1.getName()}" (${MARK_X}) has won the game!`;
                break;
            case boardStates.oWin:
                player2.incrementScore();
                statusMsg = 
                    `"${player2.getName()}" (${MARK_O}) has won the game!`;
                break;
            case boardStates.tie:
                statusMsg = "The game is a tie!";
                break;
        }

        endGame();
        return statusMsg;
    }

    function endGame() {
        turn = null;
    }

    function getPlayerData() {
        return {
            player1: {
                name: player1.getName(),
                score: player1.getScore()
            },
            player2: {
                name: player2.getName(),
                score: player2.getScore()
            },
        }
    }

    return {
        createPlayers, playGame, endGame, playTurn, 
        getPlayerData, hasGameBegun,
    };
    
})();

const gameDisplay = (function () {

    const grid = document.querySelector("#ttt-grid");
    const alert = document.querySelector("#alert-box > p");
    grid.addEventListener("click", (evt) => {
        const target = evt.target;
        if (!target.classList.contains("ttt-cell")) {
            return;
        }

        const cell = target;
        handleCellClick(cell);
    });

    const playersButton = document.querySelector("#open-create-players");
    const playersDialog = document.querySelector("#create-players-dialog");
    playersButton.addEventListener("click", (evt) => {
        playersDialog.showModal();
    });

    const playersForm = playersDialog.querySelector("form");
    const restartButton = document.querySelector("#restart-game");
    playersForm.addEventListener("submit", (evt) => {
        if (evt.submitter.id === "create-players-btn") {
            // Use the FormData constructor since the form method ("dialog") 
            // does not transmit the data via a formdata event
            const formData = new FormData(playersForm);
            const [p1name, p2name] = [formData.get("p1name"), formData.get("p2name")];
            gameControl.createPlayers(p1name, p2name); 
            gameControl.playGame();

            playersButton.parentElement.removeChild(playersButton);
            restartButton.style["visibility"] = "visible";
        }

        playersForm.reset(); 
    });

    restartButton.addEventListener("click", (evt) => {
        gameControl.endGame();
        gameControl.playGame();
        update();
        alert.textContent = "Game has restarted!";
    });

    // @NOTE: each function here will probably be an event listener
    function update() {
        const gameArray = gameBoard.getGridCopy();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const cell = grid.querySelector(`[data-i="${i}"][data-j="${j}"]`);
                cell.textContent = gameArray[i][j];
            }
        }  
    }


    // @NOTE: might have to do better error handling, perhaps through some error 
    // messages that gameControl can return for the display to print.
    function handleCellClick(cellElement) {
        if (!gameControl.hasGameBegun()) {
            alert.textContent = "A game has not begun yet!";
            return;
        }

        alert.textContent = ""; // Clear any prior alert message
        const [i, j] = [cellElement.getAttribute("data-i"), 
            cellElement.getAttribute("data-j")].map(Number);
        
        try {
            const statusMsg = gameControl.playTurn(i, j);
            update();
            if (statusMsg === null)
                return; // game is ongoing
    
            handleGameEnd(statusMsg);
        }
        catch (err) {
            alert.textContent = "That spot is already filled";
            return;
        }        
    }

    const resultsDialog = document.querySelector("#results-dialog");
    function handleGameEnd(text) {
        resultsDialog.showModal();
        const line1 = resultsDialog.querySelector("#results-line-1");
        const line2 = resultsDialog.querySelector("#results-line-2");
        line1.textContent = text;
        const {player1: p1Data, player2: p2Data} = gameControl.getPlayerData();
        line2.textContent = 
            `"${p1Data.name}" ${p1Data.score} | ${p2Data.score} "${p2Data.name}"`;
    }

    const playAgainBtn = resultsDialog.querySelector("#play-again-btn");
    playAgainBtn.addEventListener("click", (evt) => {
        resultsDialog.close();
        gameControl.endGame();
        gameControl.playGame();
        update();
        alert.textContent = "";
    });


    return {
        update //@TODO might remove
    };
})();

/* ========================================================================== */
/* TESTING */
/* ========================================================================== */

function log(expression) {
    console.log(expression);
}

