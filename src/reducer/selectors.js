import _ from "lodash";
import moment from "moment";
import { createSelector } from "reselect";

const dateSelector = state => state.log.date;
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

export const getTotalsByDaySelector = createSelector(
  dateSelector,
  eventsSelector,
  (date, events) => {
    const start = moment(date).startOf("week").valueOf();
    const initial = _.reduce(
      _.range(7),
      (acc, i) => {
        const key = start + i * 86400000;
        acc[key] = [];
        return acc;
      },
      {}
    );

    const tuples = _.reduce(
      {
        ...initial,
        ..._.groupBy(events, event =>
          moment(event.start).startOf("day").valueOf()
        )
      },
      (acc, group, day) => {
        acc.push([
          day,
          _.sumBy(group, event => {
            return moment(event.end).diff(event.start, "hours", true);
          })
        ]);

        return acc;
      },
      []
    );

    return _.sortBy(tuples, ([date]) => date).map(([date, value]) => value);
  }
);
