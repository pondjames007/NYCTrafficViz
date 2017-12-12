class MtaStation{
  constructor(id, name, coord, parent){
    this.id = id;
    this.name = name;
    this.coord = coord;
    this.parent = parent;
    this.json = {};
  }

  drawStation(){
    // console.log(this.name);
    // console.log(this.coord);

    fill(186,85,211);
    noStroke();
    var pixel = myMap.latLngToPixel(this.coord[0], this.coord[1]);
    ellipse(pixel.x, pixel.y, 5,5);
  }

  makeJson(){
    this.json = {
      "type": "Feature",
      "geometry": {
          "type": "Point",
          "coordinates": [this.coord[1], this.coord[0]]
      },
      "properties": {
          "title": this.name,
          "icon": "monument"
      }
      
    };
  }
}
