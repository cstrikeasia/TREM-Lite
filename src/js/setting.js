/* eslint-disable no-undef */
const version = $("#version");
const system_os = $("#system_os");
const system_cpu = $("#system_cpu");
const SettingWrapper = $(".setting-wrapper");
const SettingBtn = $("#nav-settings-panel");
const Back = $(".back_to_home");
const ResetBtn = $(".setting-reset-btn");
const ResetConfirmWrapper = $(".reset-confirm-wrapper");
const ResetCancel = $(".reset-cancel");
const ResetSure = $(".reset-sure");
const LoginBtn = $(".login-btn");

const LocationWrapper = $(".usr-location");
const Location = LocationWrapper.querySelector(".location");
const LocationSelWrapper = LocationWrapper.querySelector(".select-wrapper");
const localItems = LocationSelWrapper.querySelector(".local");
const CitySel = LocationSelWrapper.querySelector(".current-city");
const CityItems = LocationSelWrapper.querySelector(".city");
const TownSel = LocationSelWrapper.querySelector(".current-town");
const TownItems = LocationSelWrapper.querySelector(".town");

const AppVersion = $(".app-version");
const CurrentVersion = $("#current-version");
const NewVersion = $("#new-version");

// 版本號、UUID
version.textContent = app.getVersion();
system_os.textContent = `${os.version()} (${os.release()})`;
system_cpu.textContent = `${os.cpus()[0].model}`;


async function ls_init() {
  let config = ReadConfig() || { setting: {} };

  await realtimeStation();
  Object.entries(constant.SETTING.LOCALSTORAGE_DEF).forEach(([key, value]) => {
    if (!config.setting[key]) {
      config.setting[key] = value;
      WriteConfig(config);
    }
  });
  const def_loc = constant.SETTING.LOCALSTORAGE_DEF["location"];
  const def_loc_info = constant.REGION[def_loc.city][def_loc.town];

  if (!config.setting['station']) {
    config.setting['station'] = NearStation(def_loc_info.lat, def_loc_info.lon);
    WriteConfig(config);
  }

  const userCheckbox = config.setting['user-checkbox'] || {};

  Object.keys(constant.SETTING.CHECKBOX_DEF).forEach(key => {
    if (!(key in userCheckbox)) {
      userCheckbox[key] = 1;
    }
  });

  config.setting['user-checkbox'] = userCheckbox;
  WriteConfig(config);

}
ls_init();

// 左側選單按鈕點擊
querySelectorAll(".setting-buttons .button").forEach((button) => {
  button.addEventListener("click", () => {
    querySelectorAll(".setting-options-page").forEach((page) =>
      page.classList.remove("active")
    );
    querySelector(`.${button.getAttribute("for")}`).classList.add("active");

    querySelectorAll(".setting-buttons .button").forEach((btn) =>
      btn.classList.remove("on")
    );
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
  ls_init();
  ResetConfirmWrapper.style.bottom = "-100%";
});

// 取消重置按鈕點擊事件
ResetCancel.addEventListener("click", () => {
  ResetConfirmWrapper.style.bottom = "-100%";
});

// 設定按鈕點擊事件
SettingBtn.addEventListener("click", () => {
  const _eew_list = Object.keys(variable.eew_list);
  if (_eew_list.length) return;

  display([SettingWrapper], "block");
  requestAnimationFrame(() => {
    opacity([SettingWrapper], 1);
  });
});

// 返回按鈕點擊事件
Back.addEventListener("click", () => {
  display([SettingWrapper]);
  requestAnimationFrame(() => {
    opacity([SettingWrapper], 0);
  });
});

// 所在地-下拉選單點擊事件
Location.addEventListener("click", function () {
  const ArrowSpan = this.querySelector(".selected-btn");
  ArrowSpan.textContent =
    ArrowSpan.textContent.trim() == "keyboard_arrow_up"
      ? "keyboard_arrow_down"
      : "keyboard_arrow_up";
  LocationSelWrapper.classList.toggle("select-show-big");
});

// 所在地-點擊選項事件
const addLocationSelectEvent = (
  localItemsContainer,
  cityItemsContainer,
  selectElement
) => {
  [localItemsContainer, cityItemsContainer].forEach((container) => {
    container.addEventListener("click", (event) => {
      const closestDiv = event.target.closest(
        ".usr-location .select-items > div"
      );
      if (closestDiv) {
        const selectedOption = closestDiv.textContent;
        selectElement.textContent = selectedOption;
        container
          .querySelectorAll("div")
          .forEach((div) => div.classList.remove("select-option-selected"));
        closestDiv.classList.add("select-option-selected");
      }
    });
  });
};

// 所在地-更新目前選項的city、town
const updateLocationSelectItems = (itemsContainer, items) => {
  itemsContainer.innerHTML = items.map((item) => `<div>${item}</div>`).join("");
};

// 所在地-將town推入city數組
Object.keys(constant.REGION).forEach((city) => {
  constant.SETTING.SPECIAL_LOCAL[city] = Object.keys(constant.REGION[city]);
});

// 所在地-local選單點擊事件
localItems.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(".usr-location .select-items > div");
  if (closestDiv) {
    updateLocationSelectItems(
      CityItems,
      constant.SETTING.LOCAL_ARRAY[closestDiv.textContent]
    );
    updateLocationSelectItems(TownItems, []);
  }
});

