define("flashlight/model/search-results",

    ["ember", "flashlight/flashlight"],

    function(Ember, Flashlight) {

        var SearchResultsModel = Ember.Object.extend({

            _settings: null,
            _total: 0,
            _hasMore: false,
            _offset: 0,

            _items: null,
            _facets: null,
            _ranges: null,


            settings: Ember.computed(function() {
                return this._settings;
            }),

            totalItems: Ember.computed(function() {
                return this._total;
            }),

            count: Ember.computed(function() {
                return this._items ? this._items.length : 0;
            }),

            offset: Ember.computed(function() {
                return this._offset;
            }),


            isSinglePage: Ember.computed("totalItems", "offset", "count", function() {
                return (this.get("totalItems") <= this.get("count"));
            }),

            firstItem: Ember.computed("offset", "count", function() {
                var c = this.get("count");
                if(c <= 0) {
                    return null;
                }
                return (this.get("offset") || 0);
            }),

            lastItem: Ember.computed("offset", "count", function() {
                var c = this.get("count");
                if(c <= 0) {
                    return null;
                }
                return ((this.get("offset") || 0) + (c - 1));
            }),


            items: Ember.computed(function() {
                return Ember.A(this._items);
            }),

            facets: Ember.computed(function() {
                return this._facets;
            }),

            stats: Ember.computed(function() {
                return this._stats;
            }),

            ranges: Ember.computed(function() {
                return this._ranges;
            }),

            rangeForKey: function(key) {
                return (this._ranges && this._ranges.hasOwnProperty(key)) ? this._ranges[key] : null;
            },

            hasResults: Ember.computed(function() {
                return (this._items && this._items.length);
            }),

            // Private method: used for creation
            _setBasicSettings: function(settings, items, total, offset, hasMore, facets, stats, ranges) {
                this._settings = settings;
                this._items = items;
                this._total = total;
                this._offset = offset;
                this._hasMore = hasMore;
                this._facets = facets;
                this._stats = stats;
                this._ranges = ranges;
            }
        });


        SearchResultsModel.reopenClass({

            createFromBasicProviderSearchResults: function(response, searchSettings) {

                var result = response ? response.result : null;
                var instance = this.create();

                if(result) {
                    var offset = (result.settings && result.settings.hasOwnProperty("offset")) ? result.settings.offset : searchSettings.get('fetchSkip');
                    instance._setBasicSettings(searchSettings, result.items || null, result.total, offset, result.hasmore, result.facets || null, result.stats || null, result.ranges || null);
                } else {
                    instance._setBasicSettings(searchSettings, null, 0, 0, false, null, null, null);
                }

                return instance;
            }
        });

        return (Flashlight.SearchResultsModel = SearchResultsModel);
    }
);