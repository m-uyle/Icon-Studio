import { mountStudioPage } from "../pages/studio/index.js";
import { createAppStore } from "./model/store.js";

function bootstrap() {
  const appRoot = document.querySelector("#app") || document.body;
  const store = createAppStore();
  return mountStudioPage(appRoot, {
    getState: store.getState,
    setState: store.setState,
    subscribe: store.subscribe,
    notify: store.notify,
    resetState: store.resetSettings,
  });
}

function registerServiceWorker() {
  if (
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator) ||
    typeof window === "undefined"
  ) {
    return;
  }
  const isSecure =
    window.isSecureContext ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";
  if (!isSecure) {
    return;
  }

  const runRegister = () => {
    navigator.serviceWorker
      .register("./sw.js", { scope: "./" })
      .catch(() => {});
  };

  if (document.readyState === "complete") {
    runRegister();
  } else {
    window.addEventListener("load", runRegister, { once: true });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
  bootstrap();
}

registerServiceWorker();
