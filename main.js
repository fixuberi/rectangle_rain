class Canvas {
  constructor(canvas, props) {
    this.width   = canvas.clientWidth;
    this.height  = canvas.clientHeight;
    this.ctx     = canvas.getContext('2d');
    this.gameOn  = false;
    this.props   = { 
                      rectCollection: props.rectCollection, 
                      score: props.score 
                    };
    this.spawnRectangleTimeoutId;
  }
  animateStart() {
    if(!this.gameOn) {
      this.gameOn = true;
      this.props.score.resetValue();
      this._spawnRectangles();
      this._animate();
    }
  }
  animateStop() {
    this.gameOn = false;
    clearTimeout(this.spawnRectangleTimeoutId);
    this.props.rectCollection.clear();
  }
  handleClick(event) {
    const { layerX: eventX, 
            layerY: eventY } = event;
    let rectCount = this.props.rectCollection.content.length;

    for (let i= rectCount - 1; i >= 0; i--) {
      let currEl = this.props.rectCollection.content[i];
      if(clickWithin(currEl)) {
        this.props.score.incrementValue();
        this.props.rectCollection.remove(currEl);
        break;
      }
    }

    function clickWithin(el) {
      return (
        eventY > el.posY - el.stepY*3 && 
        eventY < el.posY + el.size[1] - el.stepY*3 && 
        eventX > el.posX && 
        eventX < el.posX + el.size[0]
      );
    }
  }
  _spawnRectangles() {
    this.spawnRectangleTimeoutId = setTimeout( async () => {
        await this.props.rectCollection.add(new Rectangle({ maxPosX: this.width, maxPosY: 0 }));
        this._spawnRectangles();
      }, this._randomNum(0, 3000));
  }
  _animate() {
    this._clear();
    this._fillRectCollection(this.props.rectCollection.content);
    this.props.rectCollection.setNextFrame()
    if(this.gameOn) {
      requestAnimationFrame(this._animate.bind(this));
     } else this._clear();
  }
  _clear() {
    this.ctx.clearRect(0, 0, this.width, this.width);
  }
  _fillRectCollection(collection) {
    collection.forEach(el => {
      this.ctx.fillStyle = el.color;
      this.ctx.fillRect(el.posX, el.posY, ...el.size);
    });
  }
  _randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

class RectangleCollection {
  constructor(canvasHeight) {
    this.content = [];
    this.canvasHeight   = canvasHeight
  }
  setNextFrame() {
    this.content.forEach(el => el.increaseY(this.canvasHeight));
  }
  add(rect) {
    this.content.push(rect);
  }
  remove(rect) {
    this.content = this.content.filter(el => el !== rect);
  }
  clear() {
    this.content = [];
  }
}

class Rectangle {
  constructor({ maxPosX, maxPosY }) {
    this.size  = [20, 20];
    this.posX  = this._randomNum(0, maxPosX-this.size[0]);
    this.posY  = this._randomNum(0, maxPosY-this.size[1]);
    this.stepY = this._randomNum(1, 4);
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

var scoreEl = document.getElementById('score');
var canvasEl = document.getElementById('canvas');

var score = new GameScore(scoreEl); 
var collection = new RectangleCollection(canvasEl.height);
var canvas = new Canvas(canvasEl,
                          { 
                            rectCollection: collection, 
                            score: score 
                          }
                        );
canvasEl.addEventListener('click', (ev) => {
  canvas.handleClick(ev);
})
document.getElementById('start').addEventListener('click', ()=> {
  canvas.animateStart()
});
document.getElementById('stop').addEventListener('click', ()=> {
  canvas.animateStop();
});
