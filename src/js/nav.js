/* eslint-disable no-undef */
const Nav_btns = document.querySelectorAll(".nav-btn");
const Home_btn = document.querySelector("#nav-home");
const Report_btn = document.querySelector("#nav-report-panel");
const Tsunami_btn = document.querySelector("#nav-tsunami-panel");
const Warning_msg = document.querySelector(".warning-message");
const TsunamiInfoBox = document.querySelector(".tsunami-info-box");
const TsunamiReport = document.querySelector(".tsunami-report-container");

function removeOnClass() {
  Nav_btns.forEach(btn => btn.classList.remove("on"));
}

Home_btn.addEventListener("click", (event) => {
  removeOnClass();
  const closestDiv = event.target.closest(".nav-btn");
  closestDiv.classList.add("on");
  show_element([ReportListWrapper, InfoBox], "flex");
  hidden_element([Warning_msg, TsunamiReport, TsunamiInfoBox]);
  opacity([ReportListWrapper], 1);
});

// Report_btn.addEventListener("click", (event) => {
//   const _eew_list = Object.keys(variable.eew_list);

//   if (_eew_list.length) return;

//   removeOnClass();
//   const closestDiv = event.target.closest(".nav-btn");
//   closestDiv.classList.add("on");
//   hidden_element([ReportBoxWrapper, ReportListWrapper, InfoBox]);
//   show_element([ReportListWrapper], "flex");
// });

Tsunami_btn.addEventListener("click", (event) => {
  const _eew_list = Object.keys(variable.eew_list);

  if (_eew_list.length) return;

  removeOnClass();
  const closestDiv = event.target.closest(".nav-btn");
  closestDiv.classList.add("on");
  hidden_element([ReportBoxWrapper, ReportListWrapper, InfoBox]);
  show_element([Warning_msg, TsunamiReport, TsunamiInfoBox], "flex");
});