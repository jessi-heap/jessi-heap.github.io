(function () {
    // This object is created & validated on the generation service level
    var SERVER_SIDE_CONFIG = {};

    window.heap.serverConfig = SERVER_SIDE_CONFIG;

    function constructSDKEndpoint() {
        return 'https://jessi-heap.github.io/v5/config/heap.js';
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