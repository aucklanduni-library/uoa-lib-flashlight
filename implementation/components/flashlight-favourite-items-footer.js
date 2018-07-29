define("flashlight/component/favourite-items-footer",

    ["ember", "flashlight/components", "bootstrap"],

    function(Ember, FlashlightComponents) {

        return FlashlightComponents.FlashlightFavouriteItemsFooterComponent = Ember.Component.extend({

            tagName: "div",

            classNames: ["container-fluid", "saved-item-container", "footer-saved-items"],
            classNameBindings: ["hasFavouritedItems:uoa-lib-active"],

            favouritesProvider: Ember.inject.service(),
            identifierKey: "id",

            hasFavouritedItems: Ember.computed("favouritesProvider.items", function() {
                var favProviderItems = this.get("favouritesProvider.items");
                return (favProviderItems && favProviderItems.length);
            }),

            _setupTooltips: function() {
                this.$('[data-toggle="tooltip"]').tooltip();
            }.on('didRender'),

            actions: {
                removeItemFromFavourites: function(item) {
                    if(!item) {
                        return;
                    }

                    var favProvider = this.get("favouritesProvider");
                    var identifierKey = this.get("identifierKey");

                    if(!favProvider) {
                        return;
                    }

                    var itemID = item[identifierKey];
                    if(itemID === undefined) {
                        return;
                    }

                    if(favProvider.hasItem(itemID)) {
                        favProvider.removeItem(itemID);
                    }
                }
            }
        });
    }
);