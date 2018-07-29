define("flashlight/component/facet-filters",

    ["ember", 'jquery', "flashlight/components"],

    function(Ember, $, FlashlightComponents) {

        return FlashlightComponents.FlashlightFacetFiltersComponent = Ember.Component.extend({

            /*
                Inputs:
                    results - SearchResultsModel
                    displayedFacets - optional, array of facet keys to be displayed
                    facetDescriptions - FacetDescriptionsModel
                    facetOrder - optional, overrides the facet ordering from the "facetDescriptions" model object
            */

            init: function() {
                this._super.apply(this, arguments);
                this.set("currentAllFiltersPickerSetup", null);
            },
            
            didInsertElement: function(){
                this._super(arguments);
                var self = this;
                $(document).on('keydown.facet-all-values-picker', function ( e ) {
                    if ( e.keyCode === 27 ) { // ESC
                         self.set("currentAllFiltersPickerSetup", null);
                    }
                });
            },

            doesHaveFacets: Ember.computed("results.facets", function() {
                var facets = this.get("results.facets");
                if(!facets || !(typeof(facets) !== "object")) {
                    return false;
                }
                for(var k in facets) {
                    if(facets.hasOwnProperty(k)) {
                        return true;
                    }
                }
                return false;
            }),

            filters: Ember.computed("results.facets", "results.settings", "results.stats", "facetsDescription.facets",
                "facetsDescription.orderedFacetKeys", "displayedFacets", "facetOrder", function() {

                var facets = this.get("results.facets");
                var settings = this.get("results.settings");
                var stats = this.get("results.stats");
                var facetOrder = this.get('facetOrder') || this.get("facetsDescription.orderedFacetKeys");
                var displayedFacets = this.get('displayedFacets');
                var facetDescriptions = this.get("facetsDescription.facets");
                var activeFilters = settings ? settings.get("filters") : null;
                var allFacets = [];
                var self = this;
                var k, i;

                if(typeof(activeFilters) !== "object") {
                    activeFilters = null;
                }

                if(facetOrder) {
                    if(!(facetOrder instanceof Array) || !facetOrder.length) {
                        facetOrder = null;
                    }
                }

                facetDescriptions.forEach(function(facetDesc) {
                    var key = facetDesc.key;
                    if(!key) {
                        return;
                    }

                    var activeFiltersMap = {};
                    var facetActiveFilterValues = null;
                    var a;

                    if(activeFilters && activeFilters.hasOwnProperty(key) && (a = activeFilters[key]) && a instanceof Array && a.length) {
                        facetActiveFilterValues = a;
                        facetActiveFilterValues.forEach(function(x) {
                            activeFiltersMap["" + x] = true;
                        });
                    }

                    var f = {
                        key: key,
                        display: facetDesc.display || key
                    };
                    if(facetDesc.help) {
                        f.help = facetDesc.help;
                    }

                    if(stats && stats.hasOwnProperty(key)) {
                        if(stats[key].hasOwnProperty("countDistinct") && typeof(stats[key].countDistinct) === "number") {
                            f.distinct = stats[key].countDistinct;
                        }
                    }

                    if(facets && facets.hasOwnProperty(key)) {
                        f.values = facets[key];
                    }

                    var srt = facetOrder.indexOf(key);
                    if(srt !== -1) {
                        f.sort = srt;
                    }

                    if(facetDesc.type) {
                        f.type = facetDesc.type;
                    }

                    if(facetActiveFilterValues) {
                        f.activeFilters = facetActiveFilterValues;

                        if(f.values) {
                            f.values.forEach(function(x) {
                                if(x.label && activeFiltersMap["" + x.label]) {
                                    x.active = true;
                                }
                            });
                        }
                    }

                    // Component name, used for vertical listing mainly, primary use is determining the component to insert.
                    var componentName = self.componentNameForFacet(f);
                    if(componentName) {
                        f.componentName = componentName;
                    }

                    allFacets.push(f);
                });

                if(displayedFacets && displayedFacets instanceof Array) {
                    allFacets = allFacets.filter(function(x) {
                        return displayedFacets.indexOf(x.key) !== -1;
                    });
                }

                if(!allFacets.length) {
                    return null;
                }

                // Sort the final set of filters based on the sort ordering
                function __sortFilters(a,b) {
                    if(a.sort === b.sort) {
                        if(a.display < b.display) {
                            return -1;
                        }
                        if(a.display > b.display) {
                            return 1;
                        }
                        return 0;
                    } else if(a.sort === null) {
                        return 1;
                    } else if(b.sort === null) {
                        return -1;
                    }
                    return a.sort - b.sort;
                }
                return allFacets.sort(__sortFilters);
            }),

            componentNameForFacet: function(facetKey) {
                return null;
            },

            // Utility: used for hiding overlays etc. when filters are modified
            _didChangeFilters: function() {
                this.set("currentAllFiltersPickerSetup", null);
            },

            _settingsChanged: function() {
                this.set("currentAllFiltersPickerSetup", null);
            }.on("didUpdateAttrs"),


            actions: {
                addActiveFilter: function(filterKey, value) {
                    var searchSettings = this.get("results.settings");
                    if(searchSettings && !searchSettings.isFilterPinned(filterKey, value)) {
                        this.get('performSearch')(searchSettings.cloneWithSkip(0).cloneWithActiveFilter(filterKey, value));
                        this._didChangeFilters();
                    }
                },

                removeActiveFilter: function(filterKey, value) {
                    var searchSettings = this.get("results.settings");
                    if(searchSettings && !searchSettings.isFilterPinned(filterKey, value)) {
                        this.get('performSearch')(searchSettings.cloneWithSkip(0).cloneWithDeactivatedFilter(filterKey, value));
                        this._didChangeFilters();
                    }
                },

                showFilterValuesPickerForFacet: function(filterKey) {
                    var stats = this.get("results.stats");
                    var totalCount = 0;

                    if(stats && stats.hasOwnProperty(filterKey)) {
                        if(stats[filterKey].hasOwnProperty("countDistinct") && typeof(stats[filterKey].countDistinct) === "number") {
                            totalCount = stats[filterKey].countDistinct;
                        }
                    }

                    this.set("currentAllFiltersPickerSetup", {facet:filterKey, totalCount:totalCount});
                },

                hideFilterValuePicker: function() {
                    this.set("currentAllFiltersPickerSetup", null);
                }
            }
        });
    }
);