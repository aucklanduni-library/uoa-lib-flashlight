define("flashlight/component/favourite-item-toggle",

    ["ember", "flashlight/components", "bootstrap"],

    function(Ember, FlashlightComponents) {

        return FlashlightComponents.FlashlightFavouriteItemToggleComponent = Ember.Component.extend({

            tagName: "span",
            classNames: ["uoa-lib-record-item-select", "js-add-favorite"],
            classNameBindings: ["itemMarkedAsFavourite:uoa-lib-active", "glyphSizeClassName"],

            favouritesProvider: Ember.inject.service(),

            attributeBindings: ['dataToggle:data-toggle', 'dataPlacement:data-placement', 'tooltipTitle:data-original-title'],
            dataToggle: "tooltip",
            dataPlacement: "right",


            itemMarkedAsFavourite: Ember.computed("favouritesProvider.items", "item", "item.id", function() {

                var itemID = this.get("item.id");
                var favProvider = this.get("favouritesProvider");

                if(!favProvider || itemID === undefined) {
                    return false;
                }
                return favProvider.hasItem(itemID);
            }),

            glyphSize: "sm",
            glyphSizeClassName: Ember.computed(function() {
                return "uoa-lib-glyph-" + this.get("glyphSize");
            }),

            tooltipTitle: Ember.computed("itemMarkedAsFavourite", function() {
                return this.get("itemMarkedAsFavourite") ? "Unsave this item" : "Save this item";
            }),

            _setupTooltips: function() {
                this.$().tooltip();
            }.on('didRender'),

            click: function() {
                var item = this.get("item");
                if(!item) {
                    return false;
                }

                var favProvider = this.get("favouritesProvider");
                if(!favProvider) {
                    return false;
                }

                var itemID = item.id;
                if(itemID === undefined) {
                    return false;
                }

                if(favProvider.hasItem(itemID)) {
                    favProvider.removeItem(itemID);
                } else {
                    favProvider.addItem(item);
                }

                return true;
            }
        });
    }
);