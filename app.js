const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

//camera offset of the board
let offsetX = window.innerWidth / 2;
let offsetY = -16;
//how much to offset tiles while drawing. scales with globalScale
let tileVectorX = 16;
let tileVectorY = 8;
//how large is the art for the tiles
let imageWidth = 32;
let imageHeight = 32;
//scale of tiles, units, etc (zoom)
let globalScale = 2;

let selectedTileX = -1;
let selectedTileY = -1;

//amount of tiles WIDTH * HEIGHT
const GRID_WIDTH = 31;
const GRID_HEIGHT = 30;

function windowFullscreen() {
    [canvas.width, canvas.height] = [window.innerWidth - 10, window.innerHeight - 10];
    ctx.imageSmoothingEnabled = false;
}

windowFullscreen();
window.onresize = windowFullscreen;

//key events

let buttonPressedUpArrow = false;
let buttonPressedDownArrow = false;
let buttonPressedLeftArrow = false;
let buttonPressedRightArrow = false;

window.onkeydown = (e) => {
    switch (e.key) {
        case "ArrowUp":
            buttonPressedUpArrow = true;
            break;
        case "ArrowDown":
            buttonPressedDownArrow = true;
            break;
        case "ArrowLeft":
            buttonPressedLeftArrow = true;
            break;
        case "ArrowRight":
            buttonPressedRightArrow = true;
            break;
        case "=":
            globalScale++;
            break;
        case "-":
            globalScale--;
            break;
    }
}

window.onkeyup = (e) => {
    console.log(e.key)
    switch (e.key) {
        case "ArrowUp":
            buttonPressedUpArrow = false;
            break;
        case "ArrowDown":
            buttonPressedDownArrow = false;
            break;
        case "ArrowLeft":
            buttonPressedLeftArrow = false;
            break;
        case "ArrowRight":
            buttonPressedRightArrow = false;
            break;
    }
}

function moveCamera() {
    if (buttonPressedUpArrow) {
        offsetY += 5 * globalScale;
    }
    if (buttonPressedDownArrow) {
        offsetY -= 5 * globalScale;
    }
    if (buttonPressedLeftArrow) {
        offsetX += 5 * globalScale;
    }
    if (buttonPressedRightArrow) {
        offsetX -= 5 * globalScale;
    }
}

function selectTile(x, y) {
    let tileX = Math.floor((x - offsetX) / globalScale / (tileVectorX * 2) + (y - offsetY) / globalScale / (tileVectorY * 2) - 0.9);
    let tileY = Math.floor((y - offsetY) / globalScale / (tileVectorY * 2) - (x - offsetX) / globalScale / (tileVectorX * 2));
    if (tileX >= 0 && tileX < GRID_WIDTH && tileY >= 0 && tileY < GRID_HEIGHT) {
        if (tileX === selectedTileX && tileY === selectedTileY) {
            displaySelection(selectedTileX, selectedTileY, -1, -1);
            selectedTileX = -1;
            selectedTileY = -1;
        } else {
            displaySelection(selectedTileX, selectedTileY, tileX, tileY);
            selectedTileX = tileX;
            selectedTileY = tileY;
        }
    } else {
        displaySelection(selectedTileX, selectedTileY, -1, -1);
        selectedTileX = -1;
        selectedTileY = -1;
    }
}

function displaySelection(oldX, oldY, newX, newY) {
    console.log(oldX, oldY, newX, newY);
    if (oldX >= 0 && oldY >= 0) {
        grid.tileOverlays[oldX][oldY] = new TileOverlay();

        if (grid.entities[oldX][oldY].type === "unit") {
            showUnitPossibleMoves(oldX, oldY, grid.entities[oldX][oldY].movementSpeed, false);
        }
    }
    if (newX >= 0 && newY >= 0) {
        grid.tileOverlays[newX][newY] = new WhiteOverlay();
        if (grid.entities[newX][newY].type === "unit") {
            //todo show movement selection
            if (oldX >= 0 && oldY >= 0) {
                showUnitPossibleMoves(oldX, oldY, grid.entities[newX][newY].movementSpeed, false);
            }
            showUnitPossibleMoves(newX, newY, grid.entities[newX][newY].movementSpeed, true);

        }
    }


}

function showUnitPossibleMoves(x, y, moves, show) {
    if (grid.tiles[x][y].type !== "water") {
        let movementCost = grid.tiles[x][y].movementCost;
        if (show === true) {
            grid.tileOverlays[x][y] = new WhiteOverlay();
        } else {
            grid.tileOverlays[x][y] = new TileOverlay();
        }
        if (moves <= 0) return;
        showUnitPossibleMoves(x - 1, y, moves - grid.tiles[x - 1][y].movementCost, show);
        showUnitPossibleMoves(x + 1, y, moves - grid.tiles[x + 1][y].movementCost, show);
        showUnitPossibleMoves(x, y - 1, moves - grid.tiles[x][y - 1].movementCost, show);
        showUnitPossibleMoves(x, y + 1, moves - grid.tiles[x][y + 1].movementCost, show);
    }
}


