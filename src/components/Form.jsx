import React from "react";
import $ from "jquery";
import autobind from "autobind-decorator";
import axios from "../lib/axios";

class Form extends React.Component {
	state = { tasks: [], timeMap: {}, formData: {} };

	componentDidMount() {
		if (this.firstInput) this.firstInput.focus();

		this.getTasksForProject(302);

		const url = $("#btn-create-daily-task").attr("href");
		axios.get(url + `?_=${Date.now()}`).then(({ data }) => {
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

	onInputChange(evt) {
		this.setState({
			formData: {
				...this.state.formData,
				[evt.target.name]: evt.target.value
			}
		});
	}

	getTasksForProject(projectId) {
		axios
			.get(`/daily_tasks/activities?project_id=${projectId}&_=${Date.now()}`)
			.then(({ data }) => {
				this.setState({ tasks: data });
			});
	}

	submit(evt) {
		axios({
			method: evt.target.getAttribute("method"),
			url: evt.target.getAttribute("action"),
			data: new FormData(evt.target),
			config: { headers: { "Content-Type": "multipart/form-data" } }
		})
			.then(({ data }) => {
				window.location.reload();
			})
			.catch(console.error);
		evt.preventDefault();
	}

	render() {
		const { eventData } = this.props;
		const taskDate = eventData.start.format("DD/MM/YYYY");
		const taskStart = eventData.start.format("H:mm");
		const taskEnd = eventData.end.format("H:mm");
		const taskHours = eventData.end.diff(eventData.start, "hours", true);

		return (
			<form action="/daily_tasks" method="post" onSubmit={this.submit}>
				<input name="utf8" type="hidden" value="&#x2713;" />
				<input
					type="hidden"
					name="authenticity_token"
					value={this.state.authenticityToken}
				/>
				<input
					type="hidden"
					name="daily_task[user_id]"
					value={this.state.userId}
				/>

				<div className="form-group">
					<label htmlFor="">Nombre tarea</label>

					<input
						ref={el => this.firstInput}
						type="text"
						className="form-control"
						placeholder="Título"
						name="daily_task[name]"
					/>
				</div>

				<div className="form-group">
					<label htmlFor="">Comentario</label>

					<textarea
						className="form-control"
						type="text"
						placeholder="Comentario"
						name="daily_task[description]"
					/>
				</div>

				<div className="form-group">
					<label htmlFor="">URL Ticket</label>

					<input
						className="form-control"
						type="text"
						placeholder="URL Ticket"
						name="daily_task[ticket_url]"
					/>
				</div>

				<input type="hidden" name="daily_task[project_id]" value="302" />

				<div className="form-group">
					<label htmlFor="">Tipo de tarea</label>
					<select
						className="form-control"
						name="daily_task[activity_id]"
						value={this.state.formData["daily_task[activity_id]"]}
						onChange={this.onInputChange}
					>
						{this.state.tasks.map(task => (
							<option key={task.id} value={task.id}>{task.name}</option>
						))}
					</select>
				</div>

				<div className="form-group">
					<label htmlFor="">Fecha</label>
					<input
						className="form-control"
						type="text"
						readOnly
						value={taskDate}
						name="daily_task[date]"
					/>
				</div>

				<div className="form-group">
					<label htmlFor="">Hora de comienzo</label>
					<input
						type="text"
						className="form-control"
						readOnly
						value={taskStart}
					/>
					<input
						type="hidden"
						name="daily_task[start_time]"
						value={this.state.timeMap[taskStart]}
					/>
				</div>

				<div className="form-group">
					<label htmlFor="">Hora de término</label>
					<input
						type="hidden"
						name="daily_task[hours_amount]"
						readOnly
						value={taskHours}
					/>
					<input
						type="text"
						className="form-control"
						value={`${taskEnd} (${taskHours} horas)`}
						readOnly
					/>
				</div>

				<input name="daily_task[is_not_billable]" type="hidden" value="0" />
				<button className="btn btn-primary" type="submit">Enviar</button>
			</form>
		);
	}
}

export default autobind(Form);
