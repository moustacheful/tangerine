import React, { Component } from "react";
import autobind from "autobind-decorator";
import Calendar from "./components/Calendar";
import Form from "./components/Form";

class App extends Component {
	state = {
		collapsed: true,
		editableEvent: false
	};

	toggle() {
		this.setState({ collapsed: !this.state.collapsed });
	}

	setEditableEvent(editableEvent) {
		this.setState({ editableEvent });
	}

	render() {
		const collapsedClass = this.state.collapsed
			? "is-collapsed"
			: "is-expanded";

		return (
			<div id="tangerine" className={`app ${collapsedClass}`}>
				<button className="btn-toggle btn btn-primary" onClick={this.toggle}>
					{this.state.collapsed ? "Ver" : "Ocultar"} agenda
				</button>

				{!this.state.collapsed &&
					<div className="flex-container">
						<Calendar
							calendarData={this.props.log}
							editableEvent={this.state.editableEvent}
							setEditableEvent={this.setEditableEvent}
						/>

						{this.state.editableEvent
							? <aside>
									<Form
										eventData={this.state.editableEvent}
										setEditableEvent={this.setEditableEvent}
									/>
								</aside>
							: <aside>
									<div className="well well-xs">
										Seleccionar un rango para trackear
									</div>
								</aside>}
					</div>}
			</div>
		);
	}
}

export default autobind(App);
