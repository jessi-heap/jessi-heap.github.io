(function () {
    window._uxa = window._uxa || [];
    window._uxa.push(['addPageviewProperties', { parent:"bar" }]);
    window._uxa.push(['addEventProperties', { parentEvent:"bar" }]);
    // heap.addPageviewProperties({ parentHeap: "hi" });
    if (typeof CS_CONF === 'undefined') {
        window._uxa.push(['setPath', window.location.pathname + window.location.hash.replace('#', '?__')]);
        var mt = document.createElement("script");
        mt.type = "text/javascript";
        mt.async = true;
        mt.src = "//t.contentsquare.net/uxa/b36b4dbf880cb.js";
        document.getElementsByTagName("head")[0].appendChild(mt);
    } else {
        window._uxa.push(['trackPageview', window.location.pathname + window.location.hash.replace('#', '?__')]);
    }
})();
