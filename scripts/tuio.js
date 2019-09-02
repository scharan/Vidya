//http://mcgivery.com/htmlelement-pseudostyle-settingmodifying-before-and-after-in-javascript/
//https://jsfiddle.net/Tf69a/1/
var UID = {
  _current: 0,
  getNew: function () {
    this._current++;
    return this._current;
  }
};

HTMLElement.prototype.pseudoStyle = function (element, prop, value) {
  var _this = this;
  var _sheetId = "pseudoStyles";
  var _head = document.head || document.getElementsByTagName('head')[0];
  var _sheet = document.getElementById(_sheetId) || document.createElement('style');
  _sheet.id = _sheetId;
  var className = "pseudoStyle" + UID.getNew();

  _this.className += " " + className;

  _sheet.innerHTML += " ." + className + ":" + element + "{" + prop + ":" + value + "}";
  _head.appendChild(_sheet);
  return this;
};

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

  // https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
  var synth = window.speechSynthesis;
  var voices = synth.getVoices();

  var cleanSlateBtn = document.getElementById(options.cleanSlateBtnId);
  var clearBtn = document.getElementById(options.clearBtnId);
  var currentActivityBtn = document.getElementById(options.activityTypeId);
  var pencilsNode = document.getElementById('pencils');

  var speakBtn = document.getElementById(options.speakBtnId);
  var speakBtnFontSizePx = 30;
  speakBtn.style['font-size'] = speakBtnFontSizePx+"px";
  speakBtn.style.position = 'absolute';
  speakBtn.style.top = canvas.offsetTop+"px";
  speakBtn.style.left = (canvas.offsetLeft + canvas.width - speakBtnFontSizePx)/2+"px";

  var activityParameters = {
    numbers: {
      asciiStartIndex: 0,
      asciiEndIndex: 10,
      currentNumber: 0
    },
    englishUpper: {
      asciiStartIndex: 65,
      asciiEndIndex: 91,
      currentNumber: 0
    },
    englishLower: {
      asciiStartIndex: 97,
      asciiEndIndex: 123,
      currentNumber: 0
    },
    monthsOfYear: {

    },
    daysOfWeek: {

    },
    planets: {

    },
    opposites: {

    },
    matchingPairs: {

    },
    shapes: {

    }
  }

  var lines = [, ,];
  var offset = $(canvas).offset();

  var self = {
    slateMode: false,
    activeColor: 0,
    currentActivity: undefined,
    mousedown: false,
    pencilWidth: 30,
    colors: ["violet", "indigo", "blue", "green", "orange", "pink", "magenta", "orangered", "aqua"],

    init: function () {
      canvas.addEventListener('touchstart', self.preDraw, false);
      canvas.addEventListener('touchmove', self.draw, false);

      canvas.addEventListener('mousedown', self.preDraw, false);
      canvas.addEventListener('mousemove', self.draw, false);
      canvas.addEventListener('mouseup', self.postDraw, false);

      self.currentActivity = currentActivityBtn.value;
      clearBtn.addEventListener('click', function() {
        self.clearCanvas(activityParameters[self.currentActivity].currentNumber % activityParameters[self.currentActivity].asciiEndIndex);
      }, false);
      speakBtn.addEventListener('click', function() {
        var textToSpeak = self.textToShow(activityParameters[self.currentActivity].currentNumber)
        self.speak(textToSpeak);
        console.log(`speakBtn.onclick: currentNumber: ${activityParameters[self.currentActivity].currentNumber}, textToSpeak: ${textToSpeak}`);
      }, false);
      cleanSlateBtn.addEventListener('click',  function() {
        self.cleanSlateCanvas(true /*slateMode*/);
      }, false);
      nextBtn.addEventListener('click', function() {
        self.slateMode = false;
        self.nextNumber();
      }, false);
      currentActivityBtn.addEventListener('change', function() {
        self.currentActivity = currentActivityBtn.value;
        activityParameters[self.currentActivity].currentNumber = activityParameters[self.currentActivity].asciiStartIndex;
        self.clearCanvas(activityParameters[self.currentActivity].currentNumber);
      }, false);
      window.addEventListener('orientationchange', self.orientationChanged, false);
      document.addEventListener('contextmenu', event => event.preventDefault());

      self.showText(activityParameters[self.currentActivity].currentNumber);
      self.addPencils();
    },
    orientationChanged: function() {
      // TODO: Don't reset fully. At least retain (1) activity and (2) activity context
      location.reload();
    },
    addPencils: function() {
      self.colors.forEach(function(color) {
        self.addPencil(color);
      });

      var widthOfEachPencil = self.pencilWidth + 3 + 3; /*l/r margins*/
      var widthOfPencils = self.colors.length * widthOfEachPencil;
      pencilsStartLocationLeft = (canvas.offsetWidth - widthOfPencils)/2;
      pencilsNode.style.left = pencilsStartLocationLeft+"px";
    },
    addPencil: function(color) {
      // https://codepen.io/scharan20/pen/gOYxQOo
      var node = document.createElement("p");
      node.className = 'pencil_body';
      node.id = color;
      node.style.background = color;
      node.pseudoStyle("after", "border-bottom", `${self.pencilWidth}px solid ${color}`);
      node.onclick = console.log(node.id);
      pencilsNode.appendChild(node);
    },
    cleanSlateCanvas: function (slateMode = false) {
      self.slateMode = slateMode;
      context.clearRect(0, 0, canvas.width, canvas.height);
    },
    clearCanvas: function (text) {
      self.cleanSlateCanvas(self.slateMode);
      if (!self.slateMode)
        self.showText(text);
    },
    textFromAscii: function (asciiValue) {
      return String.fromCharCode(asciiValue);
    },
    resetCanvas: function (text) {
      self.cleanSlateCanvas();
      self.showText(text ? text : activityParameters[self.currentActivity].asciiStartIndex);
    },
    nextNumber: function () {
      activityParameters[self.currentActivity].currentNumber = 
        (activityParameters[self.currentActivity].currentNumber + 1) % activityParameters[self.currentActivity].asciiEndIndex == 0
        ? activityParameters[self.currentActivity].asciiStartIndex
        : activityParameters[self.currentActivity].currentNumber + 1;
      var next = activityParameters[self.currentActivity].currentNumber;
      console.log(`nextNumber: currentNumber: ${activityParameters[self.currentActivity].currentNumber}, next: ${next}`);
      self.resetCanvas(next);
    },
    textToShow: function(text) {
      return text > 9 ? self.textFromAscii(text) : text; // String.fromCharCode does not work for 0-9.
    },
    speak: function(textToSpeak) {
      utterThis = new SpeechSynthesisUtterance(textToSpeak);
      synth.speak(utterThis);
    },
    showText: function (text) {
      // https://www.html5tutorial.info/html5-canvas-text.php
      context.font = canvas.offsetHeight + 'px monospace';
      context.textBaseline = 'middle';
      context.textAlign = 'center';

      var textToShow = self.textToShow(text);
      console.log(`showText: textToShow: ${textToShow}`);
      context.strokeText(
        self.textToShow(text),
        canvas.offsetWidth/2,
        canvas.offsetHeight/2);

      self.speak(textToShow);
    },
    nextColor: function() {
      return self.colors[self.activeColor++ % self.colors.length];
    },
    preDraw: function (event) {
      if (event.offsetX) {
        self.mousedown = true;
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
      self.mousedown = false;
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
    activityTypeId: "activityType",
    canvasId: "sketchpad",
    cleanSlateBtnId: "cleanSlateBtn",
    clearBtnId: "clearBtn",
    speakBtnId: "speakBtn"
  });
});
