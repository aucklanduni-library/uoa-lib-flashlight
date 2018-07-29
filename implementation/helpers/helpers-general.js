define("flashlight/helpers/general",

    ["ember", "flashlight/helpers/general/value-to-class-name"],

    function(Ember, HelperValueToClassName) {

        return function(App) {

            // Generic comparator helpers
            // ---

            App.register('helper:equal', Ember.Helper.helper(function(params, namedParameters) {
                return params[0] === params[1];
            }));

            App.register('helper:equal-or-contains', Ember.Helper.helper(function(params, namedParameters) {
                var a = params[0];
                var b = params[1];

                if(a === b) {
                    return true;
                }

                return (a instanceof Array) ? a.indexOf(b) !== -1 : false;
            }));




            App.register('helper:is-null-or-undefined', Ember.Helper.helper(function(params, namedParameters) {
                return (params[0] === null || params[0] === undefined);
            }));

            App.register('helper:user-array-index', Ember.Helper.helper(function(params, namedParameters) {

                if(!params || !params.length) {
                    return;
                }

                var total = 1;

                for(var i = 0; i < params.length; i++) {
                    var index = params[i];
                    if(typeof index === "string") {
                        index = parseInt(index);
                        if(isNaN(index)) {
                            continue;
                        }
                    }
                    if(typeof index !== "number") {
                        continue;
                    }
                    total += index;
                }

                return total;
            }));

            App.register('helper:array-with-n-or-more', Ember.Helper.helper(function(params, namedParameters) {

                if(!params || !params.length) {
                    return false;
                }

                var array = params[0];
                var n = params[1];

                if(!(array instanceof Array)) {
                    return false;
                }
                return array.length >= n;
            }));


            App.register('helper:array-with-items', Ember.Helper.helper(function(params, namedParameters) {

                if(!params || !params.length) {
                    return false;
                }

                var array = params[0];
                if(!(array instanceof Array)) {
                    return false;
                }
                return array.length > 0;
            }));


            App.register('helper:value-greater-than-array-length', Ember.Helper.helper(function(params, namedParameters) {

                if(!params || !params.length) {
                    return false;
                }

                var n = params[0];
                var array = params[1];

                if(!(array instanceof Array)) {
                    return false;
                }
                return n > array.length;
            }));



            App.register('helper:concat-items-into-array', Ember.Helper.helper(function(params, namedParameters) {

                if(!params || !params.length) {
                    return [];
                }

                var array = [];
                for(var i = 0; i < params.length; i++) {
                    var v = params[i];
                    if(v instanceof Array) {
                        array.push.apply(array, v);
                    }  else {
                        array.push(v);
                    }
                }
                return array;
            }));


            App.register('helper:any-value-truthy', Ember.Helper.helper(function(params, namedParameters) {
                if(params.length) {
                    for(var i = 0; i < params.length; i++) {
                        if(params[i]) {
                            return true;
                        }
                    }
                }
                return false;
            }));


            App.register('helper:all-values-truthy', Ember.Helper.helper(function(params, namedParameters) {
                if(params.length) {
                    for(var i = 0; i < params.length; i++) {
                        if(!params[i]) {
                            return false;
                        }
                    }
                }
                return true;
            }));



            // Generic: array length plural determination
            // ---
            App.register('helper:is-array-plural', Ember.Helper.helper(function(params, namedParameters) {

                var array = params[0];
                if(!array || !(array instanceof Array)) {
                    return false;
                }

                var isPluralResult = params[1];
                var isNotPluralResult = params[2];
                var prependLength = params[3] === true;

                if(isPluralResult === undefined) {
                    isPluralResult = true;
                }

                if(isNotPluralResult === undefined) {
                    isNotPluralResult = false;
                }

                if(prependLength) {
                    return ("" + array.length) + ((array.length === 1) ? isNotPluralResult : isPluralResult);
                }

                return (array.length === 1) ? isNotPluralResult : isPluralResult;
            }));

            App.register('helper:is-plural', Ember.Helper.helper(function(params, namedParameters) {

                var count = params[0];
                if(typeof(count) !== "number") {
                    return false;
                }

                var isPluralResult = params[1];
                var isNotPluralResult = params[2];
                var prependLength = params[3] === true;

                if(isPluralResult === undefined) {
                    isPluralResult = true;
                }

                if(isNotPluralResult === undefined) {
                    isNotPluralResult = false;
                }

                if(prependLength) {
                    return ("" + count) + ((count === 1) ? isNotPluralResult : isPluralResult);
                }

                return (count === 1) ? isNotPluralResult : isPluralResult;
            }));



            // Generic value to class name helper
            // ---
            App.register('helper:value-to-class-name', Ember.Helper.helper(function(params, namedParameters) {
                return HelperValueToClassName(params[0]);
            }));



            // Get, with default value
            // ---
            App.register('helper:get-with-default', Ember.Helper.helper(function(params, namedParameters) {
                var object = params[0];
                var key = params[1];
                var defaultValue = params[2];

                if(!object || typeof(key) !== "string") {
                    return defaultValue;
                }

                return object.get(key) || defaultValue;
            }));


            // Find Matching Item in Array: for a specific property find an item in array with a specific value
            // ---
            //
            var FindMatchingItemInArrayHelper = Ember.Helper.extend({
                destroy: function() {
                    if (this.teardown) this.teardown();
                    this._super();
                },

                setupRecompute: function(array) {
                    if(this._teardown) {
                        this._teardown();
                    }

                    var path = "[]";
                    array.addObserver(path, this, this.recompute);

                    this._teardown = function() {
                        array.removeObserver(path, this, this.recompute);
                    };
                },
                compute: function(items) {
                    var array = items[0];
                    var identifier = items[1];
                    var property = items[2] || "id";

                    this.setupRecompute(array);

                    if(!array) {
                        return null;
                    }

                    return array.find(function(item) {
                        return item.get(property) == identifier;
                    });
                }
            });

            App.register('helper:array-item-with-id', FindMatchingItemInArrayHelper);

        }

    }
);


define("flashlight/helpers/general/value-to-class-name", [],

    function() {
        return function __helper_value_to_class_name(v) {
            if(!v) {
                return "";
            }
            return v.toLowerCase().replace(/\s+/gi, "-").replace(/[^a-z0-9]/gi, "");
        }
    }
);