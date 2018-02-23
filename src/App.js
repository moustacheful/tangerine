import autobind from 'autobind-decorator';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import Calendar from './components/Calendar';
import Form from './components/Form';
import { Actions as LogActions } from './reducer/log';
import { selectedEventSelector } from './reducer/selectors';

class App extends Component {
  state = {
    collapsed: true,
    editableEvent: false,
  };

  componentWillMount() {
    this.props.fetchEvents(moment().startOf('week'), moment().endOf('week'));
  }

  toggle() {
    this.setState({ collapsed: !this.state.collapsed });
  }

  render() {
    const collapsedClass = this.state.collapsed
      ? 'is-collapsed'
      : 'is-expanded';

    return (
      <div id="tangerine" className={`app ${collapsedClass}`}>
        {this.props.log.loading && <div className="loading-screen" />}
        <button className="btn-toggle btn btn-primary" onClick={this.toggle}>
          {this.state.collapsed ? 'Ver' : 'Ocultar'} agenda
        </button>

        {!this.state.collapsed && (
          <div className="pane">
            <div className="flex-container">
              <div id="fullcalendar">
                <Calendar
                  date={this.props.log.date}
                  setDate={this.props.setDate}
                  events={this.props.log.events}
                  updateEvent={this.props.updateEvent}
                  createNewEvent={this.props.createNewEvent}
                  setSelectedEventId={this.props.setSelectedEventId}
                />
              </div>

              {this.props.log.selectedEvent ? (
                <aside>
                  <Form
                    projects={this.props.projects}
                    event={this.props.log.selectedEvent}
                    updateEvent={this.props.updateEvent}
                    setEditableEvent={this.props.updateEvent}
                  />
                </aside>
              ) : (
                <aside>
                  <div className="well well-xs">
                    Seleccionar un rango para trackear
                  </div>
                </aside>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      ...state,
      log: {
        ...state.log,
        selectedEvent: selectedEventSelector(state),
      },
    };
  },
  { ...LogActions }
)(autobind(App));
