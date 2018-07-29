define("flashlight/route/browse",

    ["ember", "flashlight/flashlight", "flashlight/route/base", "bluebird", "flashlight/model/search-settings", "flashlight/model/promise-object"],

    function(Ember, Flashlight, BaseRoute, Promise, FlashlightSearchSettings, FlashlightPromiseObject) {

        function __filterValuesForGroup(allFacetValues, matchGroup) {

            matchGroup = matchGroup.toLowerCase();
            return allFacetValues.filter(function(v){
                var char = v.value[0].toLowerCase();
                if(char < 'a' || char > "z"){
                    char = "#";
                }
                return (char === matchGroup);
            });
        }

        return Flashlight.BrowseRoute = BaseRoute.extend({

            facetNameParameter: "facet",

            dataProvider: null,

            queryParams: {
                g: {refreshModel: true},      // group (ie. a, b, c)
                s: {refreshModel: true},      // filtering text value
                sg: {replace: true},          // group (overrides "g"), used for transition free
                o: {replace: true}            // offset
            },

            o: 0,
            g: null,
            s: null,
            sg: null,


            facetNameFromParameters: function(params) {
                var fnp = this.get("facetNameParameter");
                return (params && params.hasOwnProperty(fnp)) ? params[fnp] : null;
            },

            facetGroupFromParameters: function(params, hasFilterValue) {
                if(hasFilterValue) {
                    return (params && params.hasOwnProperty("sg")) ? params.sg : null;
                }
                return (params && params.hasOwnProperty("g")) ? params.g : null;
            },

            transformGroupValues: function(facet, v) {
                return v;
            },

            model: function(params, transition) {

                var dataProvider = this.get("dataProvider");
                var facetDescriptions = this.get("facetsDescription");
                var self = this;

                var browseFacet = this.facetNameFromParameters(params);
                if(!browseFacet) {
                    return Ember.RSVP.reject(new Error("BrowseDetail route requires the 'facet name' to be specified."));
                }

                var filterValue = (params && params.hasOwnProperty("s") && typeof(params.s) !== "undefined") ? ("" + params.s).trim() : null;
                if(!filterValue) {
                    filterValue = null;
                }

                var facetGroup = this.facetGroupFromParameters(params, !!filterValue);
                if(facetGroup) {
                    facetGroup = facetGroup.toLowerCase();
                    if(facetGroup < 'a' || facetGroup > 'z') {
                        facetGroup = "#";
                    }
                }

                var groups;

                var p = dataProvider.getListingOfAvailableGroups(browseFacet).then(function(groupsData) {

                    if(groupsData && groupsData.groups && groupsData.groups instanceof Array && groupsData.groups.length) {
                        groups = groupsData.groups;

                        if(!facetGroup) {
                            facetGroup = ("" + groups[0]).toLowerCase();
                        }
                    } else {
                        groups = null;
                    }

                    return groups;

                }).then(function() {

                    var r = {facetsDescription:facetDescriptions, dataProvider:dataProvider};
                    r.facet = browseFacet;

                    if(groups) {
                        groups = groups.map(function(v) {
                            var link = filterValue ? {sg:v} : {g:v};
                            return {group:v, display:v.toUpperCase(), enable:true, link:link};
                        });

                        r.groups = groups;
                    } else {
                        r.groups = null;
                    }


                    // If filtering is being applied, then we can proceed to perform a search for all values. The "sg" query parameter
                    // is then used to drill down into a specific group within the search results.

                    if(filterValue) {

                        return dataProvider.searchGroupForMatchingValues(browseFacet, filterValue).then(function(searchingGroupData) {

                            r.filteringValue = filterValue;

                            // Need to update groups now to disable groups where data is not present.
                            var charsPresent = {};

                            if(searchingGroupData && searchingGroupData.values && searchingGroupData.values instanceof Array && searchingGroupData.values.length) {
                                searchingGroupData.values.forEach(function(v) {
                                    var char = v.value[0].toLowerCase();
                                    if(char < 'a' || char > "z"){
                                        char = "#";
                                    }
                                    charsPresent[char] = true;
                                });

                                r.allSearchedValues = self.transformGroupValues(browseFacet, searchingGroupData.values);
                            } else {
                                r.allSearchedValues = null;
                            }


                            // Now need to determine the "current facet group".
                            var currentGroup = null;

                            if(r.groups) {
                                r.groups.forEach(function(grp) {
                                    if(!charsPresent.hasOwnProperty(grp.group)) {
                                        grp.enable = false;
                                    }
                                });

                                currentGroup = r.groups.find(function(v){
                                    return (v.enable === true && v.group === facetGroup);
                                });

                                if(currentGroup == null){
                                    currentGroup = r.groups.find(function(v){
                                        return (v.enable === true);
                                    });
                                }
                            }

                            if(currentGroup) {
                                r.current = Ember.Object.create({facet:browseFacet, group:currentGroup.group, display:currentGroup.display,
                                    allValues:(r.allSearchedValues ?  __filterValuesForGroup(r.allSearchedValues, currentGroup.group) : [])});
                            } else {
                                r.current = Ember.Object.create({facet:browseFacet, allValues:[]});
                            }

                            return r;
                        });
                    }

                    return dataProvider.getAllValuesForGroup(browseFacet, facetGroup).then(function(groupData) {

                        if(groupData && groupData.values && groupData.values instanceof Array && groupData.values.length) {

                            groupData.values.sort(function(a, b){
                                a = a.value.toLowerCase();
                                b = b.value.toLowerCase();
                                if(a>b) {
                                    return 1;
                                }
                                else if(a<b){
                                    return -1;
                                }
                                return 0;
                            });

                            r.current = Ember.Object.create({facet:browseFacet, group:facetGroup, display:facetGroup.toUpperCase(), allValues:self.transformGroupValues(browseFacet, groupData.values)});
                        }

                        return r;
                    });

                });

                return FlashlightPromiseObject.create({promise: p});
            }
        });
    }
);

