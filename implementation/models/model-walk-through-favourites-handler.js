define("flashlight/model/favourites-walk-through-handler",

    ["ember", "flashlight/flashlight", "flashlight/model/walk-through-handler", "flashlight/model/search-settings"],

    function(Ember, Flashlight, FlashlightWalkThroughHandler, FlashlightSearchSettings) {

        return Flashlight.FavouritesWalkThroughHandler = FlashlightWalkThroughHandler.extend({

            createWalkThroughContext: function(item, favourites, itemUserIndex, returnPath) {

                var itemIDKey = this.get("dataProvider.itemIdentifierKey") || "id";
                var wtc = {};

                wtc[itemIDKey] = item[itemIDKey];
                wtc.handler = this;
                wtc.item = item;
                wtc.favourites = favourites.slice();
                wtc.userIndex = itemUserIndex;
                wtc.returnPath = returnPath;
                return wtc;
            },

            resolveWalkThroughContext: function(walkThroughContext) {

                var itemIDKey = this.get("dataProvider.itemIdentifierKey") || "id";
                var favourites = walkThroughContext.favourites;
                var userIndex = walkThroughContext.userIndex;
                var returnPath = walkThroughContext.returnPath;
                var totalItems = (favourites && favourites instanceof Array) ? favourites.length : 0;
                var self = this;

                function _createWalkThroughContext(item, itemUserIndex) {
                    var wtc = {};
                    wtc[itemIDKey] = item[itemIDKey];
                    wtc.handler = self;
                    wtc.item = item;
                    wtc.favourites = favourites;
                    wtc.userIndex = itemUserIndex;
                    wtc.returnPath = returnPath;
                    return wtc;
                }

                var favPrevItem = (userIndex > 1) ? favourites[userIndex - 2] : null;
                var favNextItem = (userIndex < totalItems) ? favourites[userIndex] : null;
                var r = {};

                r.current = userIndex;
                r.total = totalItems;
                r.returnPath = returnPath;

                if(favPrevItem && favPrevItem.item) {
                    r.previous = _createWalkThroughContext(favPrevItem.item, userIndex - 1);
                }

                if(favNextItem && favNextItem.item) {
                    r.next = _createWalkThroughContext(favNextItem.item, userIndex + 1);
                }

                return Ember.RSVP.resolve(r);
            }

        });
    }
);