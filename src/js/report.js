/* eslint-disable no-useless-escape */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */
const EEWInfoTitle = $("#info-title-box-type");

const ReportListWrapper = $(".report-list-wrapper");
const ReportListBtn = $(".report-list-btn");
const ReportItem = $(".report-list-items");
const ReportBoxWrapper = $(".report-box-wrapper");
const ReportTitle = $("#report-title");
const ReportSubTitle = $("#report-subtitle");
const ReportMaxIntensity = $("#report-max-intensity");
const ReportActionOpen = $("#report-action-open");
const ReportLocation = $("#report-location");
const ReportLongitude = $("#report-longitude");
const ReportLatitude = $("#report-latitude");
const ReportMagitude = $("#report-magnitude");
const ReportDepth = $("#report-depth");
const ReportTime = $("#report-time");
const ReportBackBtn = $("#report-back-btn");
const ReportIntensityGrouped = $("#report-intensity-grouped");

const InfoBox = $(".info-box");
const InfoBodyTitleBox = $(".info-body-title-box");
const InfoBodyFooter = $(".info-body-footer");
const InfoBodyEQBox = $(".info-body-eq-box");
const InfoNSSPE = $(".info-nsspe");
const InfoNo = $("#info-no");

const RTS_List = $(".intensity-container");

