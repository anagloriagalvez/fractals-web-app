//////////////////////////////////////////////////
//
//    FRACTALS
//    Author: Ana Gloria Gálvez Mellado
//    In scope of Visual Creativity Informatics
//
//    Masaryk University, 2021
//
//    All functionality-related codes are
//    inspired on P5.js API and examples:
//    https://p5js.org/es/reference/
//
/////////////////////////////////////////////////

let originalDrawing; //Image buffer in which the image is saved with higher resolution
let multiplyFactor; //Times the saved canvas resolution is bigger than the displayed one
let selectedFractal; //Current selected fractal
let currentGraphicsX, currentGraphicsY;
let originalRatio;
let x_inp, y_inp; //Input text fields for saving

let loadedJSON; //Loaded JSON data
let projectJSON; //JSON for this project

//Fractal variables (drawing variables)
//-----------TREE BRANCH (L-SYSTEM)-------
var branch_length = 80; //Changed with slider
var angle = 0; //Changed with slider
var stroke_weight = 1; //Changed with slider
var length_disminution_percentage = 1/4;
var min_length_allowed = 5;
let selectedTreeType;
//--------------------------------------


//----------KOCH SNOWFLAKE-------------
  var segments, newSegments;
  var originalSegments, originalNewSegments;
  var koch_length; //Changed with slider
  var koch_stroke_weight = 1; //Changed with slider
  var iterations = 0; //Changed with slider
  let selectedKochType;
//------------------------------------


//--------BARNSLEY FERN------------------
  var x = 0;
  var y = 0;
  var leave_scale = 1;
  var n_points = 1000;
  let fernIterating = true; //Changed with button
  let selectedFernType;
//--------------------------------------


//-------------SIERPINSKI---------------
  var s_length = 500; //Changed with slider
  let selectedSierpinskiType;
//--------------------------------------


//All parameters are initialized (including GUI)
function setup() {
  multiplyFactor = 2;

  resized_width = (windowWidth - windowWidth * 0.01);
  resized_height = (windowHeight - windowHeight * 0.01);
  createCanvas(resized_width, resized_height);

  currentGraphicsX = width * multiplyFactor;
  currentGraphicsY = height * multiplyFactor;
  originalRatio = currentGraphicsX/currentGraphicsY; //For keeping proportional aspect

  originalDrawing = createGraphics(currentGraphicsX, currentGraphicsY);

  //Fractal selector
  fractal_p = createP("Current fractal type:");
  fractal_p.size(170, AUTO);
  fractal_p.style('color', 'white');
  fractal_p.position(width - 170, 50);
  fractal_select = createSelect();
  fractal_select.position(width - 170, 90);
  fractal_select.option('Tree');
  fractal_select.option('Koch');
  fractal_select.option('Barnsley fern');
  fractal_select.option('Sierpiński');
  fractal_select.selected('Tree');
  selectedFractal = fractal_select.value(); //Tree is selected by default
  fractal_select.changed(changeSelectedFractal);

  //Setup depends on selected fractal
  if(selectedFractal == "Tree"){
    branchTreeSetUp();
  }
  else if(selectedFractal =="Koch"){
    KochSetUp();
  }
  else if(selectedFractal == "Barnsley fern"){
    fernSetUp();
  }
  else if(selectedFractal == "Sierpiński"){
    SierpinskiSetUp();
  }

  //Resolution settings
  resolution_p = createP("Output settings: ");
  resolution_p.size(170, 20);
  resolution_p.style('color', 'white');
  resolution_p.style('font-size', '14px');
  resolution_p.position(fractal_p.x, resolution_p.height + 395);

  //X resolution
  x_inp_p = createP("Width ");
  x_inp_p.style('color', 'white');
  x_inp_p.style('font-size', '14px');
  x_inp_p.position(fractal_p.x, x_inp_p.height + 425);

  //X resolution input
  x_inp = createInput(str(ceil(currentGraphicsX)));
  x_inp.position(x_inp_p.x + 45, x_inp_p.y + x_inp.height/2);
  x_inp.size(100);
  x_inp.input(changeGraphicsSizeX);

  //Y resolution
  y_inp_p = createP("Height ");
  y_inp_p.style('color', 'white');
  y_inp_p.style('font-size', '14px');
  y_inp_p.position(fractal_p.x, y_inp_p.height + 450);

  //Y resolution input
  y_inp = createInput(str(ceil(currentGraphicsY)));
  y_inp.position(y_inp_p.x + 45, y_inp_p.y + y_inp.height/2);
  y_inp.size(100);
  y_inp.input(changeGraphicsSizeY);

  //Save button
  save_img_button = createButton('Save as PNG');
  save_img_button.position(resized_width - save_img_button.width - 40, save_img_button.height + 490);
  save_img_button.mousePressed(saveImg);

  //Project data title
  project_data_p = createP("Save project: ");
  project_data_p.style('color', 'white');
  project_data_p.style('font-size', '14px');
  project_data_p.position(fractal_p.x, project_data_p.height + 525);

  //Save JSON button
  save_json_button = createButton('Save data');
  save_json_button.size(130, 20);
  save_json_button.position(fractal_p.x, save_json_button.height + 555);
  save_json_button.mousePressed(saveData);

  //Project data title
  load_project_data_p = createP("Load project: ");
  load_project_data_p.style('color', 'white');
  load_project_data_p.style('font-size', '14px');
  load_project_data_p.position(fractal_p.x, load_project_data_p.height + 575);

  //Load JSON button
  load_json_button = createFileInput(loadData, false);
  load_json_button.position(fractal_p.x, load_json_button.height + 605);

  //"About" information
  about_p = createP("Project created in scope of PV097 course. Spring 2021.");
  about_p.size(170, AUTO);
  about_p.style('color', 'white');
  about_p.style('font-size', '14px');
  about_p.position(fractal_p.x, load_json_button.y + 27);

  author_p = createP("Ana Gloria Gálvez Mellado.");
  author_p.size(170, AUTO);
  author_p.style('color', 'white');
  author_p.style('font-size', '14px');
  author_p.position(fractal_p.x, load_json_button.y + 72);
}


//Draw is called each frame, unless noLoop is being called - called in setup
function draw() {
  fill(255);

  if(selectedFractal == "Tree"){
    originalDrawing.pixelDensity(1);
    background(0);
    originalDrawing.background(0);
    originalDrawing.noLoop();
    noLoop(); //Draw loop happens just once in order to optimize performance
    branchedTree();
    image(originalDrawing, 0, 0, width, height);
  }
  else if(selectedFractal == "Koch"){
    originalDrawing.resetMatrix();
    originalDrawing.pixelDensity(1);
    background(0);
    originalDrawing.background(0);
    originalDrawing.noLoop();
    noLoop(); //Draw loop happens just once in order to optimize performance
    drawKoch();
    image(originalDrawing, 0, 0, width, height);
  }
  else if(selectedFractal == "Barnsley fern"){
    originalDrawing.resetMatrix();
    originalDrawing.pixelDensity();
    originalDrawing.loop();
    loop();
    drawFern();
    image(originalDrawing, 0, 0, width, height);
  }
  else if(selectedFractal == "Sierpiński"){
    originalDrawing.pixelDensity(1);
    background(0);
    originalDrawing.background(0);
    originalDrawing.noLoop();
    noLoop(); //Draw loop happens just once in order to optimize performance
    drawSierpinski();
    image(originalDrawing, 0, 0, width, height);
  }
}

//-----------------FRACTALS--------------------------

