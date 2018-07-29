define("flashlight/route/favourites",

    ["ember", "flashlight/flashlight", "flashlight/route/base", "bluebird", "flashlight/model/search-settings",
        "flashlight/model/promise-object", "flashlight/model/favourites-walk-through-handler"],

    function(Ember, Flashlight, BaseRoute, Promise, FlashlightSearchSettings, FlashlightPromiseObject, FlashlightFavouritesWalkThroughHandler) {

        return Flashlight.FavouritesRoute = BaseRoute.extend({

            dataProvider: null,
            favouritesProvider: Ember.inject.service(),

            performSearchForFavouritesChunk: function(chunk) {

                var itemIdentifierKey = this.get("dataProvider.itemIdentifierKey") || "id";
                var searchProvider = this.get("dataProvider");

                if(!searchProvider) {
                    return Promise.reject(new Error("DataProvider not supplied to FavouritesRoute"));
                }

                var idsToFind = chunk.map(function(x) {
                    return x ? x[itemIdentifierKey] : null;
                }).filter(function(x) {
                    return !!x;
                });

                if(!idsToFind.length) {
                    return Promise.resolve([]);
                }

                var query = itemIdentifierKey + ":(" + idsToFind.join(" OR ") + ")";
                var searchSettings = FlashlightSearchSettings.createWithQuerySearch(query, null, null, null, null, 0, idsToFind.length, null, null);

                return searchProvider.performSearchWithSettings(searchSettings).then(function(results) {

                    var items = results.get("items");
                    var orderedItems = [];

                    if(items && items.length) {

                        var itemMap = {};

                        items.forEach(function(x) {
                            var ident = x[itemIdentifierKey];
                            if(ident !== undefined) {
                                itemMap["" + ident] = x;
                            }
                        });

                        orderedItems = idsToFind.map(function(ident) {
                            return itemMap["" + ident];
                        }).filter(function(x) {
                            return !!x;
                        });
                    }

                    return orderedItems;
                });
            },

            model: function(params, transition) {

                var itemIdentifierKey = this.get("dataProvider.itemIdentifierKey") || "id";
                var favourites = this.get("favouritesProvider.items");
                if(!favourites || !favourites.length) {
                    return {items: []};
                }

                var favouritesChunks = [];
                var chunkSize = 20;
                var i, j;

                for(i = 0, j = favourites.length; i < j; i += chunkSize) {
                    favouritesChunks.push(favourites.slice(i, i + chunkSize));
                }

                // For all of the favourite chunks, resolve them via the search provider
                var favouriteResolveChunkPromises = [];
                var self = this;

                favouritesChunks.forEach(function(c) {
                    if(c && c.length) {
                        favouriteResolveChunkPromises.push(self.performSearchForFavouritesChunk(c));
                    }
                });

                var returnPath = this.returnPathForLinkContext(this.get('routeName'), params);

                return FlashlightPromiseObject.create({promise: Promise.all(favouriteResolveChunkPromises).then(function(allItems) {

                    var finalFavourites = [];

                    allItems.forEach(function(items) {

                        items = items.filter(function(x) {
                            return (x && x[itemIdentifierKey] !== undefined);
                        });

                        items = items.map(function(x) {
                            return Ember.Object.create({item:x, deleted:false});
                        });

                        finalFavourites.push.apply(finalFavourites, items);
                    });

                    return {items:finalFavourites, returnPath:returnPath, settings:FlashlightSearchSettings.createFromURL("/query:*")};
                })});
            },

            // When a link context is generated for a result item, the "return path" is the information required
            // to get back to this current route.

            returnPathForLinkContext: function(routeName, params) {
                var rp = {};
                rp.routeName = routeName;
                rp.params = [];
                return rp;
            },

            createSearchWalkThroughHandler: function() {
                return FlashlightFavouritesWalkThroughHandler.create({dataProvider:this.get("dataProvider")});
            },

            setupController: function(controller, model) {
                this._super(controller, model);

                var searchWalkThroughHandler = this.get("searchWalkThroughHandler");
                if(!searchWalkThroughHandler) {
                    searchWalkThroughHandler = this.createSearchWalkThroughHandler();
                    this.set("searchWalkThroughHandler", searchWalkThroughHandler);
                }

                controller.set("dataProvider", this.get("dataProvider"));
                controller.set("searchWalkThroughHandler", searchWalkThroughHandler);

                if(controller.setupFavouritesProvider) {
                    controller.setupFavouritesProvider(this.get("favouritesProvider"));
                }
            }
        });
    }
);

