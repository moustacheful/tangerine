import _ from "lodash";
import Select from "react-select";
import { h, Component } from "preact";
import autobind from "autobind-decorator";
import moment from "moment";

import http from "../lib/http";
import Pomelo from "../lib/pomelo";
import Storage from "../lib/storage";
import { getNodeFromString } from "../lib/util";

class EnhancedSelect extends Component {
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

class Form extends Component {
  state = {
    showDebug: false,
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
      const html = getNodeFromString(htmlString);

      this.setState({
        authenticityToken: html.querySelector("[name=authenticity_token]")
          .value,
        userId: html.querySelector("#daily_task_user_id").value,
        timeMap: Array.from(
          html.querySelectorAll("#daily_task_start_time option")
        ).reduce((acc, item) => {
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
    } else if (
      nextProps.event.start !== this.state.event.start ||
      nextProps.event.end !== this.state.event.end
    ) {
      this.setState({
        event: {
          ...this.state.event,
          ...{
            start: nextProps.event.start,
            end: nextProps.event.end
          }
        }
      });
    }
  }

  toggleDebug() {
    this.setState({
      showDebug: !this.state.showDebug
    });
  }
  mapEventToForm() {
    const { event } = this.state;

    const start = moment(event.start);
    const end = moment(event.end);

    const taskDate = start.format(Pomelo.dateFormat);
    const taskStart = start.format(Pomelo.timeFormat);
    const taskHours = end.diff(start, "hours", true);

    return {
      authenticity_token: this.state.authenticityToken,
      utf8: "&#x2713;",
      "daily_task[user_id]": this.state.userId,
      "daily_task[name]": event.title,
      "daily_task[description]": event.description,
      "daily_task[project_id]": event.project,
      "daily_task[ticket_url]": event.relatedURL,
      "daily_task[activity_id]": this.isActivityValid()
        ? event.activity
        : undefined,
      "daily_task[date]": taskDate,
      "daily_task[start_time]": this.state.timeMap[taskStart],
      "daily_task[hours_amount]": taskHours,
      "daily_task[is_not_billable]": 0
    };
  }

  getHTMLForm() {
    const url = document
      .querySelector("#btn-create-daily-task")
      .getAttribute("href");
    return http.get(url + `?_=${Date.now()}`);
  }

  onInputChange(evt) {
    this.setState(
      {
        event: {
          ...this.state.event,
          _hasChanged: true,
          [evt.target.name]: evt.target.type === "checkbox"
            ? evt.target.checked
            : evt.target.value
        }
      },
      state => {
        this.updateEvent(this.state.event.id, this.state.event);
      }
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.event.project &&
      this.state.event.project !== prevState.event.project
    ) {
      this.getTasksForProject(this.state.event.project);
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

  delete(evt) {
    evt.preventDefault();
    const confirmedDeletion = window.confirm(
      `Estás seguro que quieres eliminar '${this.state.event.title}' ?`
    );
    if (confirmedDeletion) this.props.deleteEvent(this.state.event.id);
  }

  saveEvent(evt) {
    evt.preventDefault();
    this.props.saveEvent(this.state.event.id, this.mapEventToForm());
  }

  submit(evt) {
    evt.preventDefault();

    const data = this.mapEventToForm();
    this.props.saveNewEvent(data);
  }

  isActivityValid() {
    return this.state.tasks
      .map(i => i.value)
      .includes(this.state.event.activity);
  }

  render() {
    return (
      <form action="/daily_tasks" method="post" onSubmit={this.submit}>
        <div className="form-group">
          <label htmlFor="t_event-title">Nombre tarea</label>
          <input
            id="t_event-title"
            ref={el => (this.firstInput = el)}
            type="text"
            className="form-control"
            placeholder="Título"
            name="title"
            onInput={this.onInputChange}
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
            onInput={this.onInputChange}
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
            onInput={this.onInputChange}
            value={this.state.event.relatedURL}
          />
        </div>

        <div className="form-group">
          <label htmlFor="t_event-project">
            Proyecto{" "}
            {this.state.event.project &&
              <a
                onClick={() =>
                  Storage.set("defaultProject", this.state.event.project)}
                href="#"
              >
                Guardar como predeterminado
              </a>}
          </label>
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
            <label htmlFor="t_event-activity">
              Tipo de tarea{" "}
              {this.state.event.activity &&
                this.isActivityValid() &&
                <a
                  onClick={() =>
                    Storage.set("defaultActivity", this.state.event.activity)}
                  href="#"
                >
                  Guardar como predeterminado
                </a>}
            </label>
            <EnhancedSelect
              id="t_event-activity"
              className="form-control"
              name="activity"
              value={this.state.event.activity}
              clearable={false}
              onChange={this.onInputChange}
              options={this.state.tasks}
              isLoading={this.state.loadingTasks}
            />
          </div>}

        <div className="tools">
          {this.state.event.id === "new" &&
            <button className="btn btn-primary" type="submit">
              Enviar
            </button>}
          {this.state.event.id !== "new" && [
            <button onClick={this.saveEvent} className="btn btn-warning">
              Actualizar
            </button>,
            <button onClick={this.delete} className="btn btn-danger">
              Borrar
            </button>
          ]}
        </div>
        <a href="#" onClick={this.toggleDebug}>
          Ver info debug
        </a>
        {this.state.showDebug &&
          <pre>
            {JSON.stringify(this.state, null, "  ")}
          </pre>}
      </form>
    );
  }
}

export default autobind(Form);
