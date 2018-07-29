define("flashlight/component/find-in-library",

    ["ember", "jquery", "flashlight/components"],

    function(Ember, $, FlashlightComponents) {

        return FlashlightComponents.FlashlightFindInLibraryLinkComponent = Ember.Component.extend({

            findInLibraryProvider: Ember.inject.service(),

            tagName: "li",

            almaID: null,
            showFindInLibrary: false,
            showViewOnLine: false,

            resolvedLinks: null,
            resolvedNormalizedAlmaID: null,
            currentDisplayedLink: null,

            didReceiveAttrs:function(){
                this._super.apply(this, arguments);

                var normalisedAlmaID = this.get("normalizedAlmaID");

                if(normalisedAlmaID && normalisedAlmaID !== this.get("resolvedNormalizedAlmaID")) {
                    this.set("resolvedLinks", null);
                    this.set("resolvedNormalizedAlmaID", null);

                    var self = this;
                    
                    this.set("loading",true)

                    this.get("findInLibraryProvider").findLinksForAlmaID(normalisedAlmaID).then(function(resolvedLinks) {
                        if(self.get("normalizedAlmaID") === normalisedAlmaID && resolvedLinks && resolvedLinks["" + normalisedAlmaID]) {
                            self.set("resolvedLinks", resolvedLinks["" + normalisedAlmaID]);
                            self.set("resolvedNormalizedAlmaID", normalisedAlmaID);
                        }
                        self.set("loading",false);
                    });
                }
            },

            normalizedAlmaID : Ember.computed("almaID", function(){
                var obj = this.get("almaID");
                if(obj instanceof Array){
                    return obj.map(function(v){
                        return v.match(/uoa_alma\d+/)[0];
                    });
                }
                return ("" + obj).match(/uoa_alma\d+/)[0];
            }),

            findInLibraryLink: Ember.computed.alias("resolvedLinks.findInLibraryLink"),
            viewOnlineLink: Ember.computed.alias("resolvedLinks.viewOnlineLink"),

            isActive : Ember.computed("resolvedLinks", "findInLibraryLink", "viewOnlineLink", function(){
                return !!(this.get("resolvedLinks") !== null && (this.get("findInLibraryLink") || this.get("viewOnlineLink")));
            }),


            actions:{
                openFindInLibrary:function(){
                    this.send("openPanel", this.get("findInLibraryLink"));
                },

                openViewOnlineLinks:function(){
                    this.send("openPanel",this.get("viewOnlineLink"));
                },

                closePanel: function(){
                    var holder = this.$().find(".uoa-lib-uresolver-holder");
                    holder.removeClass("showing-uresolver-content");
                    holder.slideUp("fast",function(){
                        holder.addClass("uoa-lib-no-display");
                    });
                    this.set("displayedLink", null);
                },

                openPanel: function(link){
                    if(link === this.get("displayedLink")){
                        return this.send("closePanel");
                    }

                    this.set("displayedLink", link);

                    var holder = this.$().find(".uoa-lib-uresolver-holder");
                    holder.addClass("showing-uresolver-content");
                    holder.slideDown("fast");
                    holder.removeClass("uoa-lib-no-display");

                    var iframe = holder.find("iframe");
                    iframe.attr('src', link.replace(/^http\:/, ""));
                }
            }

        });
    }
);
