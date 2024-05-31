/* eslint-disable no-undef */
const domMethods = {
  querySelector    : document.querySelector.bind(document),
  querySelectorAll : document.querySelectorAll.bind(document),
  createElement    : document.createElement.bind(document),
};

const { querySelector, querySelectorAll, createElement } = domMethods;

const version = querySelector("#version");
const uuid = querySelector("#uuid");
const SettingWrapper = querySelector(".setting-wrapper");
const SettingBtn = querySelector("#nav-settings-panel");
const Back = querySelector(".back_to_home");
const ResetBtn = querySelector(".setting-reset-btn");
const ResetConfirmWrapper = querySelector(".reset-confirm-wrapper");
const ResetCancel = querySelector(".reset-cancel");
const ResetSure = querySelector(".reset-sure");
const LoginBtn = querySelector(".login-btn");

const LocationWrapper = querySelector(".usr-location");
const Location = LocationWrapper.querySelector(".location");
const LocationSelectWrapper = LocationWrapper.querySelector(".select-wrapper");
const localItems = LocationSelectWrapper.querySelector(".local");
const CitySelect = LocationSelectWrapper.querySelector(".current-city");
const CityItems = LocationSelectWrapper.querySelector(".city");
const TownSelect = LocationSelectWrapper.querySelector(".current-town");
const TownItems = LocationSelectWrapper.querySelector(".town");

// 版本號、UUID
version.textContent = "2.0.0";
uuid.textContent = "undefined";

const localArr = {
  "北部" : ["臺北市", "新北市", "基隆市", "新竹市", "桃園市", "新竹縣", "宜蘭縣"],
  "中部" : ["臺中市", "苗栗縣", "彰化縣", "南投縣", "雲林縣"],
  "南部" : ["高雄市", "臺南市", "嘉義市", "嘉義縣", "屏東縣", "澎湖縣"],
  "東部" : ["花蓮縣", "臺東縣"],
  "外島" : ["金門縣", "連江縣"],
  "南韓" : ["南陽州市"],
  "中國" : ["重慶市"],
};

const cityToTowns = {
  "南陽州市" : ["和道邑"],
  "重慶市"  : ["北碚區"],
};

// 左側選單按鈕點擊
querySelectorAll(".setting-buttons .button").forEach(button => {
  button.addEventListener("click", () => {
    querySelectorAll(".setting-options-page").forEach(page => page.classList.remove("active"));
    querySelector(`.${button.getAttribute("for")}`).classList.add("active");

    querySelectorAll(".setting-buttons .button").forEach(btn => btn.classList.remove("on"));
    button.classList.add("on");
  });
});

// 重置按鈕點擊事件
ResetBtn.addEventListener("click", () => {
  ResetConfirmWrapper.style.bottom = "0";
});

addEventListener("click", (event) => {
  const target = event.target;
  if (!ResetConfirmWrapper.contains(target) && !ResetBtn.contains(target))
    ResetConfirmWrapper.style.bottom = "-100%";
});

// 確定重置按鈕點擊事件
ResetSure.addEventListener("click", () => {
  ResetConfirmWrapper.style.bottom = "-100%";
});

// 取消重置按鈕點擊事件
ResetCancel.addEventListener("click", () => {
  ResetConfirmWrapper.style.bottom = "-100%";
});

// 設定按鈕點擊事件
SettingBtn.addEventListener("click", () => {
  SettingWrapper.style.display = "block";
  requestAnimationFrame(() => {
    SettingWrapper.style.opacity = "1";
  });
});

// 返回按鈕點擊事件
Back.addEventListener("click", () => {
  SettingWrapper.style.display = "none";
  requestAnimationFrame(() => {
    SettingWrapper.style.opacity = "0";
  });
});

// 所在地-下拉選單點擊事件
Location.addEventListener("click", function() {
  const ArrowSpan = this.querySelector(".selected-btn");
  ArrowSpan.textContent = ArrowSpan.textContent.trim() === "keyboard_arrow_up" ? "keyboard_arrow_down" : "keyboard_arrow_up";
  LocationSelectWrapper.classList.toggle("select-show-big");
});

