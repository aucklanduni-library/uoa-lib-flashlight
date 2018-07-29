define("flashlight/component/vertical-facet-filters",

    ["ember", 'jquery', "flashlight/components", "flashlight/component/facet-filters"],

    function(Ember, $, FlashlightComponents, FlashlightFacetFilters) {

        return FlashlightComponents.FlashlightVerticalFacetFiltersComponent = FlashlightFacetFilters.extend({

            defaultFacetGroupComponentName: "flashlight-facet-group-basic",
            defaultFacetGroupYearRangeComponentName: "flashlight-facet-group-year-range",

            appendShowToFacetGroup: false,

            // Generic mapping table, converting a type to a component name.

            facetTypeToComponentMapping: Ember.computed(function() {
                var defaultComponent = this.get("defaultFacetGroupComponentName");
                var r = {};

                r.basic = defaultComponent;
                r['year-range'] = this.get("defaultFacetGroupYearRangeComponentName");
                r['*'] = defaultComponent;

                return r;
            }),

            // Lookup the component name for a "facet" description, facet description is an item
            // that comes from the "filters" properpty of the FlashlightFacetFilters superclass.

            componentNameForFacet: function(facet) {
                var mapping = this.get("facetTypeToComponentMapping");
                if(mapping) {

                    if(facet.type && mapping.hasOwnProperty(facet.type)) {
                        return mapping[facet.type];
                    }

                    if(mapping.hasOwnProperty("*")) {
                        return mapping["*"]
                    }
                }
                return this.get("defaultFacetGroupComponentName");
            },

            _didChangeFilters: function() {
                this._super.apply(this, arguments);
                this.set("appendShowToFacetGroup", false);
            },

            actions: {
                changeAppendShow: function(v) {
                    this.set("appendShowToFacetGroup", !!v);
                }
            }
        });
    }
);