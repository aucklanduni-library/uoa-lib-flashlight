define("flashlight/model/promise-object",

    ["ember", "flashlight/flashlight"],

    function(Ember, Flashlight) {

        return Flashlight.PromiseObject = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);
    }
);

define("flashlight/model/promise-array",

    ["ember", "flashlight/flashlight"],

    function(Ember, Flashlight) {

        return Flashlight.PromiseArray = Ember.ArrayProxy.extend(Ember.PromiseProxyMixin);
    }
);