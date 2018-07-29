define("flashlight/component/pagination-bar",

    ["ember", "flashlight/components"],

    function(Ember, FlashlightComponents) {

        var PaginationItem = Ember.Object.extend({
            isPrev: Ember.computed("type", function() {
                return (this.get("type") === "prev");
            }),
            isNext: Ember.computed("type", function() {
                return (this.get("type") === "next");
            }),
            isGap: Ember.computed("type", function() {
                return (this.get("type") === "gap");
            }),
            isPage: Ember.computed("type", function() {
                return (this.get("type") === "page");
            }),
            isCurrentPage: Ember.computed("type", function() {
                return (this.get("type") === "current");
            })
        });

        return FlashlightComponents.FlashlightPaginationBarComponent = Ember.Component.extend({

            init: function() {
                this._super();
                this.paginationPartsChanged();
            },

            didReceiveAttrs: function() {
                this.paginationPartsChanged();
            },

            classNames: ['row','fl-pagination-wrapper'],

            paginationParts: [],
            totalPages: 0,

            prevButtonPart: PaginationItem.create({type:"prev", disabled:false}),
            prevButtonDisabledPart: PaginationItem.create({type:"prev", disabled:true}),

            nextButtonPart: PaginationItem.create({type:"next", disabled:false}),
            nextButtonDisabledPart: PaginationItem.create({type:"next", disabled:true}),

            gapPart: PaginationItem.create({type:"gap", disabled:false}),
            gapPart2: PaginationItem.create({type:"gap", disabled:false}),

            actions: {
                changeSkip: function(offset) {

                    var results = this.get("results");
                    if(results) {
                        var searchSettings = results.get("settings");
                        if(searchSettings) {
                            this.get('performSearch')(searchSettings.cloneWithSkip(offset));
                        }
                    } else {
                        var action = this.get("skipTo");
                        if(action) {
                            action(offset);
                        }
                    }
                }
            },
            
            hasNoNextOrPrev: Ember.computed("paginationParts", function() {
                var parts = this.get("paginationParts");
                var nav = parts.find(function(v){
                     return (v.get("isPrev") || v.get("isNext")) && (v.get("disabled") === false);
                });
                return (nav == null);
            }),

            paginationPartsChanged: function() {

                var results = this.get("results");
                var pageSize;
                var skip;
                var total;

                if(results) {
                    pageSize = results.get("settings.fetchCount");
                    skip = results.get("offset");
                    total = results.get("totalItems");
                } else {
                    pageSize = parseInt(this.get("pageSize"));
                    skip = parseInt(this.get("skip"));
                    total = parseInt(this.get("total"));
                }

                var currentPage = (parseInt(skip / pageSize)) + 1;
                var pageCount = parseInt(total / pageSize);

                if((total % pageSize) !== 0) {
                    ++pageCount;
                }

                var adjacent = 1;
                var prevPage = currentPage - 1;
                var nextPage = currentPage + 1;
                var lastPage = pageCount;
                var lastPageMinusOne = pageCount - 1;
                var finalParts = [];
                var i;

                function __pageToSkip(p) {
                    return (p - 1) * pageSize;
                }

                function __createPage(page, current) {
                    return PaginationItem.create({type:(current ? "current" : "page"), disabled:false, page:page, skip:__pageToSkip(page)});
                }

                if(lastPage > 1) {

                    /* Previous button. */
                    if( currentPage > 1 ) {
                        this.prevButtonPart.set("page", prevPage);
                        this.prevButtonPart.set("skip", __pageToSkip(prevPage));
                        finalParts.push(this.prevButtonPart);
                    } else {
                        finalParts.push(this.prevButtonDisabledPart);
                    }

                    /* Pages */
                    if( lastPage <  (7 + (adjacent * 2)) ) {

                        /* Not enough pages to break things up so we can have a single set of page numbers. */
                        for(i = 1; i <= lastPage; i++) {
                            finalParts.push(__createPage(i, i === currentPage));
                        }

                    } else {

                        if(currentPage < (1 + (adjacent * 3))) {

                            /* Close to the beginning  of the page set, so we only hide later pages. */
                            for (i = 1; i < (4 + (adjacent * 2)); i++) {
                                finalParts.push(__createPage(i, i === currentPage));
                            }

                            finalParts.push(this.gapPart);
                            finalParts.push(__createPage(lastPageMinusOne));
                            finalParts.push(__createPage(lastPage));

                        } else if((lastPage - (adjacent * 2)) > currentPage && (currentPage > (adjacent * 2))) {

                            finalParts.push(__createPage(1));
                            finalParts.push(__createPage(2));
                            finalParts.push(this.gapPart);

                            for(i = (currentPage - adjacent); i <= (currentPage + adjacent); i++) {
                                finalParts.push(__createPage(i, i === currentPage));
                            }

                            finalParts.push(this.gapPart2);
                            finalParts.push(__createPage(lastPageMinusOne));
                            finalParts.push(__createPage(lastPage));

                        } else {

                            finalParts.push(__createPage(1));
                            finalParts.push(__createPage(2));
                            finalParts.push(this.gapPart);

                            for(i = (lastPage - (1 + (adjacent * 3))); i <= lastPage; i++) {
                                finalParts.push(__createPage(i, i === currentPage));
                            }
                        }

                        /* Next button. */
                        if( currentPage < lastPage ) {
                            this.nextButtonPart.set("page", nextPage);
                            this.nextButtonPart.set("skip", __pageToSkip(nextPage));
                            finalParts.push(this.nextButtonPart);
                        } else {
                            finalParts.push(this.nextButtonDisabledPart);
                        }
                    }
                }

                this.setProperties({
                    totalPages:pageCount,
                    paginationParts: finalParts
                });
            }
        });

    }
);
