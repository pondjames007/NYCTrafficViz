class Traffic{
  constructor(){
    this.points = [];
    this.time = 0;
    this.coordinateCount = 0;
    this.drawProgressCount = 0;
    this.delta = 0;
    this.visitedPoints = [];
    this.drawPoints = [];
    this.finTime = 0;;
  }

  init(segments){
    this.points = segments;
    this.time = segments[0][2];
    this.finTime = segments[segments.length - 1][2];
  }

  drawRoute(){
    const E_RADIUS = 6378.137;
    var orig, dest;
    var origVec, destVec;

    if(this.coordinateCount < this.points.length - 2){
      if(this.delta >= 1){
        this.drawProgressCount = 0;
        this.coordinateCount++;
        //this.visitedPoints = [];
      }
      //console.log(this.points.length+"   "+this.coordinateCount);
      orig = myMap.latLngToPixel(this.points[this.coordinateCount][1], this.points[this.coordinateCount][0]);
      dest = myMap.latLngToPixel(this.points[this.coordinateCount+1][1], this.points[this.coordinateCount+1][0]);
      origVec = createVector(orig.x, orig.y);
      destVec = createVector(dest.x, dest.y);

      var timeEllapse = round(this.points[this.coordinateCount+1][2] - this.points[this.coordinateCount][2]);
      //timeEllapse = round(timeEllapse*5);

      var radOrigVec = [this.points[this.coordinateCount][1]*PI/180, this.points[this.coordinateCount][0]*PI/180];
      var radDestVec = [this.points[this.coordinateCount+1][1]*PI/180, this.points[this.coordinateCount+1][0]*PI/180];
      var a = radOrigVec[0] - radDestVec[0];
      var b = radOrigVec[1] - radDestVec[1];
      var dist = 2*asin(sqrt(pow(sin(a/2),2) + cos(radOrigVec[0])*cos(radOrigVec[1])*pow(sin(b/2),2)));
      dist *= E_RADIUS;
      dist = round(dist*10000)/10000;

      var speed = dist/(timeEllapse/3600);
      //console.log(dist+ "   "+ timeEllapse + "  "+speed);
      var routePoint  = origVec.lerp(destVec, this.drawProgressCount/timeEllapse);

      noStroke();
      //console.log(speed);
      var colorR = 0;
      var colorG = 0;

      if(speed <= 40){
        colorR = 255;
        colorG = map(speed, 0, 40, 0, 255);
      }
      else{
        colorR = map(speed, 40, 80, 255, 0);
        colorG = 255;
      }

      fill(colorR, colorG, 0);
      ellipse(routePoint.x, routePoint.y, 5,5);

      this.drawProgressCount++;
      this.delta = this.drawProgressCount/timeEllapse;

    }
    else{
      this.coordinateCount = 0;
      this.drawPoints = [];
    }

    //this.drawVisited();

  }


  drawVisited(){

    var traveledPoint;
    var nextPoint;
    var newPoint = [];


    traveledPoint = myMap.latLngToPixel(this.points[this.coordinateCount][1], this.points[this.coordinateCount][0]);
    nextPoint = myMap.latLngToPixel(this.points[this.coordinateCount+1][1], this.points[this.coordinateCount+1][0]);
    var nowVec = createVector(traveledPoint.x, traveledPoint.y);
    var nextVec = createVector(nextPoint.x, nextPoint.y);
    var timeEllapse = round(this.points[this.coordinateCount+1][2] - this.points[this.coordinateCount][2]);
    //timeEllapse = round(timeEllapse*5);

    newPoint.push(nowVec.lerp(nextVec, (this.drawProgressCount-1)/timeEllapse));



    stroke(255,0,0);
    strokeWeight(2);

    noFill();



  }
}
