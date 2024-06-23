/* eslint-disable no-undef */
const Nav_btns = querySelectorAll(".nav-btn");
const Home_btn = $("#nav-home");
const Report_btn = $("#nav-report-panel");
const Tsunami_btn = $("#nav-tsunami-panel");
const Warning_msg = $(".warning-message");
const TsunamiInfoBox = $(".tsunami-info-box");
const TsunamiReport = $(".tsunami-report-container");

let toHomeTimeout = null;

Home_btn.addEventListener("click", (event) => {
  if (toHomeTimeout) {
    clearTimeout(toHomeTimeout);
    toHomeTimeout = null;
  }
  const closestDiv = event.target.closest(".nav-btn");
  toHome(closestDiv);
});

// Report_btn.addEventListener("click", (event) => {
//   if (Object.keys(variable.eew_list).length) return;

//   const closestDiv = event.target.closest(".nav-btn");
//   removeOnClass(closestDiv);

//   if (toHomeTimeout) clearTimeout(toHomeTimeout);

//   toHomeTimeout = setTimeout(() => {
//     toHome(Home_btn);
//     toHomeTimeout = null;
//   }, 10000);
//   console.log("report");
// });

// Tsunami_btn.addEventListener("click", (event) => {
//   const closestDiv = event.target.closest(".nav-btn");
//   removeOnClass(closestDiv);
//   display([ReportBoxWrapper, ReportListWrapper, InfoBox, RTS_List]);
//   display([Warning_msg, TsunamiReport, TsunamiInfoBox], "flex");

//   if (toHomeTimeout) clearTimeout(toHomeTimeout);

//   toHomeTimeout = setTimeout(() => {
//     toHome(Home_btn);
//     toHomeTimeout = null;
//   }, 10000);
// });

function removeOnClass(element) {
  Nav_btns.forEach(btn => btn.classList.remove("on"));
  element.classList.add("on");
}

function toHome(element) {
  if (element) removeOnClass(element);
  if (Object.keys(variable.eew_list).length) display([RTS_List], "flex");
  display([ReportListWrapper, InfoBox], "flex");
  display([Warning_msg, TsunamiReport, TsunamiInfoBox, SettingWrapper, ReportBoxWrapper]);
  opacity([ReportListWrapper], 1);
  opacity([SettingWrapper, ReportBoxWrapper], 0);
}
