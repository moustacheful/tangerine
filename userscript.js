// ==UserScript==
// @name         Tangerine
// @namespace    http://acidlabs.io/
// @version      0.1
// @description  Hijacks our beloved tracking platform to make it useable-ish.
// @author       Daniel Acuña
// @match        *://pomelo.acid.cl/daily_tasks*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";
    var s, link;
    s = document.createElement("script");

    if (true) {
        s.src =
            "https://moustacheful.github.io/tangerine/build/static/js/main.js";

        link = document.createElement("link");
        link.href =
            "https://moustacheful.github.io/tangerine/build/static/css/main.css";
        link.rel = "stylesheet";

        document.body.append(link);
    } else {
        s.src = "https://localhost:3000/static/js/bundle.js";
    }

    document.body.append(s);
})();
