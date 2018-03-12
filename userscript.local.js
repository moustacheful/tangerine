// ==UserScript==
// @name         Tangerine (LOCAL)
// @namespace    http://acidlabs.io/
// @version      0.1
// @description  Hijacks our beloved tracking platform to make it useable-ish.
// @author       Daniel Acuña
// @match        *://pomelo.acid.cl/daily_tasks*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";
    var script;
    script = document.createElement("script");
    script.src = "https://localhost:5000/app.js";
    document.body.appendChild(script);
})();