// 所在地-點擊選項事件
const addLocationSelectEvent = (localItemsContainer, CityItemsContainer, selectElement) => {
  [localItemsContainer, CityItemsContainer].forEach(container => {
    container.addEventListener("click", (event) => {
      const closestDiv = event.target.closest(".usr-location .select-items > div");
      if (closestDiv) {
        selectElement.textContent = closestDiv.textContent;

        container.querySelectorAll("div").forEach(div => div.classList.remove("select-option-selected"));
        closestDiv.classList.add("select-option-selected");
      }
    });
  });
};
// 所在地-更新目前選項的city、town
const updateLocationSelectItems = (itemsContainer, items) => {
  itemsContainer.innerHTML = "";
  items.forEach(item => {
    const div = createElement("div");
    div.textContent = item;
    itemsContainer.appendChild(div);
  });
};

// 所在地-將town推入city數組
Object.keys(constant.REGION).forEach(city => {
  cityToTowns[city] = Object.keys(constant.REGION[city]);
});

// 所在地-local選單點擊事件
localItems.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(".usr-location .select-items > div");
  if (closestDiv) {
    updateLocationSelectItems(CityItems, localArr[closestDiv.textContent]);
    updateLocationSelectItems(TownItems, []);
  }
});

// 所在地-city選單點擊事件
CityItems.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(".usr-location .select-items > div");
  if (closestDiv) {
    CitySelect.textContent = closestDiv.textContent;
    updateLocationSelectItems(TownItems, cityToTowns[closestDiv.textContent] || []);
  }
});

// 所在地-town選單點擊事件
TownItems.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(".usr-location .select-items > div");
  if (closestDiv) {
    let usrLocalStation = [];
    TownSelect.textContent = closestDiv.textContent;
    querySelector(".current-city").textContent = CitySelect.textContent;
    querySelector(".current-town").textContent = closestDiv.textContent;

    if (CitySelect.textContent !== "南陽州市" && CitySelect.textContent !== "重慶市") {
      const usr_location_info = constant.REGION[CitySelect.textContent][closestDiv.textContent];
      usrLocalStation = NearStation(usr_location_info.lat, usr_location_info.lon);
    } else
      usrLocalStation = findStationByLocation(CitySelect.textContent, closestDiv.textContent);

    querySelector(".current-station").textContent = `${usrLocalStation.net} ${usrLocalStation.code}-${usrLocalStation.name} ${usrLocalStation.loc}`;
    SaveSelectedLocationToStorage(CitySelect.textContent, closestDiv.textContent, JSON.stringify(usrLocalStation));
  }
});

function findStationByLocation(city, town) {
  const location = `${city}${town}`;
  for (const station of StationList)
    if (station.loc === location)
      return station;


  return null;
}

function NearStation(la, lo) {
  let min = Infinity;
  let closestStation = null;

  for (const id of Object.keys(StationList)) {
    const dist_surface = Math.sqrt(Math.pow((la - StationList[id].lat) * 111, 2) + Math.pow((lo - StationList[id].lon) * 101, 2));
    if (dist_surface < min) {
      min = dist_surface;
      closestStation = StationList[id];
    }
  }

  if (closestStation) {
    const result = {
      net  : closestStation.net,
      code : closestStation.code,
      name : closestStation.name,
      loc  : closestStation.loc,
      lat  : closestStation.lat,
      lon  : closestStation.lon,
    };
    return result;
  }

  return null;
}


addLocationSelectEvent(localItems, CityItems, CitySelect);
addLocationSelectEvent(localItems, TownItems, TownSelect);

// 所在地-儲存user選擇的city和town到storage
const SaveSelectedLocationToStorage = (city, town, station) => {
  const locationData = { city: city, town: town };

  localStorage.setItem("current-location", JSON.stringify(locationData));
  localStorage.setItem("current-station", station);
};


const StationWrapper = querySelector(".realtime-station");
const StationLocation = StationWrapper.querySelector(".location");
const StationSelectWrapper = StationWrapper.querySelector(".select-wrapper");
const StationLocalItems = StationSelectWrapper.querySelector(".local");
const StationSelect = StationSelectWrapper.querySelector(".current-station");
const StationItems = StationSelectWrapper.querySelector(".station");
const StationList = [];
const StationRegion = [];

function clearArrays() {
  StationList.length = 0;
  StationRegion.length = 0;
}

// 即時測站-取得即時測站
async function realtimeStation() {
  try {
    const res = await fetchData(`${API_url()}v1/trem/station`);
    const data = await res.json();

    if (data) {
      clearArrays();
      processStationData(data);
      renderStationRegion();
    }
  } catch (err) {
    logger.error(`[Fetch] ${err}`);
  }
}
realtimeStation();

