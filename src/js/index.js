class Game {
    constructor() {
        this.field = {};

        this.createField();
    }

    createField() {
        for (let x = 1; x <= 3; x++) {
            for (let y = 1; y <= 3; y++) {
                this.field[`${x}:${y}`] = {
                    x: x,
                    y: y,
                    contain: null,
                };
            }
        }
        for (let x = 1; x <= 3; x++) {
            for (let y = 1; y <= 3; y++) {
                let cell = this.field[`${x}:${y}`];
                if (x !== 1) cell.left = this.field[`${x - 1}:${y}`];
                if (x !== 3) cell.right = this.field[`${x + 1}:${y}`];
                if (y !== 1) cell.up = this.field[`${x}:${y - 1}`];
                if (y !== 3) cell.down = this.field[`${x}:${y + 1}`];
            }
        }
    }
}
