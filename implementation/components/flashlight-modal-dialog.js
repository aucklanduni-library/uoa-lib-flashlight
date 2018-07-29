define("flashlight/component/modal-dialog",

    ["ember", "jquery","flashlight/components", "bootstrap"],

    function(Ember, $, FlashlightComponents) {

        return FlashlightComponents.FlashlightModalDialogComponent = Ember.Component.extend({

            tagName: "div",
            classNames: ["modal", "fade"],

            attributeBindings: ['role:role', 'ariaHidden:aria-hidden', 'ariaLabelledBy:aria-labelledby', 'tabIndex:tabindex'],
            role: 'dialog',
            ariaHidden: "true",
            ariaLabelledBy: "",
            tabIndex: "-1",

            _willRemove: function() {
                this.$().modal('hide');
            }.on('willDestroyElement'),

            actions: {
                showModal: function() {
                    this.$().modal('show');
                },

                hideModal: function() {
                    this.$().modal('hide');
                }
            }
        });
    }
);