// 即時測站-處理測站數據
function processStationData(data) {
  Object.keys(data).forEach(station => {
    const info = data[station].info[data[station].info.length - 1];
    let loc = region_code_to_string(constant.REGION, info.code);

    if (loc && !StationRegion.includes(loc.city))
      StationRegion.push(loc.city);

    if (!loc)
      loc = getFallbackLocation(station);
    else
      loc = `${loc.city}${loc.town}`;


    const stationInfo = {
      name : station,
      net  : data[station].net,
      loc  : loc,
      code : info.code,
      lat  : info.lat,
      lon  : info.lon,
    };

    StationList.push(stationInfo);
  });
}

// 即時測站-取得未知站點名稱
function getFallbackLocation(station) {
  switch (station) {
    case "13379360":
      return "重慶市北碚區";
    case "7735548":
      return "南陽州市和道邑";
    default:
      return "未知區域";
  }
}

// 即時測站-渲染測站站點
function renderStationRegion() {
  StationLocalItems.innerHTML = "";

  const uniqueRegions = [...new Set(StationRegion.map(city => city.slice(0, -1)))];

  const sortedRegion = uniqueRegions.sort();

  sortedRegion.forEach(city => {
    const cityDiv = createElement("div");
    cityDiv.textContent = city;
    StationLocalItems.appendChild(cityDiv);
  });
}

// 即時測站-點擊縣市選項事件
StationLocalItems.addEventListener("click", handleCityItemClick);

function handleCityItemClick(event) {
  const target = event.target.closest(".realtime-station .select-items > div");
  if (target) {
    StationLocalItems.querySelectorAll("div").forEach(div => div.classList.remove("select-option-selected"));
    target.classList.add("select-option-selected");

    const selectedCity = target.textContent;
    const filteredStations = StationList.filter(station => station.loc.includes(selectedCity));
    renderFilteredStations(filteredStations);
  }
}

// 即時測站-篩選對應縣市測站並排序後渲染
function renderFilteredStations(stations) {
  stations.sort((a, b) => a.loc.localeCompare(b.loc));

  StationItems.innerHTML = "";

  stations.forEach(station => {
    const stationDiv = createElement("div");
    stationDiv.setAttribute("data-net", station.net);
    stationDiv.setAttribute("data-code", station.code);
    stationDiv.setAttribute("data-name", station.name);
    stationDiv.setAttribute("data-loc", station.loc);
    stationDiv.setAttribute("data-lat", station.lat);
    stationDiv.setAttribute("data-lon", station.lon);

    const netSpan = createElement("span");
    netSpan.textContent = station.net;
    netSpan.classList.add(station.net);

    const infoSpan = createElement("span");
    infoSpan.textContent = `${station.code}-${station.name} ${station.loc}`;

    stationDiv.appendChild(netSpan);
    stationDiv.appendChild(infoSpan);

    StationItems.appendChild(stationDiv);
  });
}

// 即時測站-下拉選單點擊事件
StationLocation.addEventListener("click", handleLocationClick);

function handleLocationClick() {
  const ArrowSpan = this.querySelector(".selected-btn");
  ArrowSpan.textContent = ArrowSpan.textContent.trim() === "keyboard_arrow_up" ? "keyboard_arrow_down" : "keyboard_arrow_up";
  StationSelectWrapper.classList.toggle("select-show-big");
}

// 即時測站-點擊測站選項事件
addStationSelectEvent(StationItems);

function addStationSelectEvent(itemsContainer) {
  itemsContainer.addEventListener("click", (event) => {
    const closestDiv = event.target.closest(".realtime-station .select-items > div");
    if (closestDiv) {
      const selectedStation = closestDiv.textContent;

      itemsContainer.querySelectorAll("div").forEach(div => div.classList.remove("select-option-selected"));
      closestDiv.classList.add("select-option-selected");

      const regex = /^(MS-Net|SE-Net)(\d+-\d+.*)$/;
      const match = selectedStation.match(regex);
      if (match) {
        StationSelect.textContent = `${match[1]} ${match[2]}`;
        querySelector(".current-station").textContent = `${match[1]} ${match[2]}`;

        const stationData = {
          net  : closestDiv.getAttribute("data-net"),
          code : closestDiv.getAttribute("data-code"),
          name : closestDiv.getAttribute("data-name"),
          loc  : closestDiv.getAttribute("data-loc"),
          lat  : closestDiv.getAttribute("data-lat"),
          lon  : closestDiv.getAttribute("data-lon"),
        };

        localStorage.setItem("current-station", JSON.stringify(stationData));
      }
    }
  });
}

