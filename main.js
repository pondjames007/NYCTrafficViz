//Map Variables
var mapBoxKey = 'pk.eyJ1IjoicG9uZGphbWVzMDA3IiwiYSI6ImNqOW9wbDJ1NTFlaWcyd240b3IzbzBzMGcifQ.5kemTIDRSd4D7kIp5Oofww';
var mappa = new Mappa('Mapboxgl', mapBoxKey);
var myMap, canvas;
var buildingFlag = false;

var options = { //map options
  lat: 40.71427,
  lng: -73.89752,
  zoom: 11     ,
  //pitch: 45,
  //bearing: -17.6,
  style: 'mapbox://styles/mapbox/dark-v9'

}

var buildings = {
  'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': {
                'type': 'identity',
                'property': 'height'
            },
            'fill-extrusion-base': {
                'type': 'identity',
                'property': 'min_height'
            },
            'fill-extrusion-opacity': .6
        }
}

//Traffic Data Variables
var trafficRawData;
var trafficNum = 0;
var trafficData = [];
var startDraw = false;
var routePoints = [];
var routeAll = [];
var orig, dest;
var origVec;
var destVec;
var drawCnt = 0;
var trafficCycle = 0;

//MTA Data Variables
var mtaRoute;
var mtaCoordinate = [];
var mtaCount = 0;
var mtaRawStations;
var mtaStations = [];
var mtaRouteSets = [];
var stationDict = new mtaDict();
var routeDict = new mtaDict();

//MTA RealTime GTFS
const START = 1512439200; //POSIX TIME 20171204 21:00
const FINISH = 1512441060;//POSIX TIME 20171204 21:31
var fileName = [];
var gtfsRaw;
var rawTrains = [];
var runningTrains = [];
var trainDict = new mtaDict();
var trainLogo = [];
var sequentialTrains = [];
var trainNum = 0;
var trainCycle = 0;


//Time Display

//Choose Route Display
var chooseDisplay;
var chosen;

function preload(){

  for(var i = 0; i < 24; i++){
    trainLogo.push(loadImage("/signs/"+i+".png"));
  }

  var tmpTrains = [];
  for(var i = 0; i < 8; i++){
    for(var j = 0; j < 60; j++){
      if(i==3 && (j==43||j==44||j==56)){
        continue;
      }
      else{
        var file = "/20171204_2100/trainData"+i+"_"+j+".json";
        //console.log(file);
        var tmp = loadJSON(file);
        tmpTrains.push(tmp);
      }

    }

    rawTrains.push(tmpTrains);
    tmpTrains = [];
  }

  trafficRawData = loadJSON('trips.json');
  mtaRoute = loadStrings('shapes.txt');
  mtaRawStations = loadStrings('stops.txt');

}


function setup(){
  frameRate(30);

  canvas = createCanvas(window.innerWidth, window.innerHeight);
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas);

  trafficAna();
  mtaRouteAna();
  mtaStaAna();
  gtfsAna();

  myMap.onChange(drawVisited);

}

function draw(){
  clear(); //clear the background so the map is clearly seen in each frame

  if(startDraw == true){
    mtaRouteSets.forEach(function(element){
      element.forEach(function(e){
        if(e.parent == 1){
        //if(e.id == "W"){
        //if(e.tripId == "R..N93R"){
          e.drawRoute();
        }
      });
    });

     drawRoute();
     drawTrain();
  }

  // if(buildingFlag){
  //   //addBuildings();
  //   buildingFlag = false;
  // }
}


///////////////////////////////////////////////////////
function trafficAna(){


  for(i in trafficRawData){
    var tmp = new Traffic();
    tmp.init(trafficRawData[i].segments);
    trafficData.push(tmp);
  }
  trafficData.sort(function(a,b){
    return b.finTime - a.finTime;
  });
  console.log("LongestTime");
  trafficCycle = trafficData[0].finTime;
  console.log(trafficCycle);

  startDraw = true;
}

function drawRoute(){

  trafficData.forEach(function(e){
    if(e.time <= frameCount%1800 && e.finTime >= frameCount%1800){
      if(e.time <= 1800 && e.finTime <= 1800){
        e.drawRoute();
      }
    }
  });
}

