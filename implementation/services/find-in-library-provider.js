define(

    "flashlight/service/find-in-library-provider",

    ["ember", "flashlight/flashlight", "flashlight/model/promise-object", "flashlight/util/ajax"],

    function(Ember, Flashlight,PromiseObject, AJAX) {


        function _getAlmaIDsFromRecord(data){

            var matches;
            if(data.recordID){
                matches =  data.recordID.match(/uoa_alma\d+/);
                if(matches){
                    return matches[0];
                }
            }

            if(data.source && data.source instanceof Array && data.source.length){
                var result;

                result = data.source.map(function(x) {
                    var m = x ? x.match(/uoa_alma\d+/) : null;
                    return m ? m[0] : null;
                }).filter(function(x) {
                    return x !== null;
                });

                if(result.length) {
                    return result;
                }
            }

            if(data.source){
                matches = data.source.match(/uoa_alma\d+/);
                return matches ? matches[0] : null;
            }

            return null;
        }


        return Flashlight.FindInLibraryProviderService =  Ember.Service.extend(Ember.Evented,{

            // FIXME: don't hardcode in the flashlight framework
            serviceURL: "https://www.library.dev.auckland.ac.nz/api/search/journals/v1/search/",

            resolveCoalescePeriod: 250,

            _pendingResolves: [],


            findLinksForAlmaID: function(identifiers) {
                var self = this;
                return new Ember.RSVP.Promise(function(resolve, reject) {
                    self._pendingResolves.push({identifiers:identifiers, resolve:resolve, reject:reject});
                    self._triggerResolve();
                });
            },

            _triggerResolve: function() {

                Ember.run.debounce(this, this._resolveAllPending, this.get("resolveCoalescePeriod") || 500);
            },

            _formatRequestURLForIdentifiers: function(identifiers) {
                var baseServiceURL = this.get("serviceURL");
                if(baseServiceURL[baseServiceURL.length - 1] !== "/") {
                    baseServiceURL += "/";
                }
                return baseServiceURL + identifiers.join(" OR ");
            },

            _resolveAllPending: function() {

                // Take a copy of the pending resolves, reset it and then start resolving the set of identifiers supplied.
                var pending = this._pendingResolves;
                this._pendingResolves = [];

                if(!pending.length) {
                    return;
                }

                var i, j , chunk = 10;
                var resolveSets = [];
                var self = this;

                for(i = 0, j = pending.length; i < j; i += chunk) {
                    resolveSets.push(pending.slice(i, i + chunk));
                }

                resolveSets.forEach(function(set) {

                    var identifiers = [];
                    var seenIdentifiers = {};

                    set.forEach(function(x) {
                        if(x.identifiers) {
                            if(x.identifiers instanceof Array) {
                                identifiers.push.apply(identifiers, x.identifiers);
                            } else {
                                identifiers.push("" + x.identifiers);
                            }
                        }
                    });

                    identifiers = identifiers.filter(function(x) {
                        if(seenIdentifiers.hasOwnProperty(x)) {
                            return false;
                        }
                        seenIdentifiers[x] = true;
                        return true;
                    });

                    if(!identifiers.length) {
                        return;
                    }

                    AJAX.getJSON(self._formatRequestURLForIdentifiers(identifiers)).then(function(data){

                        if(!data || !data.result || !data.result.items || !(data.result.items instanceof Array) || data.result.items.length === 0) {
                            set.forEach(function(x) {
                                return x.resolve(null);
                            });
                            return;
                        }

                        var result = {};

                        data.result.items.forEach(function(item) {
                            var almaIDs = _getAlmaIDsFromRecord(item);

                            if(almaIDs) {
                                var resolvedItem = {};

                                if(item.primaryFindInLibrary && item.primaryFindInLibrary.links) {
                                    resolvedItem.findInLibraryLink = item.primaryFindInLibrary.links[0];
                                }

                                if(item.primaryViewOnline && item.primaryViewOnline.links) {
                                    resolvedItem.viewOnlineLink = item.primaryViewOnline.links[0];
                                }

                                if(resolvedItem.findInLibraryLink || resolvedItem.viewOnlineLink) {
                                    if(almaIDs instanceof Array) {
                                        almaIDs.forEach(function(a) {
                                            result["" + a] = resolvedItem;
                                        });
                                    } else {
                                        result["" + almaIDs] = resolvedItem;
                                    }
                                }
                            }
                        });

                        set.forEach(function(x) {
                            if(x.identifiers) {
                                var r = {};
                                var c = 0;

                                if(x.identifiers instanceof Array) {
                                    x.identifiers.forEach(function(ident) {
                                        if(result["" + ident]) {
                                            r["" + ident] = result["" + ident];
                                            ++c;
                                        }
                                    });
                                } else {
                                    if(result["" + x.identifiers]) {
                                        r["" + x.identifiers] = result["" + x.identifiers];
                                        ++c;
                                    }
                                }
                            }

                            x.resolve(c ? r : null);
                        });

                    }).catch(function(err) {

                        set.forEach(function(x) {
                            return x.reject(err);
                        });
                    });
                });
            }

        });
    }
);