//------------SIERPINSKI------------
//
// Initial code (base triangle) was inspired on
// hanxyn888@gmail.com - Recursive Sierpinski Triangle
// https://editor.p5js.org/hanxyn888@gmail.com/sketches/pMGvcy3Ue
//
// However, all variations improvements, carpet variation, ... are mine.
//
function drawSierpinski(){
  originalDrawing.stroke(s_line_colorPicker.color());
  originalDrawing.fill(s_line_colorPicker.color());

  s_iterations = s_iterations_slider.value();
  s_iterations_value_display = document.querySelector('#sIterationsValueP');
  s_iterations_value_display.textContent = s_iterations_slider.value();

  s_length = s_length_slider.value();
  s_length_value_display = document.querySelector('#sLengthValueP');
  s_length_value_display.textContent = s_length_slider.value();

  if(selectedSierpinskiType == "Triangle"){
    divide(originalDrawing.width / 2 - (s_length * multiplyFactor) / 2, originalDrawing.height / 2 + (s_length * multiplyFactor) * sqrt(3) / 4, (s_length * multiplyFactor), 1, s_iterations);
  }
  else if(selectedSierpinskiType == "Carpet"){
    if(s_iterations_slider.value() > 6){
      s_iterations_slider.value(6);
      s_iterations_value_display = document.querySelector('#sIterationsValueP');
      s_iterations_value_display.textContent = s_iterations_slider.value();
      s_iterations = s_iterations_slider.value();
    }
    divideCarpet((originalDrawing.width - s_length * multiplyFactor) / 2, (originalDrawing.height - s_length * multiplyFactor) / 2 , (s_length * multiplyFactor), 1, s_iterations);
  }
}

function divide(x, y, l, lvl, max) {
  if (lvl == max) {
    tri(x, y, l);
  } else {
    divide(x, y, l / 2, lvl + 1, max);
    divide(x + l / 2, y, l / 2, lvl + 1, max);
    divide(x + l / 4, y - l * sqrt(3) / 4, l / 2, lvl + 1, max);
  }
}

function divideCarpet(x, y, l, lvl, max) {
  if (lvl == max) {
    carpet(x, y, l);
  } else {
    divideCarpet(x, y, l / 3, lvl + 1, max);
    divideCarpet(x + l / 3, y, l / 3, lvl + 1, max);
    divideCarpet(x + 2 * l / 3, y, l / 3, lvl + 1, max);

    divideCarpet(x, y + l / 3, l / 3, lvl + 1, max);
    divideCarpet(x + 2 * l / 3, y + l / 3, l / 3, lvl + 1, max);

    divideCarpet(x, y + 2 * l / 3, l / 3, lvl + 1, max);
    divideCarpet(x + l / 3, y + 2 * l / 3, l / 3, lvl + 1, max);
    divideCarpet(x + 2 * l / 3, y + 2 * l / 3, l / 3, lvl + 1, max);
  }
}

function carpet(x, y ,l){
  originalDrawing.square(x, y, l);
}

function tri(x, y, l) {
  originalDrawing.triangle(x, y, x + l / 2, y - l * sqrt(3) / 2, x + l, y);
}

function SierpinskiSetUp(){
  //Sierpinski type selector
  s_variations_p = createP("Variations:");
  s_variations_p.style('color', 'white');
  s_variations_p.position(width - 170, 125);
  s_variations_select = createSelect();
  s_variations_select.position(width - 170, 165);
  s_variations_select.option('Triangle');
  s_variations_select.option('Carpet');
  s_variations_select.selected('Triangle');
  s_variations_select.changed(changeSelectedSierpinski);
  selectedSierpinskiType = s_variations_select.value();

  //Iterations slider
  s_iterations_slider = createSlider(1, 10, 2, 1);
  s_iterations_slider.input(redraw);
  s_iterations_slider.position(width - s_iterations_slider.width - 40, s_iterations_slider.height + 200);

  s_iterations_p = createP("Number of iterations");
  s_iterations_p.size(170, AUTO);
  s_iterations_p.style('color', 'white');
  s_iterations_p.style('font-size', '14px');
  s_iterations_p.position(s_iterations_slider.x, s_iterations_slider.y - 35);

  s_iterations_value_p = createP(s_iterations_slider.value());
  s_iterations_value_p.id('sIterationsValueP');
  s_iterations_value_p.style('color', 'white');
  s_iterations_value_p.style('font-size', '14px');
  s_iterations_value_p.position(s_iterations_slider.x + s_iterations_slider.width + 5, s_iterations_slider.y - 15);

  //Length slider
  s_length_slider = createSlider(250, 800, 500, 0.5);
  s_length_slider.input(redraw);
  s_length_slider.position(width - s_length_slider.width - 40, s_length_slider.height + 250);

  s_length_p = createP("Side length");
  s_length_p.size(170, AUTO);
  s_length_p.style('color', 'white');
  s_length_p.style('font-size', '14px');
  s_length_p.position(s_length_slider.x, s_length_slider.y - 35);

  s_length_value_p = createP(s_length_slider.value());
  s_length_value_p.id('sLengthValueP');
  s_length_value_p.style('color', 'white');
  s_length_value_p.style('font-size', '14px');
  s_length_value_p.position(s_length_slider.x + s_length_slider.width + 5, s_length_slider.y - 15);

  //Line color picker
  s_line_colorPicker = createColorPicker('#ffffff');
  s_line_colorPicker.input(redraw);
  s_line_colorPicker.position(width - s_length_slider.width - 40, s_line_colorPicker.height + 300);

  s_line_color_p = createP('Color');
  s_line_color_p.size(170, AUTO);
  s_line_color_p.style('color', 'white');
  s_line_color_p.style('font-size', '14px');
  s_line_color_p.position(s_length_slider.x, s_line_colorPicker.y - 35);

}

//-----------------BARNSLEY FERN-----------------------
//
// Initial code (base fern) was inspired on
// Wikipedia - Barnsley Fern
// https://en.wikipedia.org/wiki/Barnsley_fern
//
// However, all variations improvements, parameter replacements, ... are mine.
//
//
function drawFern() {

  if(selectedFernType == "Classic"){
    originalDrawing.translate((originalDrawing.width-originalDrawing.height/7)/3, originalDrawing.height/7);
    leave_scale = 0.75 * multiplyFactor;
  }
  else if(selectedFernType == "Variation 1"){
    originalDrawing.translate(originalDrawing.width/5, -originalDrawing.height/3);
    leave_scale = 1.2 * multiplyFactor;
  }
  else if(selectedFernType == "Variation 2"){
    originalDrawing.translate(originalDrawing.width/4, -originalDrawing.height/3);
    leave_scale = 1.2 * multiplyFactor;
  }
  else if(selectedFernType == "Variation 3"){
    originalDrawing.translate(originalDrawing.width/4, -originalDrawing.height/3);
    leave_scale = 1.2 * multiplyFactor;
  }

  if(fernIterating){
    for (let i = 0; i < n_points; i++) {
      drawPoint();
      if(selectedFernType == "Classic"){
        nextPoint();
      }
      else if(selectedFernType == "Variation 1"){
        nextPointVariation1();
      }
      else if(selectedFernType == "Variation 2"){
        nextPointVariation2();
      }
      else if(selectedFernType == "Variation 3"){
        nextPointVariation3();
      }
    }
  }
}

//range −2.1820 < x < 2.6558 and 0 ≤ y < 9.9983.
function drawPoint() {
  originalDrawing.stroke(fern_line_colorPicker.value());
  originalDrawing.strokeWeight(1);
  let px = map(x, -2.1820, 2.6558, 0, (height*leave_scale)); //It's set based on height (square)
  let py = map(y, 0, 9.9983, (height*leave_scale), 0);
  originalDrawing.point(px, py);
}

