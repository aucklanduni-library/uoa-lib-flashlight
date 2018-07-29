define("flashlight/helpers/markdown-to-html",

    ["ember", "showdown"],

    function(Ember, Showdown) {

        return function(App) {

            var converter = new Showdown.Converter();

            App.register('helper:markdown-to-html', Ember.Helper.helper(function(params, namedParameters) {
                var markdown = params[0];
                if(!markdown) {
                    return null;
                }
                return Ember.String.htmlSafe(converter.makeHtml(markdown));
            }));

        }

    }
);