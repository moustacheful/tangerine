import _ from "lodash";
import React from "react";
import autobind from "autobind-decorator";
import FullCalendar from "./FullCalendar";

class Calendar extends React.Component {
	state = {
		events: [],
		range: undefined
	};

	componentDidMount() {
		this.setState({
			events: this.props.calendarData
		});
	}

	componentWillReceiveProps(newProps) {
		if (this.props.calendarData !== newProps.calendarData) {
			this.setState({
				events: newProps.calendarData
			});
		}
	}

	onEditEvent(event, delta) {
		console.log(event);
		this.setState({
			editableEvent: event
		});
	}

	onCreate(start, end, evt, view) {
		const event = {
			id: "new",
			start,
			end,
			title: "Nueva tarea",
			editable: true
		};

		this.props.setEditableEvent(event);
	}

	renderEvent(event, el) {
		if (event.editable) {
			el.addClass("event-editable");
		}
	}

	render() {
		const events = [...this.state.events];

		if (this.props.editableEvent) {
			events.push(this.props.editableEvent);
		}

		return (
			<FullCalendar
				visibleRange={undefined}
				viewRender={view => {
					// should probably check here and keep state of the range being seen
				}}
				id="fullcalendar"
				defaultView="agendaWeek"
				header={{
					left: "prev,next today",
					center: "title",
					right: ""
				}}
				navLinks={true}
				events={events}
				selectable={true}
				select={this.onCreate}
				editable={true}
				eventResize={this.props.setEditableEvent}
				eventDrop={this.props.setEditableEvent}
				eventRender={this.renderEvent}
				height="500"
			/>
		);
	}
}

export default autobind(Calendar);
