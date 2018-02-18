import _ from "lodash";
import { createSelector } from "reselect";

const eventsSelector = state => state.log.events;
const eventIdSelector = state => state.log.selectedEventId;

export const selectedEventSelector = createSelector(
	eventIdSelector,
	eventsSelector,
	(id, events) => {
		if (!id) return false;
		return _.find(events, { id });
	}
);
