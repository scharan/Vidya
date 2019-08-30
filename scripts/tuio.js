var CanvasDrawr = function (options) {
  var canvas = document.getElementById(options.canvasId);
  canvas.style.width = '100%'
  canvas.style.height = '90%'
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  canvas.style.width = '';
  canvas.style.height = '';

  var context = canvas.getContext("2d");
  context.lineWidth = options.size || Math.ceil(Math.random() * 35);
  context.lineCap = options.lineCap || "round";
  context.pX = undefined;
  context.pY = undefined;

  var cleanSlateBtn = document.getElementById(options.cleanSlateBtnId);
  var clearBtn = document.getElementById(options.clearBtnId);

  var lines = [, ,];
  var offset = $(canvas).offset();

  var self = {
    slateMode: false,
    activeColor: 0,
    currentNumber: 0,
    mousedown: 0,
    colors: ["violet", "indigo", "blue", "green", "yellow", "orange", "pink", "magenta"],

    init: function () {
      canvas.addEventListener('touchstart', self.preDraw, false);
      canvas.addEventListener('touchmove', self.draw, false);

      canvas.addEventListener('mousedown', self.preDraw, false);
      canvas.addEventListener('mousemove', self.draw, false);
      canvas.addEventListener('mouseup', self.postDraw, false);

      cleanSlateBtn.addEventListener('click',  function(){ self.cleanSlateCanvas(true /*slateMode*/);}, false);
      clearBtn.addEventListener('click', self.clearCanvas, false);
      nextBtn.addEventListener('click', function() { self.slateMode = false; self.nextNumber(); }, false);

      self.showText(self.currentNumber);
    },
    cleanSlateCanvas: function (slateMode = false) {
      self.slateMode = slateMode;
      context.clearRect(0, 0, canvas.width, canvas.height);
    },
    clearCanvas: function () {
      self.cleanSlateCanvas(self.slateMode);
      if (!self.slateMode)
        self.showText(self.currentNumber);
    },
    resetCanvas: function (text) {
      self.cleanSlateCanvas();
      self.showText(text ? text : 0);
    },
    nextNumber: function () {
      self.resetCanvas(++self.currentNumber % 10);
    },
    showText: function (text) {
      // https://www.html5tutorial.info/html5-canvas-text.php
      context.font = canvas.offsetHeight + 'px monospace';
      context.textBaseline = 'middle';
      context.textAlign = 'center';
      context.strokeText(text, canvas.offsetWidth/2, canvas.offsetHeight/2);
    },
    nextColor: function() {
      return self.colors[self.activeColor++ % self.colors.length];
    },
    preDraw: function (event) {
      if (event.offsetX) {
        self.mousedown = 1;
        self.setLine(0, event.offsetX, event.offsetY, self.nextColor());
      } else if (event.touches) {
        $.each(event.touches, function (i, touch) {
           self.setLine(
             touch.identifier,
             this.pageX - offset.left,
             this.pageY - offset.top,
             self.nextColor());
          });
      }
      event.preventDefault();
    },
    setLine: function (id, moveX, moveY, color) {
      lines[id] = {
        x: moveX,
        y: moveY,
        color: color
      };
    },
    moveAndSetLine: function(id, moveX, moveY) {
      var ret = self.move(id, moveX, moveY);
      self.setLine(id, ret.x, ret.y);
    },
    draw: function (event) {
      if (event.touches) {
        $.each(event.touches, function (i, touch) {
          var id = touch.identifier,
            moveX = this.pageX - offset.left - lines[id].x,
            moveY = this.pageY - offset.top - lines[id].y;
            self.moveAndSetLine(id, moveX, moveY);
            if (!self.slateMode)
              return false; // This ensures no multi-touch
        });
      } else if (self.mousedown && event.offsetX) {
        moveX = event.offsetX - lines[0].x,
        moveY = event.offsetY - lines[0].y;
        self.moveAndSetLine(0, moveX, moveY);
      }
      event.preventDefault();
    },
    postDraw: function () {
      self.mousedown = 0;
    },
    move: function (i, changeX, changeY) {
      context.strokeStyle = lines[i].color;
      context.beginPath();
      context.moveTo(lines[i].x, lines[i].y);
      context.lineTo(lines[i].x + changeX, lines[i].y + changeY);
      context.stroke();
      context.closePath();
      return {
        x: lines[i].x + changeX,
        y: lines[i].y + changeY
      };
    }
  };
  return self.init();
};

$(function () {
  var super_awesome_multitouch_drawing_canvas_thingy = new CanvasDrawr({
    size: 15,
    canvasId: "sketchpad",
    cleanSlateBtnId: "cleanSlateBtn",
    clearBtnId: "clearBtn"
  });
});
