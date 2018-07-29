define("flashlight/component/search-result-item",

    ["ember", "jquery","flashlight/components"],

    function(Ember, $, FlashlightComponents) {
        return FlashlightComponents.FlashlightSearchResultItemComponent = Ember.Component.extend({
            tagName: "li"
        });
    }
);