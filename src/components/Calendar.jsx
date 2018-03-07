import React, { Component } from "react";
import _ from "lodash";
import autobind from "autobind-decorator";
import moment from "moment";
import BigCalendar from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import HTML5Backend from "react-dnd-html5-backend";
import { DragDropContext } from "react-dnd";
import classify from "../lib/classify";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

// Add localizer
BigCalendar.momentLocalizer(moment);
// Drag-and-drop-ize
const DndBigCalendar = withDragAndDrop(BigCalendar);
const messages = {
  next: "Siguiente",
  previous: "Anterior",
  today: "Hoy",
};

class Calendar extends Component {
  state = { ctrlModifier: false };

  constructor() {
    super();
    this.colorMap = {};
  }

  componentDidMount() {
    document.addEventListener("keydown", this.onModifierChange);
    document.addEventListener("keyup", this.onModifierChange);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onModifierChange);
    document.removeEventListener("keyup", this.onModifierChange);
  }

  onModifierChange(evt) {
    if (evt.keyCode !== 17) return;

    // We only need ctrl for now
    this.setState({
      ctrlModifier: evt.type === "keydown" ? true : false,
    });
  }

  getColorClass(key) {
    if (!key) return;

    if (key in this.colorMap) {
      return this.colorMap[key];
    }

    const nextIndex = Object.keys(this.colorMap).length % 15;

    this.colorMap = {
      ...this.colorMap,
      [key]: nextIndex,
    };

    return nextIndex;
  }

  buildColorMap(events) {
    this.setState({
      colorMap: _(events)
        .map(e => e.project)
        .uniq()
        .reduce((acc, projectKey, i) => {
          acc[projectKey] = i;
          return acc;
        }, {}),
    });
  }

  eventPropGetter(event) {
    const isNew = event.id === "new";
    const colorClassId = this.getColorClass(event.project);
    const isSelected =
      this.props.currentEvent && this.props.currentEvent.id === event.id;

    return {
      className: classify({
        "event-is-new": isNew,
        "event-modified": event._hasChanged,
        "event-selected": isSelected,
        ["event-color-" + colorClassId]: true,
      }),
    };
  }

  onEventDrop({ start, end, event }) {
    if (this.state.ctrlModifier) {
      const eventCopy = { ...event, start, end };
      delete eventCopy.id;

      this.props.createNewEvent(eventCopy);
      this.props.setSelectedEventId("new");
    } else {
      this.props.updateEvent(event.id, { start, end });
      this.props.setSelectedEventId(event.id);
    }
  }

  onEventResize(_, { start, end, event }) {
    this.props.updateEvent(event.id, { start, end });
    this.props.setSelectedEventId(event.id);
  }

  onSelectEvent(event) {
    this.props.setSelectedEventId(event.id);
  }

  render() {
    return (
      <DndBigCalendar
        date={this.props.date}
        onNavigate={this.props.setDate}
        defaultView="week"
        views={["week"]}
        events={this.props.events}
        selectable={true}
        resizable={true}
        onEventDrop={this.onEventDrop}
        onEventResize={this.onEventResize}
        onSelectEvent={this.onSelectEvent}
        onSelectSlot={this.props.createNewEvent}
        scrollToTime={new Date(2018, 2, 17, 8, 0)}
        drilldownView={null}
        eventPropGetter={this.eventPropGetter}
        messages={messages}
        formats={{
          eventTimeRangeFormat({ start, end }, culture, localizer) {
            const optionalMinutes = t => {
              const f = t.getMinutes() ? "H:mm" : "H";
              return localizer.format(t, f);
            };

            const res = [optionalMinutes(start), optionalMinutes(end)];
            return res.join(" - ");
          },
        }}
      />
    );
  }
}

export default DragDropContext(HTML5Backend)(autobind(Calendar));
