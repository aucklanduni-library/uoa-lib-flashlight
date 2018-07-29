/**
 *  Note: Search Filter Resolver is used for "facet all values picker". Given search settings, it will go off and obtain
 *  a result set of facet-count pairs. It supports filtering on "contains", it also supports pagination.
 *
 */

define("flashlight/model/search-filter-resolver",

    ["ember", "flashlight/flashlight", "flashlight/model/promise-object"],

    function(Ember, Flashlight, PromiseObject) {

        function encodeURIAndSlashes(v) {
            return encodeURI(v).replace(/\//g, "%2F");
        }

        var SearchFilterResolver = Ember.Object.extend({

            performBasicSearch: function(facet, offset, limit) {

                var urlParts = [];

                urlParts.push("/count:" + 0);
                urlParts.push("/facets:" + encodeURIAndSlashes(facet));
                urlParts.push("/facet-offset:" + (offset || 0));
                urlParts.push("/facet-count:" + limit);
                urlParts.push("/facet-sort:index");

                var p = this._searchProvider.performSearchWithURLParts(this._searchSettings._url(true, false, urlParts)).then(function(result) {
                    return {filtered:false, offset:offset, limit:limit, result:result};
                });

                return PromiseObject.create({promise:p});
            },

            performFilteredSearch: function(facet, contains, ignoreCase) {

                // Filtered search returns all results.
                var urlParts = [];

                urlParts.push("/count:" + 0);
                urlParts.push("/facets:" + encodeURIAndSlashes(facet));
                urlParts.push("/facet-contains:" + encodeURIAndSlashes(contains));

                if(ignoreCase) {
                    urlParts.push("/facet-contains-ignore-case:true");
                }

                urlParts.push("/facet-count:all");
                urlParts.push("/facet-sort:index");

                var p = this._searchProvider.performSearchWithURLParts(this._searchSettings._url(true, false, urlParts)).then(function(result) {
                    return {filtered:true, contains:contains, ignoreCase:!!ignoreCase, result:result};
                });

                return PromiseObject.create({promise:p});
            },

            // Private method: used for creation
            _setSettings: function(searchSettings, searchProvider) {
                this._searchSettings = searchSettings.cloneWithSkip(0,0).cloneWithFacetsRemoved();
                this._searchProvider = searchProvider;
            }
        });


        SearchFilterResolver.reopenClass({
            createWithSearchSettingsAndProvider: function(searchSettings, searchProvider) {
                var instance = this.create();
                instance._setSettings(searchSettings, searchProvider);
                return instance;
            }
        });

        return (Flashlight.SearchFilterResolverModel = SearchFilterResolver);
    }
);