window.onclick = (e) => {
    selectTile(e.x, e.y);

}

let waterTileDefaultImage = document.createElement("img");
waterTileDefaultImage.src = "/images/tiles/tile-water-default.png";

let grassTileDefaultImage = document.createElement("img");
grassTileDefaultImage.src = "/images/tiles/tile-grass-default.png";

let grassHillsTile = document.createElement("img");
grassHillsTile.src = "/images/tiles/tile-grass-difficult.png";

let stoneTileImage = document.createElement("img");
stoneTileImage.src = "/images/tiles/tile-stone-default.png";

let treesTile1Image = document.createElement("img");
treesTile1Image.src = "/images/tiles/tile-grass-trees-1.png";

let bridgeImage = document.createElement("img");
bridgeImage.src = "/images/tiles/tile-bridge.png";

let overLayWhiteImage = document.createElement("img");
overLayWhiteImage.src = "images/overlays/overlay-white.png";

let tankImageBlue = document.createElement("img");
tankImageBlue.src = "images/entities/tank1blue.png";

class Tile {
    constructor() {
        this.terrain = false;
        this.type = "ground";
        this.tileHeight = 0;
        this.movementCost = 1;
    }
}

class Water extends Tile {
    constructor() {
        super();
        this.type = "water";
        this.image = waterTileDefaultImage;
    }
}

class Bridge extends Tile {
    constructor() {
        super();
        this.type = "ground";
        this.image = bridgeImage;
        this.movementCost = 1;
    }
}

class Grass extends Tile {
    constructor() {
        super();
        this.type = "ground";
        this.image = grassTileDefaultImage;
        this.movementCost = 1
    }
}

class GrassHills extends Tile {
    constructor() {
        super();
        this.type = "ground";
        this.image = grassHillsTile;
        this.tileHeight = 4;
        this.movementCost = 2;
    }
}

class Trees extends Tile {
    constructor() {
        super();
        this.type = "block";
        this.image = treesTile1Image;
    }
}

class Stone extends Tile {
    constructor() {
        super();
        this.type = "block";
        this.image = stoneTileImage;
        this.tileHeight = 7;
        this.movementCost = 3;
    }
}

class TileOverlay {
    constructor() {
        this.image = document.createElement("img"); //empty image
    }
}

class WhiteOverlay extends TileOverlay {
    constructor() {
        super();
        this.image = overLayWhiteImage;
    }
}

class Entity {
    constructor() {
        this.image = document.createElement("img"); //empty image
        this.type = "none"
    }
}

class Tank extends Entity {
    constructor() {
        super();
        this.image = tankImageBlue;
        this.type = "unit";

        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.movementSpeed = 3;

    }
}

//this stores all the information about the playing field grid
let grid = {
    entities: [],
    tileOverlays: [],
    tiles: []
}

function initializeGrid() {
    grid.entities = new Array(GRID_WIDTH);
    for (let i = 0; i < GRID_WIDTH; i++) {
        grid.entities[i] = new Array(GRID_HEIGHT);
        for (let j = 0; j < GRID_HEIGHT; j++) {
            grid.entities[i][j] = new Entity();
        }
    }
    grid.entities[5][5] = new Tank();
    grid.tileOverlays = new Array(GRID_WIDTH);
    for (let i = 0; i < GRID_WIDTH; i++) {
        grid.tileOverlays[i] = new Array(GRID_HEIGHT);
        for (let j = 0; j < GRID_HEIGHT; j++) {
            grid.tileOverlays[i][j] = new TileOverlay();
        }
    }

    grid.tiles = new Array(GRID_WIDTH);
    for (let i = 0; i < GRID_WIDTH; i++) {
        grid.tiles[i] = new Array(GRID_HEIGHT);
        for (let j = 0; j < GRID_HEIGHT; j++) {
            grid.tiles[i][j] = new Water();
        }
    }
}

function generateMainSquareIsland() {
    for (let col = 4; col < GRID_WIDTH - 4; col++) {
        for (let row = 4; row < GRID_HEIGHT - 4; row++) {
            grid.tiles[col][row] = new Grass();
        }
    }
}

function generateMiddleRiver(riverWidth = 1) {
    let middleX = Math.floor(GRID_WIDTH / 2);
    let middleY = Math.floor(GRID_HEIGHT / 2);
    let riverOffset = 0;
    for (let i = 0; i < Math.floor(GRID_WIDTH / 2 - 2); i++) {
        riverOffset += Math.random() - 0.5;
        let waterYRight;
        let waterYLeft;
        waterYRight = Math.floor(middleY + riverOffset);
        waterYLeft = Math.floor(middleY - riverOffset);

        for (let j = -1 * riverWidth; j <= riverWidth; j++) {
            grid.tiles[middleX + i][waterYRight + j] = new Water();
            grid.tiles[middleX + i - 1][waterYRight + j] = new Water();
            grid.tiles[middleX + i + 1][waterYRight + j] = new Water();

            grid.tiles[middleX - i][waterYLeft + j] = new Water();
            grid.tiles[middleX - i + 1][waterYLeft + j] = new Water();
            grid.tiles[middleX - i - 1][waterYLeft + j] = new Water();
        }
    }
}

