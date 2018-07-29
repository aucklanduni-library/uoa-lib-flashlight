define("flashlight/component/browse-navigation",

    ["ember", "jquery", "flashlight/components"],

    function(Ember, $, FlashlightComponents) {

        return FlashlightComponents.FlashlightBrowseNavigationComponent = Ember.Component.extend({
            tagName: "div",
            browseRouteName: "browse"
        });
    }
);