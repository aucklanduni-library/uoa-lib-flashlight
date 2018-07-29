define("flashlight/component/search-result-holder",

    ["ember", "jquery","flashlight/components"],

    function(Ember, $, FlashlightComponents) {
        return FlashlightComponents.FlashlightSearchResultHolderComponent = Ember.Component.extend({
            searchResultListComponentName: "flashlight-search-result-list",
            searchResultItemComponentName: "flashlight-search-result-item",

            searchBoxComponentName: "flashlight-search-box",
            paginationBarComponentName: "flashlight-pagination-bar",
            pagingSummaryComponentName: "flashlight-paging-summary",
            activeFiltersSummaryComponentName: "flashlight-active-filters-summary",
            sortByButtonGroupComponentName: "flashlight-sort-by-button-group",
            horizontalFacetFiltersComponentName: "flashlight-horizontal-facet-filters",
            verticalFacetFiltersComponentName: "flashlight-vertical-facet-filters",
            
            searchFailContainerComponentName: "flashlight-search-fail-container",

            hasSearchBox: true,
            searchBoxAsRibbon: true,    // search box should be a ribbon along the top of the search result holder

            hasHorizontalFacetFilters: false,
            hasToolbarRight: true,      // results listing has righthand toolbar present
            hasFacetsRight: true,
            hasOrdinals: true,
            hasActiveFiltersSummary: true,
            hasPagingSummary: true,
            hasSortingControls: true,
            verticalListing: true,

            sortingOptions: null
        });
    }
);