function nextPoint() {
  let nextX;
  let nextY;

  let r = random(1);

  if (r < 0.01) {
    //1
    nextX = 0;
    nextY = 0.16 * y;
  } else if (r < 0.86) {
    //2
    nextX = 0.85 * x + 0.04 * y;
    nextY = -0.04 * x + 0.85 * y + 1.60;
  } else if (r < 0.93) {
    //3
    nextX = 0.20 * x + -0.26 * y;
    nextY = 0.23 * x + 0.22 * y + 1.60;
  } else {
    //4
    nextX = -0.15 * x + 0.28 * y;
    nextY = 0.26 * x + 0.24 * y + 0.44;
  }

  x = nextX;
  y = nextY;
}

// Based on parameters provided by:
// https://www.dcnicholls.com/byzantium/ferns/fractal.html
function nextPointVariation1() {
  let nextX;
  let nextY;

  let r = random(1);

  if (r < 0.02) {
    //1
    nextX = 0;
    nextY = 0.25 * y -0.14;
  } else if (r < 0.84) {
    //2
    nextX = 0.85 * x + 0.02 * y;
    nextY = -0.02 * x + 0.83 * y + 1;
  } else if (r < 0.93) {
    //3
    nextX = 0.09 * x -0.28 * y;
    nextY = 0.3 * x + 0.11 * y + 0.6;
  } else {
    //4
    nextX = -0.09 * x + 0.28 * y;
    nextY = 0.3 * x + 0.09 * y + 0.7;
  }

  x = nextX;
  y = nextY;
}

// Based on parameters provided by:
// https://www.dcnicholls.com/byzantium/ferns/fractal.html
function nextPointVariation2() {
  let nextX;
  let nextY;

  let r = random(1);

  if (r < 0.02) {
    //1
    nextX = 0;
    nextY = 0.25 * y -0.4;
  } else if (r < 0.84) {
    //2
    nextX = 0.95 * x + 0.002 * y - 0.002;
    nextY = -0.002 * x + 0.93 * y + 0.5;
  } else if (r < 0.93) {
    //3
    nextX = 0.035 * x -0.11 * y - 0.05;
    nextY = 0.27 * x + 0.01 * y + 0.005;
  } else {
    //4
    nextX = -0.04 * x + 0.11 * y + 0.047;
    nextY = 0.27 * x + 0.01 * y + 0.06;
  }

  x = nextX;
  y = nextY;
}

// Based on parameters provided by:
// https://www.dcnicholls.com/byzantium/ferns/fractal.html
function nextPointVariation3() {
  let nextX;
  let nextY;

  let r = random(1);

  if (r < 0.02) {
    //1
    nextX = 0;
    nextY = 0.25 * y -0.4;
  } else if (r < 0.84) {
    //2
    nextX = 0.95 * x + 0.005 * y - 0.002;
    nextY = -0.005 * x + 0.93 * y + 0.5;
  } else if (r < 0.93) {
    //3
    nextX = 0.035 * x -0.2 * y - 0.09;
    nextY = 0.16 * x + 0.04 * y + 0.02;
  } else {
    //4
    nextX = -0.04 * x + 0.2 * y + 0.083;
    nextY = 0.16 * x + 0.04 * y + 0.12;
  }

  x = nextX;
  y = nextY;
}

//Sets the branch tree fractal parameters on the GUI
function fernSetUp(){
  //Fern type selector
  fern_variations_p = createP("Variations:");
  fern_variations_p.style('color', 'white');
  fern_variations_p.position(width - 170, 125);
  fern_variations_select = createSelect();
  fern_variations_select.position(width - 170, 165);
  fern_variations_select.option('Classic');
  fern_variations_select.option('Variation 1');
  fern_variations_select.option('Variation 2');
  fern_variations_select.option('Variation 3');
  fern_variations_select.selected('Classic');
  selectedFernType = fern_variations_select.value(); //Tree is selected by default
  fern_variations_select.changed(changeSelectedFernType);

  //Line color picker
  fern_line_colorPicker = createColorPicker('#ffffff');
  fern_line_colorPicker.position(fern_variations_select.x, line_colorPicker.height + 200);

  fern_line_color_p = createP('Dots color');
  fern_line_color_p.size(170, AUTO);
  fern_line_color_p.style('color', 'white');
  fern_line_color_p.style('font-size', '14px');
  fern_line_color_p.position(fern_variations_select.x, fern_line_colorPicker.y - 35);

  //Stop iterating button
  fern_stop_button = createButton('Stop iterating');
  fern_stop_button.position(fern_variations_select.x, fern_stop_button.height + 275);
  fern_stop_button.mousePressed(changeFernIterating);
}

//Changes the selection for iterating and the button name
function changeFernIterating(){
  fernIterating = !fernIterating;
  if(fernIterating){
      fern_stop_button.html("Stop iterating");
  }
  else{
      fern_stop_button.html("Resume iterating");
  }
}


//----------------KOCH SNOWFLAKE AND MINKOWSKI---------------------
//
// Initial code (base snowflake) was inspired on
// Daniel Shiffman (Coding Challenge 129: Koch Snowflake)
// https://thecodingtrain.com/CodingChallenges/129-koch-snowflake.html
// https://youtu.be/X8bXDKqMsXE
//
// However, all variations (Line, Antisnowflake, Minkowski Sausage, Minkowski island),
// improvement, parameter replacements, ... are mine.
//

function drawKoch(){

  iterations = iterations_slider.value();
  iterations_value_display = document.querySelector('#iterationsValueP');
  iterations_value_display.textContent = iterations_slider.value();

  koch_length = koch_length_slider.value();
  koch_length_value_display = document.querySelector('#kochLengthValueP');
  koch_length_value_display.textContent = koch_length_slider.value();

  koch_stroke_weight = koch_stroke_slider.value();
  koch_stroke_value_display = document.querySelector('#kochStrokeValueP');
  koch_stroke_value_display.textContent = koch_stroke_slider.value();

  //Line thickness and color values
  originalDrawing.strokeWeight(koch_stroke_weight * multiplyFactor);
  originalDrawing.stroke(koch_line_colorPicker.color());

  //Changes the tree to draw
  switch(selectedKochType){
    case "Line":
      LineKochSegmentDefinition();
      KochIteration();
      break;
    case "Snowflake":
        SnowflakeKochSegmentDefinition();
        KochIteration();
      break;
    case "Antisnowflake":
        AntisnowflakeKochSegmentDefinition();
        KochIteration();
      break;
    case "Minkowski sausage":
      SausageSegmentDefinition();
      KochIteration();
      break;
    case "Minkowski island":
      IslandSegmentDefinition();
      KochIteration();
      break;
    default:
      break;
  }
}

function KochIteration(){

  for (let i = 0; i < iterations; i++){
    let originalNewSegments = [];

    for (let s of originalSegments) {
      let originalChildren = s.generate();
      addAllSegments(originalChildren, originalNewSegments);
    }
    originalSegments = originalNewSegments;
  }

  for (let s of originalSegments) {
    s.showOriginal();
  }
}

function LineKochSegmentDefinition() {
  originalSegments = [];
  originalNewSegments = [];

  originalDrawing.translate((originalDrawing.width-koch_length * multiplyFactor)/2, originalDrawing.height/2);

  let originalSegs = new Segment(createVector(0, 0), createVector(koch_length * multiplyFactor, 0));
  originalSegments.push(originalSegs);
}

