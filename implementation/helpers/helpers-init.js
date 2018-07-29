define("flashlight/helpers/init", ["flashlight/helpers/general", "flashlight/helpers/formatting", "flashlight/helpers/resources", "flashlight/helpers/search"],

    function(GeneralHelpers, FormatHelpers, ResourcesHelpers, SearchHelpers) {

        return function(App) {
            GeneralHelpers(App);
            FormatHelpers(App);
            ResourcesHelpers(App);
            SearchHelpers(App);
        }
    }
);