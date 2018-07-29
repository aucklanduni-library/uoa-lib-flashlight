define("flashlight/component/browse-holder",

    ["ember", "jquery","flashlight/components"],

    function(Ember, $, FlashlightComponents) {

        return FlashlightComponents.FlashlightBrowseHolderComponent = Ember.Component.extend({

            browseNavigationComponentName: "flashlight-browse-navigation",
            browseGroupComponentName: "flashlight-browse-group"
        });
    }
);