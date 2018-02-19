import React from "react";
import $ from "jquery";
import autobind from "autobind-decorator";
import http from "../lib/http";
import moment from "moment";
import Pomelo from "../lib/pomelo";
import _ from "lodash";
import Select from "react-select";

class EnhancedSelect extends React.Component {
	render() {
		const { name, onChange, ...props } = this.props;

		return (
			<Select
				{...props}
				name={name}
				onChange={option => {
					onChange({
						target: { name, value: option.value }
					});
				}}
			/>
		);
	}
}

class Form extends React.Component {
	state = {
		tasks: [],
		loadingTasks: false,
		timeMap: {},
		formData: {},
		event: {},
		activityId: undefined
	};

	componentWillMount() {
		this.updateEvent = _.debounce(this.props.updateEvent, 300);
	}

	componentDidMount() {
		if (this.props.event) {
			this.setState({
				event: this.props.event
			});
		}

		if (this.firstInput) {
			requestAnimationFrame(() => this.firstInput.focus());
		}

		this.getHTMLForm().then(({ data }) => {
			const [match] = data.match(/\s"(.*)"\s/);
			const htmlString = JSON.parse(match.trim());
			const html = $(htmlString);

			this.setState({
				authenticityToken: html.find("[name=authenticity_token]").first().val(),
				userId: html.find("#daily_task_user_id").first().val(),
				timeMap: html
					.find("#daily_task_start_time option")
					.toArray()
					.reduce((acc, item) => {
						acc[item.textContent] = item.value;
						return acc;
					}, {})
			});
		});
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.event && nextProps.event.id !== this.props.event.id) {
			this.setState({
				event: nextProps.event
			});
		}
	}

	mapEventToForm() {
		const { event } = this.state;

		const start = moment(event.start);
		const end = moment(event.end);

		const taskDate = start.format(Pomelo.dateFormat);
		const taskStart = start.format(Pomelo.timeFormat);
		const taskEnd = end.format(Pomelo.timeFormat);
		const taskHours = end.diff(start, "hours", true);

		return {
			authenticity_token: this.state.authenticityToken,
			utf8: "&#x2713;",
			"daily_task[user_id]": this.state.userId,
			"daily_task[name]": event.title,
			"daily_task[description]": event.description,
			"daily_task[project_id]": event.project,
			"daily_task[ticket_url]": event.relatedURL,
			"daily_task[activity_id]": event.activity,
			"daily_task[date]": taskDate,
			"daily_task[start_time]": this.state.timeMap[taskStart],
			"daily_task[hours_amount]": taskHours,
			"daily_task[is_not_billable]": event.billable
		};
	}

	getHTMLForm() {
		const url = $("#btn-create-daily-task").attr("href");
		return http.get(url + `?_=${Date.now()}`);
	}

	onInputChange(evt) {
		/*this.updateEvent(this.props.event.id, {
			[evt.target.name]: evt.target.value
		});*/

		this.setState({
			event: {
				...this.state.event,
				[evt.target.name]: evt.target.type === "checkbox"
					? evt.target.checked
					: evt.target.value
			}
		});
	}

	updateActivity(state) {
		const found = _.find(state.tasks, { label: state.event.activity });

		this.setState({
			activityId: found ? found.value : undefined
		});
	}

	componentDidUpdate(prevProps, prevState) {
		if (
			this.state.event.project &&
			this.state.event.project !== prevState.event.project
		) {
			this.getTasksForProject(this.state.event.project);
		}

		if (
			this.state.event.activity !== prevState.event.activity ||
			this.state.tasks !== prevState.tasks
		) {
			this.updateActivity(this.state);
		}
	}

	getTasksForProject(projectId) {
		if (!projectId) return Promise.resolve([]);
		this.setState({
			loadingTasks: true
		});
		return Pomelo.getTasksForProject(projectId).then(tasks => {
			this.setState({ tasks, loadingTasks: false });
			return tasks;
		});
	}

	submit(evt) {
		evt.preventDefault();

		const data = this.mapEventToForm();
		const formData = _.reduce(
			data,
			(acc, value, key) => {
				acc.append(key, value);
				return acc;
			},
			new FormData()
		);

		http({
			method: evt.target.getAttribute("method"),
			url: evt.target.getAttribute("action"),
			data: formData,
			config: { headers: { "Content-Type": "multipart/form-data" } }
		})
			.then(({ data }) => {
				console.log("success");
				// window.location.reload();
			})
			.catch(console.error);
	}

	render() {
		return (
			<form action="/daily_tasks" method="post" onSubmit={this.submit}>
				<pre>{JSON.stringify(this.state.event, null, "  ")}</pre>
				<div className="form-group">
					<label htmlFor="t_event-title">Nombre tarea</label>
					<input
						id="t_event-title"
						ref={el => (this.firstInput = el)}
						type="text"
						className="form-control"
						placeholder="Título"
						name="title"
						onChange={this.onInputChange}
						value={this.state.event.title}
					/>
				</div>

				<div className="form-group">
					<label htmlFor="t_event-description">Comentario</label>
					<textarea
						id="t_event-description"
						className="form-control"
						type="text"
						placeholder="Comentario"
						name="description"
						onChange={this.onInputChange}
						value={this.state.event.description}
					/>
				</div>

				<div className="form-group">
					<label htmlFor="t_event-related-url">URL Ticket</label>
					<input
						id="t_event-related-url"
						className="form-control"
						type="text"
						placeholder="URL Ticket"
						name="relatedURL"
						onChange={this.onInputChange}
						value={this.state.event.relatedURL}
					/>
				</div>

				<div className="form-group">
					<label htmlFor="t_event-project">Proyecto</label>
					<EnhancedSelect
						id="t_event-project"
						className="form-control"
						name="project"
						value={this.state.event.project}
						clearable={false}
						onChange={this.onInputChange}
						options={this.props.projects}
					/>
				</div>
				{!!this.state.tasks.length &&
					<div className="form-group">
						<label htmlFor="t_event-activity">Tipo de tarea</label>
						<Select
							id="t_event-activity"
							className="form-control"
							name="activity"
							value={this.state.activityId}
							clearable={false}
							onChange={option => {
								this.setState({ activityId: option.value });
								this.onInputChange({
									target: {
										name: "activity",
										value: option.label
									}
								});
							}}
							isLoading={this.state.loadingTasks}
							options={this.state.tasks}
						/>
					</div>}

				<div className="form-group">
					<input
						name="billable"
						type="checkbox"
						checked={this.state.event.billable}
						onChange={this.onInputChange}
						className="form-control"
					/>
					<label htmlFor="">No cobrable</label>
				</div>

				<button className="btn btn-primary" type="submit">Enviar</button>
			</form>
		);
	}
}

export default autobind(Form);
