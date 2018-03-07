import autobind from "autobind-decorator";
import React, { Component } from "react";
import { connect } from "react-redux";
import moment from "moment";

import { Actions as LogActions } from "./reducer/log";
import { Actions as DialogActions } from "./reducer/dialog";
import {
  selectedEventSelector,
  getTotalsByDaySelector
} from "./reducer/selectors";
import Calendar from "./components/Calendar";
import Form from "./components/Form";
import DailyTotals from "./components/DailyTotals";
import { ToastsComponent } from "./components/Toasts";

class App extends Component {
  render() {
    const collapsedClass = this.props.dialog.collapsed
      ? "is-collapsed"
      : "is-expanded";

    return (
      <div id="tangerine" className={`app ${collapsedClass}`}>
        <button
          className="btn-toggle btn btn-primary"
          onClick={this.props.toggleDialog}
        >
          {this.props.dialog.collapsed ? "Ver" : "Ocultar"} agenda
        </button>

        {!this.props.dialog.collapsed &&
          <div className="pane">
            <div className="flex-parent full-height">
              <div className="flex-extend full-height">
                <div className="flex-parent flex-column full-height">
                  <div className="calendar-container flex-extend">
                    <Calendar
                      date={this.props.log.date}
                      setDate={this.props.setDate}
                      events={this.props.log.events}
                      updateEvent={this.props.updateEvent}
                      createNewEvent={this.props.createNewEvent}
                      setSelectedEventId={this.props.setSelectedEventId}
                      currentEvent={this.props.log.selectedEvent}
                    />
                  </div>
                  <DailyTotals totals={this.props.log.totals} />
                </div>
              </div>

              {this.props.log.selectedEvent
                ? <aside>
                    <Form
                      projects={this.props.projects}
                      event={this.props.log.selectedEvent}
                      saveNewEvent={this.props.saveNewEvent}
                      updateEvent={this.props.updateEvent}
                      deleteEvent={this.props.deleteEvent}
                      saveEvent={this.props.saveEvent}
                      setEditableEvent={this.props.updateEvent}
                    />
                  </aside>
                : <aside>
                    <div className="well well-xs">
                      Seleccionar un rango para trackear. <br />
                      <code>ctrl + arrastrar</code>
                      {" "}
                      copiar / continuar tarea
                      {" "}
                      <br />

                    </div>
                  </aside>}
            </div>
          </div>}
        <ToastsComponent />
        {this.props.log.loading && <div className="loading-screen" />}
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
  { ...LogActions, ...DialogActions }
)(autobind(App));
