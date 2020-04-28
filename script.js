//Canvas
var canvas = document.getElementById("front-canvas");
var backCanvas = document.getElementById("back-canvas");
var ctx = canvas.getContext("2d");
var backCtx = backCanvas.getContext("2d");
//Components
var saveBtn = document.getElementById("save-img");
var loadBtn = document.getElementById("load-img");
var imgPath = document.getElementById("img-path");

//Variables
var canvasx = $(canvas).offset().left;
var canvasy = $(canvas).offset().top;
var last_mousex = (last_mousey = 0);
var mousex = (mousey = 0);
var mousedown = false;
var rectangles = [];
var canvasImage = "";
var rectWidth = (rectHeight = 0);

//Load
canvas.width = $(window).width() - 307;
canvas.height = $(window).height() - 3;
backCanvas.width = $(window).width() - 305;
backCanvas.height = $(window).height() - 1;
$("#status").html(
  "<tr><td>current: </td><td>" +
    mousex +
    ", " +
    mousey +
    "</td></tr><tr><td>last: </td><td>" +
    last_mousex +
    ", " +
    last_mousey +
    "</td></tr><tr><td>width: </td><td>" +
    rectWidth +
    "</td></tr><tr><td>height: </td><td>" +
    rectHeight +
    "</td></tr>"
);
showrectangles();

//Resize
$(window).on("resize", function () {
  canvas.width = $(window).width() - 307;
  canvas.height = $(window).height() - 3;
  backCanvas.width = $(window).width() - 305;
  backCanvas.height = $(window).height() - 1;
  $("#status").html(
    "<tr><td>current: </td><td>" +
      mousex +
      ", " +
      mousey +
      "</td></tr><tr><td>last: </td><td>" +
      last_mousex +
      ", " +
      last_mousey +
      "</td></tr><tr><td>width: </td><td>" +
      rectWidth +
      "</td></tr><tr><td>height: </td><td>" +
      rectHeight +
      "</td></tr>"
  );
  drawImage(canvasImage);
  showrectangles();
});

//Draw Image and rectangles on Canvas
function drawImage(img) {
  var image = new Image();
  if (img !== "") {
    image.src = img;
    image.onload = function () {
      backCtx.drawImage(image, 0, 0);
      rectangles.forEach(paintrectangles);
    };
  } else {
    rectangles.forEach(paintrectangles);
  }
}

//Draw Rect on Canvas
//canvas mousedown event
$(canvas).on("mousedown", function (e) {
  last_mousex = parseInt(e.clientX - canvasx);
  last_mousey = parseInt(e.clientY - canvasy);
  mousedown = true;
});

//canvas mousemove event
$(canvas).on("mousemove", function (e) {
  mousex = parseInt(e.clientX - canvasx);
  mousey = parseInt(e.clientY - canvasy);
  rectWidth = rectHeight = 0;
  if (mousedown) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas
    ctx.beginPath();
    var width = mousex - last_mousex;
    var height = mousey - last_mousey;
    ctx.rect(last_mousex, last_mousey, width, height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
    rectWidth = Math.abs(last_mousex - mousex);
    rectHeight = Math.abs(last_mousey - mousey);
  }
  //Status Update
  $("#status").html(
    "<tr><td>current: </td><td>" +
      mousex +
      ", " +
      mousey +
      "</td></tr><tr><td>last: </td><td>" +
      last_mousex +
      ", " +
      last_mousey +
      "</td></tr><tr><td>width: </td><td>" +
      rectWidth +
      "</td></tr><tr><td>height: </td><td>" +
      rectHeight +
      "</td></tr>"
  );
});

//canvas mouseup event
$(canvas).on("mouseup", function (e) {
  mousedown = false;
  if (last_mousex - mousex !== 0 || last_mousey - mousey !== 0) {
    rectangles.push([last_mousex, last_mousey, mousex, mousey, "black", 2]);
    backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);
    //paint Image and rectangles;
    drawImage(canvasImage);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //Update sidebar
    showrectangles();
  }
});

//Add rectangles to back canvas
function paintrectangles(rect) {
  backCtx.beginPath();
  backCtx.rect(rect[0], rect[1], rect[2] - rect[0], rect[3] - rect[1]);
  backCtx.strokeStyle = rect[4];
  backCtx.lineWidth = rect[5];
  backCtx.stroke();
}

//Add rectangles to sidebar
function showrectangles() {
  $("#rect-list").html("");
  for (i = 0; i < rectangles.length; i++) {
    var rect = rectangles[i];
    var name = "rect" + Number(i + 1);
    var points = rect[0] + " " + rect[1] + " " + rect[2] + " " + rect[3];
    var deleteBtn =
      '<span class="delete-rect text-danger" data="' +
      i +
      '"><span class="glyphicon glyphicon-trash"></span></span>';
    $("#rect-list").append(
      '<tr data="' +
        i +
        '"><td>' +
        name +
        "</td><td>" +
        points +
        "</td><td>" +
        deleteBtn +
        "</td></tr>"
    );
  }
}

//sidebar Hover select rectangles
$("#rect-list").on("mouseenter", "tr", function () {
  var data = $(this).attr("data");
  rectangles[data][4] = "blue";
  backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);
  drawImage(canvasImage);
});

$("#rect-list").on("mouseleave", "tr", function () {
  var data = $(this).attr("data");
  rectangles[data][4] = "black";
  backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);
  drawImage(canvasImage);
});

//Delete rectangle from canvas
$("#rect-list").on("click", ".delete-rect", function () {
  var data = $(this).attr("data");
  rectangles.splice(data, 1);
  showrectangles();
  backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);
  drawImage(canvasImage);
});

//Load Image on canvas
$(loadBtn).on("click", function () {
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    var path = imgPath.files[0];
    var fr = new FileReader();
    fr.onload = passImage;
    fr.readAsDataURL(path);
  } else alert("<i>File API not supported by this browser.</i>");
});

function passImage(img) {
  canvasImage = img.target.result;
  drawImage(img.target.result);
}

//Download Image on canvas
$(saveBtn).on("click", function () {
  this.href = backCanvas.toDataURL(); // Change here
  this.download = "design.png";
});
