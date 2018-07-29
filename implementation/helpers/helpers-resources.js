define("flashlight/helpers/resources", ["flashlight/helpers/base-url-path"],

    function(BaseURLPath) {

        return function(App) {

            function _createResourceLink(type, link, pckge) {
                return BaseURLPath + "/resources/" + (pckge || App.DefaultResourcePackageName || "flashlight") + "/" + type + "/" + link;
            }

            App.register('helper:flashlight-resource-link', Ember.Helper.helper(function(params, namedParameters) {

                if(params.length < 2) {
                    return null;
                }

                var type = params[0];
                var link = params[1];

                if(!type || !link) {
                    return null;
                }

                var pckge = null;
                if(params.length > 2) {
                    pckge = params[2];
                }

                return _createResourceLink(type, link, pckge);
            }));

            App.register('helper:flashlight-image-link', Ember.Helper.helper(function(params, namedParameters) {

                if(params.length < 1) {
                    return null;
                }

                var link = params[0];
                if(!link) {
                    return null;
                }

                var pckge = null;
                if(params.length > 1) {
                    pckge = params[1];
                }

                return _createResourceLink("images", link, pckge);
            }));
        }
    }
);

define("flashlight/helpers/base-url-path", [], function() {

    var element = document.getElementById("baseConfig");
    if(!element) {
        return "";
    }

    var tc = element.textContent;
    if(!tc) {
        return "";
    }

    var parsedData;
    try {
        parsedData = JSON.parse(tc);
    } catch(e) {
        return "";
    }

    var baseURLPath = parsedData ? (parsedData.baseURLPath || "") : "";
    if(baseURLPath && baseURLPath[baseURLPath.length - 1] === "/") {
        baseURLPath = baseURLPath.replace(/[\/]+$/, "");
    }

    return baseURLPath;
});
