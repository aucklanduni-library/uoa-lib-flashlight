define("flashlight/model/search-settings",

    ["ember", "flashlight/flashlight", 'flashlight/util/url-parser'],

    function(Ember, Flashlight, URLParser) {

        function encodeURIAndSlashes(v) {
            return encodeURI(v).replace(/\//g, "%2F");
        }
        
        function encodeFilterURIAndSlashes(v) {
            v = v.replace(/\+/g,"__plus__");
            return encodeURI(v).replace(/\//g, "%2F").replace(/__plus__/gi,"%2B");
        }


        var SearchSettingsModel = Ember.Object.extend({

            _activeFilters: null,
            _pinnedFilters: null,        // key/value pair

            _searchTerm: null,
            _facets: null,
            _facetCount: null,
            _specificQuery: null,

            _sortingKey: null,
            _sortingOrderAsc: true,

            _skip: 0,
            _count: 10,

            init: function() {
                this._super();

                this._activeFilters = {};
                this._facets = [];
                this._facetCount = null;
                this._searchTerm = "";
                this._specificQuery = null;

                this._sortingKey = null;
                this._sortingOrderAsc = true;
                this._skip = 0;
                this._count = 0;
            },

            defaultCount: 12,


            // Accessors
            searchTerm: Ember.computed(function() {
                return this._searchTerm;
            }),

            specificQuery: Ember.computed(function() {
                return this._specificQuery;
            }),


            filters: Ember.computed(function() {
                return this._activeFilters;
            }),

            pinnedFilters: Ember.computed(function() {
                return this._pinnedFilters;
            }),

            isFilterPinned: function(key, value) {
                if(this._pinnedFilters && this._pinnedFilters.hasOwnProperty(key)) {
                    var v = this._pinnedFilters[key];
                    return (v && v instanceof Array && v.indexOf(value) !== -1);
                }
                return false;
            },

            _getActiveFilterPairs: function(includePinnedFilters) {
                var pinnedFilters = {};
                var pairs = [];
                var v, k, pv;

                if(includePinnedFilters && this._pinnedFilters) {
                    pinnedFilters = this._pinnedFilters;
                    for(k in pinnedFilters) {
                        if(pinnedFilters.hasOwnProperty(k)) {
                            v = pinnedFilters[k];
                            if(v && v instanceof Array && v.length) {
                                v.forEach(function(x) {
                                    pairs.push({key:k, value:x});
                                });
                            }
                        }
                    }
                }

                for(k in this._activeFilters) {
                    if(this._activeFilters.hasOwnProperty(k)) {
                        v = this._activeFilters[k];
                        if(v && v instanceof Array && v.length) {
                            v.forEach(function(x) {
                                if(pinnedFilters && pinnedFilters.hasOwnProperty(k)) {
                                    pv = pinnedFilters[k];
                                    if(pv && pv instanceof Array && pv.length) {
                                        if(pv.indexOf(x) === -1) {
                                            pairs.push({key:k, value:x});
                                        }
                                    } else {
                                        pairs.push({key:k, value:x});
                                    }
                                } else {
                                    pairs.push({key:k, value:x});
                                }
                            });
                        }
                    }
                }

                return pairs.length ? pairs : null;
            },

            activeFilterPairs: Ember.computed(function() {
                return this._getActiveFilterPairs(false);
            }),

            activeFilterPairsIncludingPinned: Ember.computed(function() {
                return this._getActiveFilterPairs(true);
            }),


            facets: Ember.computed(function() {
                return this._facets;
            }),

            facetCount: Ember.computed(function() {
                return this._facetCount;
            }),

            sortingKey: Ember.computed(function() {
                return this._sortingKey;
            }),

            sortingOrderIsAscending: Ember.computed(function() {
                return this._sortingOrderAsc;
            }),

            fetchSkip: Ember.computed(function() {
                return this._skip || 0;
            }),

            fetchCount: Ember.computed(function() {
                return this._count || 0;
            }),


            _url: function(includePinnedFilters, includeFacets, extraURLParts, addedFilter, skippedFilter, excludeAllFilters) {

                var url = "";
                var n;
                var k;

                n = this.get('fetchCount');
                if(n && typeof(n) === 'number' && n !== this.defaultCount) {
                    url += "/count:" + n;
                }

                n = this.get('fetchSkip');
                if(n && typeof(n) === 'number') {
                    url += "/start:" + n;
                }

                k = this.get('sortingKey');
                if(k) {
                    url += "/order:" + k;
                }

                if(this.get('sortingOrderIsAscending')) {
                    url += "/direction:ascending";
                }

                if(excludeAllFilters !== true) {
                    var activeFilterPairs = this._getActiveFilterPairs(includePinnedFilters);
                    var didAddAddedFilter = false;

                    if(activeFilterPairs && activeFilterPairs.length) {
                        activeFilterPairs.forEach(function(x) {
                            if(!skippedFilter || (x.key !== skippedFilter.key && x.value !== skippedFilter.value)) {
                                url += ("/filter-"+ encodeFilterURIAndSlashes(x.key) + ":" + encodeFilterURIAndSlashes(x.value));
                                if(addedFilter && addedFilter.key === x.key && addedFilter.value === x.value) {
                                    didAddAddedFilter = true;
                                }
                            }
                        });
                    }

                    if(addedFilter && !didAddAddedFilter) {
                        url += ("/filter-"+ encodeFilterURIAndSlashes(addedFilter.key) + ":" + encodeFilterURIAndSlashes(addedFilter.value));
                    }
                }

                if(includeFacets) {
                    var facets = this.get("facets");
                    if(facets && facets instanceof Array && facets.length) {
                        url += "/facets:" + facets.map(function(f){ return encodeURIAndSlashes(f.trim()); }).join(",");
                    }

                    var fc = this.get("facetCount");
                    if(fc !== null) {
                        url += "/facet-count:" + encodeURIAndSlashes("" + fc);
                    }
                }

                if(extraURLParts && extraURLParts.length) {
                    extraURLParts.forEach(function(p) {
                        url += p;
                    });
                }

                var query = this.get("specificQuery");
                if(query && query.length) {

                    url += "/query:" + encodeURIAndSlashes(query);

                } else {

                    var st = this.get('searchTerm');
                    if(st && st.length) {
                        url += "/" + URLParser.prepareSearchTermForURL(st);
                    }
                }

                return url.replace(/^\//gi, "");
            },

            url: Ember.computed(function() {
                return this._url(true, true);
            }),

            frontendURL: Ember.computed(function() {
                return this._url(false, false);
            }),


            // URL Helpers
            // ---

            frontendURLWithActiveFilter: function(filterKey, filterValue) {
                return this._url(false, false, null, {key:filterKey, value:filterValue}, null);
            },

            frontendURLWithoutActiveFilter: function(filterKey, filterValue) {
                return this._url(false, false, null, null, {key:filterKey, value:filterValue});
            },

            frontendURLWithoutFilters: function() {
                return this._url(false, false, null, null, null, true);
            },


            // Clone with modifications
            // ---
            cloneWithSearchTerm: function(newTerm) {
                var clonedFilters = this._cloneFilters();
                var clonedPinnedFilters = this._clonePinnedFilters();
                var sortingKey = this.get("sortingKey");
                var sortingAscending = this.get("sortingOrderIsAscending");
                var skip = this.get("fetchSkip");
                var count = this.get("fetchCount");
                var facets = this.get("facets");
                var facetCounts = this.get("facetCount");

                return this.constructor.createWithInitialSearch(newTerm, clonedFilters, clonedPinnedFilters, sortingKey, sortingAscending, skip, count, facets, facetCounts);
            },

            cloneWithQuery: function(query) {
                var clonedFilters = this._cloneFilters();
                var clonedPinnedFilters = this._clonePinnedFilters();
                var sortingKey = this.get("sortingKey");
                var sortingAscending = this.get("sortingOrderIsAscending");
                var skip = this.get("fetchSkip");
                var count = this.get("fetchCount");
                var facets = this.get("facets");
                var facetCounts = this.get("facetCount");

                return this.constructor.createWithQuerySearch(query, clonedFilters, clonedPinnedFilters, sortingKey, sortingAscending, skip, count, facets, facetCounts);
            },

            cloneWithActiveFilter: function(filterKey, filterValue) {
                var newFilters = this._cloneFilters(filterKey, filterValue, true);
                var clonedPinnedFilters = this._clonePinnedFilters();
                var searchTerm = this.get("searchTerm");
                var sortingKey = this.get("sortingKey");
                var sortingAscending = this.get("sortingOrderIsAscending");
                var skip = this.get("fetchSkip");
                var count = this.get("fetchCount");
                var facets = this.get("facets");
                var facetCounts = this.get("facetCount");
                var query = this.get("specificQuery");

                return this.constructor.createWithInitialSearch(searchTerm, newFilters, clonedPinnedFilters, sortingKey, sortingAscending, skip, count, facets, facetCounts, query);
            },

            cloneWithDeactivatedFilter: function(filterKey, filterValue) {
                var newFilters = this._cloneFilters(filterKey, filterValue, false);
                var clonedPinnedFilters = this._clonePinnedFilters();
                var searchTerm = this.get("searchTerm");
                var sortingKey = this.get("sortingKey");
                var sortingAscending = this.get("sortingOrderIsAscending");
                var skip = this.get("fetchSkip");
                var count = this.get("fetchCount");
                var facets = this.get("facets");
                var facetCounts = this.get("facetCount");
                var query = this.get("specificQuery");

                return this.constructor.createWithInitialSearch(searchTerm, newFilters, clonedPinnedFilters, sortingKey, sortingAscending, skip, count, facets, facetCounts, query);
            },

            cloneWithOverlaidFilters: function(overlaidFilters) {
                var clonedFilters = this._cloneFilters();
                var clonedPinnedFilters = this._clonePinnedFilters();
                var searchTerm = this.get("searchTerm");
                var sortingKey = this.get("sortingKey");
                var sortingAscending = this.get("sortingOrderIsAscending");
                var skip = this.get("fetchSkip");
                var count = this.get("fetchCount");
                var facets = this.get("facets");
                var facetCounts = this.get("facetCount");
                var query = this.get("specificQuery");

                if(overlaidFilters) {
                    for(var k in overlaidFilters) {
                        if(overlaidFilters.hasOwnProperty(k)) {
                            if(overlaidFilters[k]) {
                                clonedFilters[k] = overlaidFilters[k];
                            } else {
                                delete clonedFilters[k];
                            }
                        }
                    }
                } else {

                    clonedFilters = null;
                }

                return this.constructor.createWithInitialSearch(searchTerm, clonedFilters, clonedPinnedFilters, sortingKey, sortingAscending, skip, count, facets, facetCounts, query);
            },

            cloneWithSkip: function(skip, count) {
                var clonedFilters = this._cloneFilters();
                var clonedPinnedFilters = this._clonePinnedFilters();
                var searchTerm = this.get("searchTerm");
                var sortingKey = this.get("sortingKey");
                var sortingAscending = this.get("sortingOrderIsAscending");
                var facets = this.get("facets");
                var facetCounts = this.get("facetCount");
                var query = this.get("specificQuery");

                return this.constructor.createWithInitialSearch(searchTerm, clonedFilters, clonedPinnedFilters, sortingKey, sortingAscending,
                    skip || 0, count !== undefined ? count : this.get("fetchCount"), facets, facetCounts, query);
            },

            cloneWithSorting: function(sortingKey, sortAscending) {
                var clonedFilters = this._cloneFilters();
                var clonedPinnedFilters = this._clonePinnedFilters();
                var searchTerm = this.get("searchTerm");
                var skip = this.get("fetchSkip");
                var count = this.get("fetchCount");
                var facets = this.get("facets");
                var facetCounts = this.get("facetCount");
                var query = this.get("specificQuery");

                return this.constructor.createWithInitialSearch(searchTerm, clonedFilters, clonedPinnedFilters, (sortingKey !== undefined) ? sortingKey : this.get("sortingKey"),
                    !!sortAscending, skip, count, facets, facetCounts, query);
            },

            cloneWithFacets: function(facets, facetCount) {
                var clonedFilters = this._cloneFilters();
                var clonedPinnedFilters = this._clonePinnedFilters();
                var searchTerm = this.get("searchTerm");
                var skip = this.get("fetchSkip");
                var count = this.get("fetchCount");
                var sortingKey = this.get("sortingKey");
                var sortingAscending = this.get("sortingOrderIsAscending");
                var query = this.get("specificQuery");

                return this.constructor.createWithInitialSearch(searchTerm, clonedFilters, clonedPinnedFilters, sortingKey, sortingAscending,
                    skip, count, facets, facetCount, query);
            },

            cloneWithFacetsRemoved: function() {
                var clonedFilters = this._cloneFilters();
                var clonedPinnedFilters = this._clonePinnedFilters();
                var searchTerm = this.get("searchTerm");
                var skip = this.get("fetchSkip");
                var count = this.get("fetchCount");
                var sortingKey = this.get("sortingKey");
                var sortingAscending = this.get("sortingOrderIsAscending");
                var query = this.get("specificQuery");

                return this.constructor.createWithInitialSearch(searchTerm, clonedFilters, clonedPinnedFilters, sortingKey, sortingAscending,
                    skip, count, null, 0, query);
            },

            // Clone filters, with requested modifications.
            _cloneFilters: function(filterKey, filterValue, enable) {
                var newFilters = {};
                for(var k in this._activeFilters) {
                    if(this._activeFilters.hasOwnProperty(k)) {
                        var v = this._activeFilters[k];
                        if(!v || !(v instanceof Array) || !v.length) {
                            continue;
                        }

                        v = v.slice(0);

                        if(filterKey && k === filterKey) {
                            var i = v.indexOf(filterValue);
                            if(i !== -1) {
                                if(!enable) {
                                    v.splice(i, 1);
                                    if(v.length) {
                                        newFilters[k] = v;
                                    } else {
                                        delete newFilters[k];
                                    }
                                    continue;
                                }
                            } else if(enable) {
                                v.push(filterValue);
                            }
                        }

                        newFilters[k] = v;
                    }
                }

                if(enable && !newFilters.hasOwnProperty(filterKey)) {
                    newFilters[filterKey] = [filterValue];
                }

                return newFilters;
            },

            _clonePinnedFilters: function(filterKey, filterValue, enable) {
                var newPinnedFilters = {};
                for(var k in this._activeFilters) {
                    if(this._activeFilters.hasOwnProperty(k)) {
                        var v = this._activeFilters[k];
                        if(!v || !(v instanceof Array) || !v.length) {
                            continue;
                        }

                        v = v.slice(0);

                        if(filterKey && k === filterKey) {
                            var i = v.indexOf(filterValue);
                            if(i !== -1) {
                                if(!enable) {
                                    v.splice(i, 1);
                                    if(v.length) {
                                        newPinnedFilters[k] = v;
                                    } else {
                                        delete newPinnedFilters[k];
                                    }
                                    continue;
                                }
                            } else if(enable) {
                                v.push(filterValue);
                            }
                        }

                        newPinnedFilters[k] = v;
                    }
                }

                if(enable && !newPinnedFilters.hasOwnProperty(filterKey)) {
                    newPinnedFilters[filterKey] = [filterValue];
                }

                return newPinnedFilters;
            },


            // Used during creation only
            // ----
            _setSettings: function(term, filters, pinnedFilters, sorting, sortAscending, skip, count, facets, facetCount, query) {

                this._activeFilters = filters || {};
                this._pinnedFilters = pinnedFilters || {};
                this._searchTerm = term;
                this._sortingKey = sorting;
                this._sortingOrderAsc = !!sortAscending;
                this._skip = (typeof(skip) === "number") ? skip : (parseInt(skip) || 0);
                this._count = (typeof(count) === "number") ? count : (parseInt(count) || this.defaultCount);
                this._facets = facets || null;
                this._facetCount = facetCount || null;

                this._specificQuery = query || null;
            }
        });


        var BaseURLParser = new URLParser();

        SearchSettingsModel.reopenClass({
            urlParser: BaseURLParser,

            createWithInitialSearch: function(term, filters, pinnedFilters, sorting, sortAscending, skip, count, facets, facetCount, query) {
                var instance = this.create();
                instance._setSettings(term, filters, pinnedFilters, sorting, sortAscending, skip, count, facets, facetCount, query);
                return instance;
            },

            createWithQuerySearch: function(query, filters, pinnedFilters, sorting, sortAscending, skip, count, facets, facetCount) {
                var instance = this.create();
                instance._setSettings(null, filters, pinnedFilters, sorting, sortAscending, skip, count, facets, facetCount, query || "*");
                return instance;
            },

            createFromURL: function(url, defaultCount, facets, facetCount, pinnedFilters) {
                var urlParser = this.urlParser || BaseURLParser;
                var opts = urlParser.parseURL(url);

                var instance = this.create();
                instance._setSettings(opts.query, opts.filter || null, pinnedFilters || null, opts.sort, opts.sortAscending,
                    opts.offset, opts.count || defaultCount, facets, facetCount, opts.query ? null : "*:*");
                return instance;
            }
        });

        return (Flashlight.SearchSettingsModel = SearchSettingsModel);
    }
);