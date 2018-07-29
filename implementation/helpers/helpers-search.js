define("flashlight/helpers/search",

    ["ember", "flashlight/model/search-settings"],

    function(Ember, FlashlightSearchSettings) {

        return function(App) {

            var BasicGenericSearchSettings = FlashlightSearchSettings.createWithQuerySearch("*:*");

            // Search Settings - related helpers
            // ---

            App.register('helper:flashlight-search-path', Ember.Helper.helper(function(params, namedParameters) {
                var searchSettings = params[0];
                if(!searchSettings) {
                    return null;
                }
                return searchSettings.get("frontendURL");
            }));

            App.register('helper:flashlight-search-with-filter', Ember.Helper.helper(function(params, namedParameters) {

                if(params.length < 3) {
                    return null;
                }

                var searchSettings = params[0];
                var filterKey = params[1];
                var filterValue = params[2];

                if(!searchSettings) {
                    return null;
                }

                if(!filterKey || !filterValue) {
                    return searchSettings;
                }

                return searchSettings.cloneWithActiveFilter(filterKey, filterValue);
            }));


            // Search Link - adding new active filter
            // ---
            var ResolveSearchLinkWithActiveFilter = Ember.Helper.extend({

                router: Ember.inject.service(),

                compute: function(items, namedArgs) {
                    var searchSettings = items[0];
                    var filterKey = items[1];
                    var filterValue = items[2];
                    var returnPath = (namedArgs && namedArgs.returnPath) ? namedArgs.returnPath : null;
                    var router = this.get('router');

                    if(!filterKey || filterValue === null || filterValue === undefined) {
                        return router.urlFor(searchRoute, searchSettings.get("frontendURL"));
                    }

                    if(returnPath && returnPath.routeNamePath) {
                        var p = returnPath.params ? returnPath.params.slice() : [];
                        p.unshift(returnPath.routeNamePath);

                        if(returnPath.hasPath) {
                            p[p.length - 1] = searchSettings.frontendURLWithActiveFilter(filterKey, filterValue);
                        } else {
                            p.push(searchSettings.frontendURLWithActiveFilter(filterKey, filterValue));
                        }
                        return router.urlFor.apply(router, p);
                    }

                    return router.urlFor("search", searchSettings.frontendURLWithActiveFilter(filterKey, filterValue));
                }
            });
            App.register('helper:flashlight-search-link-with-filter', ResolveSearchLinkWithActiveFilter);


            // Search Link - removing active filter
            // ---
            var ResolveSearchLinkWithoutActiveFilter = Ember.Helper.extend({

                router: Ember.inject.service(),

                compute: function(items, namedArgs) {
                    var searchSettings = items[0];
                    var filterKey = items[1];
                    var filterValue = items[2];
                    var returnPath = (namedArgs && namedArgs.returnPath) ? namedArgs.returnPath : null;
                    var router = this.get('router');

                    if(!filterKey || filterValue === null || filterValue === undefined) {
                        return router.urlFor(searchRoute, searchSettings.get("frontendURL"));
                    }

                    if(returnPath && returnPath.routeNamePath) {
                        var p = returnPath.params ? returnPath.params.slice() : [];
                        p.unshift(returnPath.routeNamePath);

                        if(returnPath.hasPath) {
                            p[p.length - 1] = searchSettings.frontendURLWithoutActiveFilter(filterKey, filterValue);
                        } else {
                            p.push(searchSettings.frontendURLWithoutActiveFilter(filterKey, filterValue));
                        }
                        return router.urlFor.apply(router, p);
                    }

                    return router.urlFor("search", searchSettings.frontendURLWithoutActiveFilter(filterKey, filterValue));
                }
            });
            App.register('helper:flashlight-search-link-without-filter', ResolveSearchLinkWithoutActiveFilter);


            // Search Link - removing ALL active filter
            // ---
            var ResolveSearchLinkNoActiveFilters = Ember.Helper.extend({

                router: Ember.inject.service(),

                compute: function(items, namedArgs) {
                    var searchSettings = items[0];
                    var returnPath = (namedArgs && namedArgs.returnPath) ? namedArgs.returnPath : null;
                    var router = this.get('router');

                    if(returnPath && returnPath.routeNamePath) {
                        var p = returnPath.params ? returnPath.params.slice() : [];
                        p.unshift(returnPath.routeNamePath);

                        if(returnPath.hasPath) {
                            p[p.length - 1] = searchSettings.frontendURLWithoutFilters();
                        } else {
                            p.push(searchSettings.frontendURLWithoutFilters());
                        }
                        return router.urlFor.apply(router, p);
                    }

                    return router.urlFor("search", searchSettings.frontendURLWithoutFilters());
                }
            });
            App.register('helper:flashlight-search-link-no-filters', ResolveSearchLinkNoActiveFilters);


            // Filtered Search Link - adding active filter onto return path search settings
            // ---
            var ResolveFilteredSearchLink = Ember.Helper.extend({

                router: Ember.inject.service(),

                compute: function(items, namedArgs) {
                    var filterKey = items[0];
                    var filterValue = items[1];
                    var returnPath = (namedArgs && namedArgs.returnPath) ? namedArgs.returnPath : null;
                    var router = this.get('router');

                    if(!filterKey || filterValue === null || filterValue === undefined) {
                        return router.urlFor(returnPath.routeNamePath, searchSettings.get("frontendURL"));
                    }

                    var searchSettings = (returnPath ? returnPath.searchSettings : null) || BasicGenericSearchSettings;

                    if(returnPath && returnPath.routeNamePath) {
                        var p = returnPath.params ? returnPath.params.slice() : [];
                        p.unshift(returnPath.routeNamePath);

                        if(returnPath.hasPath) {
                            p[p.length - 1] = searchSettings.frontendURLWithActiveFilter(filterKey, filterValue);
                        } else {
                            p.push(searchSettings.frontendURLWithActiveFilter(filterKey, filterValue));
                        }
                        return router.urlFor.apply(router, p);
                    }

                    var searchRoute = (namedArgs && namedArgs.searchRoute) ? namedArgs.searchRouteName : "search";
                    return router.urlFor(searchRoute, searchSettings.frontendURLWithActiveFilter(filterKey, filterValue));
                }
            });
            App.register('helper:flashlight-filtered-search-link', ResolveFilteredSearchLink);


            // Faceted Search Base Link
            // ---
            var ResolveFacetedSearchLink = Ember.Helper.extend({

                router: Ember.inject.service(),

                compute: function(items, namedArgs) {
                    var facetKey = items[0];
                    var facetValue = items[1];
                    var router = this.get('router');
                    var facetedSearchRoute = (namedArgs && namedArgs.facetedSearchBaseRouteName) ? namedArgs.facetedSearchBaseRouteName : "faceted-search-base";

                    if(!facetKey || facetValue === null || facetValue === undefined) {
                        return null;
                    }

                    return router.urlFor(facetedSearchRoute, facetKey, facetValue);
                }
            });
            App.register('helper:flashlight-faceted-search-base-link', ResolveFacetedSearchLink);


        }
    }
);