/* eslint-disable no-undef */
load_plugin();
function load_plugin() {
	const Path = path.join(app.getAppPath(), "./plugins/");
	const plugin_list = storage.getItem("plugin_list") ?? [];
	const plugin_info = {
		trem: {
			version: app.getVersion(),
		},
	};

	for (const i of plugin_list)
		try {
			if (fs.existsSync(Path + i + "/index.js")) {
				const f = reload(Path + i + "/index.js");
				const info = JSON.parse(fs.readFileSync(Path + i + "/trem.json").toString());
				const config = JSON.parse(fs.readFileSync(Path + i + "/config.json").toString());

				if (ver_string_to_int(app.getVersion()) < ver_string_to_int(info.dependencies?.trem ?? "0.0.0")) {
					log(`Plugin failed to load (${i})`, 2, "plugin", "load_plugin");
				} else {
					log(`Plugin loaded successfully (${i})`, 1, "plugin", "load_plugin");
					if (typeof f.start == "function") f.start();
				}

				plugin_info[i] = {
					f,
					version      : info.version ?? "0.0.0",
					description  : info.description ?? "作者未添加說明",
					author       : info.author ?? ["TREM"],
					dependencies : info.dependencies ?? {},
					link         : info.link ?? "https://github.com/ExpTechTW/TREM-Lite",
					config,
				};
			} else {
				log(`Plugin file not found (${i})`, 2, "plugin", "load_plugin");
			}
		} catch (err) {
			log(`Unable to load plugin (${i}) >> ${err}`, 3, "plugin", "load_plugin");
		}

	plugin.emit("loaded", plugin_info);
}