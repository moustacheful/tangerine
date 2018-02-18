import { combineReducers } from "redux";
import log from "./log";

export default combineReducers({
	log,
	projects: (state = []) => state
});
