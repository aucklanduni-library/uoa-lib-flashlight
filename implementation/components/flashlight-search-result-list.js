define("flashlight/component/search-result-list",

    ["ember","flashlight/components"],

    function(Ember, FlashlightComponents) {
        return FlashlightComponents.FlashlightSearchResultListComponent = Ember.Component.extend({

            tagName: "ul",

            classNames: ['uoa-lib-result-set'],
            classNameBindings: ["verticalListing:uoa-lib-v-list", "hasFacetsRight:uoa-lib-has-toolbar-right", "hasOrdinals:uoa-lib-has-ordinal"],

            verticalListing: true,
            hasFacetsRight: true,
            hasOrdinals: true,

            searchResultItemComponentName: "flashlight-search-result-item",
            
            actions: {
                addActiveFilter: function(filterKey, value) {
                    var searchSettings = this.get("settings");
                    if(searchSettings && !searchSettings.isFilterPinned(filterKey, value)) {
                        this.get('performSearch')(searchSettings.cloneWithSkip(0).cloneWithActiveFilter(filterKey, value));
                    }
                },

                removeActiveFilter: function(filterKey, value) {
                    var searchSettings = this.get("settings");
                    if(searchSettings && !searchSettings.isFilterPinned(filterKey, value)) {
                        this.get('performSearch')(searchSettings.cloneWithSkip(0).cloneWithDeactivatedFilter(filterKey, value));
                    }
                }
            }
        });
    }
);