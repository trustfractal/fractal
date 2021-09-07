import AppStore from "@redux/stores/application";

import appActions from "@redux/stores/application/reducers/app";

import ContentScriptConnection from "@background/connection";

import environment from "@environment/index";

// remove logs on prod
if (!environment.IS_DEV) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

const migrateData = () => {};

(async () => {
  ContentScriptConnection.init();
  (await AppStore.init()).dispatch(appActions.startup());

  // Listen to extension install/update event
  chrome.runtime.onInstalled.addListener(
    (details: chrome.runtime.InstalledDetails) => {
      const { reason, previousVersion } = details;

      // check if the reason is an update
      if (reason === "update") {
        // check if previous version is lower than 0.1.0
        const [major, minor, patch] = previousVersion!.split(".");

        if (Number.parseInt(major) > 0) {
          return;
        }

        if (Number.parseInt(minor) > 3) {
          return;
        }

        if (Number.parseInt(patch) > 7) {
          return;
        }

        // Run data migration for versions < 0.3.7
        migrateData();
      }
    },
  );
})();
