/*
less = {
	env: "development", // or "production"
	async: false,       // load imports async
    fileAsync: false,   // load imports async when in a page under a file protocol
    poll: 1000,         // when in watch mode, time in ms between polls
    functions: {},      // user functions, keyed by name
    dumpLineNumbers: "comments", // or "mediaQuery" or "all"
    relativeUrls: false,// whether to adjust url's to be relative if false, url's are already relative to the
                            // entry less file
    rootpath: ":/css/"// a path to add on to the start of every url resource
};
*/

requirejs.config({
    baseUrl:    "../",
    paths: {
        "jquery":       "js/libraries/jquery-1.9.1",
        "ko":           "js/libraries/knockout-2.2.1.debug",
        "less":         "js/libraries/less-1.3.3.min",
        "socket.io":    "js/libraries/socket.io",
        "trafficCop":   "js/libraries/TrafficCop",
        "infuser":      "js/libraries/infuser-amd",
        "koExternal":   "js/libraries/koExternalTemplateEngine-amd",
        
        "jsexpansion":  "js/moduls/jsexpansion_client",
        "connection":   "js/moduls/connection",
        "initialize":   "js/moduls/initialize",
        "mocsarVM":     "js/moduls/mocsarVM",
        "model":        "js/moduls/model",
        "gameMessages": "js/moduls/gameMessages",
        "log":          "js/moduls/log",
        "protocols":    "js/moduls/protocols"
    }
});
            
require(["jquery", "ko", "socket.io", "less", "jsexpansion", "initialize"], function($, ko) {
    require(["infuser", "koExternal", "mocsarVM"], function (infuser, koExt, mocsar) {
        infuser.defaults.templateUrl = "../templates";
        $(document).ready (function () {
            $(window).bind('contextmenu', function(event){
                return false;
            });
            var o = mocsar();
            ko.applyBindings (o);
        });
    });
});