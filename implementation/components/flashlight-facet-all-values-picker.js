define("flashlight/component/facet-all-values-picker",

    ["ember", "flashlight/components"],

    function(Ember, FlashlightComponents) {

        ////searchFilterResolver --- used to resolve values, do pagination etc !!! need to know total for facet though.....

        return FlashlightComponents.FlashlightFacetAllValuesPickerComponent = Ember.Component.extend({

            classNames: ["facet-all-values-picker"],

            filterTextValue: "",

            _generation: 0,
            loading: false,

            pageSize: 100,

            dataSet: null,

            _resolveDataSet: function() {
                var filterTextValue  = this.get("filterTextValue");
                if(filterTextValue && (filterTextValue = filterTextValue.trim()) && filterTextValue.length) {
                    this._resolveDataSetFiltered(filterTextValue);
                } else {
                    this._resolveDataSetNoFilterWithSkip(0);
                }
            },

            _resolveDataSetNoFilterWithSkip: function(offset) {

                var resolver = this.get("searchFilterResolver");
                var filterKey  = this.get("filterKey");
                var limit  = this.get("pageSize") || 100;
                var generation;
                var self = this;

                offset = offset || 0;

                this._generation++;
                generation = this._generation;

                resolver.performBasicSearch(filterKey, offset, limit).then(function(r) {

                    r = r && r.result && r.result.result ? r.result.result : null;

                    if(self._generation === generation) {

                        var dataSet = {};
                        var facets = (r && r.facets && r.facets.hasOwnProperty(filterKey)) ? r.facets[filterKey] : null;

                        dataSet.filtered = dataSet.fullset = false;
                        dataSet.results = (facets && facets instanceof Array && facets.length) ? facets : [];
                        dataSet.total = self.get("filterTotal");
                        dataSet.offset = offset;

                        self.set("dataSet", dataSet);
                        self.set("loading", false);                       
                    }
                    self.$().animate({
                       scrollTop: 0
                    }, 'fast');

                }).catch(function(err) {
                    if(self._generation === generation) {
                        self.set("dataSet", null);
                        self.set("loading", false);
                    }
                });
            },

            _resolveDataSetFiltered: function(filterValue) {

                var resolver = this.get("searchFilterResolver");
                var filterKey  = this.get("filterKey");
                var generation;
                var self = this;

                this._generation++;
                generation = this._generation;

                resolver.performFilteredSearch(filterKey, filterValue, true).then(function(r) {

                    r = (r && r.result && r.result.result) ? r.result.result : null;

                    if(self._generation === generation) {

                        var dataSet = {};
                        var facets = (r && r.facets && r.facets.hasOwnProperty(filterKey)) ? r.facets[filterKey] : null;

                        dataSet.filtered = dataSet.fullset = true;
                        dataSet.results = (facets && facets instanceof Array && facets.length) ? facets : [];
                        dataSet.total = dataSet.results.length;
                        dataSet.offset = 0;

                        self.set("dataSet", dataSet);
                        self.set("loading", false);
                    }

                }).catch(function(err) {
                    if(self._generation === generation) {
                        self.set("dataSet", null);
                        self.set("loading", false);
                    }
                });
            },

            _setupDataSet: function() {
                this._resolveDataSet();
            }.on("didReceiveAttrs"),

            _valuesChanged: Ember.observer("filterKey", "filterTotal", "searchFilterResolver", function() {
                this._resolveDataSet();
            }),

            _filterValueChanged: Ember.observer("filterTextValue", function() {
                Ember.run.debounce(this, this._resolveDataSet, 500);
            }),

            skip: Ember.computed("dataSet.offset", function() {
                return this.get("dataSet.offset") || 0;
            }),

            displayTotal: Ember.computed("dataSet.total", function() {
                return this.get("dataSet.total") || 0;
            }),

            pageDisplayValues: Ember.computed("dataSet", "pageSize", function() {
                var dataSet = this.get("dataSet");
                if(!dataSet) {
                    return [];
                }

                if(dataSet.fullset) {
                    var skip = this.get("skip") || 0;
                    var pageSize = this.get("pageSize") || 30;

                    if(skip >= dataSet.results.length) {
                        return [];
                    }

                    return dataSet.results.slice(skip, skip + pageSize);
                }

                return dataSet.results;
            }),

            actions: {

                addFilter: function(filterValue) {
                    var filterKey  = this.get("filterKey");
                    if(filterKey) {
                        this.get("addActiveFilter")(filterKey, filterValue);
                        this.get("closeOverlay")();
                    }
                },

                skipTo: function(offset) {
                    var dataSet = this.get("dataSet");
                    if(!dataSet) {
                        return;
                    }

                    if(dataSet.filtered) {
                        var ds = Object.assign({}, dataSet);
                        ds.offset = offset || 0;
                        this.set("dataSet", ds);
                    } else {
                        this._resolveDataSetNoFilterWithSkip(offset);
                    }
                }
            }
        });
    }
);