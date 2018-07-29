define("flashlight/route/faceted-search",

    ["ember", "flashlight/flashlight", "flashlight/route/search", "flashlight/model/search-settings"],

    function(Ember, Flashlight, FlashlightSearchRoute, FlashlightSearchSettings) {

        return Flashlight.FacetedSearchRoute = FlashlightSearchRoute.extend({

            performSearchWithSettings: function(searchSettings, params) {

                return this._super(searchSettings, params).then(function(r) {

                    // Append the "faceted search" details onto the model as well.
                    if(r) {
                        r.set("facetedFilterPair", {key:params.facetKey, value:params.facetValue});
                    }
                    return r;
                });
            },

            searchSettingsFromParams: function(params) {
                var facets = this.get("searchedFacets");
                var facetCount = this.get("facetCount");

                if(facets && typeof(facets) === "string") {
                    facets = [facets];
                }

                var facetKey = params.facetKey;
                var facetValue = params.facetValue;
                var pinnedFilters = null;

                if(facetKey && facetValue) {
                    pinnedFilters = {};
                    pinnedFilters[facetKey] = [facetValue];
                }

                return FlashlightSearchSettings.createFromURL(params.path, this.get("defaultCount"), facets, facetCount, pinnedFilters);
            },

            createReturnPathForSearchContext: function(searchSettings, params) {
                var rp = this._super.apply(this, arguments);
                rp.params.unshift(params.facetKey, params.facetValue);
                if(rp.hasPath) {
                    rp.paramsPathIndex = 2;
                }
                return rp;
            }
        });
    }
);

define("flashlight/controller/faceted-search",

    ["ember", "flashlight/flashlight", "flashlight/controller/search", "flashlight/model/search-settings"],

    function(Ember, Flashlight, FlashlightSearchController, FlashlightSearchSettings) {

        return Flashlight.FacetedSearchController = FlashlightSearchController.extend({

            actions: {
                performSearch: function(settings) {
                    if(typeof(settings) === "string") {
                        settings = FlashlightSearchSettings.createWithInitialSearch(settings);
                    }

                    var model = this.get("model");
                    var s = {};

                    if(!model) {
                        return;
                    }

                    s.path = settings.get("frontendURL");
                    s.facetKey = model.get("facetedFilterPair.key");
                    s.facetValue = model.get("facetedFilterPair.value");

                    this.transitionToRoute("faceted-search", s.facetKey, s.facetValue, s.path);
                }
            }
        });
    }
);