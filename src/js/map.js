/* eslint-disable no-undef */
variable.map = L.map("map", {
  maxBounds          : [[60, 50], [10, 180]],
  preferCanvas       : true,
  attributionControl : false,
  zoomSnap           : 0.25,
  zoomDelta          : 0.25,
  doubleClickZoom    : false,
  zoomControl        : false,
  minZoom            : 5.5,
  maxZoom            : 10,
});

variable.map.createPane("circlePane");
variable.map.getPane("circlePane").style.zIndex = 10;

variable.map.createPane("detection");
variable.map.getPane("detection").style.zIndex = 2000;

for (const map_name of constant.MAP_LIST)
  L.geoJson.vt(require(path.join(__dirname, "../resource/map", `${map_name}.json`)), {
    edgeBufferTiles : 2,
    minZoom         : 5.5,
    maxZoom         : 10,
    style           : {
      weight      : 0.6,
      color       : (map_name == "TW") ? "white" : "gray",
      fillColor   : "#3F4045",
      fillOpacity : 0.5,
    },
  }).addTo(variable.map);

variable.map.setView([23.6, 120.4], 7.8);

// L.marker([24.38, 121.93], {
//   icon: L.icon({
//     iconUrl   : "../resource/image/cross.png",
//     iconSize  : [40, 40 ],
//     className : "flash",
//   }), zIndexOffset: 2000,
// })
//   .addTo(variable.map);

// L.marker([24.39, 121.93], {
//   icon: L.divIcon({
//     className : "dot pga_-3",
//     html      : "<span></span>",
//     iconSize  : [40, 40],
//   }), zIndexOffset: 2000,
// })
//   .addTo(variable.map);

variable.icon_size = (Number(variable.map.getZoom().toFixed(1)) - 7.8) * 2;

function updateIconSize() {
  variable.icon_size = (Number(variable.map.getZoom().toFixed(1)) - 7.8) * 2;

  for (const key in variable.eew_list) {
    const oldMarker = variable.eew_list[key].layer.epicenterIcon;
    const newIconSize = [40 + variable.icon_size * 3, 40 + variable.icon_size * 3];

    const icon = variable.eew_list[key].layer.epicenterIcon.options.icon;
    icon.options.iconSize = [40 + variable.icon_size * 3, 40 + variable.icon_size * 3];
    oldMarker.setIcon(icon);

    if (oldMarker.getTooltip())
      oldMarker.bindTooltip(oldMarker.getTooltip()._content, {
        opacity   : 1,
        permanent : true,
        direction : "right",
        offset    : [newIconSize[0] / 2, 0],
        className : "progress-tooltip",
      });

    if (variable.eew_list[key].cancel) {
      const iconElement = oldMarker.getElement();
      if (iconElement) {
        iconElement.style.opacity = "0.5";
        iconElement.className = "cancel";
        iconElement.style.visibility = "visible";
      }
    }
  }
}

variable.map.on("zoomend", updateIconSize);

variable.focus.bounds = {
  report    : L.latLngBounds(),
  intensity : L.latLngBounds(),
  tsunami   : L.latLngBounds(),
  eew       : L.latLngBounds(),
  rts       : L.latLngBounds(),
};

let intensity_focus = 0;
let map_focus = 0;

setInterval(() => {
  try {
    if (variable.intensity_time && Date.now() - variable.intensity_time > 300000) {
      variable.intensity_time = 0;
      if (variable.intensity_geojson) variable.intensity_geojson.remove();
    }
    if (map_focus && !variable.focus.status.intensity && !variable.focus.status.rts && !variable.focus.status.eew) {
      map_focus = 0;
      variable.map.setView([23.6, 120.4], 7.8);
      return;
    }
    if (variable.focus.status.intensity) {
      if (Date.now() - variable.focus.status.intensity > 10000) {
        variable.focus.status.intensity = 0;
        intensity_focus = 0;
      } else if (!intensity_focus) {
        intensity_focus = 1;
        const zoom_now = variable.map.getZoom();
        const center_now = variable.map.getCenter();
        const center = variable.focus.bounds.intensity.getCenter();
        let zoom = variable.map.getBoundsZoom(variable.focus.bounds.intensity) - 0.7;
        if (Math.abs(zoom - zoom_now) < 0.2) zoom = zoom_now;
        const set_center = Math.sqrt(pow((center.lat - center_now.lat) * 111) + pow((center.lng - center_now.lng) * 101));
        variable.map.setView((set_center > 10) ? center : center_now, zoom);
        map_focus = 1;
      }
    } else {
      if (variable.focus.status.rts) {
        variable.focus.status.rts = 0;
        const zoom_now = variable.map.getZoom();
        const center_now = variable.map.getCenter();
        const center = variable.focus.bounds.rts.getCenter();
        let zoom = variable.map.getBoundsZoom(variable.focus.bounds.rts) - 0.7;
        if (Math.abs(zoom - zoom_now) < 0.2) zoom = zoom_now;
        const set_center = Math.sqrt(pow((center.lat - center_now.lat) * 111) + pow((center.lng - center_now.lng) * 101));
        variable.map.setView((set_center > 10) ? center : center_now, zoom);
        map_focus = 1;
      }
      if (variable.focus.status.eew) {
        variable.focus.status.eew = 0;
        const zoom_now = variable.map.getZoom();
        const center_now = variable.map.getCenter();
        const center = variable.focus.bounds.eew.getCenter();
        let zoom = variable.map.getBoundsZoom(variable.focus.bounds.eew) - 0.7;
        if (Math.abs(zoom - zoom_now) < 0.2) zoom = zoom_now;
        if (zoom < 6.5) zoom = 6.5;
        const set_center = Math.sqrt(pow((center.lat - center_now.lat) * 111) + pow((center.lng - center_now.lng) * 101));
        variable.map.setView((set_center > 10) ? center : center_now, zoom);
        map_focus = 1;
      }
    }
  } catch (err) {
    console.log(err);
  }
}, 100);