import React from "react";
import ReactDOM from "react-dom";
import qs from "qs";
import moment from "moment";

import "./index.css";
import "fullcalendar-reactwrapper/dist/css/fullcalendar.min.css";
import App from "./App";
import extractState from "./lib/state-extractor";

const q = qs.parse(window.location.search.replace("?", ""));
q.from = moment(q.from, "DD/MM/YYYY");
q.to = moment(q.to, "DD/MM/YYYY");

if (q.to.diff(q.from, "days") < 14) {
	window.location =
		window.location.pathname +
		"?" +
		qs.stringify({
			to: moment().format("DD/MM/YYYY"),
			from: moment().subtract(14, "days").format("DD/MM/YYYY")
		});
} else {
	const root = document.createElement("div");
	root.id = "root";
	document.body.append(root);

	extractState().then(state => {
		ReactDOM.render(<App {...state} />, document.getElementById("root"));
	});
}