define("flashlight/controller/favourites",

    ["ember", "flashlight/flashlight", "flashlight/controller/base", "flashlight/model/search-settings", "flashlight/model/promise-object"],

    function(Ember, Flashlight, FlashlightBaseController, FlashlightSearchSettings, FlashlightPromiseObject) {

        return Flashlight.FavouritesController = FlashlightBaseController.extend({

            dataProvider: null,
            favouritesProvider: null,

            // we need to start listening to events on the favourites provider
            setupFavouritesProvider: function(favsProvider) {

                this._tearDown();
                this.set("favouritesProvider", favsProvider);

                if(favsProvider) {
                    favsProvider.on("modified", this, this._favouritesModified);
                }
            },

            _tearDown: function() {
                var favsProvider = this.get("favouritesProvider");
                if(favsProvider) {
                    favsProvider.off("modified", this, this._favouritesModified);
                }
            }.on("willDestroy"),

            _resolveItemToPromiseObject: function(itemID, deleted) {
                var dataProvider = this.get("dataProvider");
                if(!dataProvider) {
                    return null;
                }

                var itemIdentifierKey = this.get("dataProvider.itemIdentifierKey") || "id";
                var searchSettings = FlashlightSearchSettings.createWithQuerySearch("" + itemIdentifierKey + ":(" + itemID + ")", null, null, null, null, 0, 1, null, null);

                return FlashlightPromiseObject.create({promise: dataProvider.performSearchWithSettings(searchSettings).then(function(results) {
                    var items = results.get("items");
                    return Ember.Object.create({item:((items && items.length) ? items[0] : null), deleted:deleted});
                })});
            },

            _favouritesModified: function(modifications) {

                var itemsAdded = modifications.added;
                var itemsRemoved = modifications.removed;
                var currentItems = this.get("model.items") || [];
                var itemIdentifierKey = this.get("dataProvider.itemIdentifierKey") || "id";
                var currentItemMap = {};
                var self = this;
                var newItems;

                if(currentItems) {
                    newItems = currentItems.slice();

                    currentItems.forEach(function(x) {
                        if(x) {
                            var item = x.get("item");
                            if(item) {
                                var ident = item[itemIdentifierKey];
                                if(ident !== undefined) {
                                    currentItemMap["" + ident] = x;
                                }
                            }
                        }
                    });

                } else {

                    newItems = [];
                }

                // For added items, if already present "undelete it", otherwise resolve the item and append it.
                if(itemsAdded) {
                    itemsAdded.forEach(function(x) {
                        var ident;
                        if(x && (ident = x[itemIdentifierKey]) !== undefined) {
                            var item = currentItemMap["" + ident];
                            if(item) {
                                item.set("deleted", false);
                            } else {
                                newItems.push(self._resolveItemToPromiseObject(ident, false));
                            }
                        }
                    });
                }

                // Marked removed items as being deleted.
                if(itemsRemoved) {
                    itemsRemoved.forEach(function(x) {
                        var ident;
                        if(x && (ident = x[itemIdentifierKey]) !== undefined) {
                            var item = currentItemMap["" + ident];
                            if(item) {
                                item.set("deleted", true);
                            }
                        }
                    });
                }

                this.set("model.items", newItems);
            },

            actions: {

                viewItem: function(linkContext) {
                    if(!linkContext) {
                        return;
                    }

                    var item = linkContext.item;
                    if(!item) {
                        return;
                    }

                    var searchWalkThroughHandler = this.get("searchWalkThroughHandler");
                    var itemIdentifierKey = this.get("dataProvider.itemIdentifierKey") || "id";
                    var allFavourites = this.get("model.items");
                    var returnPath = this.get("model.returnPath");
                    var itemID = item[itemIdentifierKey];

                    if(itemID === undefined) {
                        return;
                    }

                    // If a search walk-through handler is not present, we can transition directly to the item (via item identifier).
                    if(!searchWalkThroughHandler) {
                        return this.transitionToRoute("item", itemID);
                    }

                    var walkThroughContext = searchWalkThroughHandler.createWalkThroughContext(linkContext.item, allFavourites, linkContext.userIndex, returnPath);

                    var t = {};
                    t[itemIdentifierKey] = itemID;
                    t.item = item;
                    t.walkThroughContext = walkThroughContext;

                    return this.transitionToRoute("item", {id:itemID, item:item, walkThroughContext:walkThroughContext});
                },

                addActiveFilter: function(filterKey, value) {
                    var searchSettings = this.get("model.settings");
                    if(searchSettings && !searchSettings.isFilterPinned(filterKey, value)) {
                        this.transitionToRoute("search", searchSettings.cloneWithSkip(0).cloneWithActiveFilter(filterKey, value).get("frontendURL"));
                    }
                },

                toggleDeleteRecord: function(favItem) {
                    if(!favItem) {
                        return;
                    }

                    var isDeleted = !favItem.get("deleted");
                    favItem.set("deleted", isDeleted);

                    var itemIdentifierKey = this.get("dataProvider.itemIdentifierKey") || "id";
                    var item = favItem.get("item");
                    var ident;

                    if(item && (ident = item[itemIdentifierKey]) !== undefined) {
                        var favouritesProvider = this.get("favouritesProvider");
                        if(favouritesProvider) {
                            if(!isDeleted) {
                                var allItems = this.get("model.items");
                                var insertAfter = undefined;

                                if(allItems) {
                                    var currentIndex = allItems.indexOf(favItem);
                                    if(currentIndex !== -1) {

                                        insertAfter = null; /* insert at head */

                                        if(currentIndex > 0) {
                                            for(var i = currentIndex - 1; i >= 0; i--) {
                                                var x = allItems[i];
                                                if(!x.get("deleted")) {
                                                    x = x.get("item");
                                                    if(x && x[itemIdentifierKey] !== undefined) {
                                                        insertAfter = x[itemIdentifierKey];
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                favouritesProvider.addItem(item, insertAfter);

                            } else {

                                favouritesProvider.removeItem(ident);
                            }
                        }
                    }
                }
            }
        });
    }
);