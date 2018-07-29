define("flashlight/component/facet-group-basic",

    ["ember", "flashlight/components", "bootstrap"],

    function(Ember, FlashlightComponents) {

        return FlashlightComponents.FlashlightFacetGroupBasicComponent = Ember.Component.extend({
            classNames: ["uoa-lib-facet"],
            classNameBindings: ["hideFacetGroup:uoa-lib-no-display", "hasHelp:has-help"],

            hasHelp: Ember.computed("filter.help", function() {
                return !!this.get("filter.help");
            }),

            hideFacetGroup: Ember.computed("filter.values", function() {
                var values = this.get("filter.values");
                return !(values && values.length);
            }),

            _didRender: function() {
                this.$('[data-toggle="popover"]').popover({container:"body"});
            }.on("didRender"),

            _willRemove: function() {
                this.$('[data-toggle="popover"]').popover("hide");
            }.on("willDestroyElement"),

            actions: {
                toggleClipList: function() {
                    this.$('.uoa-lib-clip-list').toggleClass('open');
                }
            }
        });
    }
);