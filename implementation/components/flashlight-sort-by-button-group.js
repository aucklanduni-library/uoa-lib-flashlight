define("flashlight/component/sort-by-button-group",

    ["ember", "flashlight/components", "bootstrap", "flashlight/model/search-settings"],

    function(Ember, FlashlightComponents, Bootstrap, ModelSearchSettings) {

        var DEFAULT_SORTING_KEY = "relevance";

        function _findDefaultSortingOption(sortingOptions) {

            var bestDefault = null;
            var specifiedDefault = null;
            var lastResortDefault = sortingOptions[0];

            if(sortingOptions && sortingOptions instanceof Array && sortingOptions.length) {
                sortingOptions.forEach(function(so) {
                    if(so.default && !specifiedDefault) {
                        specifiedDefault = so;
                    }

                    if(so.key === DEFAULT_SORTING_KEY && !bestDefault) {
                        bestDefault = so;
                    }

                    if(!so.key) {
                        lastResortDefault = so;
                    }
                });
            }

            return (specifiedDefault) ? specifiedDefault : (bestDefault || lastResortDefault);
        }

        /* Example Sorting Options:
         *  -----------------------
         *  {key: "relevance", default:true, label: "Relevance"}
         *  {key: "course", ascending:true, label: "Title A-Z"}
         *  {key: "course", ascending:false, label: "Title Z-A"}
         */

        return FlashlightComponents.FlashlightSortByButtonGroupComponent = Ember.Component.extend({

            _didInsertElement: function() {
                this.$('.dropdown-toggle').dropdown();
            }.on("didInsertElement"),

            selectedOption: Ember.computed("sortingOptions", "settings.sortingKey", "settings.sortingOrderIsAscending", function() {

                var sortingOptions = this.get("sortingOptions");
                if(!sortingOptions || !(sortingOptions instanceof Array) || !sortingOptions.length) {
                    return null;
                }

                var defaultOption = _findDefaultSortingOption(sortingOptions);

                var searchSettings = this.get("settings");
                if(!searchSettings) {
                    return defaultOption ? (defaultOption.label || null) : null;
                }

                var sortingKey = searchSettings.get("sortingKey") || DEFAULT_SORTING_KEY;
                var sortingOrderIsAscending = searchSettings.get("sortingOrderIsAscending") || false;

                for(var i = 0; i < sortingOptions.length; i++) {
                    var so = sortingOptions[i];
                    if(so && so.key === sortingKey) {
                        var order = so.ascending || false;
                        if(order === sortingOrderIsAscending) {
                            return so;
                        }
                    }
                }

                return defaultOption;
            }),

            actions: {
                changeSorting: function(sortingOption) {
                    var settings = this.get("settings");
                    if(settings) {

                        var key = sortingOption.key || DEFAULT_SORTING_KEY;
                        var ascending = sortingOption.ascending || false;

                        settings = settings.cloneWithSorting(key, ascending);

                        this.get("performSearch")(settings);
                    }
                }
            }
        });
    }
);
