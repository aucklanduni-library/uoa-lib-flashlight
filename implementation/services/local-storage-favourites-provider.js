define(

    "flashlight/service/local-storage-favourites-provider",

    ["ember", "bluebird", "flashlight/flashlight"],

    function(Ember, Promise, Flashlight) {

        var LocalStorage = window.localStorage;

        return Flashlight.LocalStorageFavouritesProviderService =  Ember.Service.extend(Ember.Evented, {

            items: [],
            _itemMap: {},

            storageKey: "flashlight",
            identifierKey: "id",

            init: function() {
                this._super.apply(this, arguments);

                var key = this.get("storageKey");
                var data = LocalStorage[key] || "[]";
                var identifierKey = this.get("identifierKey");
                var self = this;

                var items = JSON.parse(data) || [];
                items = items.filter(function(x) {
                    return (x && x[identifierKey] !== undefined);
                });

                this.set("items", items);

                window.addEventListener("storage", function (e) {
                    if(e && e.key && e.key === key) {
                        self._reloadItems(e.newValue);
                    }
                }, false);
            },

            hasItem: function(ident) {
                return this.get("itemMap").hasOwnProperty(ident);
            },

            itemMap: Ember.computed("items", function() {
                var items = this.get("items") || [];
                var identifierKey = this.get("identifierKey");
                var map = {};

                items.forEach(function(x) {
                    var ident = x[identifierKey];
                    if(ident !== undefined) {
                        map["" + ident] = x;
                    }
                });

                return map;
            }),


            addItem:function(item, insertAfterItemID){

                var identifierKey = this.get("identifierKey");
                var identifier = item[identifierKey];

                if(this.hasItem(identifier)){
                    return;
                }

                this.propertyWillChange("items");

                if(insertAfterItemID === null) {
                    this.items.unshift(item);
                } else if(insertAfterItemID !== undefined) {
                    var itemMap = this.get("itemMap");
                    if(itemMap && itemMap.hasOwnProperty("" + insertAfterItemID)) {
                        var insertIndex = this.items.indexOf(itemMap["" + insertAfterItemID]);
                        insertIndex = (insertIndex === -1) ? this.items.length : insertIndex + 1;
                        this.items.splice(insertIndex, 0, item);
                    } else {
                        this.items.push(item);
                    }
                } else {
                    this.items.push(item);
                }

                this.propertyDidChange("items");

                this._saveItems();
                this.trigger('modified', {added:[item]});
            },

            removeItem:function(identifier){

                var itemMap = this.get("itemMap");
                identifier = "" + identifier;

                if(!itemMap.hasOwnProperty(identifier)) {
                    return false;
                }

                var item = itemMap[identifier];
                if(!item) {
                    return false;
                }

                var index = this.items.indexOf(item);
                if(index === -1) {
                    return false;
                }

                this.propertyWillChange("items");
                this.items.splice(index, 1);
                this.propertyDidChange("items");

                this._saveItems();
                this.trigger('modified', {removed:[item]});

                return true;
            },


            _saveItems: function() {
                var storageKey = this.get("storageKey");
                var items = this.get("items");
                LocalStorage[storageKey] = JSON.stringify(items || []);
            },

            _reloadItems: function(newItems) {

                var identifierKey = this.get("identifierKey");
                var currentItems = this.get("items").slice();
                var currentItemMap = this.get("itemMap");
                var newItemMap = {};
                var replacementItems;

                try {
                    replacementItems = JSON.parse(newItems || "[]") || [];
                } catch(e) {
                    return;
                }

                var addedItems = [];
                var removedItems = [];

                replacementItems = replacementItems.filter(function(x) {
                    return (x && x[identifierKey] !== undefined);
                });

                replacementItems.forEach(function(x) {
                    var ident = "" + x[identifierKey];

                    if(!newItemMap.hasOwnProperty(ident)) {
                        newItemMap["" + ident] = x;
                        if(!currentItemMap.hasOwnProperty(ident)) {
                            addedItems.push(x);
                        }
                    }
                });

                currentItems.forEach(function(x) {
                    var ident = "" + x[identifierKey];
                    if(!newItemMap.hasOwnProperty(ident)) {
                        removedItems.push(x);
                    }
                });


                if(addedItems.length || removedItems.length) {
                    this.set("items", replacementItems);
                    this.trigger('modified', {added:addedItems, removed:removedItems});
                }
            }
        });
    }
);