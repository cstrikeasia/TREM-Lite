/* eslint-disable no-undef */
// setInterval(() => show_tsunami(), 3000);

function show_tsunami(data) {
  variable.tsunami_geojson = L.geoJson.vt(require(path.join(__dirname, "../resource/map", "tsunami.json")), {
    minZoom : 4,
    maxZoom : 12,
    buffer  : 256,
    zIndex  : 5,
    style   : (args) => {
      const name = args.COUNTYNAME + " " + args.TOWNNAME;
      return {
        color       : "red",
        weight      : 5,
        fillColor   : "transparent",
        fillOpacity : 0,
      };
    },
  }).addTo(variable.map);
  setTimeout(() => variable.tsunami_geojson.remove(), 2000);
}