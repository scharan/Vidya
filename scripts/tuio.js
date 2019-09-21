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

const activityParameters = {
  numbers: {
    showCanvas: true,
    content: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  englishUpper: {
    showCanvas: true,
    content: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  },
  englishLower: {
    showCanvas: true,
    content: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'u', 'z']
  },
  monthsOfYear: {
    content: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  },
  daysOfWeek: {
    content: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  },
  planets: {
    content: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Neptune", "Uranus", "Pluto"]
  },
  shapes: {
    content: [],
    fontSize: "",
    utterances: ["Circle", "Line", "Triangle", "Square", "Pentagon", "Hexagon", "Octagon"]
  },
  opposites: {
  },
  matchingPairs: {
  }
};

var CanvasDrawr = function (options) {
  var canvas = document.getElementById(options.canvasId);
  var activities = document.getElementById(options.activitesId);
  activities.style.zIndex = 3;
  canvas.style.width = '90%';
  canvas.style.height = '90%';
  canvas.width = activities.style.width = canvas.offsetWidth;
  canvas.height = activities.style.height = canvas.offsetHeight;
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

  var lines = [, ,];
  var offset = $(canvas).offset();

  var self = {
    slateMode: false,
    activeColor: 0,
    currentActivity: undefined,
    currentContentIndex: 0,
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
        self.clearCanvas(activityParameters[self.currentActivity].content[self.currentContentIndex]);
      }, false);
      speakBtn.addEventListener('click', function() {
        var textToSpeak = self.textToShow(activityParameters[self.currentActivity].content[self.currentContentIndex])
        self.speak(textToSpeak.toLowerCase());
        console.log(`speakBtn.onclick: self.currentContentIndex: ${activityParameters[self.currentActivity].content[self.currentContentIndex]}, textToSpeak: ${textToSpeak}`);
      }, false);
      cleanSlateBtn.addEventListener('click',  function() {
        self.currentContentIndex = -1; // next pre-increments, so go one past
        self.cleanSlateCanvas(true /*slateMode*/);
      }, false);
      nextBtn.addEventListener('click', function() {
        self.slateMode = false;
        self.nextNumber();
      }, false);
      currentActivityBtn.addEventListener('change', function() {
        self.currentContentIndex = 0;
        self.currentActivity = currentActivityBtn.value;
        if (!activityParameters[self.currentActivity].showCanvas) {
          canvas.style.display = "none";
          pencilsNode.style.visibility = "hidden";
          activities.style.display = "block";
        } else {
          activities.style.display = "none";
          canvas.style.display = "block";
          pencilsNode.style.visibility = "visible";
        }
        console.log(`currentActivityBtn.onchange: ${self.currentActivity}, ${self.currentContentIndex}`);
        self.clearCanvas(activityParameters[self.currentActivity].content[self.currentContentIndex]);
      }, false);
      window.addEventListener('orientationchange', self.orientationChanged, false);
      document.addEventListener('contextmenu', event => event.preventDefault());

      self.showText(activityParameters[self.currentActivity].content[self.currentContentIndex]);
      self.addPencils();
    },
    orientationChanged: function() {
      // TODO: Don't reset fully. At least retain (1) activity and (2) activity context
      location.reload();
    },
    addPencils: function() {
      return; // Temporarily disabled pencils

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
      return asciiValue;
      // return String.fromCharCode(asciiValue);
    },
    resetCanvas: function (text) {
      self.cleanSlateCanvas();
      self.showText(text ? text : activityParameters[self.currentActivity].content[0]);
    },
    nextNumber: function () {
      self.currentContentIndex = 
        (self.currentContentIndex + 1) % activityParameters[self.currentActivity].content.length == 0
        ? 0
        : self.currentContentIndex + 1;
      var nextIndex = self.currentContentIndex;
      var next = activityParameters[self.currentActivity].content[nextIndex];
      console.log(`nextNumber: self.currentContentIndex: ${self.currentContentIndex}, nextIndex: ${nextIndex}, next: `);
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
    activitesId: "activities",
    cleanSlateBtnId: "cleanSlateBtn",
    clearBtnId: "clearBtn",
    speakBtnId: "speakBtn"
  });
});
