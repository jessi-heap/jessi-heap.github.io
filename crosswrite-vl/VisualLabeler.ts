import * as constants from './constants';
import {CookiesStorage} from "./CookieStorage";

export class VisualLabeler {
  private static instance: VisualLabeler;
  private _hasInitialized = false;
  private _storage: CookiesStorage;

  constructor() {
    this._storage = new CookiesStorage();
  }

  static getInstance(): VisualLabeler {
    if (!VisualLabeler.instance) {
      VisualLabeler.instance = new VisualLabeler();
    }
    return VisualLabeler.instance;
  }

  _loadVLScript() {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = constants.VL_JS_URL;
    document.head.appendChild(script);
  }

  _loadVLStyles() {
    const stylesToLoad = [constants.VL_CSS_URL, constants.VL_CSS_FOR_JS_URL];
    stylesToLoad.forEach((stylesheet) => {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = stylesheet;
      document.head.appendChild(style);
    });
  }

  /**
   * This cookie is set when the VL is first initiated, and its presence auto-starts the VL on this page for the next 30 minutes.
   */
  _setVLCookie() {
    this._storage.setItem(constants.VL_COOKIE_NAME, 'on', {
      expires: constants.VL_COOKIE_EXPIRATION_IN_MS,
    });
  }

  _getVLCookie() {
    return this._storage.getItem(constants.VL_COOKIE_NAME);
  }

  /**
   * @param {MessageEvent} event
   * @description Transport custom API calls into heapV for use in Heap VL
   */
  _initializeHeapV(event?: MessageEvent) {
    window.heapV = Object.assign(
      {},
      {
        source: event?.source,
        uri: constants.HEAP_WEB_APP_URI,
        loadArgs: event?.data.args,
      },
    );
  }

  /*
   * Initiate the event visualizer and load corresponding assets.
   */
  initialize(event?: MessageEvent) {
    if (this._hasInitialized) {
      return;
    }
    this._hasInitialized = true;

    this._setVLCookie();

    this._initializeHeapV(event);

    if (!window.heapV) {
      return;
    }

    this._loadVLScript();
    this._loadVLStyles();
  }
}
