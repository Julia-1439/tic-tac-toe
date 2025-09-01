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
     * @param {String} mark  
     * @returns a state from `states`; or if attempted to place a mark in an
     * already occupied cell, false, to signal failure
     */
    function placeMark(i, j, mark) {
        if (!isBlank(i, j)) 
            return false;

        grid[i][j] = mark;
        numMarks++;
        return computeState();
    }

    /**
     * @param {Number} i 
     * @param {Number} j 
     * @returns Boolean
     */
    function isBlank(i, j) {
        return grid[i][j] === null;
    }

    function resetBoard() {
        grid.forEach((row, i) => grid[i] = [null, null, null]);
        numMarks = 0; 
    }

    /**
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
        placeMark, 
        resetBoard, 
        getGridCopy, 
        getPossibleStates, 
        getValidMarks
    };
})();

/**
 * 
 * @param {String} name 
 * Factory function to create 2 players
 */
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
        getName, 
        getScore,
        incrementScore
    };
}

/**
 * This module provides functions to the displayControl module for it to 
 * create players, start/restart a game, dictate player turn, and retrieve 
 * results. 
 * 
 * Error checks are provided in the functions to provide context for when they 
 * should be used and for testing, but they are not actually used by the game
 * itself. 
 */
const gameControl = (function () {
    let player1;
    let player2;
    let turn = null; // 1, 2, or null. also a proxy for whether game has started
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
            return null;

        return (turn === 1) ? MARK_X : MARK_O;
    }

    /**
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
     * @returns if mark placing is successful, a status from boardStates. if
     * mark placing unsuccessful, then false, signalling failure 
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


    /**
     * Prevents further player input by nullifying 'turn'. Note that the board
     * is not reset so that players can still view it after game's end. Board
     * is only reset when playGame() is called.
     */
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
        createPlayers, 
        hasGameBegun, 
        playGame, 
        playTurn, 
        getNextMark, 
        endGame, 
        getPlayerData
    };
})();

// @TODO refactor this whole module because it kind of got out of hand
const gameDisplay = (function () {
    const [MARK_X, MARK_O] = gameBoard.getValidMarks();
    const boardStates = gameBoard.getPossibleStates();


    const grid = document.querySelector("#ttt-grid");
    const cells = grid.querySelectorAll(".ttt-cell");
    const alert = document.querySelector("#alert-container");
    cells.forEach((cell) => {
        cell.addEventListener("click", handleCellClick); // (note)
    }); 
    /*  Note: despite my reluctant to add event listeners to each cell (not as 
    performant as adding one only to the parent grid), I did it because 
    otherwise I'm unsure how to ensure the cell receives the click event when I 
    have an SVG overshadowing the cell that I wish to target. */

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
            restartButton.style["display"] = "revert";
            alert.textContent = "";
        }

        playersForm.reset(); 
    });
    playersForm.addEventListener("formdata", (evt) => {
        const formData = evt.formData;
        formData.set("p1name", formData.get("p1name").toUpperCase());
        formData.set("p2name", formData.get("p2name").toUpperCase());
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
                const mark = gameArray[i][j];
                putMark(cell, gameArray[i][j]);
            }
        }  
        turnIndicator.textContent = gameControl.getNextMark();
    }


    // @NOTE: might have to do better error handling, perhaps through some error 
    // messages that gameControl can return for the display to print.
    function handleCellClick(evt) {
        const cellElement = evt.currentTarget;
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
                `Player "${p1Data.name}" (${MARK_X}) has won the game!`;
                break;
            case boardStates.oWin: statusMsg =
                `Player "${p2Data.name}" (${MARK_O}) has won the game!`;
                break;
            case boardStates.tie: statusMsg = 
                `The game is a tie!`;
                break;

        }

        resultsDialog.showModal();
        line1.textContent = statusMsg;
        line2.textContent = 
            `Score: "${p1Data.name}" ${p1Data.score} | ${p2Data.score} "${p2Data.name}"`;
    }

    const playAgainBtn = resultsDialog.querySelector("#play-again-btn");
    playAgainBtn.addEventListener("click", (evt) => {
        resultsDialog.close();
        gameControl.endGame();
        gameControl.playGame();
        update();
        alert.textContent = "";
    });

    function putMark(cell, mark) {
        switch (mark) {
            case MARK_X: cell.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 18 18"><title>multiply</title><path d="M16 16H14V15H13V14H12V13H10V14H9V15H8V16H6V14H7V13H8V12H9V10H8V9H7V8H6V6H8V7H9V8H10V9H12V8H13V7H14V6H16V8H15V9H14V10H13V12H14V13H15V14H16Z" fill="black"/></svg>`;
                break;
            case MARK_O: cell.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 30 30"><title>circle</title><path d="M15 1V2H17V3H18V4H19V5H20V7H21V15H20V17H19V18H18V19H17V20H15V21H7V20H5V19H4V18H3V17H2V15H1V7H2V5H3V4H4V3H5V2H7V1H15M14 3H8V4H6V5H5V6H4V8H3V14H4V16H5V17H6V18H8V19H14V18H16V17H17V16H18V14H19V8H18V6H17V5H16V4H14V3Z" fill="black"/></svg>`;
                break;
            case null: cell.textContent = "";
                break;
        }
    }


    return {
        update //@TODO might remove
    };
})();

/* 
@TODO add styling to the ending dialog
@TODO add styling to the notification indicators
@TODO refactor gameDisplay module to be less spaghetti
*/

/* ========================================================================== */
/* TESTING */
/* ========================================================================== */

function log(expression) {
    console.log(expression);
}