function mtaRouteAna(){
  var routeCnt = 0;
  var coordCollection = [];
  for(var i = 1; i < mtaRoute.length; i++){
    if(/,0,$/.test(mtaRoute[i]) || i == mtaRoute.length - 1){
      //print(mtaRoute[i]);
      if(coordCollection.length > 0){
        var id;
        if(/\.{2}/.test(coordCollection[0]))
          id = coordCollection[0].charAt(0);
        else {
          id = coordCollection[0].substring(0,2);
        }

        var tripId = coordCollection[0].split(',')[0];

        var coords = [];
        coordCollection.forEach(function(element){
          var tmp = element.split(',');
          coords.push([parseFloat(tmp[1]), parseFloat(tmp[2])]);
        });

        if(mtaCoordinate.length > 0){
          if(id != mtaCoordinate[mtaCoordinate.length - 1].id){
            mtaCoordinate.sort(function(a, b){
              return b.route.length - a.route.length;
            });
            mtaCoordinate[0].parent = 1;
            // for(var i = 1; i < mtaCoordinate.length; i++){
            //   if(mtaCoordinate[i].route.length != mtaCoordinate[i-1].route.length)
            //     mtaCoordinate[i].parent = 1;
            // }
            mtaRouteSets.push(mtaCoordinate);

            routeCnt = 0;
            mtaCoordinate.forEach(function(e){
              routeDict.setItem(e.tripId, [mtaRouteSets.length-1, routeCnt]);
              routeCnt++;
            });

            mtaCoordinate = [];
          }
        }

        mtaCoordinate.push(new MtaShape(id, tripId, coords));


      }
      coordCollection = [];

    }

    coordCollection.push(mtaRoute[i]);
  }

  mtaCoordinate.sort(function(a, b){
    return b.route.length - a.route.length;
  });
  mtaCoordinate[0].parent = 1;

  mtaRouteSets.push(mtaCoordinate);

  routeCnt = 0;
  mtaCoordinate.forEach(function(e){
    routeDict.setItem(e.tripId, [mtaRouteSets.length-1, routeCnt]);
    routeCnt++;
  });


}


function mtaStaAna(){

  for(var i = 1; i < mtaRawStations.length; i++){
    var tmp = mtaRawStations[i].split(',');
    mtaStations.push(new MtaStation(tmp[0], tmp[2], [parseFloat(tmp[4]), parseFloat(tmp[5])], tmp[8]));
    mtaStations[i-1].makeJson();
    stationDict.setItem(tmp[0], [parseFloat(tmp[4]), parseFloat(tmp[5])]);
  }

}

function gtfsAna(){
  var travelDict = new mtaDict();
  var trainSet = [];
  var singleLine = [];
  for(var i = 0; i < rawTrains.length; i++){
    for(var j = 0; j < rawTrains[i].length; j++){
      //console.log(rawTrains[i][j]);
      rawTrains[i][j].entity.forEach(function(travel){
        if(travel.vehicle != null && travel.vehicle.trip.nyct_trip_descriptor.is_assigned == true && travel.vehicle.timestamp >= START){
          var idx = rawTrains[i][j].entity.indexOf(travel) - 1;
          if(j == 0){
            var train = new Train();
            train.init(travel.vehicle, rawTrains[i][j].entity[idx].trip_update.stop_time_update[0].stop_id, rawTrains[i][j].header.timestamp);
            singleLine.push(train);

            travelDict.setItem(train.tripId, singleLine.length-1);
          }
          else{
            var tripIdIdx = travelDict.getItem(travel.vehicle.trip.trip_id);
            if(tripIdIdx == undefined){
              var newTrain = new Train();
              newTrain.init(travel.vehicle,rawTrains[i][j].entity[idx].trip_update.stop_time_update[0].stop_id, rawTrains[i][j].header.timestamp);
              singleLine.push(newTrain);
              travelDict.setItem(newTrain.tripId, singleLine.length-1);
            }
            else{
              //console.log(rawTrains[i][j].entity[idx].trip_update.stop_time_update);
              singleLine[tripIdIdx].update(travel.vehicle, rawTrains[i][j].entity[idx].trip_update.stop_time_update[0].stop_id);
            }
          }
        }
        else if(travel.alert != null){
          //console.log(travel.alert.informed_entity.length);
        }
      });
    }

    runningTrains.push(singleLine);
    singleLine = [];
    travelDict.clear();
  }

  //console.log(runningTrains);

  runningTrains.forEach(function(element){
    element.forEach(function(e){
      //console.log(e.routeId);
      e.createRoute(stationDict, routeDict, mtaRouteSets);
      sequentialTrains.push(e);
    });
  });


  sequentialTrains.sort(function(a,b){
    return a.timeStamp[0] - b.timeStamp[0];
  });
  //console.log(sequentialTrains);
   console.log("train FirstTime: ")
  // var c=0;
  sequentialTrains.forEach(function(e){
    //if(e.timeStamp[0] > 1512439200)
      console.log(e.tripId+ " "+e.timeStamp[0]);
    //  c++;
  });
  // console.log(c);

}


