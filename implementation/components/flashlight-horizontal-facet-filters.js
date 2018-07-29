define("flashlight/component/horizontal-facet-filters",

    ["ember", 'jquery', "flashlight/components", "flashlight/component/facet-filters"],

    function(Ember, $, FlashlightComponents, FlashlightFacetFilters) {

        return FlashlightComponents.FlashlightHorizontalFacetFiltersComponent = FlashlightFacetFilters.extend({

            defaultPrompt: "Filter by:",

            _afterRender: function() {

                // Click handlers for the facet toggle feature.
                var $self = this.$();
                $self.find('.toggle-facet').on("click.flashlight-horizontal-facet-filters", function(e, ui) {

                    var id = $(this).attr('id');
                    var pattern = /uoa-lib-filter-(.+)-toggle/;
                    var match = pattern.exec(id);

                    if (match) {
                        $self.find('.toggle-facet-pane').not('.uoa-lib-filter-'+match[1]+'-toggle').hide();
                        $self.find('.uoa-lib-filter-'+match[1]+'-toggle').fadeToggle('fast');
                        $self.find('span.uoa-lib-scope-filter-item.uoa-lib-active').not(this).toggleClass('uoa-lib-active');
                        $(this).toggleClass('uoa-lib-active');
                    }
                });

                $self.find('.toggle-facet a').on("click.flashlight-horizontal-facet-filters", function (e, ui) {
                    e.stopPropagation();
                });

            }.on("didRender")

        });
    }
);