//Like Koch line but makes a triangle that leads to an snowflake-shape.
function SnowflakeKochSegmentDefinition() {
  originalSegments = [];
  originalNewSegments = [];
  originalDrawing.translate(originalDrawing.width/2, originalDrawing.height/2);

  let segs = new Segment(p5.Vector.fromAngle(0, koch_length* multiplyFactor), p5.Vector.fromAngle(TWO_PI/3,koch_length* multiplyFactor));
  let segs1 = new Segment(p5.Vector.fromAngle(TWO_PI/3, koch_length* multiplyFactor), p5.Vector.fromAngle(2*TWO_PI/3 ,koch_length* multiplyFactor));
  let segs2 = new Segment(p5.Vector.fromAngle(2*TWO_PI/3, koch_length* multiplyFactor), p5.Vector.fromAngle(0 ,koch_length* multiplyFactor));
  originalSegments.push(segs);
  originalSegments.push(segs1);
  originalSegments.push(segs2);
}

//Koch snowflake but inverse. Interesting fractal.
function AntisnowflakeKochSegmentDefinition(){
  originalSegments = [];
  originalNewSegments = [];
  originalDrawing.translate(originalDrawing.width/2, originalDrawing.height/2);

  let segs = new Segment(p5.Vector.fromAngle(TWO_PI/3,koch_length* multiplyFactor), p5.Vector.fromAngle(0, koch_length* multiplyFactor));
  let segs1 = new Segment(p5.Vector.fromAngle(2*TWO_PI/3 ,koch_length* multiplyFactor), p5.Vector.fromAngle(TWO_PI/3, koch_length* multiplyFactor));
  let segs2 = new Segment(p5.Vector.fromAngle(0 ,koch_length* multiplyFactor), p5.Vector.fromAngle(2*TWO_PI/3, koch_length* multiplyFactor));
  originalSegments.push(segs);
  originalSegments.push(segs1);
  originalSegments.push(segs2);
}

//It's like Koch line but using the class "Sausage Segment"
function SausageSegmentDefinition() {
  originalSegments = [];
  originalNewSegments = [];
  originalDrawing.translate((originalDrawing.width-koch_length * multiplyFactor)/2, originalDrawing.height/2);

  let segs = new SausageSegment(createVector(0, 0), createVector(koch_length* multiplyFactor, 0));
  originalSegments.push(segs);
}

//4 Minkowsi Lines on the shape of a square.
function IslandSegmentDefinition() {
  originalSegments = [];
  originalNewSegments = [];
  originalDrawing.translate(originalDrawing.width/2, originalDrawing.height/2);

  let segs = new SausageSegment(p5.Vector.fromAngle(0, koch_length* multiplyFactor), p5.Vector.fromAngle(TWO_PI/4,koch_length* multiplyFactor));
  let segs1 = new SausageSegment(p5.Vector.fromAngle(TWO_PI/4, koch_length* multiplyFactor), p5.Vector.fromAngle(2*TWO_PI/4 ,koch_length* multiplyFactor));
  let segs2 = new SausageSegment(p5.Vector.fromAngle(2*TWO_PI/4, koch_length* multiplyFactor), p5.Vector.fromAngle(3*TWO_PI/4 ,koch_length* multiplyFactor));
  let segs3 = new SausageSegment(p5.Vector.fromAngle(3*TWO_PI/4, koch_length* multiplyFactor), p5.Vector.fromAngle(0 ,koch_length* multiplyFactor));
  originalSegments.push(segs);
  originalSegments.push(segs1);
  originalSegments.push(segs2);
  originalSegments.push(segs3);
}

function addAllSegments(arr, list) {
  for (let s of arr) {
    list.push(s);
  }
}

function KochSetUp(){
  //Koch type selector
   koch_variations_p = createP("Koch variations:");
   koch_variations_p.size(170, AUTO);
   koch_variations_p.style('color', 'white');
   koch_variations_p.position(width - 170, 125);
   koch_variations_select = createSelect();
   koch_variations_select.position(width - 170, 165);
   koch_variations_select.option('Line');
   koch_variations_select.option('Snowflake');
   koch_variations_select.option('Antisnowflake');
   koch_variations_select.option('Minkowski sausage');
   koch_variations_select.option('Minkowski island');
   koch_variations_select.selected('Line');
   selectedKochType = koch_variations_select.value(); //Line is selected by default
   koch_variations_select.changed(changeSelectedKochType);

  //Iterations slider
   iterations_slider = createSlider(0, 5, 2, 1);
   iterations_slider.input(redraw);
   iterations_slider.position(width - iterations_slider.width - 40, iterations_slider.height + 200);

   iterations_p = createP("Number of iterations");
   iterations_p.size(170, AUTO);
   iterations_p.style('color', 'white');
   iterations_p.style('font-size', '14px');
   iterations_p.position(iterations_slider.x, iterations_slider.y - 35);

   iterations_value_p = createP(iterations_slider.value());
   iterations_value_p.id('iterationsValueP');
   iterations_value_p.style('color', 'white');
   iterations_value_p.style('font-size', '14px');
   iterations_value_p.position(iterations_slider.x + iterations_slider.width + 5, iterations_slider.y - 15);


  //Length slider
  koch_length_slider = createSlider(50, 750, 150, 0.5);
  koch_length_slider.input(redraw);
  koch_length_slider.position(width - koch_length_slider.width - 40, koch_length_slider.height + 250);

  koch_length_p = createP("Line length");
  koch_length_p.size(170, AUTO);
  koch_length_p.style('color', 'white');
  koch_length_p.style('font-size', '14px');
  koch_length_p.position(koch_length_slider.x, koch_length_slider.y - 35);

  koch_length_value_p = createP(koch_length_slider.value());
  koch_length_value_p.id('kochLengthValueP');
  koch_length_value_p.style('color', 'white');
  koch_length_value_p.style('font-size', '14px');
  koch_length_value_p.position(koch_length_slider.x + koch_length_slider.width + 5, koch_length_slider.y - 15);

  //Stroke slider
  koch_stroke_slider = createSlider(1, 5, 2, 0.01);
  koch_stroke_slider.input(redraw);
  koch_stroke_slider.position(width - koch_stroke_slider.width - 40, koch_stroke_slider.height + 300);

  koch_stroke_p = createP("Line thickness");
  koch_stroke_p.size(170, AUTO);
  koch_stroke_p.style('color', 'white');
  koch_stroke_p.style('font-size', '14px');
  koch_stroke_p.position(koch_stroke_slider.x, koch_stroke_slider.y - 35);

  koch_stroke_value_p = createP(koch_stroke_slider.value());
  koch_stroke_value_p.id('kochStrokeValueP');
  koch_stroke_value_p.style('color', 'white');
  koch_stroke_value_p.style('font-size', '14px');
  koch_stroke_value_p.position(koch_stroke_slider.x + koch_stroke_slider.width + 5, koch_stroke_slider.y - 15);

  //Line color picker
  koch_line_colorPicker = createColorPicker('#ffffff');
  koch_line_colorPicker.input(redraw);
  koch_line_colorPicker.position(width - koch_stroke_slider.width - 40, koch_line_colorPicker.height + 350);

  koch_line_color_p = createP('Line color');
  koch_line_color_p.size(170, AUTO);
  koch_line_color_p.style('color', 'white');
  koch_line_color_p.style('font-size', '14px');
  koch_line_color_p.position(koch_length_slider.x, koch_line_colorPicker.y - 35);
}

//-----------------BRANCHED TREE (L-SYSTEM) ---------------------
//
// Initial code (base) was inspired on
// "The Coding Train", Coding Challenge #14: Fractal Trees - Recursive video
// (https://www.youtube.com/watch?v=0jjeOYMjmDU&list=LL&index=2)
// However, all variations, improvement, parameter replacements, ... are mine.
//

