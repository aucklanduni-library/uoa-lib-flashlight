define("flashlight/util/ajax", ["exports", "jquery", "bluebird"], function(exports, $, Promise) {

    exports.getJSON = function(url, withCredentials) {

        var options = {dataType: "json", url:url};
        if(withCredentials) {
            options.xhrFields = {withCredentials: true};
        }

        return new Promise(function(resolve, reject) {
            $.ajax(options).done(function(d) {
                return resolve(d);
            }).error(function(e) {
                var error;
                if(e instanceof Error) {
                    error = e;
                } else {
                    error = new Error("AJAX request failed due to: " + ((e.responseText || e.statusText) || "unknown reason"));
                }
                return reject(error);
            });
        });
    };

    exports.postJSON = function(url, data) {

        if(typeof data !== "string") {
            data = JSON.stringify(data);
        }

        var options = {contentType : 'application/json', type:"POST", data:data};
        return new Promise(function(resolve, reject) {
            $.ajax(url, options).done(function(d) {
                return resolve(d);
            }).error(function(e) {
                var error;
                if(e instanceof Error) {
                    error = e;
                } else {
                    error = new Error("AJAX POST failed due to: " + ((e.responseText || e.statusText) || "unknown reason"));
                }
                return reject(error);
            });
        });
    };
});