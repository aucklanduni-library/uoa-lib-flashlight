define("flashlight/util/url-parser", [], function() {

    function _safeParseInt(string) {
        var c = parseInt(string);
        return (typeof c === "number" && !isNaN(c)) ? c : undefined;
    }

    function URLParser() {

    }

    URLParser.prepareSearchTermForURL = function(st) {
        st = st.replace(/\+/gi, "__plus__").replace(/\s\s+/gi, " ").replace(/\s/gi, "__ws__");
        return encodeURI(st).replace(/__plus__/gi, "++").replace(/__ws__/gi, "+");
    };

    URLParser.parseSearchTermFromURL = function(st) {
        return decodeURI(st.replace(/\+\+/gi, "__plus__").replace(/\+/gi, " ").replace(/__plus__/gi, "+"));
    };
    
    URLParser.parseFilterValueFromURL = function(st){
        return st.replace(/%2B/g,"+");
    };


    URLParser.prototype.parseUnknownURLPart = function(part, options) {

        // By default, we don't do anything.
        return false;
    };

    URLParser.prototype.parseURL = function(url) {

        if(!url) {
            return {};
        }

        var parts = (url instanceof Array) ? url : url.split("/");
        var filterData = undefined;
        var facetfields = undefined;
        var options = {};

        for(var i = 0; i < parts.length; i++) {
            var s = decodeURI(parts[i]);
            var t;

            if(!s) {
                continue;
            }

            if((t = s.match(/^start:(\d*)$/))) {

                options.offset = _safeParseInt(t[1]);

            } else if((t = s.match(/^count:(\d*)$/))) {

                options.count = _safeParseInt(t[1]);

            } else if((t = s.match(/^order:(.*)$/))) {

                if(t[1] && t[1].trim().length > 0) {
                    options.sort = t[1].trim();
                }

            } else if((t = s.match(/^facets:(.*)$/))) {

                if(facetfields === undefined){
                    facetfields = [];
                }
                t[1].trim().split(",").forEach(function(facet){
                    facetfields.push(facet);
                });

            } else if((t = s.match(/^facet-count:(.*)$/))) {

                if(t[1] === "all") {
                    options.facetCount = t[1];
                } else {
                    options.facetCount = _safeParseInt(t[1]);
                }

            } else if((t = s.match(/^filter-([^:]*):(.*)$/))) {

                if(filterData === undefined){
                    filterData = {};
                }
                var key = t[1].trim();
                var value = t[2];

                if(key && key.length && value && value.length) {
                    value = URLParser.parseFilterValueFromURL(value);
                    if(filterData[key]  === undefined) {
                        filterData[key] = [value];
                    } else {
                        filterData[key].push(value);
                    }
                }

            } else if((t = s.match(/^direction:ascending$/))) {

                options.sortAscending = true;

            } else {

                if(!this.parseUnknownURLPart(s, options) && i === parts.length - 1) {
                    if(s.match(/^query:/)) {
                        options.specificQuery = s.replace(/^query:/, "");
                    } else {
                        options.query = URLParser.parseSearchTermFromURL(parts[i]);
                    }
                }
            }
        }

        if(filterData) {
            options.filter = filterData;
        }

        if(facetfields) {
            options.facets = facetfields;
        }

        return options;
    };

    return URLParser;
});