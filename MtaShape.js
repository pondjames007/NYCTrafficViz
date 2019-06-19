class MtaShape{
  constructor(id, tripId, coord){
    this.id = id;
    this.tripId = tripId;
    this.route = coord;
    this.parent = 0;
    this.color = "#FFFFFF";
    this.draw = false;
  }

  decideColor(){
    var opacity = 90;
    switch(this.id){
      case "1":
      case "2":
      case "3":
        this.color = color(238,53,46,opacity);
        break;
      case "4":
      case "5":
      case "6":
        this.color = color(0,147,60,opacity);
        break;
      case "7":
        this.color = color(185,51,173,opacity);
        break;
      case "A":
      case "C":
      case "E":
        this.color = color(0,57,166,opacity);
        break;
      case "B":
      case "D":
      case "F":
      case "M":
        this.color = color(255,99,25,opacity);
        break;
      case "G":
        this.color = color(108,190,69,opacity);
        break;
      case "J":
      case "Z":
        this.color = color(153,102,51,opacity);
        break;
      case "L":
        this.color = color(167,169,172,opacity);
        break;
      case "N":
      case "Q":
      case "R":
      case "W":
        this.color = color(252,204,10,opacity);
        break;
      case "GS":
      case "FS":
      case "H":
        this.color = color(128,129,131,opacity);
        break;
      default:
        this.color = color(255,255,255,opacity);
    }
  }

  drawRoute(){
    //console.log(this.parent);
    //var color;
    this.decideColor();
    //console.log(this.id);
    stroke(this.color);
    strokeWeight(3);

    var c = 0;
    noFill();
    beginShape()
      for(i in this.route){
        var pixel = myMap.latLngToPixel(this.route[i][0], this.route[i][1]);

        if (c%10 == 0 || c == this.route.length-1) {
        vertex(pixel.x, pixel.y);
        }
        c++;
      }
    endShape()
  }


}
