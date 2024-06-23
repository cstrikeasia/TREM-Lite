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

function ReadConfig() {
  try {
    config = yaml.load(fs.readFileSync("config.yaml", "utf8"));
    return config;
  } catch (e) {
    console.log(e);
  }
}

function WriteConfig(data) {
  let yamlStr = yaml.dump(data);
  fs.writeFileSync("config.yaml", yamlStr, "utf8");
}

function config_init() {
  let config = ReadConfig();

  if (!config) {
    config = {
      setting: {}
    };
    WriteConfig(config);
  } else if (!config.setting) {
    config.setting = {};
    WriteConfig(config);
  }
}
config_init();