function drawTrain(){
  var logoIdx = {'1':0, '2':1, '3':2, '4':3, '5':4, '6':5, '7':6, 'A':7, 'B':8, 'C':9, 'D':10, 'E':11, 'F':12,
   'FS':14, 'G':13, 'GS':14, 'H':14, 'J':15, 'L':16, 'M':17, 'N':18, 'Q':19, 'R':20, 'S':21, 'W':22, 'Z':23};

  sequentialTrains.forEach(function(e){
    if(e.timeStamp[0]-START <= frameCount%1800 && e.timeStamp[e.timeStamp.length-1]-START >= frameCount%1800){
      if(e.timeStamp[0] >= START){
        e.drawRoute(trainLogo[logoIdx[e.routeId]]);
      }
    }
  });
}

function drawVisited(){
  mtaRouteSets.forEach(function(element){
    element.forEach(function(e){
      if(e.parent == 1){
      //if(e.id == "FS" || e.id == "SI"){
      //if(e.tripId == ""){
        e.drawRoute();
      }
    });
  });

}


function addBuildings(){
  var zoom = myMap.map.getZoom();
  //console.log(zoom);
  var layers = myMap.map.getStyle().layers.reverse();
  var labelLayerIdx = layers.findIndex(function (layer) {
        return layer.type !== 'symbol';
    });
  var labelLayerId = labelLayerIdx !== -1 ? layers[labelLayerIdx].id : undefined;

  myMap.map.addLayer(buildings, labelLayerId);
  //buildingFlag = 1;
}


function addMTAstations(){
  var mtaImg = myMap.map.loadImage('ic_subway_station.png', (err,
    image)=> {
      myMap.map.addImage('station', image);
    });
  var stations = {
    "id": "points",
    "type": "symbol",
    "source": {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    },
    "layout": {
        "icon-image": "station",
        "text-field": "{title}",
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-size": 12,
        "text-offset": [0, 0.6],
        "text-anchor": "top"
    },
    "paint": {
        "text-color": "#CCCCCC"
    }
  };
  mtaStations.forEach(function(e){
    if(e.parent == 1)
      stations.source.data.features.push(e.json);
  });
  myMap.map.addLayer(stations);
}

function keyReleased(){
  addMTAstations();
  buildingFlag = true;
}


function mtaDict(obj){
    this.length = 0;
    this.items = {};
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            this.items[p] = obj[p];
            this.length++;
        }
    }

    this.setItem = function(key, value)
    {
        var previous = undefined;
        if (this.hasItem(key)) {
            previous = this.items[key];
        }
        else {
            this.length++;
        }
        this.items[key] = value;
        return previous;
    }

    this.getItem = function(key) {
        return this.hasItem(key) ? this.items[key] : undefined;
    }

    this.hasItem = function(key)
    {
        return this.items.hasOwnProperty(key);
    }

    this.removeItem = function(key)
    {
        if (this.hasItem(key)) {
            previous = this.items[key];
            this.length--;
            delete this.items[key];
            return previous;
        }
        else {
            return undefined;
        }
    }

    this.keys = function()
    {
        var keys = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                keys.push(k);
            }
        }
        return keys;
    }

    this.values = function()
    {
        var values = [];
        for (var k in this.items) {
            if (this.hasItem(k)) {
                values.push(this.items[k]);
            }
        }
        return values;
    }

    this.each = function(fn) {
        for (var k in this.items) {
            if (this.hasItem(k)) {
                fn(k, this.items[k]);
            }
        }
    }

    this.clear = function()
    {
        this.items = {}
        this.length = 0;
    }
}
