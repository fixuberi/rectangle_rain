function setupGame(config) {
    let scoreEl  = document.getElementById('score');
    let canvasEl = document.getElementById('canvas');
  
    let score           = new GameScore(scoreEl);
    let canvas          = new Canvas(canvasEl);
    let sceneCollection = { menu: new MenuScene([new RectangleCollection], new InterfaceCollection, canvas),
                            game: new GameScene([new RectangleCollection], new InterfaceCollection, canvas)
                          };//mocked collections
    let gameController  = new GameController({ score: score, 
                                              sceneCollection: sceneCollection,
                                              currScene: sceneCollection.menu });
    Game.controller = gameController;
    Game.config = config;
    Game.config.canvas = { width: canvas.width, height: canvas.height };
    let game        = new Game({ canvas: canvas, 
                          score: score,
                          sceneCollection: sceneCollection,
                          currentScene: sceneCollection.menu,
                          controller: gameController,
                          config: config
                        });
    canvasEl.addEventListener('click', (ev) => game.handleClick(ev));
    game.run();
}

class Game {
    constructor({ score, canvas, config, sceneCollection, currentScene, controller }) {
        this.score           = score;
        this.canvas          = canvas;
        this.sceneCollection = sceneCollection;
        this.currentScene    = currentScene;
        this.controller      = controller;
        this.config          = config;
    }
    run() {
        Game.controller.runCurrentScene();
    }
    handleClick(event) {
        const { layerX: x, layerY: y } = event;
        const click = { x, y };
        this.currentScene.handleClick(click);
    }
}
function GameController({ score, currScene, sceneCollection }) {
    const newInstanceContext = this;
    this.score               = score;
    this.currScene           = currScene;

    this.incrementScore   = () => this.score.incrementValue();
    this.resetScore       = () => this.score.resetValue();
    this.runCurrentScene  = () => this.currScene.run();
    this.stopCurrentScene = () => this.currScene.stop();
    generateRunMethodForEachScene();

    function generateRunMethodForEachScene() {
        for (sceneName in sceneCollection) {
            sceneCollection.hasOwnProperty(sceneName) && generateRunMethodFor(sceneName);
        }

        function generateRunMethodFor(sceneName) {
            newInstanceContext.constructor
                              .prototype
                              [`run${capitalize(sceneName)}Scene`] = function() {
                newInstanceContext.currScene = sceneCollection[sceneName];
                newInstanceContext.currScene.run();
            };
            function capitalize(string) {
                return string.replace(/^./, string[0].toUpperCase());
            }
        }
    }
}

class GameScene {
    constructor(gameObjectCollections, 
                interfaceObjectCollection,
                canvas) {
        this.gameObjectCollections     = [...gameObjectCollections];
        this.interfaceObjectCollection = interfaceObjectCollection;
        this.canvas = canvas;
        this.isRunning = false;
    }
    run() {
        this.isRunning = true;
        Game.controller.resetScore();
        this._runCollectionsBackgroundEventLoop();
        this._renderAllColections();
    }
    stop() {
        this.isRunning = false;
        this._stopCollectionsBackgroundEventLoop();
    }
    handleClick(click) {
        const interfaceIsClicked = this.interfaceObjectCollection
                                       .handleClickAndReturnFeedback(click);
        if(interfaceIsClicked) return;
        for (let i = 0; i < this.gameObjectCollections.length; i++) {
            const gameObjClicked = this.gameObjectCollections[i]
                                       .handleClickAndReturnFeedback(click);
            if(gameObjClicked) break;
        } 
    }
    _renderAllColections() {
        if(this.isRunning) {
            this.gameObjectCollections.forEach(gameObjCollection => {
                gameObjCollection.drawOn(this.canvas);
            });
            this.interfaceObjectCollection.drawOn(this.canvas);
            requestAnimationFrame(this._renderAllColections.bind(this));
        }
    }
    _runCollectionsBackgroundEventLoop() {
        this.gameObjectCollections.forEach(col => col.runBackgroundEventLoop());
    }
    _stopCollectionsBackgroundEventLoop() {
        this.gameObjectCollections.forEach(col => col.stopBackgroundEventLoop());
    }
}
class SceneCollection {
    constructor() {
        this.content = [];
    }
    drawOn(canvas) {
        this.content.forEach(el => el.drawOnCanvas(canvas));
    }
    add(el) {
        this.content.push(el);
    }
    remove(el) {
        this.content = this.content.filter(collectionEl => el !== collectionEl);
    }
    clear() {
        this.content = [];
    }
    handleClickAndReturnFeedback(click) {
        for ( let i = this.content.length -1; i >= 0; i-- ) {
            let currEl = this.content[i];
            if(currEl.wasClicked(click)) {
                this._fireEventByClick(currEl);
                return true;
            }
        }
    }
    runBackgroundEventLoop() {}
    stopBackgroundEventLoop() {}
    _fireEventByClick(currEl) {
        if (typeof currEl.fireEventByClick === 'function') currEl.fireEventByClick(click);
    }
    _randomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
      }
    _randomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16);
    }
}
class RectangleCollection extends SceneCollection {
    constructor() {
        super();
        this.spawnRectangleTimeoutId;
    }
    runBackgroundEventLoop() {
        this.spawnRectangleTimeoutId = setTimeout( async () => {
            await this.add(new Rectangle(this._buildParamsForNewRectangle()));
            this.runBackgroundEventLoop();
            }, this._randomNum(...Game.config.gameProcess.spawnRectanglesTimeRange));
    }
    stopBackgroundEventLoop() {
        clearTimeout(this.spawnRectangleTimeoutId);
    }
    _fireEventByClick(currEl) {
        super();
        this.remove(currEl);
    }
    _buildParamsForNewRectangle() {
        const maxPosX           = Game.config.canvas.width - Game.config.rectangleProps.size[0];
        const maxPosY           = Game.config.canvas.height-Game.config.rectangleProps.size[1];
        const size              = Game.config.rectangleProps.size;
        const moveDownStepRange = Game.config.rectangleProps.moveDownStepRange;
        return {
            posX: this._randomNum(0, maxPosX),
            posY: this._randomNum(0, maxPosY),
            size: size,
            color: this._randomColor(),
            moveDownStepRange: this._randomNum(moveDownStepRange),
        }
    }
}
class InterfaceCollection extends SceneCollection {
    
}
class MenuScene extends GameScene { }

