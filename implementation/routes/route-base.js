define("flashlight/route/base",

    ["ember", "flashlight/flashlight"],

    function(Ember, Flashlight) {

        return Flashlight.BaseRoute = Ember.Route.extend({

            routeClasses: [],
            scrollToTopOnTransition: true,

            activate: function() {
                var routeClasses = this.get("routeClasses");
                if(routeClasses) {
                    routeClasses.forEach(function(x) {
                        Ember.$('body').addClass(x);
                    });
                }
            },

            deactivate: function() {
                var routeClasses = this.get("routeClasses");
                if(routeClasses) {
                    routeClasses.forEach(function(x) {
                        Ember.$('body').removeClass(x);
                    });
                }
            },

            actions: {
                didTransition: function() {
                    if(this.get("scrollToTopOnTransition")) {
                        window.scrollTo(0,0);
                    }
                    return true;
                },

                loading: function(transition, originRoute) {
                    var controller = this.get("controller");
                    if(controller) {
                        controller.set('currentlyLoading', true);
                        transition.promise.finally(function() {
                            controller.set('currentlyLoading', false);
                        });
                    } else {
                        return true;
                    }
                }
            }
        });
    }
);

define("flashlight/controller/base",

    ["ember", "flashlight/flashlight", "flashlight/model/search-settings"],

    function(Ember, Flashlight, ModelSearchSettings) {

        return Flashlight.BaseController = Ember.Controller.extend({

            defaultSearchRoute: "search",

            actions: {
                performSearch: function(settings) {
                    if(typeof(settings) === "string") {
                        settings = ModelSearchSettings.createWithInitialSearch(settings);
                    }
                    this.transitionToRoute(this.get("defaultSearchRoute") || "search", settings.get("frontendURL"));
                }
            }
        });
    }
);