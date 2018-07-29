define("flashlight/component/item-link",

    ["ember", "flashlight/components"],

    function(Ember, FlashlightComponents) {

        return FlashlightComponents.FlashlightItemLinkComponent = Ember.LinkComponent.extend({

            // Disable the default "click" handler and replace it with our custom handler
            // that will perform the "viewItem" action (provided or on the parent view).

            init: function () {
                this._super.apply(this, arguments);

                var eventName = this.get('eventName');
                this.off(eventName, this, this._invoke);
                this.on(eventName, this, this._viewItem);
            },

            _viewItem: function(event) {
                event.preventDefault();
                var viewItem = this.get("viewItem") || this.get("parentView.viewItem");
                if(viewItem) {
                    viewItem(this.get("linkContext"));
                }
            }
        });
    }
);


define("flashlight/component/walk-through-item-link",

    ["ember", "flashlight/components"],

    function(Ember, FlashlightComponents) {

        return FlashlightComponents.FlashlightWalkThroughItemLinkComponent = Ember.LinkComponent.extend({

            // Disable the default "click" handler and replace it with our custom handler
            // that will perform the "viewItem" action (provided or on the parent view).

            init: function () {
                this._super.apply(this, arguments);

                var eventName = this.get('eventName');
                this.off(eventName, this, this._invoke);
                this.on(eventName, this, this._viewWalkThroughLink);
            },

            _viewWalkThroughLink: function(event) {
                event.preventDefault();
                var viewWalkThroughItem = this.get("viewWalkThroughLink") || this.get("parentView.viewWalkThroughLink");
                if(viewWalkThroughItem) {
                    viewWalkThroughItem(this.get("context"));
                }
            }
        });
    }
);
