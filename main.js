class Canvas {
  constructor(canvas, content) {
    this.width   = canvas.clientWidth;
    this.height  = canvas.clientHeight;
    this.ctx     = canvas.getContext('2d');
    this.gameOn  = false;
    this.content = content;
  }
  animateStart() {
    this.gameOn = true;
    this._animate();
  }
  animateStop() {
    this.gameOn = false;
  }
  _animate() {
    this._clear();
    this._fillRectCollection(this.content.rectCollection);
    this.content.setNextFrame()
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
    this.rectCollection = [];
    this.canvasHeight   = canvasHeight
  }
  setNextFrame() {
    this.rectCollection.forEach(el => el.increaseY(this.canvasHeight));
  }
  add(rect) {
    this.rectCollection.push(rect);
  }
  remove(rect) {
    this.rectCollection = this.rectCollection.filter(el => el !== rect);
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

var canvasEl = document.getElementById('canvas');
var content = new RectangleCollection(canvasEl.height);
content.add(new Rectangle(
                          { posX: 320,
                            posY: 0, 
                            stepY: 1, 
                            color: '#000000', 
                            size: [20, 20] }
                          ));
var canvas = new Canvas(canvasEl, content);
document.getElementById('start').addEventListener('click', ()=> {
  canvas.animateStart()
});
document.getElementById('stop').addEventListener('click', ()=> {
  canvas.animateStop();
});