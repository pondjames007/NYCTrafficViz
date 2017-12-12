class Train{
  constructor(){
    this.globalTime = 0;
    this.tripId = "";
    this.routeId = "";
    this.currentStatus = [];
    this.stopId = [];
    this.timeStamp = [];
    this.points = [];
    this.dontDraw = false;
    this.coordinateCount = 0;
    this.delta = 0;
    this.drawProgressCount = 0;
  }

  init(vehicle, stopId, globalTime){
    this.globalTime = globalTime;
    this.tripId = vehicle.trip.trip_id;
    this.routeId = vehicle.trip.route_id;
    this.currentStatus.push(vehicle.current_status);
    this.stopId.push(stopId);
    this.timeStamp.push(vehicle.timestamp);
  }

  update(vehicle, stopId){
    this.currentStatus.push(vehicle.current_status);
    this.stopId.push(stopId);
    this.timeStamp.push(vehicle.timestamp);
  }


  createRoute(stationDict, routeDict, mtaRouteSets){
    //Missing train W and Z//
    //S in routeId == SI in tripId
    var routeIdx = {'1':0, '2':1, '3':2, '4':3, '5':4, '6':5, '7':6, 'A':7, 'B':8, 'C':9, 'D':10, 'E':11, 'F':12,
     'FS':13, 'G':14, 'GS':15, 'H':16, 'J':17, 'L':18, 'M':19, 'N':20, 'Q':21, 'R':22, 'S':23, 'W':24, 'Z':25};
    var tripIdx = routeDict.getItem(this.tripId.split('_')[1]);
    var direction = direction = this.tripId.split('_')[1].charAt(3);
    var stopIdx = -1;

    if(tripIdx == undefined){

      //console.log(this.routeId +" : "+ direction);
      if(this.routeId == "W"){
        var tmpId = "N";
        tripIdx = [routeIdx[tmpId], 0];
      }
      else if(this.routeId == "Z"){
        var tmpId = "J";
        tripIdx = [routeIdx[tmpId], 0];
      }
      else if(this.routeId == "5X"){
        var tmpId = "5";
        tripIdx = [routeIdx[tmpId], 0];
      }
      else if(this.routeId == "6X"){
        var tmpId = "6";
        tripIdx = [routeIdx[tmpId], 0];
      }
      else if(this.routeId == "7X"){
        var tmpId = "7";
        tripIdx = [routeIdx[tmpId], 0];
      }
      else{
        tripIdx = [routeIdx[this.routeId], 0];
      }


    }
    //console.log(this.routeId);
    //console.log("tripIdx:   "+ tripIdx);
    for(var i = 0; i < this.stopId.length; i++){
      var stationCoord = stationDict.getItem(this.stopId[i]);

      if(stationCoord == undefined){
        this.dontDraw = true;
        break;
      }
      //console.log(this.stopId[i] + "   :   " +stationCoord);
      //console.log(mtaRouteSets[tripIdx[0]][tripIdx[1]].route);
      mtaRouteSets[tripIdx[0]][tripIdx[1]].route.forEach(function(e){
        if(e[0] == stationCoord[0] && e[1] == stationCoord[1]){
          //console.log("match");
          stopIdx = mtaRouteSets[tripIdx[0]][tripIdx[1]].route.indexOf(e);
          //console.log(stopIdx);
        }
      });

      if(stopIdx < 0){
        this.dontDraw = true;
        break;
      }


      if(this.currentStatus[i] == 0){
        if(direction == mtaRouteSets[tripIdx[0]][tripIdx[1]].tripId.charAt(3)){
          //console.log("arriving same Direction");
          if(stopIdx == 0){
            this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx]);
            this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx]);
          }
          else{
            this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx-1]);
            this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx]);
          }

        }
        else{
          //console.log("arriving different Direction");
          if(stopIdx == mtaRouteSets[tripIdx[0]][tripIdx[1]].route.length-1){
            this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx]);
            this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx]);
          }
          else{
            this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx+1]);
            this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx]);
          }

        }


      }
      else if(this.currentStatus[i] == 1){
        //console.log("stop");
        this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx]);
        this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx]);
      }
      else{
        if(direction == mtaRouteSets[tripIdx[0]][tripIdx[1]].tripId.charAt(3)){
          //console.log("leaving same Direction");
          if(stopIdx == mtaRouteSets[tripIdx[0]][tripIdx[1]].route.length-1){
            this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx]);
            this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx]);
          }
          else{
            this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx]);
            this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx+1]);
          }
        }
        else{
          //console.log("leaving different Direction");
          if(stopIdx == 0){
            this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx]);
            this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx]);
          }
          else{
            this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx]);
            this.points.push(mtaRouteSets[tripIdx[0]][tripIdx[1]].route[stopIdx-1]);
          }
        }
      }

    }
    // console.log(this.tripId);
    // console.log(stopIdx+"    "+ mtaRouteSets[tripIdx[0]][tripIdx[1]].route.length);
    // console.log(this.points);
    var tmpTime = [];
    var rawLength = this.timeStamp.length;
    tmpTime.push(this.timeStamp[0]);
    for(var i = 1; i < rawLength; i++){
      var insertTime = 0;
      if(this.currentStatus[i-1] == 0){
        insertTime = this.timeStamp[i-1] + (this.timeStamp[i] - this.timeStamp[i-1])/3;
      }
      else if(this.currentStatus[i-1] == 1){
        insertTime = this.timeStamp[i-1] + (this.timeStamp[i] - this.timeStamp[i-1])/2;
      }
      else{
        insertTime = this.timeStamp[i-1] + (this.timeStamp[i] - this.timeStamp[i-1])*2/3;
      }
      tmpTime.push(insertTime);
      tmpTime.push(this.timeStamp[i]);
    }


    insertTime = this.timeStamp[rawLength-1] + 30;
    tmpTime.push(insertTime);

    this.timeStamp = tmpTime;

    //console.log(this.timeStamp);

  }

  drawRoute(trainLogo){
    if(this.dontDraw == false){
        var orig, dest;
        var origVec, destVec;

        if(this.coordinateCount < this.points.length - 2){
          if(this.delta >= 1){
            this.drawProgressCount = 0;
            this.coordinateCount++;
          }

          orig = myMap.latLngToPixel(this.points[this.coordinateCount][0], this.points[this.coordinateCount][1]);
          dest = myMap.latLngToPixel(this.points[this.coordinateCount+1][0], this.points[this.coordinateCount+1][1]);
          origVec = createVector(orig.x, orig.y);
          destVec = createVector(dest.x, dest.y);

          var timeEllapse = ceil(this.timeStamp[this.coordinateCount+1] - this.timeStamp[this.coordinateCount]);
          if(timeEllapse == 0)
            timeEllapse = 1;
          //console.log(timeEllapse);
          //timeEllapse *=5;

          var routePoint = origVec.lerp(destVec, this.drawProgressCount/timeEllapse);

          noStroke();
          fill(0,255,255);

          try{
          image(trainLogo, routePoint.x-7, routePoint.y-7, 14,14);
          }
          catch(err){}
          this.drawProgressCount++;
          this.delta = this.drawProgressCount/timeEllapse;
          //console.log(this.drawProgressCount);
        }
        else{
          this.coordinateCount = 0;
          this.drawPoints = [];
        }

      }
    }
}