//Sets the branch tree fractal parameters on the GUI
function branchTreeSetUp(){
  //L-System type selector
  tree_variations_p = createP("Variations:");
  tree_variations_p.style('color', 'white');
  tree_variations_p.position(width - 170, 125);
  tree_variations_select = createSelect();
  tree_variations_select.position(width - 170, 165);
  tree_variations_select.option('Basic');
  tree_variations_select.option('Variation 1');
  tree_variations_select.option('Variation 2');
  tree_variations_select.option('Variation 3');
  tree_variations_select.selected('Basic');
  selectedTreeType = tree_variations_select.value(); //Tree is selected by default
  tree_variations_select.changed(changeSelectedTreeType);

  //Angle slider
  angle_slider = createSlider(0, PI/2, PI/4, 0.01);
  angle_slider.input(redraw);
  angle_slider.position(width - angle_slider.width - 40, angle_slider.height + 200);

  angle_p = createP("Branch angle (radians)");
  angle_p.size(170, AUTO);
  angle_p.style('color', 'white');
  angle_p.style('font-size', '14px');
  angle_p.position(angle_slider.x, angle_slider.y - 35);

  angle_value_p = createP(angle_slider.value());
  angle_value_p.id('angleValueP');
  angle_value_p.style('color', 'white');
  angle_value_p.style('font-size', '14px');
  angle_value_p.position(angle_slider.x + angle_slider.width + 5, angle_slider.y - 15);


  //Length slider
  length_slider = createSlider(50, 350, 150, 0.5);
  length_slider.input(redraw);
  length_slider.position(width - length_slider.width - 40, length_slider.height + 250);

  length_p = createP("Branch length");
  length_p.size(170, AUTO);
  length_p.style('color', 'white');
  length_p.style('font-size', '14px');
  length_p.position(length_slider.x, length_slider.y - 35);

  length_value_p = createP(length_slider.value());
  length_value_p.id('lengthValueP');
  length_value_p.style('color', 'white');
  length_value_p.style('font-size', '14px');
  length_value_p.position(length_slider.x + length_slider.width + 5, length_slider.y - 15);

  //Stroke slider
  stroke_slider = createSlider(1, 5, 2, 0.01);
  stroke_slider.input(redraw);
  stroke_slider.position(width - stroke_slider.width - 40, stroke_slider.height + 300);

  stroke_p = createP("Line thickness");
  stroke_p.size(170, AUTO);
  stroke_p.style('color', 'white');
  stroke_p.style('font-size', '14px');
  stroke_p.position(stroke_slider.x, stroke_slider.y - 35);

  stroke_value_p = createP(stroke_slider.value());
  stroke_value_p.id('strokeValueP');
  stroke_value_p.style('color', 'white');
  stroke_value_p.style('font-size', '14px');
  stroke_value_p.position(stroke_slider.x + stroke_slider.width + 5, stroke_slider.y - 15);

  //Line color picker
  line_colorPicker = createColorPicker('#ffffff');
  line_colorPicker.input(redraw);
  line_colorPicker.position(width - stroke_slider.width - 40, line_colorPicker.height + 350);

  line_color_p = createP('Line color');
  line_color_p.size(170, AUTO);
  line_color_p.style('color', 'white');
  line_color_p.style('font-size', '14px');
  line_color_p.position(length_slider.x, line_colorPicker.y - 35);
}

//Branched Tree setup
function branchedTree(){
  angle = angle_slider.value();
  angle_value_display = document.querySelector('#angleValueP');
  angle_value_display.textContent = angle_slider.value();

  branch_length = length_slider.value();
  length_value_display = document.querySelector('#lengthValueP');
  length_value_display.textContent = length_slider.value();

  stroke_weight = stroke_slider.value();
  stroke_value_display = document.querySelector('#strokeValueP');
  stroke_value_display.textContent = stroke_slider.value();

  originalDrawing.push();

  originalDrawing.strokeWeight(stroke_weight * multiplyFactor);
  originalDrawing.stroke(line_colorPicker.color());
  originalDrawing.translate(originalDrawing.width/2, originalDrawing.height);

  //Changes the tree to draw
  switch(selectedTreeType) {
    case "Basic":
      length_disminution_percentage = 0.71;
      drawBranch(branch_length);
      break;
    case "Variation 1":
      length_disminution_percentage = 1/2;
      drawBranchTwo(branch_length);
      break;
    case "Variation 2":
      length_disminution_percentage = 0.55;
      drawBranchThree(branch_length);
      break;
    case "Variation 3":
      length_disminution_percentage = 1/4;
      drawBranchFour(branch_length);
      break;
    default:
      length_disminution_percentage = 0.71;
      drawBranch(branch_length);
      break;
  }

  originalDrawing.pop();
}

//Recursive function for drawing branchs. Try with:
//length_disminution_percentage = 0.7 - 0.72
//min_length_allowed = 5;
function drawBranch(length){
  originalDrawing.line(0, 0, 0, (-length * multiplyFactor));
  originalDrawing.translate(0, -length * multiplyFactor);

  if(length > 7){
    originalDrawing.push();
    originalDrawing.rotate(angle);
    drawBranch(length * length_disminution_percentage);
    originalDrawing.pop();
    originalDrawing.push();
    originalDrawing.rotate(-angle);
    drawBranch(length * length_disminution_percentage);
    originalDrawing.pop();
  }
}

//Variation. Try with:
//length_disminution_percentage = 2/4;
//min_length_allowed = 5;
function drawBranchTwo(length){
  originalDrawing.line(0, 0, 0, (-length * multiplyFactor));
  originalDrawing.translate(0, -length * multiplyFactor);

  if(length > min_length_allowed){

    originalDrawing.push();
    originalDrawing.rotate(angle);
    drawBranchTwo(length * length_disminution_percentage);
    originalDrawing.pop();

    originalDrawing.push();
    originalDrawing.translate(0, length/2 * multiplyFactor);
    originalDrawing.rotate(-angle);
    drawBranchTwo(length * length_disminution_percentage);
    originalDrawing.pop();

    originalDrawing.push();
    originalDrawing.rotate(-angle);
    drawBranchTwo(length * length_disminution_percentage);
    originalDrawing.pop();
  }
}

//Variation. Try with:
//length_disminution_percentage = 0.55;
//min_length_allowed = 5;
function drawBranchThree(length){
  originalDrawing.line(0, 0, 0, (-length * multiplyFactor));
  originalDrawing.translate(0, -length * multiplyFactor);

  if(length > min_length_allowed){

    originalDrawing.push();
    originalDrawing.translate(0, length/3 * multiplyFactor);
    originalDrawing.rotate(angle);
    drawBranchThree(length * length_disminution_percentage);
    originalDrawing.pop();

    originalDrawing.push();
    originalDrawing.translate(0, length/2 * multiplyFactor);
    originalDrawing.rotate(-angle);
    drawBranchThree(length * length_disminution_percentage);
    originalDrawing.pop();

    originalDrawing.push();
    drawBranchThree(length * length_disminution_percentage);
    originalDrawing.pop();
  }
}

