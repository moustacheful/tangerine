import React from "react";
import autobind from "autobind-decorator";
import moment from "moment";
import BigCalendar from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import HTML5Backend from "react-dnd-html5-backend";
import { DragDropContext } from "react-dnd";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

// Add localizer
BigCalendar.momentLocalizer(moment);
// Drag-and-drop-ize
const DndBigCalendar = withDragAndDrop(BigCalendar);

class Calendar extends React.Component {
	eventPropGetter(event) {
		return {
			className: event.editable ? "event-editable" : ""
		};
	}

	onEventDrop({ start, end, event }) {
		this.props.updateEvent(event.id, { start, end });
	}

	onEventResize(_, { start, end, event }) {
		this.props.updateEvent(event.id, { start, end });
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
				formats={{
					eventTimeRangeFormat({ start, end }, culture, localizer) {
						const optionalMinutes = t => {
							const f = t.getMinutes() ? "H:mm" : "H";
							return localizer.format(t, f);
						};

						const res = [optionalMinutes(start), optionalMinutes(end)];
						return res.join(" - ");
					}
				}}
			/>
		);
	}
}

export default DragDropContext(HTML5Backend)(autobind(Calendar));
