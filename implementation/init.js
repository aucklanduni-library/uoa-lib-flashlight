define("flashlight/init",

    ["ember", "flashlight/flashlight", "flashlight/components/init", "flashlight/helpers/init"],

    function(Ember, Flashlight, FlashlightComponents, HelpersInit) {

        return function(App) {

            HelpersInit(App);

            // Register all Flashlight components
            if(FlashlightComponents) {
                for(var k in FlashlightComponents) {
                    if(FlashlightComponents.hasOwnProperty(k)) {
                        App[k] = FlashlightComponents[k];
                    }
                }
            }
        };
    }
);

define("flashlight/flashlight", ["ember"], function(Ember) {
    return Ember.Object.create({});
});