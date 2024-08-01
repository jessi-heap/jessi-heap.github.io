(function () {
    // This object is created & validated on the generation service level
    var SERVER_SIDE_CONFIG = {};

    window.heap.serverConfig = SERVER_SIDE_CONFIG;

    function getPluginKey(arr) {
        if (arr.indexOf('core') === -1) {
            arr.push('core');
        }
        var sortedArray = arr.sort(function (a, b) {
            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            } else {
                return 0;
            }
        });

        return sortedArray.join('-');
    }

    function constructSDKEndpoint() {
        // TODO - we can also support customer-inputted plugins, we would just find the intersection of the 2
        var plugins = getPluginKey(SERVER_SIDE_CONFIG.sdk.plugins || []);
        var clientSdkConfig = (heap && heap.clientConfig && heap.clientConfig.sdk) || {};
        var domain = clientSdkConfig.domain || SERVER_SIDE_CONFIG.sdk.domain;
        var version = clientSdkConfig.version || SERVER_SIDE_CONFIG.sdk.version;
        var heapjsType =
            clientSdkConfig.version || !SERVER_SIDE_CONFIG.sdk.isExperimentalVersion
                ? 'heapjs-static'
                : 'heapjs-experimental';

        return domain + '/v5/' + heapjsType + '/' + version + '/' + plugins + '/heap.js';
    }

    function loadScript() {
        var url = constructSDKEndpoint();
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.async = true;
        var firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);
    }

    window.heap.init(window.heap.envId, window.heap.clientConfig, window.heap.serverConfig);

    loadScript();
})();
