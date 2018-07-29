define("flashlight/component/faceted-search-summary",

    ["ember", "jquery", "flashlight/components"],

    function(Ember, $, FlashlightComponents) {

        return FlashlightComponents.FlashlightFacetedSearchSummaryComponent = Ember.Component.extend({
            tagName: "div",
            browseRouteName: "browse",
            browseRouteBaseName: "browse"
        });
    }
);