define("flashlight/component/browse-group",

    ["ember", "jquery", "flashlight/components"],

    function(Ember, $, FlashlightComponents) {

        return FlashlightComponents.FlashlightBrowseGroupComponent = Ember.Component.extend({

            tagName: "div",
            className: "js-initial-panel",

            facetedSearchRouteName: "faceted-search"

            /*GroupLabel:Ember.computed("groupkey", function() {
                return this.get("groupkey");
            }),

            GroupList:Ember.computed("model", function() {
                return this.get("model").list;
            })*/
        });
    }
);
