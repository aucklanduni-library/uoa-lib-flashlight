define("flashlight/component/paging-summary",

    ["ember", "flashlight/components"],

    function(Ember, FlashlightComponents) {

        return FlashlightComponents.FlashlightPagingSummaryComponent = Ember.Component.extend({
            tagName: "ul",
            classNames: ["uoa-lib-h-list", "uoa-lib-tool-bar", "uoa-lib-paging"]
        });
    }
);