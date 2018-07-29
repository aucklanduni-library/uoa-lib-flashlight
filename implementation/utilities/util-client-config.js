define("flashlight/util/client-config", [], function() {

    if(typeof(document) === "undefined") {
        return null;
    }

    var element = document.getElementById("data-client-config");
    if(!element) {
        return null;
    }

    var tc = element.textContent;
    if(!tc) {
        return null;
    }

    var parsedData;
    try {
        parsedData = JSON.parse(tc);
    } catch(e) {
        return null;
    }

    return parsedData;
});