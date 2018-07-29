var path = require("path"),
    Promise = require("bluebird");


var BundleDescription = require("./bundle");

exports.module = {
    name: "flashlight",
    packages: [
        {
            name: "flashlight",
            jsdir: path.join(__dirname, "implementation"),
            bundle: BundleDescription
        }
    ]
};


exports.configure = function(clientPackage, EmberApp) {

    // Register this package into the client bundle and include our templates into the compiled templates passed to clients.
    if(clientPackage) {
        clientPackage.package("flashlight/flashlight");
    }

    if(EmberApp) {
        //EmberApp.templateDirectory(path.join(__dirname, "templates"));
        EmberApp.templateDirectory(path.join(__dirname, "implementation"));
    }
};