// 所在地-city選單點擊事件
CityItems.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(".usr-location .select-items > div");
  if (closestDiv) {
    CitySel.textContent = closestDiv.textContent;
    updateLocationSelectItems(
      TownItems,
      constant.SETTING.SPECIAL_LOCAL[closestDiv.textContent] || []
    );
  }
});

// 所在地-town選單點擊事件
TownItems.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(".usr-location .select-items > div");
  if (closestDiv) {
    let usrLocalStation = [];
    TownSel.textContent = closestDiv.textContent;
    querySelector(".current-city").textContent = CitySel.textContent;
    querySelector(".current-town").textContent = closestDiv.textContent;

    if (
      CitySel.textContent !== "南陽州市" &&
      CitySel.textContent !== "重慶市"
    ) {
      const usr_location_info =
        constant.REGION[CitySel.textContent][closestDiv.textContent];
      usrLocalStation = NearStation(
        usr_location_info.lat,
        usr_location_info.lon
      );
    } else
      usrLocalStation = findStationByLocation(
        CitySel.textContent,
        closestDiv.textContent
      );

    querySelector(
      ".current-station"
    ).textContent = `${usrLocalStation.net} ${usrLocalStation.code}-${usrLocalStation.name} ${usrLocalStation.loc}`;
    SaveSelectedLocationToStorage(
      CitySel.textContent,
      closestDiv.textContent,
      JSON.stringify(usrLocalStation)
    );
  }
});

function findStationByLocation(city, town) {
  const location = `${city}${town}`;
  return (
    variable.setting.station.find((station) => station.loc == location) || null
  );
}

function NearStation(la, lo) {
  let min = Infinity;
  let closestStation = null;

  for (const station of variable.setting.station) {
    const dist_surface = Math.sqrt(
      (la - station.lat) ** 2 * 111 ** 2 + (lo - station.lon) ** 2 * 101 ** 2
    );
    if (dist_surface < min) {
      min = dist_surface;
      closestStation = station;
    }
  }

  return closestStation ? { ...closestStation } : null;
}

addLocationSelectEvent(localItems, CityItems, CitySel);
addLocationSelectEvent(localItems, TownItems, TownSel);

// 所在地-儲存user選擇的city和town到storage
const SaveSelectedLocationToStorage = (city, town, station) => {
  if (city !== "重慶市" && city !== "南陽州市") {
    const coordinate = constant.REGION[city][town];

    const locationData = {
      city,
      town,
      lat: coordinate.lat,
      lon: coordinate.lon,
    };

    let config = ReadConfig() || { setting: {} };
    config.setting['location'] = locationData;
    config.setting['station'] = JSON.parse(station);
    WriteConfig(config);
  }
};

const StationWrapper = $(".realtime-station");
const StationLocation = StationWrapper.querySelector(".location");
const StationSelWrapper = StationWrapper.querySelector(".select-wrapper");
const StationLocalItems = StationSelWrapper.querySelector(".local");
const StationSel = StationSelWrapper.querySelector(".current-station");
const StationItems = StationSelWrapper.querySelector(".station");

// 即時測站-取得即時測站
async function realtimeStation() {
  try {
    const res = await fetchData(`${API_url()}v1/trem/station`);
    const data = await res.json();

    if (data) {
      processStationData(data);
      RenderStationReg();
    }
  } catch (err) {
    logger.error(`[Fetch] ${err}`);
  }
}

