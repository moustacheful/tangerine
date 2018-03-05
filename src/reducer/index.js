import { combineReducers } from "redux";
import log from "./log";
import dialog from "./dialog";

export default combineReducers({
	log,
	dialog,
	projects: (state = []) => state
});
