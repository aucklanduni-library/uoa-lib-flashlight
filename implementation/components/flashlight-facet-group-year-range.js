define("flashlight/component/facet-group-year-range",

    ["ember", "flashlight/components", "flashlight/component/facet-group-basic"],

    function(Ember, FlashlightComponents, FlashlightFacetGroupBasicComponent) {

        return FlashlightComponents.FlashlightFacetGroupYearRangeComponent = FlashlightFacetGroupBasicComponent.extend({

            startYear: null,
            endYear:null,

            _componentWasInserted: function() {
                var self = this;

                function _safeAdjustValue(value, adjustment) {
                    value = ("" + value).replace(/[^0-9]/g, "");
                    return parseInt(value) + adjustment;
                }

                this.$("#date-start-increase").click(function(e){
                    self.set("startYear", _safeAdjustValue(self.get("startYear"), 1));
                    e.preventDefault();
                    return false;
                });

                this.$("#date-start-decrease").click(function(e){
                    self.set("startYear", _safeAdjustValue(self.get("startYear"), -1));
                    e.preventDefault();
                    return false;
                });

                this.$("#date-end-increase").click(function(e){
                    self.set("endYear", _safeAdjustValue(self.get("endYear"), 1));
                    e.preventDefault();
                    return false;
                });

                this.$("#date-end-decrease").click(function(e){
                    self.set("endYear", _safeAdjustValue(self.get("endYear"), -1));
                    e.preventDefault();
                    return false;
                });

            }.on("didInsertElement"),

            _setupWithAttributes: function() {
                var results = this.get("results");
                var settings = this.get('settings');
                var filterKey = this.get("filter.key");
                var startYear = null;
                var endYear = null;

                if(settings) {
                    var filters = settings.get("filters");
                    var a;

                    if(filters && filters.hasOwnProperty(filterKey) && (a = filters[filterKey]) && a instanceof Array && a.length) {
                        a = a[0];
                        if(a && typeof(a) === "string") {
                            a = a.split("-");
                            var s = a[0];
                            var e = a.length > 1 ? a[1] : "";

                            s = s.trim().replace(/[^0-9]/g, "");
                            e = e.trim().replace(/[^0-9]/g, "");

                            if(s) {
                                startYear = parseInt(s);
                            }
                            if(e) {
                                endYear = parseInt(e);
                            }
                        }
                    }
                }

                if(results && filterKey) {
                    var range = results.rangeForKey(filterKey);
                    if(range) {
                        if(range.hasOwnProperty('start') && startYear === null) {
                            startYear = range.start;
                        }
                        if(range.hasOwnProperty('end') && endYear === null) {
                            endYear = range.end;
                        }
                    }
                }

                this.set("startYear", startYear);
                this.set("endYear", endYear);

            }.on("didReceiveAttrs"),

            hideFacetGroup: Ember.computed(function() {
                return false;
            }),

            actions: {
                applyYearRange: function() {
                    var settings = this.get('settings');
                    var startYear = this.get("startYear");
                    var endYear = this.get("endYear");
                    var filterKey = this.get("filter.key");
                    var filterValue;

                    if(filterKey) {
                        startYear = ("" + startYear).trim().replace(/[^0-9]/g, "");
                        endYear = ("" + endYear).trim().replace(/[^0-9]/g, "");

                        filterValue = (startYear || "") + "-" + (endYear || "");

                        var overlaidFilters = {};
                        overlaidFilters[filterKey] = [filterValue];

                        this.get("performSearch")(settings.cloneWithOverlaidFilters(overlaidFilters));
                    }
                }
            }
        });
    }
);