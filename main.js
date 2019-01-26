class Canvas {
  constructor(canvas, content) {
    this.width = canvas.clientWidth;
    this.height = canvas.clientHeight;
    this.ctx = canvas.getContext('2d');
    this.gameOn = false;
    this.content = {
      rectCollection: content.rectCollection
    }
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
    this.content.rectCollection.setNextFrame()
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

var canvasEl = document.getElementById('canvas');
var content = {
  rectCollection: [
                    {
                      posX: 320, 
                      posY: 0, 
                      size: [20, 20],
                      color: '#000000',
                      stepY: 1
                    }
                  ]
              };
content.rectCollection.setNextFrame = function() {
  this.forEach(el => {
    el.posY += el.stepY;
    if(el.posY >= canvas.height) el.posY = 0;
  })
}
var canvas = new Canvas(canvasEl, content);
document.getElementById('start').addEventListener('click', ()=> {
  canvas.animateStart()
});
document.getElementById('stop').addEventListener('click', ()=> {
  canvas.animateStop();
});