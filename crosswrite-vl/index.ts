const DUMMY_COOKIE_TIMEOUT = 150000;

class CookiesStorage {
  _findHighestLevelDomain = () => {
    let highestLevelDomain: string | null = '';

    // :TRICKY: If something goes wrong in this procedure (maybe the browser crashes
    // in the middle), it's possible to end up leaving the 'hld' cookie behind.
    // Most of the time this shouldn't matter, but in some edge cases in which an
    // envId has restrictions on setting cookies on subdomains it might.
    // So we generate a unique hld cookie identifier each time.
    const domain = window.location.hostname || 'localhost';
    const dummyCookieValue = 'hld' + Math.floor(Math.random() * 1000000000000000);
    const dummyCookieName = `_hp2_${dummyCookieValue}`;
    const domainParts = domain.split('.');
    for (let i = domainParts.length - 1; i >= 0; i--) {
      if (this.getItem(dummyCookieName) !== dummyCookieValue) {
        highestLevelDomain = domainParts.slice(i, domainParts.length).join('.');
        this.setItem(dummyCookieName, dummyCookieValue, {
          expires: DUMMY_COOKIE_TIMEOUT,
          domain: highestLevelDomain,
        }); // set expiration of 2 minutes
      }
    }

    // Clear the dummy cookie by setting an expiry date in the past.
    this.setItem(dummyCookieName, dummyCookieValue, { expires: -1, domain: highestLevelDomain });

    // If the domain contains no separators (i.e. is only one part),
    // then it's almost certainly localhost. And if the domain contains
    // no letters, then it's almost certainly an IP.
    // In either case, don't specify a default cookie domain.
    const isProbablyIP = !highestLevelDomain.match(/[a-zA-Z]/);
    const isProbablyLocalhost = highestLevelDomain.indexOf('.') < 0;
    if (isProbablyIP || isProbablyLocalhost) {
      highestLevelDomain = null;
    }

    return highestLevelDomain;
  };

  setItem = (name: string, value: string, opts: Record<string, any> = {}) => {
    let cookieText = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    let domain;
    let pathIsSet = false;

    if (!opts || !opts.domain) {
      domain = this._findHighestLevelDomain();
    }

    if (opts) {
      Object.keys(opts).map((key) => {
        let value = opts[key];
        if (key === 'expires') {
          const now = new Date();
          const expiry = now.getTime() + +opts.expires;
          now.setTime(expiry);
          value = now.toUTCString();
        }
        if (value) {
          cookieText += `; ${key}=${value}`;
        }
        if (key === 'path') {
          pathIsSet = true;
        }
        if (key === 'domain') {
          domain = value;
        }
      });
    }
    if (!pathIsSet) {
      cookieText += '; path=/';
    }

    if (domain) {
      cookieText += `; domain=.${domain}`;
    }


    document.cookie = cookieText;
  };

  getAllCookiesMatching = (cookieName: string, matchString: string): Array<string> => {
    const cookiePattern = new RegExp('(^|;)[ ]*' + cookieName + '=([^;]*)', 'g');
    const matches: Array<string> = [];
    let matchOption = cookiePattern.exec(matchString);
    while (matchOption) {
      matches.push(decodeURIComponent(matchOption[2]));
      matchOption = cookiePattern.exec(matchString);
    }
    return matches;
  };

  getItem = (key: string) => {
    const cookieMatches = this.getAllCookiesMatching(key, document.cookie);
    let cookieMatch = cookieMatches[0];

    // There shouldn't be multiple matches, but sometimes there are,
    // presumably due to (probably incorrectly) placed subdomain cookies.
    // In this case we should go to the effort of finding the correct
    // cookie that we'll eventually write to with setCookie - that is,
    // we should find the cookie associated with the current highestleveldomain.
    // If we don't know a highestleveldomain yet, then just default to the
    // previous behavior.
    if (cookieMatches.length > 1) {
      this.setItem(key, 'delete', { expires: -1 });
      const cookieMatchesWithoutHLD = this.getAllCookiesMatching(key, document.cookie);
      const deletedCookies = cookieMatches.filter((x) => !cookieMatchesWithoutHLD.includes(x));
      if (deletedCookies.length > 0) {
        cookieMatch = deletedCookies[0];
      }
      if (cookieMatch) {
        this.setItem(key, cookieMatch);
      }
    }

    return cookieMatch ?? null;
  };
}

