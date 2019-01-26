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
  }
  animateStart() {
    this.gameOn = true;
    this.props.score.resetValue();
    this._animate();
  }
  animateStop() {
    this.gameOn = false;
  }
  handleClick(event) {
    const { layerX: eventX, 
            layerY: eventY } = event;
    this.props.rectCollection.content.forEach(el => {
      if(clickWitih(el)) {
        this.props.score.incrementValue();
        this.props.rectCollection.remove(el);
      }
    })

    function clickWitih(el) {
      return (
        eventY > el.posY && 
        eventY < el.posY + el.size[1] && 
        eventX > el.posX && 
        eventX < el.posX + el.size[0]
      );
    }
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
}

class Rectangle {
  constructor({ posX, posY, stepY, color, size }) {
    this.posX  = posX;
    this.posY  = posY;
    this.stepY = stepY;
    this.color = color;
    this.size  = size;
  }
  increaseY(canvasHeight) {
    this.posY += this.stepY;
    if (this.posY >= canvasHeight) this.posY = 0;
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
collection.add(new Rectangle(
                          { posX: 0,
                            posY: 0, 
                            stepY: 1, 
                            color: '#000000', 
                            size: [20, 20] }
                          ));
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