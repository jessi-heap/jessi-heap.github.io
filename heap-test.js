!function(){var SERVER_SIDE_CONFIG={"privacy":{"disableTextCapture":false,"enableSecureCookies":false},"compressCookies":false,"salesforceAura":false,"supportedDomains":[],"replaySettings":{},"integrations":[{"name":"vwo","fn":function integration(dependencyContainer) {
            const SOURCE_NAME = 'vwo';
            var _vis_counter = 0;
            try {
                if (!_vis_counter) {
                    var _vis_data = {};
                    var _vis_combination, _vis_id;
                    for (var idx = 0; idx < _vwo_exp_ids.length; idx++) {
                        _vis_id = _vwo_exp_ids[idx];
                        if (_vwo_exp[_vis_id].ready) {
                            _vis_combination = _vis_opt_readCookie('_vis_opt_exp_' + _vis_id + '_combi');
                            if (typeof _vwo_exp[_vis_id].combination_chosen != 'undefined') {
                                _vis_combination = _vwo_exp[_vis_id].combination_chosen;
                            }
                            if (
                                _vis_combination &&
                                typeof _vwo_exp[_vis_id].comb_n[_vis_combination] != 'undefined'
                            ) {
                                _vis_data['VWO: ' + _vwo_exp[_vis_id].name] =
                                    _vwo_exp[_vis_id].comb_n[_vis_combination];
                                _vis_counter++;
                            }
                        }
                    }
                }
                // Use the _vis_data object created above to fetch the data,
                // key of the object is the Test ID and the value is Variation Name
                if (_vis_counter) {
                    heap.addPageviewProperties(_vis_data);
                }
            } catch (err) {
                // eslint-disable-next-line no-empty
            } finally {
                dependencyContainer.markAdapterAsResolved(SOURCE_NAME);
            }
        },"config":{"isBlocking":true,"blockDurationInMs":5000}},{"name":"contentsquare","fn":function integration(dependencyContainer) {
            var HASHED_CS_PROJ_ID='5f658a1e9f984';
            var SOURCE_NAME = 'contentsquare';

            function loadCsLiteScript() {
                window._uxa = window._uxa || [];
                var mt = document.createElement('script');
                mt.type = 'text/javascript';
                mt.async = true;
                mt.src = '//t.contentsquare.net/uxa/' + HASHED_CS_PROJ_ID + '.js';
                document.getElementsByTagName('head')[0].appendChild(mt);
            }

            function isCsLiteMetadataPresent() {
                var csMetadata;
                if (window._uxa && window._uxa.push) {
                    csMetadata = window._uxa.push(['getSessionData']);
                }
                return csMetadata && csMetadata.projectId;
            }

            function csLiteLoadedTimer() {
                if (isCsLiteMetadataPresent()) {
                    clearTimerAndLoad();
                }
            }

            function clearTimerAndLoad() {
                clearInterval(csLiteLoaded);
                dependencyContainer.markAdapterAsResolved(SOURCE_NAME);
            }

            try {
                if (isCsLiteMetadataPresent()) {
                    dependencyContainer.markAdapterAsResolved(SOURCE_NAME);
                    return;
                }

                if (HASHED_CS_PROJ_ID) {
                    loadCsLiteScript();
                }

                var csLiteLoaded = setInterval(csLiteLoadedTimer, 100);
                setTimeout(clearTimerAndLoad, 3000);
                //eslint-disable-next-line no-empty
            } catch (e) {}
        },"config":{"isBlocking":true,"blockDurationInMs":5000}}],"snapshots":{"click":{"#testAttributes":{"a":{"Color":{"target":"#testAttributes","attribute":"data-color"},"Name":{"target":"${this}","attribute":"data-name"},"Siblings name":{"target":"#testAttributesSibling","attribute":"data-name"}},"j":{},"f":{},"st":{},"ex":{}},"#ash-ketchum":{"j":{"test-id":function execute() { return 'test-ash-id'}},"f":{},"t":{"squirtle":"#squirtle"}},"#donot":{"j":{},"f":{},"s":{"Testing":"div#test"}},".pii-test-cs button":{"j":{"Log":function execute() { return console.log('Clicked on child element')},"Testing":function execute() { return 'success'}},"f":{}},".ash-ketchum":{"a":{},"j":{"test":function execute() { return 'test-ash-class'},"isIdentified":function execute() { return !!heap.getIdentity()},"testCharacter?":function execute() { return 1+1},"testComment":function execute() { return (function() {
                        //var match = event.target.id.match(/^profile-drawer-linkedin-(\d+)$/);
                        //return match[1];
                    })()}},"f":{},"st":{},"ex":{},"t":{"who-does-misty-own":"#who-does-misty-own","jessi-test":"#jessi-test"}}},"pageview":{"/*":{"j":{"timeSincePageLoad":function execute() { return (function() {
                        var pageLoadTime = performance.timeOrigin;

                        window.getTimeSincePageLoad = function() {
                            return (performance.now() + performance.timeOrigin - pageLoadTime);
                        };

                        return getTimeSincePageLoad();
                    })();}},"f":{},"s":{"mytextareawithtext":"#mytextareawithtext","header":"#header"},"a":{},"st":{},"ex":{}},"/page1.html":{"j":{"testMath":function execute() { return 1+1}},"f":{},"s":{"mytextareawithtext":"#mytextareawithtext","header":"#header"}}}},"sdk":{"version":"5.2.9","isExperimentalVersion":false,"domain":"https://cdn.us.heap-api.com","plugins":[]},"ingestServer":"https://c.us.heap-api.com","csSettings":{"csProjectId":"79520","csHashedProjId":"5f658a1e9f984","heapTagStatus":"heap_sideloads_cs"}};function t(e){var n;return-1===e.indexOf('core')&&e.push('core'),e.sort(function(e,n){return e<n?-1:n<e?1:0}).join('-')}function i(){var e=t(SERVER_SIDE_CONFIG.sdk.plugins||[]),n=heap&&heap.clientConfig&&heap.clientConfig.sdk||{},i=n.domain||SERVER_SIDE_CONFIG.sdk.domain,o=encodeURIComponent(n.version||SERVER_SIDE_CONFIG.sdk.version),r;return i+'/v5/'+(n.version||!SERVER_SIDE_CONFIG.sdk.isExperimentalVersion?'heapjs-static':'heapjs-experimental')+'/'+o+'/'+e+'/heap.js'}function e(){var e=i(),n=document.createElement('script');n.type='text/javascript',n.src=e,n.async=!0;var e=document.getElementsByTagName('script')[0];e.parentNode.insertBefore(n,e)}window.heap.serverConfig=SERVER_SIDE_CONFIG,window.heap.init(window.heap.envId,window.heap.clientConfig,window.heap.serverConfig),e()}();