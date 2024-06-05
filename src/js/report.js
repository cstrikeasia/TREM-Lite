const ReportItem = querySelector(".report-list-items");
const ReportBoxWrapper = querySelector(".report-box-wrapper");
const ReportTitle = querySelector("#report-title");
const ReportSubTitle = querySelector("#report-subtitle");
const ReportMaxIntensity = querySelector("#report-max-intensity");
const ReportActionOpen = querySelector("#report-action-open");
const ReportLocation = querySelector("#report-location");
const ReportLongitude = querySelector("#report-longitude");
const ReportLatitude = querySelector("#report-latitude");
const ReportMagitude = querySelector("#report-magnitude");
const ReportDepth = querySelector("#report-depth");
const ReportTime = querySelector("#report-time");
const ReportIntensityGrouped = querySelector("#report-intensity-grouped");

async function report() {
  const ReportList = querySelector(".report-list-items");
  const res = await fetchData(`${API_url()}v2/eq/report?limit=20`);
  if (!res) return;
  const data = await res.json();
  ReportList.innerHTML = "";

  const FirstItem = data[0];
  const First = document.createElement("div");
  First.classList.add("report-list-item-index", "first");
  First.setAttribute("data-report-id", FirstItem.id);

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
  Time.textContent = ReportTimeFormat(FirstItem.time);

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
    Element.setAttribute("data-report-id", item.id);

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
    TimeItem.textContent = ReportTimeFormat(item.time);

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

  ReportItem.addEventListener("click", (event) => {
    const closestDiv = event.target.closest(".report-list-item-index");
    const ReportID = closestDiv.getAttribute("data-report-id");
    const ThisReport = data.find(ReportInt => ReportInt.id === ReportID);
    ReportInfo(ReportID, ThisReport.int);
  });
}
report();

async function ReportInfo(id, int) {
  const res = await fetchData(`${API_url()}v2/eq/report/${id}`);
  const data = await res.json();
  ReportBoxWrapper.style.display = "flex";
  ReportLocation.textContent = data.loc;
  ReportLongitude.textContent = data.lon;
  ReportLatitude.textContent = data.lat;
  ReportMagitude.textContent = data.mag;
  ReportDepth.textContent = data.depth;
  ReportTime.textContent = formatTime(data.time).replace(/\//g, "-");
  ReportTitle.textContent = LocalReplace(data.loc);
  ReportSubTitle.textContent = `編號 ${data.id}`;

  ReportMaxIntensity.classList.forEach(className => {
    if (className.startsWith("intensity-"))
      ReportMaxIntensity.classList.remove(className);

    ReportMaxIntensity.classList.add(`intensity-${int}`);
  });

  ReportActionOpen.addEventListener("click", () => {
    window.open(`https://www.cwa.gov.tw/V8/C/E/EQ/EQ${data.id.replace("2024-", "")}.html`, "_blank");
  });
  // https://www.cwa.gov.tw/V8/C/E/EQ/EQ113000-0605-212043.html
  report_grouped(data);
  report_all(data);
}

function report_grouped(data) {
  const reportListWrapper = document.querySelector("#report-intensity-grouped");
  reportListWrapper.innerHTML = "";

  const cities = Object.keys(data.list);

  cities.forEach(city => {
    const CityData = data.list[city];

    const ReportListWrapper = document.createElement("div");
    ReportListWrapper.classList.add("report-list-item-wrapper", "active");

    const ReportList = document.createElement("div");
    ReportList.classList.add("report-list-item");

    const ReportListInt = document.createElement("div");
    ReportListInt.classList.add("report-list-int");

    const ReportIntensity = document.createElement("div");
    ReportIntensity.classList.add("report-intensity", `intensity-${CityData.int}`);
    ReportIntensity.textContent = CityData.int;

    const ReportLoc = document.createElement("div");
    ReportLoc.classList.add("report-location");
    ReportLoc.textContent = city;

    ReportListInt.appendChild(ReportIntensity);
    ReportListInt.appendChild(ReportLoc);
    ReportList.appendChild(ReportListInt);

    const ReportArrowDown = document.createElement("span");
    ReportArrowDown.classList.add("report-arrow-down", "button-leading-icon", "material-symbols-rounded");
    ReportArrowDown.textContent = "keyboard_arrow_down";

    ReportList.appendChild(ReportArrowDown);

    ReportListWrapper.appendChild(ReportList);

    const ReportInts = document.createElement("div");
    ReportInts.classList.add("report-int-items");

    const Towns = Object.keys(CityData.town);

    Towns.forEach(town => {
      const townData = CityData.town[town];

      const ReportInt = document.createElement("div");
      ReportInt.classList.add("report-int-item");

      const ReportIntInfo = document.createElement("div");
      ReportIntInfo.classList.add("report-int-item-info");

      const Int = document.createElement("div");
      Int.classList.add("int", `intensity-${townData.int}`);
      Int.textContent = townData.int;

      const Town = document.createElement("div");
      Town.classList.add("town");
      Town.textContent = town;

      // const myLocation = document.createElement("div");
      // myLocation.classList.add("my_location");

      // const usrLocationIcon = document.createElement("span");
      // usrLocationIcon.classList.add("usr_location", "button-leading-icon", "material-symbols-rounded");
      // usrLocationIcon.textContent = "my_location";

      // const locationText = document.createElement("span");
      // locationText.classList.add("location");
      // locationText.textContent = "所在地";

      // myLocation.appendChild(usrLocationIcon);
      // myLocation.appendChild(locationText);

      ReportIntInfo.appendChild(Int);
      ReportIntInfo.appendChild(Town);
      // ReportIntInfo.appendChild(myLocation);

      ReportInt.appendChild(ReportIntInfo);
      ReportInts.appendChild(ReportInt);
    });

    ReportListWrapper.appendChild(ReportInts);

    reportListWrapper.appendChild(ReportListWrapper);
  });
}

function report_all(data) {
  const reportContainer = document.getElementById("report-intensity-all");
  reportContainer.innerHTML = "";

  Object.keys(data.list).forEach(city => {
    const cityData = data.list[city];
    const cityIntensity = cityData.int;

    const reportItem = document.createElement("div");
    reportItem.classList.add("report-list-item");

    const intensityDiv = document.createElement("div");
    intensityDiv.classList.add("report-intensity", `intensity-${cityIntensity}`);
    intensityDiv.textContent = cityIntensity;

    const locationDiv = document.createElement("div");
    locationDiv.classList.add("report-location");
    locationDiv.textContent = city;

    reportItem.appendChild(intensityDiv);
    reportItem.appendChild(locationDiv);

    reportContainer.appendChild(reportItem);
  });
}

function LocalReplace(loc) {
  const matches = loc.match(/\(([^)]+)\)/);
  if (matches) {
    let text = matches[1];
    text = text.replace("位於", "");
    return text.trim();
  }
  return "";
}

function ReportTimeFormat(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}