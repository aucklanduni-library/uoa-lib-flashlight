define("flashlight/helpers/formatting",

    ["ember", "moment"],

    function(Ember, moment, HelperValueToClassName) {

        return function(App) {


            function toLocaleStringSupportsLocales() {
                var number = 0;
                try {
                    number.toLocaleString('i');
                } catch (e) {
                    return e.name === 'RangeError';
                }
                return false;
            }

            function toLocaleStringSupportsOptions() {
                return !!(typeof Intl === 'object' && Intl && typeof Intl.NumberFormat === 'function');
            }

            var localSupportAvailable = toLocaleStringSupportsLocales();

            App.register('helper:format-number-thousands', Ember.Helper.helper(function(params, namedParameters) {

                var num = params[0];
                if(num === undefined) {
                    return null;
                }
                if(typeof num === "string") {
                    num = parseInt(num);
                    if(isNaN(num)) {
                        return null;
                    }
                }
                if(typeof num !== "number") {
                    return null;
                }

                if(localSupportAvailable) {
                    return num.toLocaleString();
                }

                // http://stackoverflow.com/questions/9743038/how-do-i-add-a-thousand-seperator-to-a-number-in-javascript
                var rx = /(\d+)(\d{3})/;
                return String(num).replace(/^\d+/, function (w) {
                    while (rx.test(w)) {
                        w = w.replace(rx, '$1,$2');
                    }
                    return w;
                });
            }));


            App.register('helper:lower-case-string', Ember.Helper.helper(function(params, namedParameters) {
                var string = params[0];
                if(!string) {
                    return null;
                }
                return ("" + string).toLowerCase();
            }));


            // Facet grouping
            App.register('helper:initial-grouping-from-term', Ember.Helper.helper(function(params, namedParameters) {

                var term = params[0];
                var symbolGroup = params[1] || "OTHER";

                if(!term) {
                    return null;
                }
                term = "" + term;

                var initial = term.substring(0, 1);
                return (initial.match(/[A-Z|a-z]/i)) ? initial.toUpperCase() : symbolGroup;
            }));


            // http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
            // ---

            function humanFileSize(bytes, si) {
                var thresh = si ? 1000 : 1024;
                if(Math.abs(bytes) < thresh) {
                    return bytes + ' B';
                }
                var units = si
                    ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
                    : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
                var u = -1;
                do {
                    bytes /= thresh;
                    ++u;
                } while(Math.abs(bytes) >= thresh && u < units.length - 1);
                return bytes.toFixed(1)+' '+units[u];
            }

            App.register('helper:bytes-to-nice', Ember.Helper.helper(function(params, namedParameters) {
                var size = params[0];
                if(size === null || size === undefined) {
                    return "-";
                }
                size = parseInt(size);
                if(isNaN(size)) {
                    return "-";
                }
                return humanFileSize(parseInt(params[0] || 0), true);
            }));

            
            // Date Time from Now with automatic updates to the displayed value.
            // ---
            //
            App.DateTimeFromNowComponent = Ember.Component.extend({
                tagName: 'time',

                output: function() {
                    return moment(this.get('value')).fromNow();
                }.property('value'),

                didInsertElement: function() {
                    this.tick();
                },

                tick: function() {
                    var nextTick = Ember.run.later(this, function() {
                        this.notifyPropertyChange('output');
                        this.tick();
                    }, 10000);
                    this.set('nextTick', nextTick);
                },

                willDestroyElement: function() {
                    var nextTick = this.get('nextTick');
                    if(nextTick) {
                        Ember.run.cancel(nextTick);
                    }
                }
            });
        }

    }
);