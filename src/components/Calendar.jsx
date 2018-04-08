import React, { Component } from "react";
import _ from "lodash";
import autobind from "autobind-decorator";
import moment from "moment";
import BigCalendar from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import HTML5Backend from "react-dnd-html5-backend";
import { DragDropContext } from "react-dnd";
import CalendarToolbar from "./CalendarToolbar";
import classify from "../lib/classify";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

// Add localizer
BigCalendar.momentLocalizer(moment);
// Drag-and-drop-ize
const DndBigCalendar = withDragAndDrop(BigCalendar);
const messages = {
  next: "Siguiente",
  previous: "Anterior",
  today: "Semana actual",
};

const formats = {
  dayRangeHeaderFormat: ({ start, end }, _, localizer) => {
    const startM = start.getMonth();
    const endM = end.getMonth();

    const result = [
      localizer.format(start, "DD"),
      "-",
      localizer.format(end, "DD"),
      "de",
      localizer.format(end, "MMMM"),
    ];

    if (startM !== endM) {
      result.splice(1, 0, "de", localizer.format(start, "MMMM"));
    }

    return result.join(" ");
  },

  eventTimeRangeFormat({ start, end }, culture, localizer) {
    const optionalMinutes = t => {
      const f = t.getMinutes() ? "H:mm" : "H";
      return localizer.format(t, f);
    };

    const res = [optionalMinutes(start), optionalMinutes(end)];
    return res.join(" - ");
  },
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
    if (![224, 17, 91].includes(evt.keyCode)) return;
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

  withinSameDay(start, end) {
    const startDay = moment(start).day();
    const endDay = moment(end).day();

    return startDay === endDay;
  }

  eventPropGetter(event) {
    const isNew = event.id === "new";
    const colorClassId = this.getColorClass(event.project);
    const isSelected = this.props.selectedEventId === event.id;

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
    if (!this.withinSameDay(start, end)) return;

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
    // Bail if same start end, or if not within the same day
    if (start.valueOf() === end.valueOf()) return;
    if (!this.withinSameDay(start, end)) return;

    // Swap values if start > end to avoid negative values
    [start, end] = start > end ? [end, start] : [start, end];

    this.props.updateEvent(event.id, { start, end });
    this.props.setSelectedEventId(event.id);
  }

  onSelectEvent(event) {
    this.props.setSelectedEventId(event.id);
  }

  getToolbar(props) {
    return <CalendarToolbar {...props} stats={this.props.stats} />;
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
        formats={formats}
        components={{
          toolbar: this.getToolbar
        }}
      />
    );
  }
}

export default DragDropContext(HTML5Backend)(autobind(Calendar));