async function report(t, retryCount = 0) {
  let s = variable.report.survey;
  for (const int in variable.intensity_list)
    s = variable.intensity_list[int].data;
  try {
    logger.info("[Fetch] Fetching report data...");
    const ReportList = $(".report-list-items");
    const res = await fetchData(`${API_url()}v2/eq/report?limit=20`);
    if (!res.ok) return;
    logger.info("[Fetch] Got report data");
    const data = await res.json();
    ReportList.innerHTML = "";

    if (s) variable.report.check_ = 0;
    variable.report.data = data;

    const FirstItem = s ? s : data[0];
    const First = createElement("div");
    First.classList.add("report-list-item-index", "first");
    First.setAttribute("data-report-id", s ? "" : FirstItem.id);

    if ((!variable.report.last || JSON.stringify(variable.report.last) !== JSON.stringify({ id: FirstItem.id })) && checkbox("sound-effects-Report") == 1) {
      variable.report.last = { id: FirstItem.id };
      if (t !== 0) constant.AUDIO.REPORT.play();
    }

    const No = s ? "" : FirstItem.id.split("-");
    const CheckNo = s ? "" : No[0].split(3)[1];
    if (CheckNo == "000") variable.report.withoutNo = "Normal";

    const IntWrapper = CreatEle("", "report-list-item-int-wrapper");
    const Int = CreatEle(s ? s.max : FirstItem.int, `report-list-item-int intensity-${s ? s.max : FirstItem.int}`);
    const IntTitle = CreatEle("觀測最大震度", "report-list-item-int-title");

    IntWrapper.appendChild(Int);
    IntWrapper.appendChild(IntTitle);
    First.appendChild(IntWrapper);

    let InfoWrapper = CreatEle("", "report-list-item-info-wrapper");
    const Info = CreatEle("", "report-list-item-info");
    const Location = CreatEle(s ? "震源 調查中" : LocalReplace(FirstItem.loc), "report-list-item-location");
    const Time = CreatEle(ReportTimeFormat(s ? s.id : FirstItem.time), "report-list-item-time");

    Info.appendChild(Location);
    Info.appendChild(Time);
    InfoWrapper.appendChild(Info);

    if (!s) {
      const MagDepthWrapper = CreatEle("", "report-list-item-mag-depth");
      const Mag = CreatEle("", "report-list-item-mag", "規模", `<div class="report-list-item-magnitude ${variable.report.withoutNo}">${FirstItem.mag < 10 ? FirstItem.mag.toFixed(1) : FirstItem.mag}</div>`);
      const KM = CreatEle("", "report-list-item-km", "深度", `<div class="km">${FirstItem.depth}</div>`);

      MagDepthWrapper.appendChild(Mag);
      MagDepthWrapper.appendChild(KM);
      InfoWrapper.appendChild(MagDepthWrapper);
    }

    First.appendChild(InfoWrapper);
    ReportList.appendChild(First);

    // 非First
    for (let i = variable.report.check_; i < data.length; i++) {
      variable.report.withoutNo = "";
      const item = data[i];
      const No = item.id.split("-");
      const CheckNo = No[0].split(3)[1];

      if (CheckNo == "000") variable.report.withoutNo = "Normal";

      InfoWrapper = CreatEle("", "report-list-item-info-wrapper");
      MagDepthWrapper = CreatEle("", "report-list-item-mag-depth");
      const Element = CreatEle("", "report-list-item-index", "", "", { "data-report-id": item.id });
      const IntItem = CreatEle(item.int, `report-list-item-int intensity-${item.int}`);
      const InfoItem = CreatEle("", "report-list-item-info");
      const LocationItem = CreatEle(LocalReplace(item.loc), "report-list-item-location");
      const TimeItem = CreatEle(ReportTimeFormat(item.time), "report-list-item-time");
      const MagDepth = CreatEle("", "report-list-item-mag report-list-item-mag-depth", "規模", `<div class="report-list-item-magnitude ${variable.report.withoutNo}">M ${item.mag < 10 ? item.mag.toFixed(1) : item.mag}</div>`);


      InfoItem.appendChild(LocationItem);
      InfoItem.appendChild(TimeItem);
      MagDepthWrapper.appendChild(MagDepth);
      InfoWrapper.appendChild(InfoItem);
      InfoWrapper.appendChild(MagDepthWrapper);
      Element.appendChild(IntItem);
      Element.appendChild(InfoWrapper);
      ReportList.appendChild(Element);
    }
  } catch (error) {
    if (retryCount < variable.report.list_retry) {
      logger.error(`[Fetch] ${error} (Try #${retryCount})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await report(t, retryCount + 1);
    }
  }
}
report(0);

async function ReportInfo(id, int, retryCount = 0) {
  try {
    logger.info("[Fetch] Fetching report info data");
    const res = await fetchData(`${API_url()}v2/eq/report/${id}`);
    if (!res.ok) return;
    logger.info("[Fetch] Got report info data");

    const data = await res.json();
    report_more(data, int);
  } catch (error) {
    if (retryCount < variable.report.list_retry) {
      logger.error(`[Fetch] ${error} (Try #${retryCount})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await ReportInfo(id, int, retryCount + 1);
    }
  }
}

function report_more(data, int) {
  const No = data.id.split("-")[0];
  const CheckNo = No.split(3)[1];
  display([ReportBoxWrapper], "flex");
  setTimeout(() => opacity([ReportBoxWrapper], 1), 100);

  const { loc, lon, lat, mag, depth, time } = data;
  const text = (el, val) => { el.textContent = val; };
  text(ReportLocation, loc.match(/^[^\(]+/)?.[0]?.trim() || "");
  text(ReportLatitude, lat);
  text(ReportLongitude, lon);
  text(ReportMagitude, mag < 10 ? mag.toFixed(1) : mag);
  text(ReportDepth, depth);
  text(ReportTime, formatTime(time).replace(/\//g, "-"));
  text(ReportTitle, LocalReplace(loc));
  text(ReportSubTitle, CheckNo !== "000" ? `編號 ${No}` : "小區域有感地震");
  ReportMaxIntensity.className = `report-max-intensity intensity-${int}`;
  report_grouped(data);
  report_all(data);

  const More = localStorage.getItem("report-more");
  const existMore = More ? JSON.parse(More) : [];
  const already = existMore.some(item => item.id === data.id);
  if (!already) {
    existMore.push(data);
    localStorage.setItem("report-more", JSON.stringify(existMore));
  }
}

function report_grouped(data) {
  opacity([ReportListWrapper, InfoBox], 0);
  const RepoListWrapper = $("#report-intensity-grouped");
  RepoListWrapper.innerHTML = "";

  const cities = Object.keys(data.list);
  cities.forEach(city => {
    const CityData = data.list[city];

    const ReportListWrapper = CreatEle("", "report-list-item-wrapper active");
    const ReportList = CreatEle("", "report-list-item");
    const ReportListInt = CreatEle("", "report-list-int");
    const ReportIntensity = CreatEle(CityData.int, `report-intensity intensity-${CityData.int}`);
    const ReportLoc = CreatEle(city, "report-location");
    const ReportArrowDown = CreatEle("keyboard_arrow_down", "report-arrow-down button-leading-icon material-symbols-rounded");

    ReportListInt.appendChild(ReportIntensity);
    ReportListInt.appendChild(ReportLoc);
    ReportList.appendChild(ReportListInt);
    ReportList.appendChild(ReportArrowDown);
    ReportListWrapper.appendChild(ReportList);

    const ReportInts = CreatEle("", "report-int-items");

    const Towns = Object.keys(CityData.town);

    Towns.forEach(town => {
      const townData = CityData.town[town];
      const ReportInt = CreatEle("", "report-int-item");
      const ReportIntInfo = CreatEle("", "report-int-item-info");
      const Int = CreatEle(townData.int, `int intensity-${townData.int}`);
      const Town = CreatEle(town, "town");

      ReportIntInfo.appendChild(Int);
      ReportIntInfo.appendChild(Town);
      ReportInt.appendChild(ReportIntInfo);
      ReportInts.appendChild(ReportInt);
    });

    ReportListWrapper.appendChild(ReportInts);
    RepoListWrapper.appendChild(ReportListWrapper);
  });
}

function report_all(data) {
  const reportContainer = $("#report-intensity-all");
  reportContainer.innerHTML = "";

  Object.entries(data.list).forEach(([city, { int: cityIntensity }]) => {
    const reportItem = CreatEle("", "report-list-item");
    const intensityDiv = CreatEle(cityIntensity, `report-intensity intensity-${cityIntensity}`);
    const locationDiv = CreatEle(city, "report-location");

    reportItem.appendChild(intensityDiv);
    reportItem.appendChild(locationDiv);
    reportContainer.appendChild(reportItem);
  });
}

function show_rts_list() {
  const _eew_list = Object.keys(variable.eew_list);
  const len = _eew_list.length;
  opacity([ReportListBtn], len ? 0 : 1);
  opacity([InfoBox, InfoBodyTitleBox, InfoBodyFooter], len ? 1 : 0);
  RTS_List.classList.toggle("hidden", !len);
  if (len > 0) {
    ReportListWrapper.classList.toggle("hidden", len);
    const current_eew = variable.eew_list[_eew_list[last_map_count]] ? variable.eew_list[_eew_list[last_map_count]].data : "";
    display([InfoBodyEQBox], current_eew.detail == 0 ? "" : "flex");
    display([SettingWrapper], "none");
    opacity([SettingWrapper], 0);
    display([InfoNSSPE], current_eew.detail == 0 ? "block" : "");
  } else {
    opacity([InfoBox], window.getComputedStyle(ReportBoxWrapper).display !== "flex" ? 1 : 0);
    InfoNo.textContent = "";
    InfoBox.style.backgroundColor = "#505050c7";
    EEWInfoTitle.textContent = "暫無生效中的地震預警";
  }
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


/** Report Click事件**/
// 地震報告收展
ReportListBtn.addEventListener("click", () => {
  const ArrowSpan = this.querySelector(".nav-item-icon");
  ArrowSpan.textContent = ArrowSpan.textContent.trim() == "chevron_right" ? "chevron_left" : "chevron_right";
  ReportListWrapper.classList.toggle("hidden");
});

// 地震報告項目
ReportItem.addEventListener("click", (event) => {
  const { dataset: { reportId: ReportID } } = event.target.closest(".report-list-item-index");
  const t = variable.report.data.find(ReportInt => ReportInt.id == ReportID);
  if (t) {
    const localStorageData = localStorage.getItem("report-more");
    const exists = localStorageData ? JSON.parse(localStorageData).find(report => report.id === ReportID) : null;
    exists ? report_more(exists, t.int) : ReportInfo(ReportID, t.int);
  }
});

// 地震報告詳細資訊各地震度下拉
document.addEventListener("click", (event) => {
  const ReportListItem = event.target.closest(".report-list-item");
  if (ReportListItem) {
    const wrapper = ReportListItem.closest(".report-list-item-wrapper");
    const ArrowSpan = ReportListItem.querySelector(".report-arrow-down");
    ArrowSpan.textContent = ArrowSpan.textContent.trim() == "keyboard_arrow_up" ? "keyboard_arrow_down" : "keyboard_arrow_up";
    wrapper.classList.toggle("active");
  }
});

// 報告頁面
ReportActionOpen.addEventListener("click", () => {
  const id = variable.report.more.id.split("-");
  const filtered = id.filter((part, index) => index !== 1).join("-");
  window.open(`https://www.cwa.gov.tw/V8/C/E/EQ/EQ${filtered}.html`, "_blank");
});

// 地震報告詳細資訊返回
ReportBackBtn.addEventListener("click", () => {
  opacity([ReportBoxWrapper], 0);
  setTimeout(() => display([ReportBoxWrapper], ""), 100);
  opacity([ReportListWrapper, InfoBox], 1);
});