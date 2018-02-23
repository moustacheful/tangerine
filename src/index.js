import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import ReactDOM from "react-dom";
import React from "react";
import moment from "moment";
import Pomelo from "./lib/pomelo";
import qs from "qs";

import App from "./App";
import extractState from "./lib/state-extractor";
import reducer from "./reducer";

import "react-select/dist/react-select.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./index.css";

const getStore = state => {
	return createStore(reducer, state, applyMiddleware(thunk));
};

const mountApplication = initialState => {
	const store = getStore(initialState);
	ReactDOM.render(
		<Provider store={store}>
			<App />
		</Provider>,
		document.getElementById("root")
	);
};

const root = document.createElement("div");
root.id = "root";
document.body.append(root);


Pomelo.getProjects().then((projects) => {
	let initialState = {projects}
	if (process.env.NODE_ENV === "developmentx") {
		console.log("Running in dev mode, using mock data");
		initialState = { 
			...initialState, 
			...require("./mock-state").default
		};
	}
		/*
		extractState({
			to: moment().format(Pomelo.dateFormat),
			from: moment().subtract(14, "days").format(Pomelo.dateFormat)
		}).
		*/
	mountApplication(initialState);
})
