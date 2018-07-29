define("flashlight/component/search-box",

    ["ember", "jquery","flashlight/components", "flashlight/model/search-settings"],

    function(Ember, $, FlashlightComponents, FlashlightSearchSettings) {

        return FlashlightComponents.FlashlightSearchBoxComponent = Ember.Component.extend({

            tagName: "form",
            classNames: ["uoa-lib-inline-form"],

            searchTerm: null,

            _setupWithAttributes: function() {
                var settings = this.get("settings");
                if(settings) {
                    this.set("searchTerm", settings.get("searchTerm"));
                } else {
                    this.set("searchTerm", "");
                }
            }.on("didReceiveAttrs"),

            actions: {
                searchUsingCurrentTerm: function() {
                    var searchTerm = this.get("searchTerm");
                    var settings = null;//this.get("settings");

                    if(searchTerm) {
                        settings = settings ? settings.cloneWithSkip(0).cloneWithSearchTerm(searchTerm) : FlashlightSearchSettings.createWithInitialSearch(searchTerm);
                    } else {
                        settings = settings ? settings.cloneWithSkip(0).cloneWithQuery("*:*") : FlashlightSearchSettings.createWithQuerySearch("*:*");
                    }
                    this.get('performSearch')(settings);
                }
            }
        });
    }
);