//Variation. Try with:
//length_disminution_percentage = 1/4;
//min_length_allowed = 5;
function drawBranchFour(length){
  originalDrawing.line(0, 0, 0, (-length * multiplyFactor));
  originalDrawing.translate(0, -length * multiplyFactor);

  if(length > min_length_allowed){

    originalDrawing.push();
    drawBranchFour(length * (length_disminution_percentage + 0.15));
    originalDrawing.pop();

    originalDrawing.push();
    originalDrawing.translate(0, length/4 * multiplyFactor);
    originalDrawing.rotate(angle);
    drawBranchFour(length * length_disminution_percentage);
    originalDrawing.pop();

    originalDrawing.push();
    originalDrawing.translate(0, length/3.5 * multiplyFactor);
    originalDrawing.rotate(-angle);
    drawBranchFour(length * length_disminution_percentage);
    originalDrawing.pop();

    originalDrawing.push();
    originalDrawing.translate(0, length/2.5 * multiplyFactor);
    originalDrawing.rotate(-angle);
    drawBranchFour(length * (length_disminution_percentage - 0.1));
    originalDrawing.pop();

    originalDrawing.push();
    originalDrawing.translate(0, length/1.5 * multiplyFactor);
    originalDrawing.rotate(angle);
    drawBranchFour(length * (length_disminution_percentage + 0.1));
    originalDrawing.pop();

    originalDrawing.push();
    originalDrawing.translate(0, length/1.5 * multiplyFactor);
    originalDrawing.rotate(-angle);
    drawBranchFour(length * (length_disminution_percentage + 0.1));
    originalDrawing.pop();

    originalDrawing.push();
    originalDrawing.translate(0, length/1.2 * multiplyFactor);
    originalDrawing.rotate(angle);
    drawBranchFour(length * (length_disminution_percentage - 0.1));
    originalDrawing.pop();

    originalDrawing.push();
    originalDrawing.translate(0, length/1.03 * multiplyFactor);
    originalDrawing.rotate(-angle);
    drawBranchFour(length * length_disminution_percentage);
    originalDrawing.pop();
  }
}

//-----------------------------------------------------


//------------------UI FUNCTIONALITIES----------------

// Gets the value on the text input, changes the graphics scale based on it
function changeGraphicsSizeX(){

  if(float(this.value()) > 8000){ //No more than 8k allowed
    currentGraphicsX = 8000;
    ceil(currentGraphicsX);
    this.value(str(currentGraphicsX)); //Changes new X value on the textfield

    currentGraphicsY = round(currentGraphicsX/originalRatio); //Keep aspect ratio
    y_inp.value(str(currentGraphicsY));

    if (selectedFractal == "Barnsley fern"){
      multiplyFactor = (currentGraphicsX/width)/ pixelDensity();
      originalDrawing = createGraphics(currentGraphicsX/ pixelDensity(), currentGraphicsY/ pixelDensity());
      originalDrawing.background(0);
    }else{
      multiplyFactor = (currentGraphicsX/width);
      originalDrawing = createGraphics(currentGraphicsX, currentGraphicsY);
    }
    redraw();
  }
  else if(isNaN(float(this.value()))){
    return; //Do nothing
  }
  else {
    currentGraphicsX = float(this.value());
    ceil(currentGraphicsX);
    this.value(str(currentGraphicsX)); //Changes new X value on the textfield

    currentGraphicsY = round(currentGraphicsX/originalRatio); //Keep aspect ratio
    y_inp.value(str(currentGraphicsY));

    if (selectedFractal == "Barnsley fern"){
      multiplyFactor = (currentGraphicsX/width)/ pixelDensity();
      originalDrawing = createGraphics(currentGraphicsX/ pixelDensity(), currentGraphicsY/ pixelDensity());
      originalDrawing.background(0);
    }else{
      multiplyFactor = (currentGraphicsX/width);
      originalDrawing = createGraphics(currentGraphicsX, currentGraphicsY);
    }
    redraw();
  }

}

function changeGraphicsSizeY(){
  heightValue = ceil(float(this.value()));
  widthValue = round(heightValue*originalRatio);

  if(widthValue > 8000){ //No more than 8k allowed
    currentGraphicsX = 8000;
    ceil(currentGraphicsX);
    x_inp.value(str(currentGraphicsX)); //Changes new X value on the textfield

    currentGraphicsY = round(currentGraphicsX/originalRatio); //Keep aspect ratio
    this.value(str(currentGraphicsY));

    if (selectedFractal == "Barnsley fern"){
      multiplyFactor = currentGraphicsY/height;
      originalDrawing = createGraphics(currentGraphicsX, currentGraphicsY);
      originalDrawing.background(0);
    }else{
      multiplyFactor = currentGraphicsY/height/ pixelDensity();
      originalDrawing = createGraphics(currentGraphicsX/ pixelDensity(), currentGraphicsY/ pixelDensity());
    }
    redraw();
  }
  else if(isNaN(float(this.value()))){
    return; //Do nothing
  }
  else {
    currentGraphicsY = heightValue;
    this.value(str(currentGraphicsY)); //Changes new X value on the textfield

    currentGraphicsX = widthValue;
    x_inp.value(str(currentGraphicsX));

    if (selectedFractal == "Barnsley fern"){
      multiplyFactor = currentGraphicsY/height;
      originalDrawing = createGraphics(currentGraphicsX, currentGraphicsY);
      originalDrawing.background(0);
    }else{
      multiplyFactor = currentGraphicsY/height/ pixelDensity();
      originalDrawing = createGraphics(currentGraphicsX/ pixelDensity(), currentGraphicsY/ pixelDensity());
    }
    redraw();
  }

}

function initializeDrawing(){
  if (selectedFractal == "Barnsley fern"){
    multiplyFactor = (currentGraphicsX/width)/ pixelDensity();
    originalDrawing = createGraphics(currentGraphicsX/ pixelDensity(), currentGraphicsY/ pixelDensity());
    originalDrawing.background(0);
  }else{
    multiplyFactor = (currentGraphicsX/width);
    originalDrawing = createGraphics(currentGraphicsX, currentGraphicsY);
  }
}

//Select tree type (branch fractal), redraws the image
function changeSelectedTreeType(){
  selectedTreeType = tree_variations_select.value();
  redraw();
}

//Select fern type (change selection)
function changeSelectedFernType(){
  originalDrawing.background(0);
  selectedFernType = fern_variations_select.value();
}

//Select Koch type, redrawns the image
function changeSelectedKochType(){
  selectedKochType = koch_variations_select.value();
  originalDrawing.redraw();
  redraw();
}

//Alternates between Sierpinski
function changeSelectedSierpinski(){
  selectedSierpinskiType = s_variations_select.value();
  redraw();
}

//Select fractal, redraws the image, reloads everything
function changeSelectedFractal(){
  selectedFractal = fractal_select.value();
  fernIterating = true;
  initializeDrawing();
  removeElements();
  originalDrawing.resetMatrix();
  reSetUp();
  originalDrawing.background(0);
  originalDrawing.redraw();
  redraw();
}

