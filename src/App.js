import autobind from "autobind-decorator";
import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";

import { Actions as LogActions } from "./reducer/log";
import { selectedEventSelector, getTotalsByDaySelector } from "./reducer/selectors";
import Calendar from "./components/Calendar";
import Form from "./components/Form";
import { ToastsComponent } from "./components/Toasts";

const DailyTotals = ({ totals }) => {
  if (!totals) return null;

  const style = {
    width: (100 / 8) + '%'
  }
  return <div style={{display: 'flex'}} className="rbc-row">
    <div style={style} className="rbc-label rbc-header-gutter"></div>
    {totals.map((val) => 
      <div style={style} className="rbc-header">{val}</div>
    )}
  </div>
}


class App extends Component {
  state = {
    collapsed: true,
    editableEvent: false
  };

  componentWillMount() {
    this.props.fetchEvents(moment().startOf("week"), moment().endOf("week"));
  }

  toggle() {
    this.setState({ collapsed: !this.state.collapsed });
  }

  render() {
    const collapsedClass = this.state.collapsed
      ? "is-collapsed"
      : "is-expanded";

    return (
      <div id="tangerine" className={`app ${collapsedClass}`}>
        {this.props.log.loading && <div className="loading-screen" />}
        <button className="btn-toggle btn btn-primary" onClick={this.toggle}>
          {this.state.collapsed ? "Ver" : "Ocultar"} agenda
        </button>

        {!this.state.collapsed &&
          <div className="pane">
            <div className="flex-container">
              <div className="flex-extend">
                <Calendar
                  date={this.props.log.date}
                  setDate={this.props.setDate}
                  events={this.props.log.events}
                  updateEvent={this.props.updateEvent}
                  createNewEvent={this.props.createNewEvent}
                  setSelectedEventId={this.props.setSelectedEventId}
                />
                <DailyTotals totals={this.props.log.totals} />
              </div>

              {this.props.log.selectedEvent
                ? <aside>
                    <Form
                      projects={this.props.projects}
                      event={this.props.log.selectedEvent}
                      saveNewEvent={this.props.saveNewEvent}
                      updateEvent={this.props.updateEvent}
                      deleteEvent={this.props.deleteEvent}
                      setEditableEvent={this.props.updateEvent}
                    />
                  </aside>
                : <aside>
                    <div className="well well-xs">
                      Seleccionar un rango para trackear
                    </div>
                  </aside>}
            </div>
          </div>}
        <ToastsComponent />
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
        totals: getTotalsByDaySelector(state)
      }
    };
  },
  { ...LogActions }
)(autobind(App));
