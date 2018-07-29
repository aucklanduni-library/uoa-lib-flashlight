define("flashlight/model/walk-through-handler",

    ["ember", "flashlight/flashlight"],

    function(Ember, Flashlight) {

        var FlashlightWalkThroughHandler = Ember.Object.extend({
            dataProvider: null
        });

        FlashlightWalkThroughHandler.reopenClass({
            resolveWalkThroughContext: function(walkThroughContext) {
                return (walkThroughContext && walkThroughContext.handler) ? walkThroughContext.handler.resolveWalkThroughContext(walkThroughContext) : null;
            }
        });

        return Flashlight.WalkThroughHandler = FlashlightWalkThroughHandler;
    }
);


define("flashlight/model/search-walk-through-handler",

    ["ember", "flashlight/flashlight", "flashlight/model/walk-through-handler"],

    function(Ember, Flashlight, FlashlightWalkThroughHandler) {

        return Flashlight.SearchWalkThroughHandler = FlashlightWalkThroughHandler.extend({

            createWalkThroughContext: function(item, results, itemUserIndex, returnPath) {

                var itemIDKey = this.get("dataProvider.itemIdentifierKey") || "id";
                var wtc = {};

                wtc[itemIDKey] = item[itemIDKey];
                wtc.handler = this;
                wtc.item = item;
                wtc.results = results;
                wtc.userIndex = itemUserIndex;
                wtc.returnPath = returnPath;
                return wtc;
            },

            resolveWalkThroughContext: function(walkThroughContext) {

                var itemIDKey = this.get("dataProvider.itemIdentifierKey") || "id";
                var results = walkThroughContext.results;
                var settings = results.get("settings");
                var userIndex = walkThroughContext.userIndex;
                var returnPath = walkThroughContext.returnPath;
                var totalItems = results.get("totalItems");
                var self = this;

                function _createWalkThroughContext(item, itemUserIndex) {
                    var wtc = {};
                    wtc[itemIDKey] = item[itemIDKey];
                    wtc.handler = self;
                    wtc.item = item;
                    wtc.results = results;
                    wtc.userIndex = itemUserIndex;
                    wtc.returnPath = returnPath;
                    return wtc;
                }

                var skip = (userIndex - 1);
                var count = 1;
                var hasPrev = false;
                var hasNext = false;

                if(userIndex > 1) {
                    skip--;
                    count++;
                    hasPrev = true;
                }
                if(userIndex < totalItems) {
                    count++;
                    hasNext = true;
                }

                return this.get("dataProvider").performSearchWithSettings(settings.cloneWithSkip(skip, count).cloneWithFacetsRemoved()).then(function(results) {

                    var items = results.get("items");
                    var r = null;

                    if(items && items.length === count) {

                        r = {};
                        r.current = userIndex;
                        r.total = totalItems;

                        r.returnPath = returnPath;

                        if(hasPrev) {
                            r.previous = _createWalkThroughContext(items[0], userIndex - 1);
                        }

                        if(hasNext) {
                            r.next = _createWalkThroughContext(items[hasPrev ? 2 : 1], userIndex + 1);
                        }
                    }

                    return r;
                });
            }
        });
    }
);


define("flashlight/model/favourites-walk-through-handler",

    ["ember", "flashlight/flashlight", "flashlight/model/walk-through-handler"],

    function(Ember, Flashlight, FlashlightWalkThroughHandler) {

        return Flashlight.FavouritesWalkThroughHandler = FlashlightWalkThroughHandler.extend({

        });
    }
);