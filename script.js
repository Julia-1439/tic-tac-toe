/* ========================================================================== */
/* Factory functions & IIFE modules */
/* Includes basic error checking which may/may not be necessary */
/* ========================================================================== */

/**
 * This module is to be controlled by a game controller that should supply 
 * correct inputs in a valid order as defined by the rules of tic-tac-toe. 
 * The only error-checking this module provides is not allowing a mark to be
 * placed in an already occupied cell. 
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
        return grid[i][j] === null;
    }
    
    /**
     * 
     * @param {Number} i 
     * @param {Number} j 
     * @param {String} mark 
     * @returns a state from `states` or, if attempted to place a mark in an
     * already occupied cell, false 
     */
    function placeMark(i, j, mark) {
        if (!isBlank(i, j)) 
            return false;

        grid[i][j] = mark;
        numMarks++;
        return computeState();
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
            return (winningMark === MARK_X) ? states.xWin : states.oWin;
        }
        else if (isTie) {
            return states.tie;
        }
        else {
            return states.ongoing;
        }
    }

    /**
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
        placeMark, resetBoard, 
        getGridCopy, getPossibleStates, getValidMarks
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

    function getNextMark() {
        if (!hasGameBegun()) 
            return "";

        return (turn === 1) ? MARK_X : MARK_O;
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
     * @param {Number} i 
     * @param {Number} j 
     * @returns either a status belonging to gameBoard.getPossibleStates() or, 
     * if the cell requested is already occupied, then false
     */
    function playTurn(i, j) {
        if (!hasGameBegun())
            throw Error("A game has not started yet");
        
        const markToPlace = (turn === 1) ? MARK_X : MARK_O;
        const gameState = gameBoard.placeMark(i, j, markToPlace);
        if (!gameState)
            return false;
        
        switch (gameState) {
            case boardStates.ongoing: 
                toggleTurn();
                break;
            case boardStates.xWin:
                player1.incrementScore();
                endGame();
                break;
            case boardStates.oWin:
                player2.incrementScore();
                endGame();
                break;
            case boardStates.tie:
                endGame();
                break;
        }
        return gameState;
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
        createPlayers, hasGameBegun, playGame, playTurn, getNextMark, 
        endGame, getPlayerData
    };
})();

const gameDisplay = (function () {
    const [MARK_X, MARK_O] = gameBoard.getValidMarks();
    const boardStates = gameBoard.getPossibleStates();


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
            update();

            playersButton.parentElement.removeChild(playersButton);
            restartButton.style["visibility"] = "visible";
            alert.textContent = "";
        }

        playersForm.reset(); 
    });

    restartButton.addEventListener("click", (evt) => {
        gameControl.endGame();
        gameControl.playGame();
        update();
        alert.textContent = "Game has restarted!";
    });

    const turnIndicator = document.querySelector("#turn-container > span");
    function update() {
        const gameArray = gameBoard.getGridCopy();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const cell = grid.querySelector(`[data-i="${i}"][data-j="${j}"]`);
                cell.textContent = gameArray[i][j];
            }
        }  
        turnIndicator.textContent = gameControl.getNextMark();
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
        const gameStatus = gameControl.playTurn(i, j);
        if (!gameStatus){
            alert.textContent = "That spot is already filled";
            return;
        }

        update();
        if (gameStatus === boardStates.ongoing) {
            return;
        }

        handleGameEnd(gameStatus);
    }

    const resultsDialog = document.querySelector("#results-dialog");
    function handleGameEnd(gameStatus) {
        const line1 = resultsDialog.querySelector("#results-line-1");
        const line2 = resultsDialog.querySelector("#results-line-2");

        const {player1: p1Data, player2: p2Data} = gameControl.getPlayerData();
        let statusMsg;
        switch (gameStatus) {
            case boardStates.xWin: statusMsg =
                `"${p1Data.name}" (${MARK_X}) has won the game!`;
                break;
            case boardStates.oWin: statusMsg =
                `"${p2Data.name}" (${MARK_O}) has won the game!`;
                break;
            case boardStates.tie: statusMsg = 
                `The game is a tie!`;
                break;

        }

        resultsDialog.showModal();
        line1.textContent = statusMsg;
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