const LoginFormContent = querySelector(".login-forms-content");
const AccountInfoContent = querySelector(".usr-account-info-content");
const act = querySelector(".account");
const vip = querySelector(".vip");
const LogoutBtn = querySelector(".logout-btn");
const LoginBack = querySelector(".login-back");

const FormLogin = querySelector("#form-login");
const FormEmail = querySelector("#email");
const FormPassword = querySelector("#password");
const LoginMsg = querySelector(".login_msg");
const url = "https://api.exptech.com.tw/api/v3/et/";

// 登入-切換登入表單和帳號資訊
function toggleForms(isLoginFormVisible) {
  LoginFormContent.style.display = isLoginFormVisible ? "grid" : "none";
  AccountInfoContent.style.display = isLoginFormVisible ? "none" : "block";
}

// 登入-跳轉到登入表單
LoginBtn.addEventListener("click", () => {
  toggleForms(true);
  requestAnimationFrame(() => {
    LoginFormContent.classList.add("show-login-form");
    AccountInfoContent.classList.remove("show-account-info");
  });
});

// 登入-返回登入首頁/帳號資訊
LoginBack.addEventListener("click", () => {
  toggleForms(false);
  requestAnimationFrame(() => {
    AccountInfoContent.classList.add("show-account-info");
    LoginFormContent.classList.remove("show-login-form");
  });
});

// 登入-表單登入按鈕
FormLogin.addEventListener("click", async () => {
  const email = FormEmail.value;
  const password = FormPassword.value;
  await login(email, password);
});

// 登入-表單登出按鈕
LogoutBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("user-token");
  await logout(token);
});

// 登入-登入成功畫面
function LoginSuccess(msg) {
  LoginBtn.style.display = "none";
  LogoutBtn.style.display = "flex";
  act.textContent = "Welcome";
  vip.textContent = `VIP-${msg.vip}`;
  localStorage.setItem("user-token", msg.device[0].key);
  LoginBack.dispatchEvent(clickEvent);
}

// 登入-登出成功畫面
function LogoutSuccess() {
  LoginBtn.style.display = "flex";
  LogoutBtn.style.display = "none";
  act.textContent = "尚未登入";
  vip.textContent = "";
  localStorage.removeItem("user-token", "");
  LoginBtn.dispatchEvent(clickEvent);
}

