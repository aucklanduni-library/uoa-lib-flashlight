define("flashlight/component/active-filters-summary",

    ["ember", "flashlight/components"],

    function(Ember, FlashlightComponents) {

        return FlashlightComponents.FlashlightActiveFiltersSummaryComponent = Ember.Component.extend({

            classNames: ["active-filters"],

            filters: Ember.computed("results.settings.activeFilterPairs", "facetsDescription.facets", function() {

                var filters = [];
                var activeFilters = this.get("results.settings.activeFilterPairs");
                var mappedFacetDescriptions = {};
                var self = this;

                if(!activeFilters) {
                    return null;
                }

                var facetDescriptions = this.get("facetsDescription.facets");
                if(facetDescriptions) {
                    facetDescriptions.forEach(function(x) {
                        mappedFacetDescriptions[x.key] = x;
                    });
                }

                activeFilters.forEach(function(af) {
                    if(!af.key) {
                        return;
                    }

                    if(mappedFacetDescriptions.hasOwnProperty(af.key)) {
                        af.desc = mappedFacetDescriptions[af.key];
                    }

                    var r;
                    r = self.postProcessFilter(af, af.desc, af.desc ? (af.desc.type || "basic") : "basic");
                    if(r) {
                        if(r instanceof Array) {
                            filters.push.apply(filters, r);
                        } else {
                            filters.push(r);
                        }
                    }
                });

                return filters;
            }),

            postProcessFilter: function(filter, desc, type) {

                // Year ranges need to be split into two separate "filters" one for the start year and one for the end year.
                // A special "replace" value is present which determines the new filtering value to apply upon changes being
                // requested by the user.

                if(type === "year-range") {

                    var v = ("" + filter.value).trim();
                    var s = null;
                    var e = null;

                    if(v.indexOf("-") !== -1) {
                        v = v.split("-");
                        s = v[0] || null;
                        e = v[1] || null;
                    } else {
                        s = v;
                    }

                    var startFilter = null;
                    var endFilter = null;

                    if(s) {
                        startFilter = {key:filter.key, value:s, prefix:"From: ", desc:desc, replace:(e ? ("-" + e) : null) };
                    }
                    if(e) {
                        endFilter = {key:filter.key, value:e, prefix:"To: ", desc:desc, replace:(s || null)};
                    }

                    return (startFilter && endFilter) ? [startFilter, endFilter] : (startFilter || endFilter);
                }

                return filter;
            },

            actions: {
                removeSearchTerm: function() {
                    var settings = this.get("settings");
                    this.get("performSearch")(settings.cloneWithQuery("*:*"));
                },

                removeFilter: function(filter) {
                    var settings = this.get("settings");

                    if(settings && filter && filter.key && filter.value && !settings.isFilterPinned(filter.key, filter.value)) {

                        if(filter.hasOwnProperty('replace')) {
                            var overlay = {};
                            overlay[filter.key] = (filter.replace !== null) ? [filter.replace] : null;

                            settings = settings.cloneWithOverlaidFilters(overlay);
                        } else {
                            settings = settings.cloneWithDeactivatedFilter(filter.key, filter.value);
                        }

                        this.get("performSearch")(settings);
                    }
                },

                clearAllFilters: function() {
                    var settings = this.get("settings");
                    this.get("performSearch")(settings.cloneWithOverlaidFilters(null));
                }
            }
        });
    }
);