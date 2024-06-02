/* eslint-disable no-undef */
let replay_timer;
if (variable.replay_list.length)
  replay_timer = setInterval(() => read_replay_file(), 1000);

ntp();

setInterval(() => {
  // if (variable.replay_list.length) return;
  realtime_rts();
  realtime_eew();
}, 1000);

setInterval(() => {
  report();
}, 10000);

setInterval(() => {
  ntp();
}, 60000);


function read_replay_file() {
  if (!variable.replay_list.length) {
    variable.replay = 0;
    if (replay_timer) clearInterval(replay_timer);
    return;
  }

  const name = variable.replay_list.shift();

  // eslint-disable-next-line no-constant-condition
  if (1 == 2) {
    const data = JSON.parse(fs.readFileSync(path.join(app.getPath("userData"), `replay/${name}`)).toString());

    const alert = Object.keys(data.rts.box).length;
    show_rts_dot(data.rts, alert);
    if (alert) show_rts_box(data.rts.box);

    for (const eew of data.eew) {
      eew.time = data.rts.time;
      eew.timestamp = now();
      // eew.eq.mag = 1;
      show_eew(eew);
    }

    variable.replay = data.rts.time;

    console.log(name);
  }
}

async function realtime_rts() {
  const res = await fetchData(`${LB_url()}v1/trem/rts`);
  const data = await res.json();
  // console.log(data);

  const alert = Object.keys(data.box).length;
  show_rts_dot(data, alert);
  if (alert) show_rts_box(data.box);

  variable.last_get_data_time = now();
  document.getElementById("connect").style.color = "goldenrod";
}

async function realtime_eew() {
  const res = await fetchData(`${LB_url()}v1/eq/eew`);
  const data = await res.json();
  for (const eew of data) {
    eew.timestamp = now();
    show_eew(eew);
  }
}

async function ntp() {
  const res = await fetchData(`https://lb-${Math.ceil(Math.random() * 4)}.exptech.com.tw/ntp`);
  const data = await res.text();
  variable.time_offset = Number(data) - Date.now();
}

async function report() {
  const ReportList = document.querySelector(".report-list-items");
  const res = await fetchData(`${API_url()}v2/eq/report?limit=20`);
  const data = await res.json();
  ReportList.innerHTML = "";

  const FirstItem = data[0];
  const First = document.createElement("div");
  First.classList.add("report-list-item-index", "first");

  const IntWrapper = document.createElement("div");
  IntWrapper.classList.add("report-list-item-int-wrapper");

  const Int = document.createElement("div");
  Int.classList.add("report-list-item-int", `intensity-${FirstItem.int}`);
  Int.textContent = FirstItem.int;

  const IntTitle = document.createElement("div");
  IntTitle.classList.add("report-list-item-int-title");
  IntTitle.textContent = "觀測最大震度";

  IntWrapper.appendChild(Int);
  IntWrapper.appendChild(IntTitle);
  First.appendChild(IntWrapper);

  let InfoWrapper = document.createElement("div");
  InfoWrapper.classList.add("report-list-item-info-wrapper");

  const Info = document.createElement("div");
  Info.classList.add("report-list-item-info");

  const Title = document.createElement("div");
  const TitleText = FirstItem.mag > 4.0 ? "顯著有感地震" : "小區域有感地震";
  Title.classList.add("report-list-item-title");
  Title.textContent = TitleText;

  const Location = document.createElement("div");
  Location.classList.add("report-list-item-location");
  Location.textContent = LocalReplace(FirstItem.loc);

  const Time = document.createElement("div");
  Time.classList.add("report-list-item-time");
  Time.textContent = formatTime(FirstItem.time);

  Info.appendChild(Title);
  Info.appendChild(Location);
  Info.appendChild(Time);

  let MagDepthWrapper = document.createElement("div");
  MagDepthWrapper.classList.add("report-list-item-mag-depth");

  const Mag = document.createElement("div");
  Mag.classList.add("report-list-item-mag");
  Mag.dataset.backgroundText = "規模";
  Mag.innerHTML = `<div class="report-list-item-magnitude">${FirstItem.mag}</div>`;

  const KM = document.createElement("div");
  KM.classList.add("report-list-item-km");
  KM.dataset.backgroundText = "深度";
  KM.innerHTML = `<div class="km">${FirstItem.depth}</div>`;

  MagDepthWrapper.appendChild(Mag);
  MagDepthWrapper.appendChild(KM);

  InfoWrapper.appendChild(Info);
  InfoWrapper.appendChild(MagDepthWrapper);

  First.appendChild(InfoWrapper);

  ReportList.appendChild(First);

  // 非First
  for (let i = 1; i < data.length; i++) {
    const item = data[i];
    const Element = document.createElement("div");
    Element.classList.add("report-list-item-index");

    const IntItem = document.createElement("div");
    IntItem.classList.add("report-list-item-int", `intensity-${item.int}`);
    IntItem.textContent = item.int;

    InfoWrapper = document.createElement("div");
    InfoWrapper.classList.add("report-list-item-info-wrapper");

    const InfoItem = document.createElement("div");
    InfoItem.classList.add("report-list-item-info");

    const LocationItem = document.createElement("div");
    LocationItem.classList.add("report-list-item-location");
    LocationItem.textContent = LocalReplace(item.loc);

    const TimeItem = document.createElement("div");
    TimeItem.classList.add("report-list-item-time");
    TimeItem.textContent = formatTime(item.time);

    const MagItem = document.createElement("div");
    MagItem.classList.add("report-list-item-mag");
    MagItem.textContent = `M ${item.mag < 10 ? item.mag.toFixed(1) : item.mag}`;

    InfoItem.appendChild(LocationItem);
    InfoItem.appendChild(TimeItem);

    MagDepthWrapper = document.createElement("div");
    MagDepthWrapper.classList.add("report-list-item-mag-depth");

    const MagDepth = document.createElement("div");
    MagDepth.classList.add("report-list-item-mag", "report-list-item-mag-depth");
    MagDepth.dataset.backgroundText = "規模";
    MagDepth.innerHTML = `<div class="report-list-item-magnitude">M ${item.mag < 10 ? item.mag.toFixed(1) : item.mag}</div>`;

    MagDepthWrapper.appendChild(MagDepth);
    InfoWrapper.appendChild(InfoItem);
    InfoWrapper.appendChild(MagDepthWrapper);

    Element.appendChild(IntItem);
    Element.appendChild(InfoWrapper);

    ReportList.appendChild(Element);
  }
}
report();

function LocalReplace(loc) {
  const matches = loc.match(/\(([^)]+)\)/);
  if (matches) {
    let text = matches[1];
    text = text.replace("位於", "");
    return text.trim();
  }
  return "";
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}