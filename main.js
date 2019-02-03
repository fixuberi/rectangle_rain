const config = {
  gameProcess: {
     spawnRectanglesTimeRange: [0, 3000]
  },
  rectangleProps: {
     size: [20, 20],
     moveDownStepRange: [1, 4]
  }
}

document.body.onload = () => setupGame(config);

// function setupGame(config) {
//   let scoreEl  = document.getElementById('score');
//   let canvasEl = document.getElementById('canvas');

//   let score      = new GameScore(scoreEl); 
//   let collection = new RectangleCollection(canvasEl.height);
//   let canvas     = new Canvas(canvasEl);
//   let game       = new Game({ canvas: canvas, 
//                               rectCollection: collection,
//                               score: score,
//                               config: config
//                             });

//   canvasEl.addEventListener('click', (ev) => {
//     game.handleClick(ev);
//   });
//   document.getElementById('start').addEventListener('click', ()=> {
//     game.start();
//   });
//   document.getElementById('stop').addEventListener('click', ()=> {
//     game.stop();
//   });
// }

// class Game {
//   constructor({ canvas, rectCollection, score, config }) {
//     this.canvas         = canvas;
//     this.rectCollection = rectCollection;
//     this.score          = score;
//     this.gameOn         = false;
//     this.config         = config;
//     this.spawnRectangleTimeoutId;
//   }
//   start() {
//       if(!this.gameOn) {
//       this.gameOn = true;
//       this.score.resetValue();
//       this._spawnRectangles(true);
//       this._renderRectCollection();
//     }
//   }
//   stop() {
//     this.gameOn = false;
//     this._spawnRectangles(false);
//     this.rectCollection.clear();
//   }
//   handleClick(event) {
//     const { layerX: eventX, 
//             layerY: eventY } = event;
//     let rectCount = this.rectCollection.content.length;

//     for (let i= rectCount - 1; i >= 0; i--) {
//       let currEl = this.rectCollection.content[i];
//       if(clickWithin(currEl)) {
//         this.score.incrementValue();
//         this.rectCollection.remove(currEl);
//         break;
//       }
//     }

//     function clickWithin(el) {
//       return (
//         eventY > el.posY - el.stepY*3 && 
//         eventY < el.posY + el.size[1] - el.stepY*3 && 
//         eventX > el.posX && 
//         eventX < el.posX + el.size[0]
//       );
//     }
//   }
//   _spawnRectangles(isOn) {
//     if(isOn) {
//       this.spawnRectangleTimeoutId = setTimeout( async () => {
//         await this.rectCollection.add(new Rectangle({ maxPosX: this.canvas.width, 
//                                                       maxPosY: 0,
//                                                       moveDownStepRange: this.config.rectangleProps.moveDownStepRange,
//                                                       size: this.config.rectangleProps.size }));
//         this._spawnRectangles(true);
//       }, this._randomNum(...this.config.gameProcess.spawnRectanglesTimeRange));
//     } else {
//       clearTimeout(this.spawnRectangleTimeoutId);
//     }
//   }
//   _renderRectCollection() {
//     this.canvas.renderFrameWithRectCollection(this.rectCollection.content);
//     if(this.gameOn) {
//       this.rectCollection.setNextFrame()
//       requestAnimationFrame(this._renderRectCollection.bind(this));
//      } else this.canvas.clear();
//   }
//   _randomNum(min, max) {
//     return Math.floor(Math.random() * (max - min + 1) + min);
//   }
// }

class Canvas {
  constructor(canvasEl) {
    this.width   = canvasEl.clientWidth;
    this.height  = canvasEl.clientHeight;
    this.ctx     = canvasEl.getContext('2d');
  }
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.width);
  }
  renderFrameWithRectCollection(collection) {
    this.clear();
    this._fillRectCollection(collection);
  }
  _fillRectCollection(collection) {
    collection.forEach(el => {
      this.ctx.fillStyle = el.color;
      this.ctx.fillRect(el.posX, el.posY, ...el.size);
    });
  }
}

// class RectangleCollection {
//   constructor(canvasHeight) {
//     this.content = [];
//     this.canvasHeight   = canvasHeight
//   }
//   setNextFrame() {
//     this.content.forEach(el => el.increaseY(this.canvasHeight));
//   }
//   add(rect) {
//     this.content.push(rect);
//   }
//   remove(rect) {
//     this.content = this.content.filter(el => el !== rect);
//   }
//   clear() {
//     this.content = [];
//   }
// }

class Rectangle {
  constructor({ maxPosX, maxPosY, moveDownStepRange, size }) {
    this.size  = size;
    this.posX  = this._randomNum(0, maxPosX-this.size[0]);
    this.posY  = this._randomNum(0, maxPosY-this.size[1]);
    this.stepY = this._randomNum(...moveDownStepRange);
    this.color = this._randomColor();
  }
  increaseY(canvasHeight) {
    this.posY += this.stepY;
    if (this.posY >= canvasHeight) this.posY = 0; 
  }
  _randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  _randomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }
}

class GameScore {
  constructor(scoreEl) {
    this.element = scoreEl;
    this.value = 0;
  }
  incrementValue() {
    this.value += 1;
    this._updateElement();
  }
  resetValue() {
    this.value = 0;
    this._updateElement();
  }
  _updateElement() {
    this.element.innerText = this.value;
  }
}

