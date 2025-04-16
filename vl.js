System.register("constants", [], function (exports_1, context_1) {
    "use strict";
    var VL_COOKIE_NAME, VL_COOKIE_EXPIRATION_IN_MS, HEAP_WEB_APP_URI, VL_JS_URL, VL_CSS_URL, VL_CSS_FOR_JS_URL, VisualLabelerStatus;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            // Cookie name for keeping VED overlay
            exports_1("VL_COOKIE_NAME", VL_COOKIE_NAME = '_hp_ved');
            // Life of the Visual Labeler cookie
            exports_1("VL_COOKIE_EXPIRATION_IN_MS", VL_COOKIE_EXPIRATION_IN_MS = 1800000); // 30 minutes
            // URL for the Heap dashboard
            exports_1("HEAP_WEB_APP_URI", HEAP_WEB_APP_URI = 'https://heapanalytics.com');
            // VL JS URL
            exports_1("VL_JS_URL", VL_JS_URL = 'https://heapanalytics.com/js/ved.js');
            // VED CSS URL
            exports_1("VL_CSS_URL", VL_CSS_URL = 'https://heapanalytics.com/css/ved.css');
            // VL CSS Generated from JS import statements
            exports_1("VL_CSS_FOR_JS_URL", VL_CSS_FOR_JS_URL = 'https://heapanalytics.com/js/ved.css');
            (function (VisualLabelerStatus) {
                VisualLabelerStatus["ReceivedInitMessage"] = "received_init_message";
                VisualLabelerStatus["PreFetchMetadata"] = "pre_fetch_metadata";
                VisualLabelerStatus["PostFetchMetadata"] = "post_fetch_metadata";
            })(VisualLabelerStatus || (exports_1("VisualLabelerStatus", VisualLabelerStatus = {})));
        }
    };
});
System.register("CookieStorage", [], function (exports_2, context_2) {
    "use strict";
    var DUMMY_COOKIE_TIMEOUT, CookiesStorage;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            DUMMY_COOKIE_TIMEOUT = 150000;
            CookiesStorage = /** @class */ (function () {
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
                    this.hasExpired = function (expiry) {
                        var now = new Date();
                        if (now >= expiry) {
                            return true;
                        }
                        return false;
                    };
                    this.removeItem = function (name) {
                        _this.setItem(name, '', { expires: '-60000' });
                    };
                }
                return CookiesStorage;
            }());
            exports_2("CookiesStorage", CookiesStorage);
        }
    };
});
System.register("VisualLabeler", ["constants", "CookieStorage"], function (exports_3, context_3) {
    "use strict";
    var constants, CookieStorage_1, VisualLabeler;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (constants_1) {
                constants = constants_1;
            },
            function (CookieStorage_1_1) {
                CookieStorage_1 = CookieStorage_1_1;
            }
        ],
        execute: function () {
            VisualLabeler = /** @class */ (function () {
                function VisualLabeler() {
                    this._hasInitialized = false;
                    this._storage = new CookieStorage_1.CookiesStorage();
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
                    script.src = constants.VL_JS_URL;
                    document.head.appendChild(script);
                };
                VisualLabeler.prototype._loadVLStyles = function () {
                    var stylesToLoad = [constants.VL_CSS_URL, constants.VL_CSS_FOR_JS_URL];
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
                    this._storage.setItem(constants.VL_COOKIE_NAME, 'on', {
                        expires: constants.VL_COOKIE_EXPIRATION_IN_MS,
                    });
                };
                VisualLabeler.prototype._getVLCookie = function () {
                    return this._storage.getItem(constants.VL_COOKIE_NAME);
                };
                /**
                 * @param {MessageEvent} event
                 * @description Transport custom API calls into heapV for use in Heap VL
                 */
                VisualLabeler.prototype._initializeHeapV = function (event) {
                    window.heapV = Object.assign({}, {
                        source: event === null || event === void 0 ? void 0 : event.source,
                        uri: constants.HEAP_WEB_APP_URI,
                        loadArgs: event === null || event === void 0 ? void 0 : event.data.args,
                    });
                };
                /*
                 * Initiate the event visualizer and load corresponding assets.
                 */
                VisualLabeler.prototype.initialize = function (event) {
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
                };
                return VisualLabeler;
            }());
            exports_3("VisualLabeler", VisualLabeler);
        }
    };
});
System.register("onMessageHandler", ["constants", "VisualLabeler"], function (exports_4, context_4) {
    "use strict";
    var constants_2, VisualLabeler_1, postMessageHandler, sendReceivedInitMessageTo, initOnMessageHandler;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (constants_2_1) {
                constants_2 = constants_2_1;
            },
            function (VisualLabeler_1_1) {
                VisualLabeler_1 = VisualLabeler_1_1;
            }
        ],
        execute: function () {
            /*
             * The VL gets initiated via postMessage events from the heapanalytics.com domain.
             */
            postMessageHandler = function (event) {
                if (event.origin !== constants_2.HEAP_WEB_APP_URI) {
                    return;
                }
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
                VisualLabeler_1.VisualLabeler.getInstance().initialize(event);
            };
            sendReceivedInitMessageTo = function (source) {
                source.postMessage({
                    type: 'status',
                    value: constants_2.VisualLabelerStatus.ReceivedInitMessage,
                }, { targetOrigin: '*' });
            };
            exports_4("initOnMessageHandler", initOnMessageHandler = function () {
                window.addEventListener('message', postMessageHandler);
            });
        }
    };
});
System.register("index", ["constants", "onMessageHandler", "VisualLabeler", "CookieStorage"], function (exports_5, context_5) {
    "use strict";
    var constants_3, onMessageHandler_1, VisualLabeler_2, CookieStorage_2, initVLIfCookieIsPresent;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (constants_3_1) {
                constants_3 = constants_3_1;
            },
            function (onMessageHandler_1_1) {
                onMessageHandler_1 = onMessageHandler_1_1;
            },
            function (VisualLabeler_2_1) {
                VisualLabeler_2 = VisualLabeler_2_1;
            },
            function (CookieStorage_2_1) {
                CookieStorage_2 = CookieStorage_2_1;
            }
        ],
        execute: function () {
            initVLIfCookieIsPresent = function () {
                var storage = new CookieStorage_2.CookiesStorage();
                var isNotIframe = window.top === window.self;
                if (isNotIframe && storage.getItem(constants_3.VL_COOKIE_NAME)) {
                    VisualLabeler_2.VisualLabeler.getInstance().initialize();
                }
            };
            onMessageHandler_1.initOnMessageHandler();
            initVLIfCookieIsPresent();
        }
    };
});
