import _ from "lodash";
import Pomelo from '../lib/pomelo'
import moment from 'moment'

const namespace = "LOG";
export const IS_LOADING = `${namespace}:IS_LOADING`;
export const SET_DATE = `${namespace}:SET_DATE`;
export const SET_EVENTS = `${namespace}:SET_EVENTS`;
export const CREATE_NEW_EVENT = `${namespace}:CREATE_NEW_EVENT`;
export const UPDATE_EVENT = `${namespace}:UPDATE_EVENT`;
export const SET_SELECTED_EVENT_ID = `${namespace}:SET_SELECTED_EVENT_ID`;

const defaultState = {
	loading: false,
	date: new Date(),
	selectedEventId: false,
	events: []
};

export default function(state = defaultState, action) {
	switch (action.type) {
		case IS_LOADING: {
			return {
				...state,
				loading: action.value
			}
			break;
		}
		case SET_DATE: {
			return {
				...state,
				date: action.value
			}
			break;
		}

		case SET_EVENTS: {
			return {
				...state,
				events: action.value
			}
			break;
		}

		case CREATE_NEW_EVENT: {
			const existingEvent = _.findIndex(state.events, { id: "new" });
			const events = [...state.events];
			const newEvent = {
				id: "new",
				editable: true,
				title: "",
				description: "",
				project: "",
				activity: "",
				relatedURL: "",
				billable: false,
				...action.value
			};

			if (existingEvent > -1) {
				events.splice(existingEvent, 1);
			}

			events.push(newEvent);

			return {
				...state,
				events
			};
			break;
		}

		case UPDATE_EVENT: {
			const eventIndex = _.findIndex(state.events, { id: action.eventId });

			if (eventIndex === -1) {
				console.log(action.eventId, 'not found')
				return;
			}

			const events = [...state.events];

			events.splice(eventIndex, 1, {
				...state.events[eventIndex],
				...action.data
			});

			return {
				...state,
				events
			};
			break;
		}

		case SET_SELECTED_EVENT_ID: {
			return {
				...state,
				selectedEventId: action.value
			};
			break;
		}
	}

	return { ...defaultState, ...state };
}

export const Actions = {
	setDate(date) {
		return dispatch => {
			dispatch({ type: SET_DATE, value: date})
			dispatch(Actions.fetchEvents(
				moment(date).startOf('week'),
				moment(date).endOf('week'),
			))
			
		}
	},
	updateEvent(eventId, data) {
		return dispatch => {
			dispatch({ type: UPDATE_EVENT, eventId, data });
		};
	},
	fetchEvents(from, to) {
		return dispatch => {
			dispatch({ type: IS_LOADING, value: true })

			Pomelo.extractLogData(
				from.format(Pomelo.dateFormat),
				to.format(Pomelo.dateFormat)
			).then(log => {
				dispatch({ type: IS_LOADING, value: false })
				dispatch({ type: SET_EVENTS, value: log })
			}).catch(err => {
				dispatch({ type: IS_LOADING, value: false })
			})
		}
	},
	createNewEvent(options) {
		return dispatch => {
			dispatch({
				type: CREATE_NEW_EVENT,
				value: _.pick(options, ["start", "end"])
			});
			dispatch({
				type: SET_SELECTED_EVENT_ID,
				value: "new"
			});
		};
	},
	setSelectedEventId(id) {
		return dispatch => {
			dispatch({
				type: SET_SELECTED_EVENT_ID,
				value: id
			});
		};
	}
};
