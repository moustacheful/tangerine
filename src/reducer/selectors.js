import _ from 'lodash';
import moment from 'moment';
import { createSelector } from 'reselect';

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

export const getTotalsByDaySelector = createSelector(eventsSelector, events => {
  const tuples = _(events)
    .groupBy(event => moment(event.start).startOf('day').valueOf())
    .reduce((acc, group, day) => {
      acc.push([
        day,
        _.sumBy(group, event => {
          return moment(event.end).diff(event.start, 'hours', true);
        }),
      ]);

      return acc;
    }, [])

  const results = _
  	.sortBy(tuples, ([date]) => date)
  	.map(([date, value]) => value)

  return results;

});
