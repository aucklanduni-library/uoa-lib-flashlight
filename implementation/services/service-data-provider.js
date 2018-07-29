define(

    "flashlight/service/data-provider",

    ["ember", "bluebird", "flashlight/flashlight", "flashlight/model/promise-object", "flashlight/model/promise-array",
        "flashlight/util/ajax", "flashlight/model/search-results"],

    function(Ember, Promise, Flashlight, PromiseObject, PromiseArray, AJAX, SearchResultsModel) {

        return Flashlight.DataProviderService =  Ember.Service.extend({

            itemIdentifierKey: "id",
            apiBaseURL: null,

            searchBasePath: "/search/",
            browseBasePath: "/browse/",

            // --- Search --- //
            performSearchWithSettings: function(searchSettings) {

                var url = this._createAPIPath(searchSettings.get("url"), this.get("searchBasePath"));
                return PromiseObject.create({
                    promise: this._generateAJAXRequest(url).then(function(data) {
                        return SearchResultsModel.createFromBasicProviderSearchResults(data, searchSettings);
                    })
                });
            },

            performSearchWithURLParts: function(urlParts) {
                var url = this._createAPIPath(urlParts, this.get("searchBasePath"));
                return PromiseObject.create({
                    promise: this._generateAJAXRequest(url).then(function(data) {
                        return data;
                    })
                });
            },

            // --- Browsing --- //
            getListingOfAvailableGroups: function(facet) {
                var url = this._createAPIPath("/" + encodeURI(facet) + "/groups", this.get("browseBasePath"));
                return PromiseObject.create({promise:this._generateAJAXRequest(url).then(function(data) {
                        return data;
                    })
                });
            },

            getAllValuesForGroup: function(facet, group) {
                var url = this._createAPIPath("/" + encodeURI(facet) + "/values/" + encodeURIComponent(group), this.get("browseBasePath"));
                return PromiseObject.create({promise:this._generateAJAXRequest(url).then(function(data) {
                        return data;
                    })
                });
            },

            searchGroupForMatchingValues: function(facet, searchTerm) {
                var url = this._createAPIPath("/" + encodeURI(facet) + "/search/" + encodeURIComponent(searchTerm), this.get("browseBasePath"));
                return PromiseObject.create({promise:this._generateAJAXRequest(url).then(function(data) {
                        return data;
                    })
                });
            },


            // --- Internal Methods --- //
            _createAPIPath: function(path, basePath, apiBaseURL) {
                var baseURL = (apiBaseURL !== undefined) ? (apiBaseURL || "") : (this.get("apiBaseURL") || "");
                basePath = basePath || "";

                baseURL = baseURL.replace(/\/$/, "");

                if(basePath) {
                    baseURL += (basePath[0] !== '/') ? ("/" + basePath) : basePath;
                }

                if(baseURL[baseURL.length-1] !== "/") {
                    baseURL = baseURL + "/";
                }

                if(path[0] === '/') {
                    path = path.slice(1);
                }

                return baseURL + path;
            },

            _generateAJAXRequest: function(url) {
                return AJAX.getJSON(url);
            }
        });
    }
);