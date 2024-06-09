/* eslint-disable no-undef */

show_intensity({
  "type"   : "intensity",
  "author" : "trem",
  "id"     : 1712102295000,
  "alert"  : 0,
  "serial" : 1,
  "final"  : 0,
  "area"   : {
    "2": [
      962,
      981,
      978,
    ],
    "4": [
      974,
      976,
      977,
      979,
    ],
    "5": [
      975,
    ],
    "6": [
      970,
      971,
      973,
    ],
  },
  "max": 6,
});

function show_intensity(data) {
  variable.focus.bounds.intensity = L.latLngBounds();
  const intensity_list = {};
  for (const int of Object.keys(data.area))
    for (const code of data.area[int]) {
      const loc = region_code_to_string(constant.REGION, code);
      intensity_list[`${loc.city} ${loc.town}`] = int;
      variable.focus.bounds.intensity.extend([loc.lat, loc.lon]);
    }
  variable.focus.status.intensity = Date.now();
  variable.intensity_time = Date.now();
  if (variable.intensity_geojson) variable.intensity_geojson.remove();
  variable.intensity_geojson = L.geoJson.vt(require(path.join(__dirname, "../resource/map", "town.json")), {
    minZoom : 4,
    maxZoom : 12,
    buffer  : 256,
    zIndex  : 5,
    style   : (args) => {
      const name = args.COUNTYNAME + " " + args.TOWNNAME;
      const intensity = intensity_list[name];
      const color = (!intensity) ? "#3F4045" : int_to_color(intensity);
      return {
        color       : (intensity == 4 || intensity == 5 || intensity == 6) ? "grey" : "white",
        weight      : 0.4,
        fillColor   : color,
        fillOpacity : 1,
      };
    },
  }).addTo(variable.map);
}