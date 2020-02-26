var video;
var button;
var snapshot = [];

function setup() {

  createCanvas(320, 400);
  background(100);
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.position(0, 0);

  buttonSnap = createButton('SNAP');
  buttonSnap.position(100, 300);
  buttonSnap.mousePressed(takesnap);

  buttonClear = createButton('CLEAR');
  buttonClear.position(100, 340 );
  buttonClear.mousePressed(startCamera);

}

function startCamera() {
  video.show();
}

function takesnap() {
  snapshot = video.get();
  print(snapshot);
  video.hide();
}

function draw() {
  // background(220);

  if (snapshot.width > 0) { //snapshot seen as object instead of array, so use object charatersitic to check
    //print(snapshot.length);
    image(snapshot, 0, 0, 320, 240);
  }
}
