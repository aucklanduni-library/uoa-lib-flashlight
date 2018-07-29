define("flashlight/component/favourites-overview",

    ["ember", "flashlight/components", "bootstrap"],

    function(Ember, FlashlightComponents) {

        return FlashlightComponents.FlashlightFavouritesOverviewComponent = Ember.LinkComponent.extend({

            favouritesProvider: Ember.inject.service(),
            classNameBindings: ["hasFavourites:uoa-lib-active"],

            favouritesCount: Ember.computed("favouritesProvider.items", function() {
                var items = this.get("favouritesProvider.items");
                return items ? items.length : 0;
            }),

            hasFavourites: Ember.computed("favouritesProvider.items", function() {
                var items = this.get("favouritesProvider.items");
                return items ? (items.length > 0) : false;
            }),

            attributeBindings: ['data-toggle', 'data-placement', 'data-original-title'],

            _setupTooltips: function() {
                this.$('[data-toggle="tooltip"]').tooltip();
            }.on('didRender')
        });
    }
);