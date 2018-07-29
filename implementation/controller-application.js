define("flashlight/controller/application",

    ["ember", "flashlight/flashlight", "flashlight/controller/base"],

    function(Ember, Flashlight, FlashlightBaseController) {

        return Flashlight.ApplicationController = FlashlightBaseController.extend({
        });
    }
);