// 登入-登入/登出相關功能
async function handleUserAction(endpoint, options) {
  try {
    const response = await fetch(`${url}${endpoint}`, options);
    const responseData = await response.text();

    switch (true) {
      case response.ok: {
        LoginMsg.classList.add("success");
        LoginMsg.textContent = `${options.method === "POST" ? "登入" : "登出"}成功！`;
        if (endpoint === "login") LoginSuccess(await getUserInfo(responseData));
        if (endpoint === "logout") LogoutSuccess();
        break;
      }
      case response.status === 400 || response.status === 401:
        LoginMsg.classList.add("error");
        LoginMsg.textContent = "帳號或密碼錯誤！";
        break;
      default:
        LoginMsg.classList.add("error");
        LoginMsg.textContent = `伺服器異常(error ${response.status})`;
        break;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// 登入-表單登入
async function login(email, password) {
  const requestBody = { email, pass: password, name: "admin" };
  const options = {
    method  : "POST",
    headers : { "Content-Type": "application/json" },
    body    : JSON.stringify(requestBody),
  };
  await handleUserAction("login", options);
}

// 登入-表單登出
async function logout(token) {
  const options = {
    method  : "DELETE",
    headers : { "Content-Type": "application/json", "Authorization": `Basic ${token}` },
  };
  await handleUserAction("logout", options);
}

// 登入-取得使用者資訊
async function getUserInfo(token) {
  try {
    const response = await fetch(`${url}info`, {
      method  : "GET",
      headers : { "Content-Type": "application/json", "Authorization": `Basic ${token}` },
    });
    if (response.ok) return await response.json();
    else throw new Error(`伺服器異常(error ${response.status})`);
  } catch (error) {
    console.error("error:", error);
    return {};
  }
}

const clickEvent = new MouseEvent("click", {
  bubbles    : true,
  cancelable : true,
  view       : window,
});


// 預警條件
function initializeSelect(type, location, showInt, selectWrapper, items) {
  location.addEventListener("click", function() {
    const ArrowSpan = this.querySelector(".selected-btn");
    ArrowSpan.textContent = ArrowSpan.textContent.trim() === "keyboard_arrow_up" ? "keyboard_arrow_down" : "keyboard_arrow_up";
    selectWrapper.classList.toggle("select-show-big");
  });

  items.addEventListener("click", (event) => {
    const target = event.target.closest(".select-items > div");
    if (target) {
      items.querySelectorAll("div").forEach(div => div.classList.remove("select-option-selected"));
      target.classList.add("select-option-selected");

      const selected = target.textContent;
      showInt.textContent = selected;

      updateLocalStorage(type.className, selected);
    }
  });
}

function updateLocalStorage(typeClassName, selectedValue) {
  const data = JSON.parse(localStorage.getItem("current-warning")) || {};

  if (typeClassName.indexOf("warning-realtime-station") > 0) {
    if (!data["realtime-station"])
      data["realtime-station"] = "";

    data["realtime-station"] = selectedValue;
  } else {
    if (!data["estimate-int"])
      data["estimate-int"] = "";

    data["estimate-int"] = selectedValue;
  }

  localStorage.setItem("current-warning", JSON.stringify(data));
}

// 預警條件-即時測站
const WRTS = document.querySelector(".warning-realtime-station");
const WRTSLocation = WRTS.querySelector(".location");
const WRTSShowInt = WRTS.querySelector(".realtime-int");
const WRTSSelectWrapper = WRTS.querySelector(".select-wrapper");
const WRTSItems = WRTSSelectWrapper.querySelector(".int");

initializeSelect(WRTS, WRTSLocation, WRTSShowInt, WRTSSelectWrapper, WRTSItems);

// 預警條件-預估震度
const WEI = document.querySelector(".warning-estimate-int");
const WEILocation = WEI.querySelector(".location");
const WEIShowInt = WEI.querySelector(".estimate-int");
const WEISelectWrapper = WEI.querySelector(".select-wrapper");
const WEIItems = WEISelectWrapper.querySelector(".int");

initializeSelect(WEI, WEILocation, WEIShowInt, WEISelectWrapper, WEIItems);

// 渲染震度選項列表
const Ints = document.querySelectorAll(".select-wrapper .int");
const intensity_text = ["0級", "1級", "2級", "3級", "4級", "5弱", "5強", "6弱", "6強", "7級"];
Ints.forEach(Int => {
  intensity_text.forEach(text => {
    const intItem = document.createElement("div");
    intItem.textContent = text;
    Int.appendChild(intItem);
  });
});


// 其他功能-設定頁面背景透明度滑塊
const sliderContainer = querySelector(".slider-container");
const sliderTrack = querySelector(".slider-track");
const sliderThumb = querySelector(".slider-thumb");

let isDragging = false;

sliderThumb.addEventListener("mousedown", () => {
  isDragging = true;
});

addEventListener("mouseup", () => {
  isDragging = false;
});

addEventListener("mousemove", (event) => {
  if (isDragging) {
    const containerRect = sliderContainer.getBoundingClientRect();
    let newLeft = event.clientX - containerRect.left;

    newLeft = Math.max(0, Math.min(newLeft, containerRect.width));

    const percentage = (newLeft / containerRect.width) * 100;
    const blurValue = (newLeft / containerRect.width) * 20;

    sliderThumb.style.left = `${percentage}%`;
    sliderTrack.style.width = `${percentage}%`;
    SettingWrapper.style.backdropFilter = `blur(${blurValue}px)`;
  }
});

// 從storage取得user之前保存的選項
const GetSelectedFromStorage = () => {
  const locationData = JSON.parse(localStorage.getItem("current-location")) || {};
  const warningData = JSON.parse(localStorage.getItem("current-warning")) || {};

  return {
    city    : locationData.city ? locationData.city : "臺南市",
    town    : locationData.town ? locationData.town : "歸仁區",
    station : localStorage.getItem("current-station") ? localStorage.getItem("current-station") : "未知區域",
    wrts    : warningData["realtime-station"] ? warningData["realtime-station"] : intensity_text[0],
    wei     : warningData["estimate-int"] ? warningData["estimate-int"] : intensity_text[0],
    effect  : localStorage.getItem("current-map-display-effect") ? localStorage.getItem("current-map-display-effect") : "1",
  };
};

// 渲染user之前保存的選項
const RenderSelectedFromStorage = () => {
  const { city, town, station, wrts, wei, effect } = GetSelectedFromStorage();
  const current_station = querySelector(".current-station");

  querySelector(".current-city").textContent = city;
  querySelector(".current-town").textContent = town;
  querySelector(".realtime-int").textContent = wrts;
  querySelector(".estimate-int").textContent = wei;

  if (station && station !== "未知區域") {
    const stationData = JSON.parse(localStorage.getItem("current-station"));
    current_station.textContent = `${stationData.net} ${stationData.code}-${stationData.name} ${stationData.loc}`;
  } else
    current_station.textContent = "未知區域";

  const keys = Object.keys(EffectArr);
  const effect_text = keys[effect - 1] || "unknown";
  querySelector(".current-effect").textContent = effect_text;
};

// 渲染user之前保存的選項
addEventListener("DOMContentLoaded", RenderSelectedFromStorage);


const MapDisplayEffect = querySelector(".map-display-effect");
const MapDisplayEffectSelect = MapDisplayEffect.querySelector(".current-effect");
const MapDisplayEffectLocation = MapDisplayEffect.querySelector(".location");
const MapDisplayEffectSelectWrapper = MapDisplayEffect.querySelector(".select-wrapper");
const MapDisplayEffectItems = MapDisplayEffectSelectWrapper.querySelector(".effect");

const EffectArr = { "實測震度 + 預估震度": 1, "即時加速度 + 預估震度": 2, "預估震度": 3, "即時加速度": 4, "實測震度": 5 };

if (MapDisplayEffectItems)
  for (const [text, value] of Object.entries(EffectArr)) {
    const intItem = document.createElement("div");
    intItem.setAttribute("data-value", value);
    intItem.textContent = text;
    MapDisplayEffectItems.appendChild(intItem);
  }


const addMapDisplayEffectSelectEvent = (MapDisplayEffectContainer, selectElement) => {
  [MapDisplayEffectContainer].forEach(container => {
    container.addEventListener("click", (event) => {
      const closestDiv = event.target.closest(".usr-location .select-items > div");
      if (closestDiv) {
        selectElement.textContent = closestDiv.textContent;

        container.querySelectorAll("div").forEach(div => div.classList.remove("select-option-selected"));
        closestDiv.classList.add("select-option-selected");
      }
    });
  });
};

MapDisplayEffectLocation.addEventListener("click", function() {
  const ArrowSpan = this.querySelector(".selected-btn");
  ArrowSpan.textContent = ArrowSpan.textContent.trim() === "keyboard_arrow_up" ? "keyboard_arrow_down" : "keyboard_arrow_up";
  MapDisplayEffectSelectWrapper.classList.toggle("select-show-big");
});

MapDisplayEffectItems.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(".map-display-effect .select-items > div");
  if (closestDiv) {
    MapDisplayEffectSelect.textContent = closestDiv.textContent;
    MapDisplayEffectSelectWrapper.querySelectorAll("div").forEach(div => div.classList.remove("select-option-selected"));
    closestDiv.classList.toggle("select-option-selected");
    localStorage.setItem("current-map-display-effect", closestDiv.dataset.value);
  }
});

addMapDisplayEffectSelectEvent(MapDisplayEffectItems, MapDisplayEffectSelect);


const Tos = querySelector(".tos");
const Tos_Sure = querySelector(".tos_sure");

if (!localStorage.getItem("tos")) {
  querySelector(".tos").style.display = "flex";
  const hello = querySelector(".hello__div");
  setTimeout(() => {
    hello.style.opacity = "0";

    setTimeout(() => {
      const tosWrapper = querySelector(".tos_wrapper");
      tosWrapper.style.height = "19em";
      tosWrapper.style.opacity = "1";
      hello.style.display = "none";
    }, 2500);
  }, 6000);
}

Tos_Sure.addEventListener("click", () => {
  Tos.style.opacity = "0";

  setTimeout(() => {
    Tos.style.display = "none";
    localStorage.setItem("tos", true);
  }, 2000);
});


/** Report **/
querySelectorAll(".report-list-item-wrapper").forEach(wrapper => {
  const ReportListItem = wrapper.querySelector(".report-list-item");
  ReportListItem.addEventListener("click", () => {
    const ArrowSpan = ReportListItem.querySelector(".report-arrow-down");
    ArrowSpan.textContent = ArrowSpan.textContent.trim() === "keyboard_arrow_up" ? "keyboard_arrow_down" : "keyboard_arrow_up";
    wrapper.classList.toggle("active");
  });
});