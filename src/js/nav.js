/* eslint-disable no-undef */
const Nav_btns = document.querySelectorAll(".nav-btn");
const Home_btn = document.querySelector("#nav-home");
const Report_btn = document.querySelector("#nav-report-panel");
const Tsunami_btn = document.querySelector("#nav-tsunami-panel");
const Warning_msg = document.querySelector(".warning-message");
const TsunamiInfoBox = document.querySelector(".tsunami-info-box");
const TsunamiReport = document.querySelector(".tsunami-report-container");

Home_btn.addEventListener("click", (event) => {
  const closestDiv = event.target.closest(".nav-btn");
  toHome(closestDiv);
});

Report_btn.addEventListener("click", (event) => {
  const _eew_list = Object.keys(variable.eew_list);
  if (_eew_list.length) return;

  const closestDiv = event.target.closest(".nav-btn");
  removeOnClass(closestDiv);
  console.log("report");
});

Tsunami_btn.addEventListener("click", (event) => {
  const _eew_list = Object.keys(variable.eew_list);
  if (_eew_list.length) return;

  const closestDiv = event.target.closest(".nav-btn");
  removeOnClass(closestDiv);
  show_element([ReportBoxWrapper, ReportListWrapper, InfoBox]);
  show_element([Warning_msg, TsunamiReport, TsunamiInfoBox], "flex");
});

function removeOnClass(element) {
  Nav_btns.forEach(btn => btn.classList.remove("on"));
  element.classList.add("on");
}

function toHome(element) {
  if (element) removeOnClass(element);
  show_element([ReportListWrapper, InfoBox], "flex");
  show_element([Warning_msg, TsunamiReport, TsunamiInfoBox, SettingWrapper]);
  opacity([ReportListWrapper], 1);
  opacity([SettingWrapper], 0);
}