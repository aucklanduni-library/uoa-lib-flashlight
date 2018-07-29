define("flashlight/route/item",

    ["ember", "flashlight/flashlight", "flashlight/route/base", "flashlight/model/search-settings",
        "flashlight/model/promise-object", "flashlight/model/walk-through-handler"],

    function(Ember, Flashlight, FlashlightBaseRoute, FlashlightSearchSettings, FlashlightPromiseObject, FlashlightWalkThroughHandler) {

        return Flashlight.ItemRoute = FlashlightBaseRoute.extend({

            dataProvider: Ember.inject.service(),
            walkThroughForSearchResults: true,

            performSearchWithSettings: function(searchSettings, params, linkContext) {
                var dataProvider = this.get("dataProvider");
                if(!dataProvider) {
                    return Promise.resolve(null);
                }

                return dataProvider.performSearchWithSettings(searchSettings).then((function(results) {

                    if(results) {
                        var items = results.get("items");
                        if(items && items instanceof Array && items.length) {
                            var r = {item: items[0]};
                            if(linkContext) {
                                r.linkContext = linkContext;
                            }
                            return Ember.Object.create(r);
                        }
                    }

                    return Ember.RSVP.reject(new Error("Unable to find item with specified identifier."));
                }));
            },

            searchSettingsFromParams: function(params) {

                var itemIDKey = this.get("dataProvider.itemIdentifierKey") || "id";
                var query = itemIDKey + ":" + params.id;
                var skip = 0;
                var count = 1;

                return FlashlightSearchSettings.createWithQuerySearch(query, null, null, null, false, skip, count);
            },

            model: function(params, transition) {
                var searchSettings = this.searchSettingsFromParams(params);
                if(!searchSettings) {
                    return Ember.RSVP.reject(new Error("Unable to parse search settings from URL"));
                }
                return FlashlightPromiseObject.create({promise: this.performSearchWithSettings(searchSettings, params)});
            },

            afterModel: function(resolvedModel) {

                // Attempt to resolve any walk through context that may have been passed in as model.

                if(this.get("walkThroughForSearchResults") && resolvedModel) {

                    var walkThroughContext = resolvedModel.walkThroughContext;
                    if(walkThroughContext) {

                        if(walkThroughContext.returnPath) {
                            resolvedModel.returnPath = walkThroughContext.returnPath;
                        }

                        return FlashlightWalkThroughHandler.resolveWalkThroughContext(walkThroughContext).then(function(walkThroughDetails) {
                            resolvedModel.walkThroughDetails = walkThroughDetails;
                        });
                    }
                }

                return Ember.RSVP.resolve(resolvedModel);
            },

            setupController: function(controller, model) {
                this._super(controller, model);
                controller.set("itemIdentifierKey", this.get("dataProvider.itemIdentifierKey"));
            }
        });
    }
);

define("flashlight/controller/item",

    ["ember", "flashlight/flashlight", "flashlight/controller/base", "flashlight/model/search-settings"],

    function(Ember, Flashlight, FlashlightBaseController, FlashlightSearchSettings) {

        return Flashlight.ItemController = FlashlightBaseController.extend({

            itemIdentifierKey: null,

            actions: {
                viewWalkThroughLink: function(walkThroughLink) {
                    if(!walkThroughLink) {
                        return;
                    }

                    var item = walkThroughLink.item;
                    if(!item) {
                        return;
                    }

                    var itemIdentifierKey = this.get("itemIdentifierKey") || "id";
                    var itemID = item[itemIdentifierKey];
                    if(itemID === undefined) {
                        return;
                    }

                    this.transitionToRoute("item", {id:itemID, item:item, walkThroughContext:walkThroughLink});
                },

                performFilteredSearch: function(filterKey, filterValue) {
                    var returnPath = this.get("model.returnPath");
                    var searchSettings = this.get("model.returnPath.searchSettings") || FlashlightSearchSettings.createWithQuerySearch("*:*");
                    var newPath = (searchSettings.cloneWithSkip(0).cloneWithActiveFilter(filterKey, filterValue)).get("frontendURL");

                    if(returnPath && returnPath.routeNamePath && returnPath.params && returnPath.params.length) {

                        var newParams = returnPath.params.slice();

                        if(returnPath.hasPath) {
                            if(returnPath.paramsPathIndex !== undefined && returnPath.paramsPathIndex < newParams.length) {
                                newParams[returnPath.paramsPathIndex] = newPath;
                            } else {
                                newParams[newParams.length - 1] = newPath;
                            }
                        } else {
                            // NOTE: this is an assumption that the path is appended onto the end of the parameters.
                            newParams.push(newPath);
                        }

                        newParams.unshift(returnPath.routeNamePath);
                        return this.transitionToRoute.apply(this, newParams);
                    }

                    return this.transitionToRoute("search", newPath);
                }
            }
        });
    }
);