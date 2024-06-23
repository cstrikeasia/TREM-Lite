/* eslint-disable no-undef */
const doc_time = $("#time");

const speech = new Speech.default();
(async () => {
  await speech.init();
  speech.setLanguage("zh-TW");
  speech.setVoice("Microsoft Yating - Chinese (Traditional, Taiwan)");
  //   speech.setLanguage("ja-JP");
  //   speech.setVoice("Microsoft Sayaka - Japanese (Japan)");
  speech.setRate(1.5);
  // variable.speech_status = 1;
})();