//Does the set up again, it's called when the fractal is changed
function reSetUp(){
  //Fractal selector
  fractal_p = createP("Current fractal type:");
  fractal_p.size(170, AUTO);
  fractal_p.style('color', 'white');
  fractal_p.position(width - 170, 50);
  fractal_select = createSelect();
  fractal_select.position(width - 170, 90);
  fractal_select.option('Tree');
  fractal_select.option('Koch');
  fractal_select.option('Barnsley fern');
  fractal_select.option('Sierpiński');
  fractal_select.selected(selectedFractal);
  fractal_select.changed(changeSelectedFractal);

  //Setup depends on selected fractal
  if(selectedFractal == "Tree"){
    branchTreeSetUp();
  }
  else if(selectedFractal =="Koch"){
    KochSetUp();
  }
  else if (selectedFractal == "Barnsley fern"){
    originalDrawing.background(0);
    fernSetUp();
  }
  else if(selectedFractal == "Sierpiński"){
    SierpinskiSetUp();
  }
  //Resolution settings
  resolution_p = createP("Output settings: ");
  resolution_p.size(170, 20);
  resolution_p.style('color', 'white');
  resolution_p.style('font-size', '14px');
  resolution_p.position(fractal_p.x, resolution_p.height + 395);

  //X resolution
  x_inp_p = createP("Width ");
  x_inp_p.style('color', 'white');
  x_inp_p.style('font-size', '14px');
  x_inp_p.position(fractal_p.x, x_inp_p.height + 425);

  //X resolution input
  x_inp = createInput(str(ceil(currentGraphicsX)));
  x_inp.position(x_inp_p.x + 45, x_inp_p.y + x_inp.height/2);
  x_inp.size(100);
  x_inp.input(changeGraphicsSizeX);

  //Y resolution
  y_inp_p = createP("Height ");
  y_inp_p.style('color', 'white');
  y_inp_p.style('font-size', '14px');
  y_inp_p.position(fractal_p.x, y_inp_p.height + 450);

  //Y resolution input
  y_inp = createInput(str(ceil(currentGraphicsY)));
  y_inp.position(y_inp_p.x + 45, y_inp_p.y + y_inp.height/2);
  y_inp.size(100);
  y_inp.input(changeGraphicsSizeY);

  //Save button
  save_img_button = createButton('Save as PNG');
  save_img_button.position(resized_width - save_img_button.width - 40, save_img_button.height + 490);
  save_img_button.mousePressed(saveImg);

  //Project data title
  project_data_p = createP("Save project: ");
  project_data_p.style('color', 'white');
  project_data_p.style('font-size', '14px');
  project_data_p.position(fractal_p.x, project_data_p.height + 525);

  //Save JSON button
  save_json_button = createButton('Save data');
  save_json_button.size(130, 20);
  save_json_button.position(fractal_p.x, save_json_button.height + 555);
  save_json_button.mousePressed(saveData);

  //Project data title
  load_project_data_p = createP("Load project: ");
  load_project_data_p.style('color', 'white');
  load_project_data_p.style('font-size', '14px');
  load_project_data_p.position(fractal_p.x, load_project_data_p.height + 575);

  //Load JSON button
  load_json_button = createFileInput(loadData, false);
  load_json_button.position(fractal_p.x, load_json_button.height + 605);

  //"About" information
  about_p = createP("Project created in scope of PV097 course. Spring 2021.");
  about_p.size(170, AUTO);
  about_p.style('color', 'white');
  about_p.style('font-size', '14px');
  about_p.position(fractal_p.x, load_json_button.y + 27);

  author_p = createP("Ana Gloria Gálvez Mellado.");
  author_p.size(170, AUTO);
  author_p.style('color', 'white');
  author_p.style('font-size', '14px');
  author_p.position(fractal_p.x, load_json_button.y + 72);
}

// Save image
function saveImg() {
  originalDrawing.save(selectedFractal + '.png');
}

// Resizing canvas
// function windowResized() {
//   //resizeCanvas(windowWidth -10, windowHeight -10);
//   resized_width = (windowWidth - windowWidth * 0.01);
//   resized_height = (windowHeight - windowHeight * 0.01);
//
//   fractal_p.position(resized_width - 170, 50);
//   fractal_select.position(resized_width - 170, 90);
//
//   resolution_p.position(fractal_p.x, resolution_p.height + 410);
//
//   x_inp_p.position(fractal_p.x, x_inp_p.height + 440);
//   x_inp.position(x_inp_p.x + 45, x_inp_p.y + x_inp.height/2);
//
//   y_inp_p.position(fractal_p.x, y_inp_p.height + 470);
//   y_inp.position(y_inp_p.x + 45, y_inp_p.y + y_inp.height/2);
//
//   save_img_button.position(resized_width - save_img_button.width - 40, save_img_button.height + 525);
//
//   project_data_p.position(fractal_p.x, project_data_p.height + 575);
//   save_json_button.position(fractal_p.x, save_img_button.height + 610);
//   load_json_button.position(fractal_p.x + save_json_button.width + 10, save_img_button.height + 610);
//
//   about_p.position(fractal_p.x, resized_height - 75);
//   author_p.position(fractal_p.x, resized_height - 30);
//
//
//   //Setup depends on selected fractal
//   if(selectedFractal == "Tree"){
//     //--------------------------------------BRANCH TREE SETUP------------------------------------
//       tree_variations_p.position(resized_width - 170, 125);
//       tree_variations_select.position(resized_width - 170, 165);
//
//       angle_slider.position(resized_width - angle_slider.width - 40, angle_slider.height + 200);
//       angle_p.position(angle_slider.x, angle_slider.y - 35);
//       angle_value_p.position(angle_slider.x + angle_slider.width + 5, angle_slider.y - 15);
//
//       length_slider.position(resized_width - length_slider.width - 40, length_slider.height + 250);
//       length_p.position(length_slider.x, length_slider.y - 35);
//       length_value_p.position(length_slider.x + length_slider.width + 5, length_slider.y - 15);
//
//       stroke_slider.position(resized_width - stroke_slider.width - 40, stroke_slider.height + 300);
//       stroke_p.position(stroke_slider.x, stroke_slider.y - 35);
//       stroke_value_p.position(stroke_slider.x + stroke_slider.width + 5, stroke_slider.y - 15);
//
//       line_colorPicker.position(resized_width - stroke_slider.width - 40, line_colorPicker.height + 350);
//       line_color_p.position(length_slider.x, line_colorPicker.y - 35);
//
//     //---------------------------------------------------------------------------------------------
//   }
//   else if(selectedFractal =="Koch"){
//     //---------------------------------------------KOCH SETUP--------------------------------------
//        koch_variations_p.position(resized_width - 170, 125);
//        koch_variations_select.position(resized_width - 170, 165);
//
//        iterations_slider.position(resized_width - iterations_slider.width - 40, iterations_slider.height + 200);
//        iterations_p.position(iterations_slider.x, iterations_slider.y - 35);
//        iterations_value_p.position(iterations_slider.x + iterations_slider.width + 5, iterations_slider.y - 15);
//
//        koch_length_slider.position(resized_width - koch_length_slider.width - 40, koch_length_slider.height + 250);
//        koch_length_p.position(koch_length_slider.x, koch_length_slider.y - 35);
//        koch_length_value_p.position(koch_length_slider.x + koch_length_slider.width + 5, koch_length_slider.y - 15);
//
//        koch_stroke_slider.position(resized_width - koch_stroke_slider.width - 40, koch_stroke_slider.height + 300);
//        koch_stroke_p.position(koch_stroke_slider.x, koch_stroke_slider.y - 35);
//
//        koch_stroke_value_p.position(koch_stroke_slider.x + koch_stroke_slider.width + 5, koch_stroke_slider.y - 15);
//        koch_line_colorPicker.position(resized_width - koch_stroke_slider.width - 40, koch_line_colorPicker.height + 350);
//        koch_line_color_p.position(koch_length_slider.x, koch_line_colorPicker.y - 35);
//
//     //---------------------------------------------------------------------------------------------
//   }
//   else if (selectedFractal == "Barnsley fern"){
//     //-----------------------------------------BARNSLEY FERN SETUP---------------------------------
//         fern_variations_p.position(resized_width - 170, 125);
//         fern_variations_select.position(resized_width - 170, 165);
//
//         fern_line_colorPicker.position(fern_variations_select.x, line_colorPicker.height + 200);
//         fern_line_color_p.position(fern_variations_select.x, fern_line_colorPicker.y - 35);
//
//         fern_stop_button.position(fern_variations_select.x, fern_stop_button.height + 275);
//     //---------------------------------------------------------------------------------------------
//   }
// }



