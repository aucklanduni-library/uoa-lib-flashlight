define("flashlight/components", function(Ember) {
    return {};
});


define(
    "flashlight/components/init",

    [
        "flashlight/components",
        "flashlight/component/active-filters-summary",

        "flashlight/component/browse-group",
        "flashlight/component/browse-holder",
        "flashlight/component/browse-navigation",
        "flashlight/component/faceted-search-summary",

        "flashlight/component/facet-filters",
        "flashlight/component/facet-group-basic",
        "flashlight/component/facet-group-year-range",
        "flashlight/component/horizontal-facet-filters",
        "flashlight/component/vertical-facet-filters",
        "flashlight/component/facet-all-values-picker",

        "flashlight/component/item-link",
        "flashlight/component/walk-through-item-link",
        "flashlight/component/favourite-item-toggle",
        "flashlight/component/favourite-items-footer",
        "flashlight/component/favourites-overview",

        "flashlight/component/pagination-bar",
        "flashlight/component/paging-summary",

        "flashlight/component/search-box",
        "flashlight/component/search-result-holder",
        "flashlight/component/search-result-item",
        "flashlight/component/search-result-list",

        "flashlight/component/modal-dialog",

        "flashlight/component/sort-by-button-group",
        "flashlight/component/find-in-library"
    ],

    function(FlashlightComponents) {
        return FlashlightComponents;
    }
);