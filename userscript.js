// ==UserScript==
// @name         Tangerine
// @namespace    http://acidlabs.io/
// @version      0.4
// @description  Hijacks our beloved tracking platform to make it useable-ish.
// @author       Daniel Acuña
// @updateURL    https://moustacheful.github.io/tangerine/userscript.js
// @downloadURL  https://moustacheful.github.io/tangerine/userscript.js
// @match        *://pomelo.acid.cl/daily_tasks*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";
    var manifest, script, link;
    manifest = document.createElement("script");
    manifest.async = false;
    manifest.src = "https://moustacheful.github.io/tangerine/dist/manifest.js";

    script = document.createElement("script");
    script.async = false;
    script.src = "https://moustacheful.github.io/tangerine/dist/main.js";

    link = document.createElement("link");
    link.href = "https://moustacheful.github.io/tangerine/dist/main.css";
    link.rel = "stylesheet";

    document.body.appendChild(link);
    document.body.appendChild(manifest);
    document.body.appendChild(script);
})();
