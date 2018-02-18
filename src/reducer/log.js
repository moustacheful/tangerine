import _ from "lodash";

const namespace = "LOG";
export const CREATE_NEW_EVENT = `${namespace}:CREATE_NEW_EVENT`;
export const UPDATE_EVENT = `${namespace}:UPDATE_EVENT`;
export const SET_SELECTED_EVENT_ID = `${namespace}:SET_SELECTED_EVENT_ID`;

const defaultState = {
	selectedEventId: false,
	events: []
};

export default function(state = defaultState, action) {
	switch (action.type) {
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

			if (eventIndex === -1) return;

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
	updateEvent(eventId, data) {
		return dispatch => {
			dispatch({ type: UPDATE_EVENT, eventId, data });
		};
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
