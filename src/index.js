import React from "react";
import ReactDOM from "react-dom";
import qs from "qs";
import moment from "moment";

import "./index.css";
import Pomelo from "./lib/pomelo";
import "fullcalendar/dist/fullcalendar.css";
import App from "./App";
import extractState from "./lib/state-extractor";

const root = document.createElement("div");
root.id = "root";
document.body.append(root);

extractState({
	to: moment().format(Pomelo.dateFormat),
	from: moment().subtract(14, "days").format(Pomelo.dateFormat)
}).then(state => {
	ReactDOM.render(<App {...state} />, document.getElementById("root"));
});

