function formatTime(time) {
    const hours = String(Math.floor(time / (1000 * 60 * 60))).padStart(2, "0");
    const minutes = String(Math.floor((time % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
    const seconds = String(Math.floor((time % (1000 * 60)) / 1000)).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
}

// Нужно переписать очередность ходов.
// Сразу сделать управление ходами - комп? рандом? игрок?

class Game {
    constructor() {
        this.field = {};
        this.gameStatusElement = document.getElementById("game-status-container");
        this.timeElement = document.getElementById("time");
        this.startButton = document.getElementById("start");
        this.startButton.addEventListener("click", () => this.startGame());

        this.modeSelectorElement = document.getElementsByName("mode");
        this.modeSelectorElement.forEach((El) => {
            if (El.checked) this.mode = El.value;
            El.addEventListener("click", (event) => {
                this.mode = event.target.value;
            });
        });

        this.renderInterval = undefined;

        this.startTime = undefined;
        this.gameIsStart = false;
        this.winner = null;
        this.isCircleTurn = true;
        this.createField();
    }

    getAImove() {
        // ИИ всегда играет за ноликов
        const miniMax = (F, turn, RL) => {
            RL = RL ? RL : 1;
            const terminate = this.isTerminate(F);
            if (terminate) {
                if (RL === 3) return -1000;
                return terminate === "circle" ? 1 : -10;
            }
            let emptyIndexes = [];
            F.forEach((El, ind) => {
                if (!El) emptyIndexes.push(ind);
            });
            const turns = emptyIndexes.map((Ind) => {
                let newF = [...F];
                newF[Ind] = turn === "circle" ? "circle" : "cross";
                const newTurn = turn === "circle" ? "cross" : "circle";
                return miniMax(newF, newTurn, RL + 1);
            });
            if (RL === 1) {
                const max = Math.max(...turns);
                const maxIndex = turns.findIndex((El) => El === max);
                console.log(emptyIndexes);
                console.log(turns);
                return emptyIndexes[maxIndex];
            } else {
                return turns.reduce((acc, Val) => (acc += Val), 0);
            }
        };

        const turn = miniMax(this.getFieldArray(), "circle");
        const x = (turn % 3) + 1;
        const y = Math.trunc(turn / 3) + 1;
        const cell = this.field[`${x}:${y}`];
        cell.drawCircle();
        return cell;
    }

    isTerminate(F) {
        function isLine(arr) {
            if (!arr.every((El) => El)) return false;
            const set = new Set(arr);
            if (set.size === 1) return Array.from(set)[0];
            return false;
        }

        if (isLine([F[0], F[1], F[2]])) return isLine([F[0], F[1], F[2]]);
        if (isLine([F[3], F[4], F[5]])) return isLine([F[3], F[4], F[5]]);
        if (isLine([F[6], F[7], F[8]])) return isLine([F[6], F[7], F[8]]);
        if (isLine([F[0], F[3], F[6]])) return isLine([F[0], F[3], F[6]]);
        if (isLine([F[1], F[4], F[7]])) return isLine([F[1], F[4], F[7]]);
        if (isLine([F[2], F[5], F[8]])) return isLine([F[2], F[5], F[8]]);
        if (isLine([F[0], F[4], F[8]])) return isLine([F[0], F[4], F[8]]);
        if (isLine([F[2], F[4], F[6]])) return isLine([F[2], F[4], F[6]]);
        return false;
    }

    getFieldArray() {
        let fieldArray = [];
        for (let y = 1; y <= 3; y++) {
            for (let x = 1; x <= 3; x++) {
                fieldArray.push(this.field[`${x}:${y}`].contain);
            }
        }
        return fieldArray;
    }

    cellClickHandler(cell) {
        if (!this.gameIsStart) return;
        if (cell.contain !== null) return;
        if (!this.isCircleTurn) {
            cell.drawCross();
        } else {
            if (this.mode === "player") {
                cell.drawCircle();
            }
        }
        this.isCircleTurn = !this.isCircleTurn;
        this.afterMoveHandler();
    }

    startGame() {
        this.gameIsStart = true;
        this.winner = null;
        this.clearField();

        this.startTime = Date.now();

        this.modeSelectorElement.forEach((El) => (El.disabled = true));

        clearInterval(this.renderInterval);
        this.renderInterval = setInterval(() => this.renderStatus(), 500);
        this.renderStatus();
        this.afterMoveHandler();
    }

    getRandomEmptyCell() {
        let cell = undefined;
        while (true) {
            const x = Math.trunc(Math.random() * 3 + 1);
            const y = Math.trunc(Math.random() * 3 + 1);
            cell = this.field[`${x}:${y}`];
            if (cell.contain === null) return cell;
        }
    }

    afterMoveHandler() {
        this.winner = (() => {
            for (let K = 1; K <= 3; K++) {
                const h = new Set([this.field[`${1}:${K}`].contain, this.field[`${2}:${K}`].contain, this.field[`${3}:${K}`].contain]);
                if (h.size === 1 && Array.from(h)[0] !== null) return Array.from(h)[0];
                const v = new Set([this.field[`${K}:${1}`].contain, this.field[`${K}:${2}`].contain, this.field[`${K}:${3}`].contain]);
                if (v.size === 1 && Array.from(v)[0] !== null) return Array.from(v)[0];
            }
            const A = new Set([this.field[`${1}:${1}`].contain, this.field[`${2}:${2}`].contain, this.field[`${3}:${3}`].contain]);
            if (A.size === 1 && Array.from(A)[0] !== null) return Array.from(A)[0];
            const B = new Set([this.field[`${1}:${3}`].contain, this.field[`${2}:${2}`].contain, this.field[`${3}:${1}`].contain]);
            if (B.size === 1 && Array.from(B)[0] !== null) return Array.from(B)[0];
            return null;
        })();
        if (this.winner) {
            this.gameIsStart = false;
            clearInterval(this.renderInterval);
            this.modeSelectorElement.forEach((El) => (El.disabled = false));
            this.renderStatus();
            return;
        }

        const isFieldFill = (() => {
            for (let C in this.field) {
                const Cell = this.field[C];
                if (!Cell.contain) return false;
            }
            return true;
        })();
        if (isFieldFill) {
            this.winner = "draw";
            this.gameIsStart = false;
            clearInterval(this.renderInterval);
            this.modeSelectorElement.forEach((El) => (El.disabled = false));
            this.renderStatus();
            return;
        }

        if (this.mode === "AI" && this.isCircleTurn) {
            this.getAImove();
            this.isCircleTurn = false;
            this.renderStatus();
            this.afterMoveHandler();
            return;
        }

        if (this.mode === "random" && this.isCircleTurn) {
            this.getRandomEmptyCell().drawCircle();
            this.isCircleTurn = false;
            this.renderStatus();
            this.afterMoveHandler();
            return;
        }

        this.renderStatus();
    }

    renderStatus() {
        if (!this.gameIsStart) {
            if (!this.winner) {
                this.gameStatusElement.innerText = "Нажмите СТАРТ чтобы начать игру";
            } else if (this.winner === "circle") {
                this.gameStatusElement.innerText = "Выиграли 🔴";
            } else if (this.winner === "cross") {
                this.gameStatusElement.innerText = "Выиграли ❌";
            } else if (this.winner === "draw") {
                this.gameStatusElement.innerText = "НИЧЬЯ!";
            }
        } else {
            if (this.isCircleTurn) {
                this.gameStatusElement.innerText = "Ход 🔴";
            } else {
                this.gameStatusElement.innerText = "Ход ❌";
            }
        }

        const time = Date.now();
        this.timeElement.innerText = formatTime(time - this.startTime);

        if (this.gameIsStart) {
            this.startButton.innerText = "Перезапустить игру";
        } else {
            this.startButton.innerText = "СТАРТ";
        }
    }

    clearField() {
        for (let C in this.field) {
            const cell = this.field[C];
            cell.drawNull();
        }
    }

    createField() {
        for (let x = 1; x <= 3; x++) {
            for (let y = 1; y <= 3; y++) {
                this.field[`${x}:${y}`] = {
                    cellElement: document.getElementById(`${x}:${y}`),
                    x: x,
                    y: y,
                    contain: null,
                    drawCircle() {
                        this.cellElement.innerText = "🔴";
                        this.contain = "circle";
                    },
                    drawCross() {
                        this.cellElement.innerText = "❌";
                        this.contain = "cross";
                    },
                    drawNull() {
                        this.cellElement.innerText = "";
                        this.contain = null;
                    },
                };
            }
        }
        for (let x = 1; x <= 3; x++) {
            for (let y = 1; y <= 3; y++) {
                let cell = this.field[`${x}:${y}`];
                cell.cellElement.addEventListener("click", () => {
                    this.cellClickHandler(cell);
                });
                if (x !== 1) cell.left = this.field[`${x - 1}:${y}`];
                if (x !== 3) cell.right = this.field[`${x + 1}:${y}`];
                if (y !== 1) cell.up = this.field[`${x}:${y - 1}`];
                if (y !== 3) cell.down = this.field[`${x}:${y + 1}`];
            }
        }
    }
}

const app = new Game();
window.app = app;
