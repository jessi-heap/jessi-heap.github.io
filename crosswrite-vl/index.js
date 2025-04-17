var DUMMY_COOKIE_TIMEOUT = 150000;
var CookiesStorage = /** @class */ (function () {
    function CookiesStorage() {
        var _this = this;
        this._findHighestLevelDomain = function () {
            var highestLevelDomain = '';
            // :TRICKY: If something goes wrong in this procedure (maybe the browser crashes
            // in the middle), it's possible to end up leaving the 'hld' cookie behind.
            // Most of the time this shouldn't matter, but in some edge cases in which an
            // envId has restrictions on setting cookies on subdomains it might.
            // So we generate a unique hld cookie identifier each time.
            var domain = window.location.hostname || 'localhost';
            var dummyCookieValue = 'hld' + Math.floor(Math.random() * 1000000000000000);
            var dummyCookieName = "_hp2_".concat(dummyCookieValue);
            var domainParts = domain.split('.');
            for (var i = domainParts.length - 1; i >= 0; i--) {
                if (_this.getItem(dummyCookieName) !== dummyCookieValue) {
                    highestLevelDomain = domainParts.slice(i, domainParts.length).join('.');
                    _this.setItem(dummyCookieName, dummyCookieValue, {
                        expires: DUMMY_COOKIE_TIMEOUT,
                        domain: highestLevelDomain,
                    }); // set expiration of 2 minutes
                }
            }
            // Clear the dummy cookie by setting an expiry date in the past.
            _this.setItem(dummyCookieName, dummyCookieValue, { expires: -1, domain: highestLevelDomain });
            // If the domain contains no separators (i.e. is only one part),
            // then it's almost certainly localhost. And if the domain contains
            // no letters, then it's almost certainly an IP.
            // In either case, don't specify a default cookie domain.
            var isProbablyIP = !highestLevelDomain.match(/[a-zA-Z]/);
            var isProbablyLocalhost = highestLevelDomain.indexOf('.') < 0;
            if (isProbablyIP || isProbablyLocalhost) {
                highestLevelDomain = null;
            }
            return highestLevelDomain;
        };
        this.setItem = function (name, value, opts) {
            if (opts === void 0) { opts = {}; }
            var cookieText = "".concat(encodeURIComponent(name), "=").concat(encodeURIComponent(value));
            var domain;
            var pathIsSet = false;
            if (!opts || !opts.domain) {
                domain = _this._findHighestLevelDomain();
            }
            if (opts) {
                Object.keys(opts).map(function (key) {
                    var value = opts[key];
                    if (key === 'expires') {
                        var now = new Date();
                        var expiry = now.getTime() + +opts.expires;
                        now.setTime(expiry);
                        value = now.toUTCString();
                    }
                    if (value) {
                        cookieText += "; ".concat(key, "=").concat(value);
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
                cookieText += "; domain=.".concat(domain);
            }
            document.cookie = cookieText;
        };
        this.getAllCookiesMatching = function (cookieName, matchString) {
            var cookiePattern = new RegExp('(^|;)[ ]*' + cookieName + '=([^;]*)', 'g');
            var matches = [];
            var matchOption = cookiePattern.exec(matchString);
            while (matchOption) {
                matches.push(decodeURIComponent(matchOption[2]));
                matchOption = cookiePattern.exec(matchString);
            }
            return matches;
        };
        this.getItem = function (key) {
            var cookieMatches = _this.getAllCookiesMatching(key, document.cookie);
            var cookieMatch = cookieMatches[0];
            // There shouldn't be multiple matches, but sometimes there are,
            // presumably due to (probably incorrectly) placed subdomain cookies.
            // In this case we should go to the effort of finding the correct
            // cookie that we'll eventually write to with setCookie - that is,
            // we should find the cookie associated with the current highestleveldomain.
            // If we don't know a highestleveldomain yet, then just default to the
            // previous behavior.
            if (cookieMatches.length > 1) {
                _this.setItem(key, 'delete', { expires: -1 });
                var cookieMatchesWithoutHLD_1 = _this.getAllCookiesMatching(key, document.cookie);
                var deletedCookies = cookieMatches.filter(function (x) { return !cookieMatchesWithoutHLD_1.includes(x); });
                if (deletedCookies.length > 0) {
                    cookieMatch = deletedCookies[0];
                }
                if (cookieMatch) {
                    _this.setItem(key, cookieMatch);
                }
            }
            return cookieMatch !== null && cookieMatch !== void 0 ? cookieMatch : null;
        };
    }
    return CookiesStorage;
}());
// Cookie name for keeping VED overlay
var VL_COOKIE_NAME = '_hp_ved';
// Life of the Visual Labeler cookie
var VL_COOKIE_EXPIRATION_IN_MS = 1800000; // 30 minutes
// URL for the Heap dashboard
var HEAP_WEB_APP_URI = 'https://heapanalytics.com';
// VL JS URL
var VL_JS_URL = 'https://heapanalytics.com/js/ved.js';
// VED CSS URL
var VL_CSS_URL = 'https://heapanalytics.com/css/ved.css';
// VL CSS Generated from JS import statements
var VL_CSS_FOR_JS_URL = 'https://heapanalytics.com/js/ved.css';
var VisualLabelerStatus;
(function (VisualLabelerStatus) {
    VisualLabelerStatus["ReceivedInitMessage"] = "received_init_message";
    VisualLabelerStatus["PreFetchMetadata"] = "pre_fetch_metadata";
    VisualLabelerStatus["PostFetchMetadata"] = "post_fetch_metadata";
})(VisualLabelerStatus || (VisualLabelerStatus = {}));
/*
 * The VL gets initiated via postMessage events from the heapanalytics.com domain.
 */
var postMessageHandler = function (event) {
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
var sendReceivedInitMessageTo = function (source) {
    console.log('sent message received to', source);
    source.postMessage({
        type: 'status',
        value: VisualLabelerStatus.ReceivedInitMessage,
    }, { targetOrigin: '*' });
};
var initOnMessageHandler = function () {
    console.log('initializing handler');
    window.addEventListener('message', postMessageHandler);
};
var VisualLabeler = /** @class */ (function () {
    function VisualLabeler() {
        this._hasInitialized = false;
        this._storage = new CookiesStorage();
    }
    VisualLabeler.getInstance = function () {
        if (!VisualLabeler.instance) {
            VisualLabeler.instance = new VisualLabeler();
        }
        return VisualLabeler.instance;
    };
    VisualLabeler.prototype._loadVLScript = function () {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = VL_JS_URL;
        document.head.appendChild(script);
    };
    VisualLabeler.prototype._loadVLStyles = function () {
        var stylesToLoad = [VL_CSS_URL, VL_CSS_FOR_JS_URL];
        stylesToLoad.forEach(function (stylesheet) {
            var style = document.createElement('link');
            style.rel = 'stylesheet';
            style.href = stylesheet;
            document.head.appendChild(style);
        });
    };
    /**
     * This cookie is set when the VL is first initiated, and its presence auto-starts the VL on this page for the next 30 minutes.
     */
    VisualLabeler.prototype._setVLCookie = function () {
        this._storage.setItem(VL_COOKIE_NAME, 'on', {
            expires: VL_COOKIE_EXPIRATION_IN_MS,
        });
        console.log('set cookie');
    };
    VisualLabeler.prototype._getVLCookie = function () {
        return this._storage.getItem(VL_COOKIE_NAME);
    };
    /**
     * @param {MessageEvent} event
     * @description Transport custom API calls into heapV for use in Heap VL
     */
    VisualLabeler.prototype._initializeHeapV = function (event) {
        window.heapV = Object.assign({}, {
            source: event === null || event === void 0 ? void 0 : event.source,
            uri: HEAP_WEB_APP_URI,
            loadArgs: event === null || event === void 0 ? void 0 : event.data.args,
            identify: console.log('called window.heapV.identify'),
            track: console.log('called window.heapV.track'),
        });
    };
    /*
     * Initiate the event visualizer and load corresponding assets.
     */
    VisualLabeler.prototype.initialize = function (event) {
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
    };
    return VisualLabeler;
}());
var initVLIfCookieIsPresent = function () {
    var storage = new CookiesStorage();
    var isNotIframe = window.top === window.self;
    if (isNotIframe && storage.getItem(VL_COOKIE_NAME)) {
        VisualLabeler.getInstance().initialize();
    }
};
initOnMessageHandler();
initVLIfCookieIsPresent();