// 即時測站-處理測站數據
function processStationData(data) {
  Object.keys(data).forEach((station) => {
    const info = data[station].info[data[station].info.length - 1];
    const loc =
      region_code_to_string(constant.REGION, info.code) ||
      getFallbackLocation(station);

    if (loc.city && !constant.SETTING.STATION_REGION.includes(loc.city))
      constant.SETTING.STATION_REGION.push(loc.city);

    variable.setting.station.push({
      name: station,
      net: data[station].net,
      loc: loc.city ? `${loc.city}${loc.town}` : loc,
      code: info.code,
      lat: info.lat,
      lon: info.lon,
    });
  });
}

// 即時測站-取得未知站點名稱
function getFallbackLocation(station) {
  return constant.SETTING.LOCALFALLBACK[station] || "未知區域";
}

// 即時測站-渲染測站站點
function RenderStationReg() {
  StationLocalItems.innerHTML = "";

  const uniqueRegions = [
    ...new Set(
      constant.SETTING.STATION_REGION.map((city) => city.slice(0, -1))
    ),
  ];

  const sortedRegion = uniqueRegions.sort();

  sortedRegion.forEach((city) => {
    const cityDiv = CreatEle(city);
    StationLocalItems.appendChild(cityDiv);
  });
}

// 即時測站-點擊縣市選項事件
StationLocalItems.addEventListener("click", handleCityItemClick);

function handleCityItemClick(event) {
  const target = event.target.closest(".realtime-station .select-items > div");
  if (target) {
    StationLocalItems.querySelectorAll("div").forEach((div) =>
      div.classList.remove("select-option-selected")
    );
    target.classList.add("select-option-selected");

    const selectedCity = target.textContent;
    const filteredStations = variable.setting.station.filter((station) =>
      station.loc.includes(selectedCity)
    );
    renderFilteredStations(filteredStations);
  }
}