function generateMountains(maxRocks = 5) {
    let rockX = Math.floor(Math.random() * (GRID_WIDTH - 8) + 4);
    let rockY = Math.floor(Math.random() * (GRID_HEIGHT - 8) + 4);
    console.log(rockX, rockY);
    for (let rockNumber = 0; rockNumber < maxRocks; rockNumber++) {
        if (Math.random() > 0.5) {
            rockX += Math.random() > 0.5 ? 1 : -1;
        } else {
            rockY += Math.random() > 0.5 ? 1 : -1;
        }

        if (rockY < 4) rockY = 4;
        if (rockY >= GRID_HEIGHT - 4) rockY = GRID_HEIGHT - 5;
        if (rockX < 4) rockX = 4;
        if (rockX >= GRID_WIDTH - 4) rockX = GRID_WIDTH - 5;

        if (grid.tiles[rockX][rockY].type !== "water") {
            grid.tiles[rockX][rockY] = new Stone();
            grid.tiles[GRID_WIDTH - rockX - 1][GRID_HEIGHT - rockY - 1] = new Stone();
        }

    }
}

function generateHills(maxHills = 5) {
    let hillX = Math.floor(Math.random() * (GRID_WIDTH - 8) + 4);
    let hillY = Math.floor(Math.random() * (GRID_HEIGHT - 8) + 4);
    console.log(hillX, hillY);
    for (let rockNumber = 0; rockNumber < maxHills; rockNumber++) {
        //todo generate rocks
        if (Math.random() > 0.5) {
            hillX += Math.random() > 0.5 ? 1 : -1;
        } else {
            hillY += Math.random() > 0.5 ? 1 : -1;
        }
        if (hillY < 4) hillY = 4;
        if (hillY >= GRID_HEIGHT - 4) hillY = GRID_HEIGHT - 5;
        if (hillX < 4) hillY = 4;
        if (hillX >= GRID_WIDTH - 4) hillY = GRID_WIDTH - 5;
        if (grid.tiles[hillX][hillY].type !== "water") {
            grid.tiles[hillX][hillY] = new GrassHills();
            grid.tiles[GRID_WIDTH - hillX - 1][GRID_HEIGHT - hillY - 1] = new GrassHills();
        }

    }
}

//variable used for waves on the water tiles
let waterOffset = 0;

function drawBoard() {
    //clear the canvas with background
    ctx.fillStyle = "lightskyblue"
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    waterOffset++;
    for (let col = 0; col < GRID_WIDTH; col++) {
        for (let row = 0; row < GRID_HEIGHT; row++) {
            let tileX = col * tileVectorX * globalScale - row * tileVectorX * globalScale + offsetX;
            let tileY = row * tileVectorY * globalScale + col * tileVectorY * globalScale + offsetY;
            let width = imageWidth * globalScale;
            let height = imageHeight * globalScale;

            if (grid.tiles[col][row].type === "water") {
                tileY -= globalScale * 2 * Math.sin(col + waterOffset * 0.05 + row * 0.3)
            }

            ctx.drawImage(grid.tiles[col][row].image, tileX, tileY, width, height);
            ctx.drawImage(grid.tileOverlays[col][row].image, tileX, tileY - grid.tiles[col][row].tileHeight * globalScale, width, height);
            ctx.drawImage(grid.entities[col][row].image, tileX, tileY - 8 * globalScale - grid.tiles[col][row].tileHeight * globalScale, width, height);
        }
    }

}

function makeBridge() {
    let bridgeX = Math.floor(Math.random() * (GRID_WIDTH - 8) + 4);
    for (let bridgeY = 6; bridgeY < GRID_HEIGHT - 5; bridgeY++) {
        if (grid.tiles[bridgeX][bridgeY].type === "water") {
            grid.tiles[bridgeX][bridgeY] = new Bridge();
        }
    }
}

function putRandomTank() {
    grid.entities[Math.floor(Math.random() * GRID_WIDTH)][Math.floor(Math.random() * GRID_HEIGHT)] = new Tank();
}


function gameUpdate() {
    moveCamera();
    drawBoard();
}


grassTileDefaultImage.onload = () => {
    initializeGrid();
    generateMainSquareIsland();

    generateMiddleRiver(Math.floor(Math.random() * 3));

    generateHills(20);
    generateHills(20);
    generateHills(20);
    generateHills(20);
    generateMountains(200);
    for (let i = 0; i < 10; i++) {
        putRandomTank();
    }

    makeBridge();
    setInterval(gameUpdate, 20);
}