// Cookie name for keeping VED overlay
const VL_COOKIE_NAME = '_hp_ved';
// Life of the Visual Labeler cookie
const VL_COOKIE_EXPIRATION_IN_MS = 1800000; // 30 minutes
// URL for the Heap dashboard
 const HEAP_WEB_APP_URI = 'https://heapanalytics.com';
// VL JS URL
 const VL_JS_URL = 'https://heapanalytics.com/js/ved.js';
// VED CSS URL
 const VL_CSS_URL = 'https://heapanalytics.com/css/ved.css';
// VL CSS Generated from JS import statements
 const VL_CSS_FOR_JS_URL = 'https://heapanalytics.com/js/ved.css';

 enum VisualLabelerStatus {
  ReceivedInitMessage = 'received_init_message',
  PreFetchMetadata = 'pre_fetch_metadata',
  PostFetchMetadata = 'post_fetch_metadata',
}

/*
 * The VL gets initiated via postMessage events from the heapanalytics.com domain.
 */
const postMessageHandler = (event: MessageEvent) => {

  if (event.origin !== HEAP_WEB_APP_URI) {
    return;
  }
    console.log('received message ', event);
  if (typeof event.data !== 'object') {
    return;
  }

  if (event.data.message !== 'init') {
    return;
  }

  if (!event.source) {
    return;
  }

  sendReceivedInitMessageTo(event.source);

  VisualLabeler.getInstance().initialize(event);
};

const sendReceivedInitMessageTo = (source: MessageEventSource) => {
  console.log('sent message received to', source);
  source.postMessage(
      {
        type: 'status',
        value: VisualLabelerStatus.ReceivedInitMessage,
      },
      { targetOrigin: '*' },
  );
};

 const initOnMessageHandler = () => {
  console.log('initializing handler');
  window.addEventListener('message', postMessageHandler);
};

 class VisualLabeler {
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
    script.src = VL_JS_URL;
    document.head.appendChild(script);
  }

  _loadVLStyles() {
    const stylesToLoad = [VL_CSS_URL, VL_CSS_FOR_JS_URL];
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
    this._storage.setItem(VL_COOKIE_NAME, 'on', {
      expires: VL_COOKIE_EXPIRATION_IN_MS,
    });
      console.log('set cookie');
  }

  _getVLCookie() {
    return this._storage.getItem(VL_COOKIE_NAME);
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
          uri: HEAP_WEB_APP_URI,
          loadArgs: event?.data.args,
            identify: ()=> {console.log('called window.heapV.identify')},
            track: () => {console.log('called window.heapV.track')},
        },
    );
  }

  /*
   * Initiate the event visualizer and load corresponding assets.
   */
  initialize(event?: MessageEvent) {
    if (this._hasInitialized) {
        console.log('vl already initialized ');
      return;
    }
    this._hasInitialized = true;
    this._setVLCookie();

    this._initializeHeapV(event);

    if (!window.heapV) {
      console.log('window.heapV not found, aborting');
      return;
    }

    this._loadVLScript();
    this._loadVLStyles();
      console.log('initialized vl');

  }
}


const initVLIfCookieIsPresent = () => {
  const storage = new CookiesStorage();
  const isNotIframe = window.top === window.self;
  if (isNotIframe && storage.getItem(VL_COOKIE_NAME)) {
    VisualLabeler.getInstance().initialize();
  }
};

initOnMessageHandler();
initVLIfCookieIsPresent();
