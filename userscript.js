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
    var script, link;
    script = document.createElement("script");
    script.src = "https://moustacheful.github.io/tangerine/build/static/js/main.js";

    link = document.createElement("link");
    link.href = "https://moustacheful.github.io/tangerine/build/static/css/main.css";
    link.rel = "stylesheet";

    document.body.appendChild(link);
    document.body.appendChild(script);
})();