// 即時測站-篩選對應縣市測站並排序後渲染
function renderFilteredStations(stations) {
  stations.sort((a, b) => a.loc.localeCompare(b.loc));

  StationItems.innerHTML = "";

  stations.forEach((station) => {
    const stationAttr = {
      "data-net": station.net,
      "data-code": station.code,
      "data-name": station.name,
      "data-loc": station.loc,
      "data-lat": station.lat,
      "data-lon": station.lon,
    };
    const stationDiv = CreatEle("", "", "", "", stationAttr);

    const netSpan = createElement("span");
    netSpan.textContent = station.net;
    netSpan.classList = station.net;

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
  ArrowSpan.textContent =
    ArrowSpan.textContent.trim() == "keyboard_arrow_up"
      ? "keyboard_arrow_down"
      : "keyboard_arrow_up";
  StationSelWrapper.classList.toggle("select-show-big");
}

// 即時測站-點擊測站選項事件
StationSelEvent(StationItems);

function StationSelEvent(itemsContainer) {
  itemsContainer.addEventListener("click", (event) => {
    const closestDiv = event.target.closest(
      ".realtime-station .select-items > div"
    );
    if (closestDiv) {
      itemsContainer
        .querySelectorAll("div")
        .forEach((div) => div.classList.remove("select-option-selected"));
      closestDiv.classList.add("select-option-selected");
      const regex = /^(MS-Net|SE-Net)(\d+-\d+.*)$/;
      const match = closestDiv.textContent.match(regex);
      if (match) {
        StationSel.textContent = `${match[1]} ${match[2]}`;
        querySelector(
          ".current-station"
        ).textContent = `${match[1]} ${match[2]}`;
        const stationData = Object.fromEntries(
          ["net", "code", "name", "loc", "lat", "lon"].map((attr) => [
            attr,
            closestDiv.getAttribute(`data-${attr}`),
          ])
        );

        let config = ReadConfig() || { setting: {} };
        config.setting['station'] = stationData;
        WriteConfig(config);
      }
    }
  });
}

const LoginFormContent = $(".login-forms-content");
const AccountInfoContent = $(".usr-account-info-content");
const act = $(".account");
const vip = $(".vip");
const LogoutBtn = $(".logout-btn");
const LoginBack = $(".login-back");

const FormLogin = $("#form-login");
const FormEmail = $("#email");
const FormPassword = $("#password");
const LoginMsg = $(".login_msg");
const url = "https://api.exptech.com.tw/api/v3/et/";

// 登入-切換登入表單和帳號資訊
function toggleForms(isLogin) {
  display([LoginFormContent], isLogin ? "grid" : "none");
  display([AccountInfoContent], isLogin ? "none" : "block");
}

// 登入-跳轉到登入表單
LoginBtn.addEventListener("click", () => {
  toggleForms(1);
  requestAnimationFrame(() => {
    LoginFormContent.classList.add("show-login-form");
    AccountInfoContent.classList.remove("show-account-info");
  });
});

// 登入-返回登入首頁/帳號資訊
LoginBack.addEventListener("click", () => {
  toggleForms(0);
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
  let config = ReadConfig() || { setting: {} };
  const token = config.setting['user-key'];
  await logout(token);
});

// 登入-登入成功畫面
function LoginSuccess(msg) {
  display([LoginBtn]);
  display([LogoutBtn], "flex");
  act.textContent = "Welcome";
  vip.textContent = `VIP-${msg.vip}`;
  LoginBack.dispatchEvent(clickEvent);
}

// 登入-登出成功畫面
function LogoutSuccess() {
  display([LogoutBtn]);
  display([LoginBtn], "flex");
  act.textContent = "尚未登入";
  vip.textContent = "";
  localStorage.removeItem("user-key", "");
  LoginBtn.dispatchEvent(clickEvent);
}

// 登入-登入/登出相關功能
async function handleUserAction(endpoint, options) {
  try {
    const response = await fetch(`${url}${endpoint}`, options);
    const responseData = await response.text();

    const isSuccess = response.ok;
    LoginMsg.classList.remove("success", "error", "shake");
    LoginMsg.classList.add(isSuccess ? "success" : "error");

    if (isSuccess) {
      LoginMsg.textContent = `${options.method == "POST" ? "登入" : "登出"
        }成功！`;

      let config = ReadConfig() || { setting: {} };
      let data = { login: responseData };
      config.setting.login = data.login === "OK" ? "" : data.login || "";
      WriteConfig(config);

      if (endpoint == "login") LoginSuccess(await getUserInfo(responseData));
      if (endpoint == "logout") LogoutSuccess();
    } else if (response.status == 400 || response.status == 401) {
      LoginMsg.textContent = "帳號或密碼錯誤！";
      LoginMsg.classList.add("shake");
    } else {
      LoginMsg.textContent = `伺服器異常(error ${response.status})`;
      LoginMsg.classList.add("shake");
    }

    LoginMsg.addEventListener(
      "animationend",
      () => {
        LoginMsg.classList.remove("shake");
      },
      { once: true }
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

// 登入-表單登入
async function login(email, password) {
  const version = app.getVersion().split("-")[1];
  const requestBody = {
    email,
    pass: password,
    name: `/TREM-Lite/${version}/${os.release()}`,
  };
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  };
  await handleUserAction("login", options);
}

// 登入-表單登出
async function logout(token) {
  const options = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
  };
  await handleUserAction("logout", options);
}

// 登入-取得使用者資訊
async function getUserInfo(token, retryCount = 0) {
  try {
    const response = await fetch(`${url}info`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${token}`,
      },
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`伺服器異常(error ${response.status})`);
    }
  } catch (error) {
    if (retryCount < variable.report.list_retry) {
      logger.error(`[Fetch] ${error} (Try #${retryCount})`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      awaitgetUserInfo(token, retryCount + 1);
    }
  }
}

const clickEvent = new MouseEvent("click", {
  bubbles: 1,
  cancelable: 1,
  view: window,
});

// 預警條件
function initializeSel(type, location, showInt, selectWrapper, items) {
  location.addEventListener("click", () => {
    const ArrowSpan = location.querySelector(".selected-btn");
    ArrowSpan.textContent =
      ArrowSpan.textContent.trim() == "keyboard_arrow_up"
        ? "keyboard_arrow_down"
        : "keyboard_arrow_up";
    selectWrapper.classList.toggle("select-show-big");
  });

  items.addEventListener("click", (event) => {
    const target = event.target.closest(".select-items > div");
    if (target) {
      items
        .querySelectorAll("div")
        .forEach((div) => div.classList.remove("select-option-selected"));
      target.classList.add("select-option-selected");

      const selected = target.textContent;
      showInt.textContent = selected;

      updateLocalStorage(type.className, selected);
    }
  });
}

function updateLocalStorage(typeClassName, selectedValue) {
  let config = ReadConfig() || { setting: {} };
  const data = config.setting['warning'] || {};
  const key = typeClassName.includes("warning-realtime-station")
    ? "realtime-station"
    : "estimate-int";
  data[key] = selectedValue;

  if (typeof config.setting.warning !== 'object' || config.setting.warning === null) config.setting.warning = {};
  config.setting.warning[key] = selectedValue;
  WriteConfig(config);
}

// 預警條件-即時測站
const WRTS = $(".warning-realtime-station");
const WRTSLocation = WRTS.querySelector(".location");
const WRTSShowInt = WRTS.querySelector(".realtime-int");
const WRTSSelWrapper = WRTS.querySelector(".select-wrapper");
const WRTSItems = WRTSSelWrapper.querySelector(".int");

initializeSel(WRTS, WRTSLocation, WRTSShowInt, WRTSSelWrapper, WRTSItems);

// 預警條件-預估震度
const WEI = $(".warning-estimate-int");
const WEILocation = WEI.querySelector(".location");
const WEIShowInt = WEI.querySelector(".estimate-int");
const WEISelWrapper = WEI.querySelector(".select-wrapper");
const WEIItems = WEISelWrapper.querySelector(".int");

initializeSel(WEI, WEILocation, WEIShowInt, WEISelWrapper, WEIItems);

// 渲染震度選項列表
const Ints = querySelectorAll(".select-wrapper .int");
Ints.forEach((Int) => {
  constant.SETTING.INTENSITY.forEach((text) => {
    const intItem = CreatEle(text);
    Int.appendChild(intItem);
  });
});

// 其他功能-設定頁面背景透明度滑塊
const sliderContainer = $(".slider-container");
const sliderTrack = $(".slider-track");
const sliderThumb = $(".slider-thumb");
let isDragging = 0;

sliderThumb.addEventListener("mousedown", () => {
  isDragging = 1;
});

addEventListener("mouseup", () => {
  isDragging = 0;
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

    let config = ReadConfig() || { setting: {} };
    config.setting['bg-percentage'] = percentage;
    config.setting['bg-filter'] = blurValue;
    WriteConfig(config);
  }
});

// 從storage取得user之前保存的選項
const GetSelectedFromStorage = () => {
  let config = ReadConfig() || { setting: {} };

  const locationData = config.setting['location'] || {};
  const warningData = config.setting['warning'] || {};
  sliderThumb.style.left = `${config.setting['bg-percentage']
    ? config.setting['bg-percentage']
    : 100
    }%`;
  sliderTrack.style.width = `${config.setting['bg-percentage']
    ? config.setting['bg-percentage']
    : 100
    }%`;
  SettingWrapper.style.backdropFilter = `blur(${config.setting['bg-filter'] ? config.setting['bg-filter'] : 20
    }px)`;
  return {
    city: locationData.city ? locationData.city : "臺南市",
    town: locationData.town ? locationData.town : "歸仁區",
    station: config.setting['station']
      ? config.setting['station']
      : "未知區域",
    wrts: warningData["realtime-station"]
      ? warningData["realtime-station"]
      : constant.SETTING.INTENSITY[0],
    wei: warningData["estimate-int"]
      ? warningData["estimate-int"]
      : constant.SETTING.INTENSITY[0],
    effect: config.setting['map-display-effect']
      ? config.setting['map-display-effect']
      : "1",
    selectedcheckbox: config.setting['user-checkbox'],
  };
};

// 渲染user之前保存的選項
const RenderSelectedFromStorage = () => {
  const { city, town, station, wrts, wei, effect, selectedcheckbox } =
    GetSelectedFromStorage();
  const current_station = $(".current-station");
  let config = ReadConfig() || { setting: {} };

  querySelector(".current-city").textContent = city;
  querySelector(".current-town").textContent = town;
  querySelector(".realtime-int").textContent = wrts;
  querySelector(".estimate-int").textContent = wei;

  if (station && station !== "null") {
    const stationData = config.setting['station'];
    if (stationData) current_station.textContent = `${stationData.net} ${stationData.code}-${stationData.name} ${stationData.loc}`;
  } else current_station.textContent = "未知區域";

  const keys = Object.keys(constant.SETTING.MAP_DISPLAY);
  const effect_text = keys[effect - 1] || "unknown";
  querySelector(".current-effect").textContent = effect_text;

  /** 選中check box**/
  const checkboxes = querySelectorAll(".switch input[type='checkbox']");
  const SelectedCheckBoxes = selectedcheckbox || {};
  checkboxes.forEach((checkbox) => {
    const id = checkbox.id;
    if (SelectedCheckBoxes[id]) checkbox.checked = 1;
    else checkbox.checked = 0;
  });
};

// 渲染user之前保存的選項
addEventListener("DOMContentLoaded", RenderSelectedFromStorage);

const MapDisplayEff = $(".map-display-effect");
const MapDisplayEffSel = MapDisplayEff.querySelector(".current-effect");
const MapDisplayEffLocation = MapDisplayEff.querySelector(".location");
const MapDisplayEffSelWrapper = MapDisplayEff.querySelector(".select-wrapper");
const MapDisplayEffItems = MapDisplayEffSelWrapper.querySelector(".effect");

if (MapDisplayEffItems)
  for (const [text, value] of Object.entries(constant.SETTING.MAP_DISPLAY)) {
    const intItem = CreatEle(text, "", "", "", { "data-value": value });
    MapDisplayEffItems.appendChild(intItem);
  }

const addMapDisplayEffSelEvent = (container, selectElement) => {
  container.addEventListener("click", (event) => {
    const closestDiv = event.target.closest(
      ".usr-location .select-items > div"
    );
    if (closestDiv) {
      selectElement.textContent = closestDiv.textContent;
      container
        .querySelectorAll("div")
        .forEach((div) => div.classList.remove("select-option-selected"));
      closestDiv.classList.add("select-option-selected");
    }
  });
};

MapDisplayEffLocation.addEventListener("click", function () {
  const ArrowSpan = this.querySelector(".selected-btn");
  ArrowSpan.textContent =
    ArrowSpan.textContent.trim() == "keyboard_arrow_up"
      ? "keyboard_arrow_down"
      : "keyboard_arrow_up";
  MapDisplayEffSelWrapper.classList.toggle("select-show-big");
});

MapDisplayEffItems.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(
    ".map-display-effect .select-items > div"
  );
  if (closestDiv) {
    MapDisplayEffSel.textContent = closestDiv.textContent;
    MapDisplayEffSelWrapper.querySelectorAll("div").forEach((div) =>
      div.classList.remove("select-option-selected")
    );
    closestDiv.classList.toggle("select-option-selected");

    let config = ReadConfig() || { setting: {} };
    config.setting['map-display-effect'] = closestDiv.dataset.value;
    WriteConfig(config);
  }
});

addMapDisplayEffSelEvent(MapDisplayEffItems, MapDisplayEffSel);

const Tos = $(".tos");
const Tos_Sure = $(".tos_sure");

if (!ReadConfig().setting['tos']) {
  display([Tos], "flex");
  setTimeout(() => {
    const tosWrapper = $(".tos_wrapper");
    tosWrapper.style.height = "19em";
    opacity([tosWrapper], 1);
  }, 2500);
}

Tos_Sure.addEventListener("click", () => {
  opacity([Tos], 0);
  setTimeout(() => {
    display([Tos]);

    let config = ReadConfig() || { setting: {} };
    config.setting['tos'] = 1;
    WriteConfig(config);
  }, 2000);
});

/** 滑條選中**/
const checkboxes = querySelectorAll(".switch input[type='checkbox']");
const updateCheckboxesLocalStorage = () => {
  const selectedCheckbox = Array.from(checkboxes).reduce((acc, cb) => {
    acc[cb.id] = cb.checked ? 1 : 0;
    return acc;
  }, {});

  let config = ReadConfig() || { setting: {} };
  config.setting['user-checkbox'] = selectedCheckbox;
  WriteConfig(config);
};

checkboxes.forEach((checkbox) =>
  checkbox.addEventListener("change", updateCheckboxesLocalStorage)
);

/** 檢查新版本**/
const app_version = app.getVersion();

async function checkForNewRelease() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/ExpTechTW/TREM-Lite/releases"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const releases = await response.json();
    if (releases.length > 0) {
      const latestRelease = releases[0];
      const latestVersion = latestRelease.tag_name;

      const comparisonResult = compareVersions(latestVersion, app_version);

      if (comparisonResult === 1) {
        NewVersion.style.color = "#fff900";
        AppVersion.classList.toggle("new");
      }
    }
  } catch (error) {
    console.error("Failed to fetch release information:", error);
  }
}

function compareVersions(last, current) {
  let lst = last.replace("v", "");

  NewVersion.textContent = lst;
  CurrentVersion.textContent = current;

  if (last.includes('-')) lst = lst.split('-')[0];
  const curr = current.split("-")[0];
  const parts1 = lst.split(".").map(Number);
  const parts2 = curr.split(".").map(Number);

  const length = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < length; i++) {
    AppVersion.style.display = 'flex';
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    if (part1 > part2) {
      return 1;
    } else if (part1 < part2) {
      return -1;
    } else {
      AppVersion.style.display = 'none';
    }
  }
  return 0;
}
checkForNewRelease();

setInterval(() => {
  checkForNewRelease();
}, 3600_000);
