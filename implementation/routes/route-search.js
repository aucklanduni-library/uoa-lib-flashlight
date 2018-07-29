define("flashlight/route/search",

    ["ember", "flashlight/flashlight", "flashlight/route/base", "bluebird", "flashlight/model/search-settings",
        "flashlight/model/promise-object", "flashlight/model/search-walk-through-handler", "flashlight/model/search-filter-resolver"],

    function(Ember, Flashlight, BaseRoute, Promise, FlashlightSearchSettings,
             FlashlightPromiseObject, FlashlightSearchWalkThroughHandler,
                FlashlightSearchFilterResolver) {


        return Flashlight.SearchRoute = BaseRoute.extend({

            // Search Route: requires a *path to be specified, which is used by "searchSettingsFromParams"
            // to determine the search settings.
            // Either "facets" or "facetsDescription" is used to determine the facets that are fetched
            // during a search, "facetCount" is used to determine the maximum number of facets to initially
            // display in a search result set as well.

            defaultCount: 20,

            facets: null,
            facetCount: null,
            facetsDescription: null,

            dataProvider: Ember.inject.service(),

            searchedFacets: Ember.computed("facets", "facetsDescription.searchedFacetKeys", function() {
                var facets =  this.get("facets");
                return (facets && facets.length) ? facets : (this.get("facetsDescription.searchedFacetKeys") || null);
            }),

            performSearchWithSettings: function(searchSettings, params) {
                var dataProvider = this.get("dataProvider");
                var facetsDescription = this.get("facetsDescription");
                var self = this;

                return dataProvider ? dataProvider.performSearchWithSettings(searchSettings).then((function(results) {
                    var r = {results:results};
                    if(facetsDescription) {
                        r.facetsDescription = facetsDescription;
                    }
                    r.returnPath = self.createReturnPathForSearchContext(searchSettings, params);

                    r.searchFilterResolver = FlashlightSearchFilterResolver.createWithSearchSettingsAndProvider(searchSettings, dataProvider);

                    return Ember.Object.create(r);
                })) : Promise.resolve(null);
            },

            searchSettingsFromParams: function(params) {
                var facets = this.get("searchedFacets");
                var facetCount = this.get("facetCount");

                if(facets && typeof(facets) === "string") {
                    facets = [facets];
                }
                return FlashlightSearchSettings.createFromURL(params.path, this.get("defaultCount"), facets, facetCount);
            },

            model: function(params, transition) {
                var searchSettings = this.searchSettingsFromParams(params);
                if(!searchSettings) {
                    return Ember.RSVP.reject(new Error("Unable to parse search settings from URL"));
                }
                return FlashlightPromiseObject.create({promise: this.performSearchWithSettings(searchSettings, params)});
            },


            // Route names (special cases for path and no path)
            noPathRoutePostfix: "-base",

            routeNameNoPath: Ember.computed("routeName", "noPathRoutePostfix", function() {
                var noPathRoutePostfix = this.get("noPathRoutePostfix");
                var reg = new RegExp("" + noPathRoutePostfix + "$", "i");
                return (this.get('routeName').replace(reg, "")) + noPathRoutePostfix;
            }),

            routeNameWithPath: Ember.computed("routeName", "noPathRoutePostfix", function() {
                var noPathRoutePostfix = this.get("noPathRoutePostfix");
                var reg = new RegExp("" + noPathRoutePostfix + "$", "i");
                return (this.get('routeName').replace(reg, ""));
            }),

            // When a link context is generated for a result item, the "return path" is the information required
            // to get back to this current route.
            createReturnPathForSearchContext: function(searchSettings, params) {
                var rp = {};
                rp.routeName = this.get("routeName");
                rp.routeNameBase = this.get("routeNameNoPath");
                rp.routeNamePath = this.get("routeNameWithPath");

                if(params.path) {
                    rp.hasPath = true;
                    rp.params = [params.path];
                    rp.paramsPathIndex = 0;
                } else {
                    rp.hasPath = false;
                    rp.params = [];
                }

                if(searchSettings) {
                    rp.searchSettings = searchSettings;
                }
                return rp;
            },

            createSearchWalkThroughHandler: function() {
                return FlashlightSearchWalkThroughHandler.create({dataProvider:this.get("dataProvider")});
            },

            setupController: function(controller, model) {
                this._super(controller, model);

                var searchWalkThroughHandler = this.get("searchWalkThroughHandler");
                if(!searchWalkThroughHandler) {
                    searchWalkThroughHandler = this.createSearchWalkThroughHandler();
                    this.set("searchWalkThroughHandler", searchWalkThroughHandler);
                }

                controller.set("itemIdentifierKey", this.get("dataProvider.itemIdentifierKey"));
                controller.set("searchWalkThroughHandler", searchWalkThroughHandler);
            }
        });
    }
);

define("flashlight/controller/search",

    ["ember", "flashlight/flashlight", "flashlight/controller/base"],

    function(Ember, Flashlight, FlashlightBaseController) {

        return Flashlight.SearchController = FlashlightBaseController.extend({

            itemIdentifierKey: "id",
            searchWalkThroughHandler: null,

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
                    var itemIdentifierKey = this.get("itemIdentifierKey") || "id";
                    var results = this.get("model.results");
                    var returnPath = this.get("model.returnPath");
                    var itemID = item[itemIdentifierKey];

                    if(itemID === undefined) {
                        return;
                    }

                    // If a search walk-through handler is not present, we can transition directly to the item (via item identifier).
                    if(!searchWalkThroughHandler) {
                        return this.transitionToRoute("item", itemID);
                    }

                    var walkThroughContext = searchWalkThroughHandler.createWalkThroughContext(linkContext.item, results, linkContext.userIndex, returnPath);

                    var t = {};
                    t[itemIdentifierKey] = itemID;
                    t.item = item;
                    t.walkThroughContext = walkThroughContext;

                    return this.transitionToRoute("item", {id:itemID, item:item, walkThroughContext:walkThroughContext});
                }
            }
        });
    }
);