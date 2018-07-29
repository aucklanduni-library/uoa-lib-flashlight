define("flashlight/route/index",

    ["ember", "flashlight/flashlight", "flashlight/route/base"],

    function(Ember, Flashlight, BaseRoute) {

        return Flashlight.IndexRoute = BaseRoute.extend({
        });
    }
);

define("flashlight/controller/index",

    ["ember", "flashlight/flashlight", "flashlight/controller/base"],

    function(Ember, Flashlight, FlashlightBaseController) {

        return Flashlight.IndexController = FlashlightBaseController.extend({
        });
    }
);