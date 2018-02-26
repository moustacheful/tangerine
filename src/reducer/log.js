import _ from 'lodash';
import moment from 'moment';
import Pomelo from '../lib/pomelo';
import Storage from '../lib/storage';
import http from '../lib/http';
import Toasts from '../components/Toasts';

const namespace = 'LOG';
export const IS_LOADING = `${namespace}:IS_LOADING`;
export const SET_DATE = `${namespace}:SET_DATE`;
export const SET_EVENTS = `${namespace}:SET_EVENTS`;
export const CREATE_NEW_EVENT = `${namespace}:CREATE_NEW_EVENT`;
export const UPDATE_EVENT = `${namespace}:UPDATE_EVENT`;
export const DELETE_EVENT = `${namespace}:DELETE_EVENT`;
export const SET_SELECTED_EVENT_ID = `${namespace}:SET_SELECTED_EVENT_ID`;

const defaultState = {
  loading: false,
  date: new Date(),
  selectedEventId: false,
  events: [],
};

export default function(state = defaultState, action) {
  switch (action.type) {
    case IS_LOADING: {
      return {
        ...state,
        loading: action.value,
      };
    }

    case SET_DATE: {
      return {
        ...state,
        date: action.value,
      };
    }

    case SET_EVENTS: {
      return {
        ...state,
        events: action.value.map(event => {
          return { ...event, _hasChanged: false };
        }),
      };
    }

    case CREATE_NEW_EVENT: {
      console.log('default evnet is', Storage.get('defaultProject'))
      const existingEvent = _.findIndex(state.events, { id: 'new' });
      const events = [...state.events];
      const newEvent = {
        id: 'new',
        editable: true,
        title: '',
        description: '',
        project: Storage.get('defaultProject') || '',
        activity: Storage.get('defaultActivity') || '',
        relatedURL: '',
        billable: false,
        ...action.value,
      };

      if (existingEvent > -1) {
        events.splice(existingEvent, 1);
      }

      events.push(newEvent);

      return {
        ...state,
        events,
      };
    }

    case DELETE_EVENT: {
      const events = _.reject(state.events, { id: action.eventId });

      return {
        ...state,
        events,
      };
    }

    case UPDATE_EVENT: {
      const eventIndex = _.findIndex(state.events, { id: action.eventId });

      if (eventIndex === -1) {
        return;
      }

      const events = [...state.events];

      events.splice(eventIndex, 1, {
        ...state.events[eventIndex],
        ...action.data,
        _hasChanged: true,
      });

      return {
        ...state,
        events,
      };
    }

    case SET_SELECTED_EVENT_ID: {
      return {
        ...state,
        selectedEventId: action.value,
      };
    }

    default:
      return { ...defaultState, ...state };
  }
}

export const Actions = {
  setDate(date) {
    return dispatch => {
      dispatch({ type: SET_DATE, value: date });
      dispatch(
        Actions.fetchEvents(
          moment(date).startOf('week'),
          moment(date).endOf('week')
        )
      );
    };
  },

  deleteEvent(eventId) {
    return dispatch => {
      if (eventId === 'new') return;

      dispatch({ type: IS_LOADING, value: true });
      http({
        url: `/daily_tasks/${eventId}`,
        method: 'post',
        data: { _method: 'delete' },
      })
        .then(({ data }) => {
          dispatch({ type: DELETE_EVENT, eventId });
          Toasts.push('Eliminado de tu bitácora', 'success');
        })
        .catch(err => {
          Toasts.push('Ocurrió un error eliminando de tu bitácora', 'danger');
        })
        .finally(() => dispatch({ type: IS_LOADING, value: false }));
    };
  },

  updateEvent(eventId, data) {
    return dispatch => {
      dispatch({ type: UPDATE_EVENT, eventId, data });
    };
  },

  fetchEvents(from, to) {
    return dispatch => {
      dispatch({ type: IS_LOADING, value: true });

      Pomelo.extractLogData(
        from.format(Pomelo.dateFormat),
        to.format(Pomelo.dateFormat)
      )
        .then(log => {
          dispatch({ type: SET_EVENTS, value: log });
        })
        .catch(err => {
          /* NOOP */
        })
        .finally(() => dispatch({ type: IS_LOADING, value: false }));
    };
  },

  createNewEvent(options) {
    return dispatch => {
      dispatch({
        type: CREATE_NEW_EVENT,
        value: _.pick(options, ['start', 'end']),
      });
      dispatch({
        type: SET_SELECTED_EVENT_ID,
        value: 'new',
      });
    };
  },

  saveNewEvent(data) {
    return (dispatch, getState) => {
      dispatch({ type: IS_LOADING, value: true });
      http({
        method: 'post',
        url: '/daily_tasks',
        data,
      })
        .then(({ data }) => {
          dispatch({ type: DELETE_EVENT, value: 'new' });
          dispatch(Actions.setDate(getState().log.date));
          Toasts.push('Agregado a tu bitácora con éxito', 'success');
        })
        .catch(() => {
          Toasts.push('Ocurrió un error guardando en tu bitácora', 'danger');
        })
        .finally(() => dispatch({ type: IS_LOADING, value: false }));
    };
  },

  setSelectedEventId(id) {
    return dispatch => {
      dispatch({
        type: SET_SELECTED_EVENT_ID,
        value: id,
      });
    };
  },
};
