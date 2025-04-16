import { VL_COOKIE_NAME } from './constants';
import { initOnMessageHandler } from './onMessageHandler';
import {VisualLabeler} from "./VisualLabeler";
import {CookiesStorage} from "./CookieStorage";

const initVLIfCookieIsPresent = () => {
  const storage = new CookiesStorage();
  const isNotIframe = window.top === window.self;
  if (isNotIframe && storage.getItem(VL_COOKIE_NAME)) {
    VisualLabeler.getInstance().initialize();
  }
};

initOnMessageHandler();
initVLIfCookieIsPresent();
