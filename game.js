function setupGame(config) {
    let scoreEl  = document.getElementById('score');
    let canvasEl = document.getElementById('canvas');
  
    let score           = new GameScore(scoreEl);
    let canvas          = new Canvas(canvasEl);
    let sceneCollection = { menu: new MenuScene([new GameCollection], new InterfaceCollection),
                            game: new GameScene([new GameCollection], new InterfaceCollection)
                          };//mocked collections
    let gameController  = new GameController({ score: score, 
                                              sceneCollection: sceneCollection,
                                              currScene: sceneCollection.menu });
    Game.controller = gameController;
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
                interfaceObjectCollection) {
        this.gameObjectCollections     = [...gameObjectCollections];
        this.interfaceObjectCollection = interfaceObjectCollection;
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
                gameObjCollection.animate();
            });
            this.interfaceObjectCollection.animate();
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

//classes for test needs START
class GameCollection {
    animate() {
        console.log('animate game collection');
    }
    runBackgroundEventLoop() {
        console.log('run bg event loop')
    }
    stopBackgroundEventLoop() {
        console.log('stop bg event loop')
    }
}
class InterfaceCollection {
    animate() {
        console.log('animate interface');
    } 
}
class MenuScene extends GameScene { }
//classes for test needs END