//---------------LOADING / SAVING JSON FUNCTION ---------------------//
function loadData(file){
  if (file.subtype === 'json') {
    loadedJSON = file.data;
  }
  else{
    return;
  }
  if(loadedJSON != null){
    selectedFractal = loadedJSON["selectedFractal"];
    removeElements();
    reSetUp();

    if(selectedFractal == "Tree"){
      selectedTreeType = loadedJSON["selectedTreeType"];
      tree_variations_select.selected(selectedTreeType);

      branch_length = loadedJSON["branch_length"];
      length_slider.value(branch_length);
      length_value_display = document.querySelector('#lengthValueP');
      length_value_display.textContent = length_slider.value();

      angle = loadedJSON["angle"];
      angle_slider.value(angle);
      angle_value_display = document.querySelector('#angleValueP');
      angle_value_display.textContent = angle_slider.value();

      stroke_weight = loadedJSON["stroke_weight"];
      stroke_slider.value(stroke_weight);
      stroke_value_display = document.querySelector('#strokeValueP');
      stroke_value_display.textContent = stroke_slider.value();

      line_colorPicker.value(loadedJSON["color"]);
    }
    else if(selectedFractal =="Koch"){
      selectedKochType = loadedJSON["selectedKochType"];
      koch_variations_select.selected(selectedKochType);

      iterations = loadedJSON["iterations"];
      iterations_slider.value(iterations);
      iterations_value_display = document.querySelector('#iterationsValueP');
      iterations_value_display.textContent = iterations_slider.value();

      koch_length = loadedJSON["koch_length"];
      koch_length_slider.value(koch_length);
      koch_length_value_display = document.querySelector('#kochLengthValueP');
      koch_length_value_display.textContent = koch_length_slider.value();

      koch_stroke_weight = loadedJSON["koch_stroke_weight"];
      koch_stroke_slider.value(koch_stroke_weight);
      koch_stroke_value_display = document.querySelector('#kochStrokeValueP');
      koch_stroke_value_display.textContent = koch_stroke_slider.value();

      koch_line_colorPicker.value(loadedJSON["color"]);
    }
    else if(selectedFractal == "Barnsley fern"){
      fernIterating = true;
      selectedFernType = loadedJSON["selectedFernType"];
      fern_variations_select.selected(selectedFernType);

      fern_line_colorPicker.value(loadedJSON["color"]);
    }
    else if(selectedFractal == "Sierpiński"){
      selectedSierpinskiType = loadedJSON["selectedSierpinskiType"];
      s_variations_select.selected(selectedSierpinskiType);

      s_iterations = loadedJSON["s_iterations"];
      s_iterations_slider.value(s_iterations);
      s_iterations_value_display = document.querySelector('#sIterationsValueP');
      s_iterations_value_display.textContent = s_iterations_slider.value();

      s_length = loadedJSON["s_length"];
      s_length_slider.value(s_length);
      s_length_value_display = document.querySelector('#sLengthValueP');
      s_length_value_display.textContent = s_length_slider.value();

      s_line_colorPicker.value(loadedJSON["color"]);
    }

    multiplyFactor = loadedJSON["multiplyFactor"];
    currentGraphicsX = loadedJSON["currentGraphicsX"];
    currentGraphicsY = loadedJSON["currentGraphicsY"];
    originalRatio = loadedJSON["originalRatio"];

    initializeDrawing();

    x_inp.value(str(ceil(currentGraphicsX)));
    y_inp.value(str(ceil(currentGraphicsY)));

    originalDrawing.resetMatrix();
    originalDrawing.background(0);
    originalDrawing.redraw();
    redraw();
  }
}

function saveData(){
  projectJSON = {};

  projectJSON.selectedFractal = selectedFractal;

  if(selectedFractal == "Tree"){

    projectJSON.selectedTreeType = selectedTreeType;
    projectJSON.branch_length = branch_length;
    projectJSON.angle = angle;
    projectJSON.stroke_weight = stroke_weight;
    projectJSON.color = line_colorPicker.value();
  }
  else if(selectedFractal =="Koch"){
    projectJSON.selectedKochType = selectedKochType;
    projectJSON.iterations = iterations;
    projectJSON.koch_length = koch_length;
    projectJSON.koch_stroke_weight = koch_stroke_weight;
    projectJSON.color = koch_line_colorPicker.value();
  }
  else if(selectedFractal == "Barnsley fern"){
    projectJSON.selectedFernType = selectedFernType;
    projectJSON.color = fern_line_colorPicker.value();
  }
  else if(selectedFractal == "Sierpiński"){
    projectJSON.selectedSierpinskiType = selectedSierpinskiType;
    projectJSON.s_iterations = s_iterations;
    projectJSON.s_length = s_length;
    projectJSON.color = s_line_colorPicker.value();
  }

  projectJSON.currentGraphicsX = currentGraphicsX;
  projectJSON.currentGraphicsY = currentGraphicsY;
  projectJSON.originalRatio = originalRatio;
  projectJSON.multiplyFactor = multiplyFactor;

  saveJSON(projectJSON, selectedFractal + '.json');
}


/////////////////////////////////////
//
// CLASS SEGMENT FOR KOCH SNOWFLAKE
//
/////////////////////////////////////
// Koch Snowflake
// Daniel Shiffman (Coding Challenge 129)
// https://thecodingtrain.com/CodingChallenges/129-koch-snowflake.html
// https://youtu.be/X8bXDKqMsXE

class Segment {
  constructor(a, b) {
    this.a = a.copy();
    this.b = b.copy();
  }

  generate() {
    let children = [];

    let v = p5.Vector.sub(this.b, this.a);
    v.div(3);

    // Segment 0
    let b1 = p5.Vector.add(this.a, v);
    children[0] = new Segment(this.a, b1);

    // Segment 3
    let a1 = p5.Vector.sub(this.b, v);
    children[3] = new Segment(a1, this.b);

    v.rotate(-PI / 3);
    let c = p5.Vector.add(b1, v);

    // Segment 2
    children[1] = new Segment(b1, c);
    // Segment 3
    children[2] = new Segment(c, a1);

    return children;
  }

  show() {
    //stroke(225);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }

  showOriginal(){ //For saving the drawing
    originalDrawing.line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

//Variation by me in order to implement Minkowski Sausage
class SausageSegment {
  constructor(a, b) {
    this.a = a.copy();
    this.b = b.copy();
  }

  generate() {
    let children = [];

    let v = p5.Vector.sub(this.b, this.a);
    v.div(4);

    // Segment 0
    let b1 = p5.Vector.add(this.a, v);
    children[0] = new SausageSegment(this.a, b1);

    // Segment 7
    let a1 = p5.Vector.sub(this.b, v);
    children[7] = new SausageSegment(a1, this.b);

    v.rotate(PI/2);
    let c1 = p5.Vector.add(b1, v);
    // Segment 1
    children[1] = new SausageSegment(b1, c1);

    v.rotate(-PI/2);
    let d1 = p5.Vector.add(c1, v);
    //Segment 2
    children[2] = new SausageSegment(c1, d1);

    v.rotate(-PI/2);
    let e1 = p5.Vector.add(d1, v);
    //Segment 3
    children[3] = new SausageSegment(d1, e1);

    let f1 = p5.Vector.add(e1, v);
    //Segment 4
    children[4] = new SausageSegment(e1, f1);

    v.rotate(PI/2);
    let g1 = p5.Vector.add(f1, v);
    //Segment 5
    children[5] = new SausageSegment(f1, g1);

    // Segment 6
    children[6] = new SausageSegment(g1, a1);
    return children;
  }

  show() {
    //stroke(225);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }

  showOriginal(){ //For saving the drawing
    originalDrawing.line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}