define("flashlight/controller/browse",

    ["ember", "flashlight/flashlight", "flashlight/controller/base"],

    function(Ember, Flashlight, FlashlightBaseController) {


        function __filterValuesForGroup(allFacetValues, matchGroup) {

            matchGroup = matchGroup.toLowerCase();
            return allFacetValues.filter(function(v){
                var char = v.value[0].toLowerCase();
                if(char < 'a' || char > "z"){
                    char = "#";
                }
                return (char === matchGroup);
            });
        }

        return Flashlight.BrowseController = FlashlightBaseController.extend({

            offset: Ember.computed('o', function() {
                var offset = this.get("o");
                if(typeof offset === "undefined" || offset === null) {
                    return 0;
                }

                if(typeof offset !== "number") {
                    offset = parseInt("" + offset);
                    if(isNaN(offset)) {
                        offset = 0;
                    }
                }

                if(offset < 0) {
                    offset = 0;
                }

                return offset;
            }),
            filteredGroup: Ember.computed.alias('sg'),
            pageSize: 30,

            facetKey: Ember.computed.alias("model.facet"),
            allFacetGroups: Ember.computed.alias("model.groups"),

            currentFacetGroup: Ember.computed.alias("model.current"),
            facetsDescription: Ember.computed.alias("model.facetsDescription"),

            facetedSearchBaseRouteName: "faceted-search-base",
            itemRouteName: "item",

            scrollToTopOnOffsetChange: true,

            values: Ember.computed("model.current.allValues", "offset", "pageSize", function() {

                var allValues = this.get("model.current.allValues");
                var offset = this.get("offset") || 0;
                var pageSize = this.get("pageSize") || 30;

                if(allValues && allValues instanceof Array && allValues.length) {

                    var length = allValues.length;

                    if(offset >= length) {
                        return null;
                    }

                    return allValues.slice(offset, offset + pageSize);
                }

                return null;
            }),

            totalValueCount: Ember.computed("model.current.allValues", function() {
                var allValues = this.get("model.current.allValues");
                return (allValues && allValues instanceof Array && allValues.length) ? allValues.length : 0;
            }),

            _offsetDidChange: function() {
                if(this.get("scrollToTopOnOffsetChange")) {
                    window.scrollTo(0,0);
                }
            }.observes("offset"),

            _filteredGroupDidChange: function() {

                var browseFacet = this.get("model.facet");
                var filteredGroup = this.get("filteredGroup");
                var filteringValue = this.get("model.filteringValue");

                if(!filteringValue) {
                    return;
                }

                var groups = this.get("model.groups");
                var allSearchedValues = this.get("model.allSearchedValues");
                var newCurrent = null;

                if(groups) {

                    var currentGroup = groups.find(function(v){
                        return (v.enable === true && v.group === filteredGroup);
                    });

                    if(currentGroup) {
                        newCurrent = Ember.Object.create({facet:browseFacet, group:currentGroup.group, display:currentGroup.display, allValues:(allSearchedValues ?  __filterValuesForGroup(allSearchedValues, currentGroup.group) : [])});
                    }
                }

                if(!newCurrent) {
                    newCurrent = Ember.Object.create({facet:browseFacet, allValues:[]});
                }

                this.set("model.current", newCurrent);
                this.set("o", 0);

            }.observes("filteredGroup"),


            filteringTerm: "",
            _filteringTermChanged: Ember.observer("filteringTerm", function() {
                Ember.run.debounce(this, this._transitionForFilteringTermChange, 500);
            }),

            _transitionForFilteringTermChange: function() {
                var filteringTerm = this.get("filteringTerm");
                if(filteringTerm) {
                    filteringTerm = ("" + filteringTerm).trim();
                }
                
                var filteredGroup = this.get("filteredGroup");
                var currentgroup  = this.get("currentFacetGroup.group");

                if(filteringTerm) {
                    this.transitionToRoute({
                        queryParams: {
                            s: filteringTerm,
                            o: undefined,
                            g: undefined,
                            sg: filteredGroup || currentgroup
                        }
                    });
                } else {
                    this.transitionToRoute({
                        queryParams: {
                            s: undefined,
                            o: undefined,
                            g: undefined,
                            sg:  filteredGroup || currentgroup
                        }
                    });
                }
            },


            actions: {
                "skipTo": function(offset) {
                    this.transitionToRoute({
                        queryParams: {
                            o: parseInt(offset)
                        }
                    });
                },

                "viewFacetedSearch": function(label) {
                    this.transitionToRoute((this.get("facetedSearchBaseRouteName") || "faceted-search-base"), this.get("model.facet"), label);
                },

                "viewItem": function(itemID) {
                    this.transitionToRoute((this.get("itemRouteName") || "item"), itemID);
                }
            }
        });
    }
);