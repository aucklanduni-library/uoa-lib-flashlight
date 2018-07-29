define("flashlight/model/facet-descriptions",

    ["ember", "flashlight/flashlight"],

    function(Ember, Flashlight) {

        /*
            Facet Descriptions:
                {
                    key: "name",
                    display: "Artist",
                    type: "basic"           // -- optional -- //
                }
         */

        var FacetDescriptionsModel = Ember.Object.extend({

            descriptions: null,

            _setDescriptions: function(desc) {
                this.set("descriptions", desc);
            },

            browsableFacets: Ember.computed("descriptions", function() {
                var desc = this.get("descriptions");

                return desc.filter(function(x) {
                    return x.browse === true;
                }).map(function(x) {
                    return x;
                });
            }),

            facets: Ember.computed("descriptions", function() {
                var desc = this.get("descriptions");

                return desc.filter(function(x) {
                    return x.filter === true;
                }).map(function(x) {
                    return x;
                });
            }),

            searchedFacetKeys: Ember.computed("descriptions", function() {

                // Searched facets are facets that are included in API calls to be faceted on, some
                // facet keys (like year ranges), aren't provided on the list of facets requested
                // and are instead returned via stats min/max for example.

                var searchedFacetKeys = [];
                var desc = this.get("descriptions");

                if(desc) {
                    desc.forEach(function(d) {
                        if(d.key && d.filter === true && d.display && (!d.type || d.type === "basic" || d.searchable === true)) {
                            searchedFacetKeys.push(d.key);
                        }
                    });
                }
                return searchedFacetKeys;
            }),

            orderedFacetKeys: Ember.computed("descriptions", function() {
                var facetKeys = [];
                var desc = this.get("descriptions");

                if(desc) {
                    desc.forEach(function(d) {
                        if(d.key) {
                            facetKeys.push(d.key);
                        }
                    });
                }
                return facetKeys;
            }),


            // Display name lookups
            // ---
            displayNameLookupMap: Ember.computed("descriptions", function() {
                var lookupmap = {};
                var desc = this.get("descriptions");

                if(desc) {
                    desc.forEach(function(d) {
                        if(d.key) {
                            lookupmap[d.key] = d.display || d.key;
                        }
                    });
                }
                return lookupmap;
            }),

            displayNamePluralLookupMap: Ember.computed("descriptions", function() {
                var lookupmap = {};
                var desc = this.get("descriptions");

                if(desc) {
                    desc.forEach(function(d) {
                        if(d.key) {
                            lookupmap[d.key] = d.displayPlural || d.display || d.key;
                        }
                    });
                }
                return lookupmap;
            })
        });

        FacetDescriptionsModel.reopenClass({
            createFacetDescription: function(description) {
                var instance = this.create();
                var copiedItems = [];

                description.forEach(function(x) {
                    var newDesc = {};
                    for(var k in x) {
                        if(x.hasOwnProperty(k)) {
                            newDesc[k] = x[k];
                        }
                    }
                    copiedItems.push(newDesc);
                });

                instance._setDescriptions(Ember.A(copiedItems));
                return instance;
            }
        });

        return (Flashlight.FacetDescriptionsModel = FacetDescriptionsModel);
    }
);