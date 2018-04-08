import React from "react";
import moment from "moment";
import autobind from "autobind-decorator";
import Storage from "../lib/storage";

@autobind
export default class CalendarToolbar extends React.Component {
  state = {
    statIndex: parseInt(Storage.get("statIndex"), 10) || 0
  };

  rotateStats() {
    const statIndex = (this.state.statIndex + 1) % this.props.stats.length;

    Storage.set("statIndex", statIndex);
    this.setState({ statIndex });
  }

  render() {
    const current = moment(this.props.date).startOf("week");
    const next = current.clone().add(1, "week").toDate();
    const prev = current.clone().subtract(1, "week").toDate();
    const stat = this.props.stats[this.state.statIndex];

    return (
      <div className="rbc-toolbar">
        <div className="rbc-toolbar-label">{this.props.label}</div>
        <div
          className="toolbar-stats"
          title={`${stat.label} - Click para cambiar`}
          onClick={this.rotateStats}
        >
          <span className="toolbar-stat-value">
            {stat.value} hrs
          </span>
          <span className="toolbar-stat-label">
            {stat.label} <i className="fa fa-exchange" />
          </span>
          <i className="icon" />
        </div>

        <div className="flex-spacer" />

        <span className="rbc-btn-group">
          <button
            className="btn-icon"
            onClick={() => this.props.onNavigate("click", prev)}
            title={this.props.messages.previous}
          >
            <i className="fa fa-angle-left" />
          </button>
          <button onClick={() => this.props.onNavigate("click", new Date())}>
            {this.props.messages.today}
          </button>
          <button
            className="btn-icon"
            onClick={() => this.props.onNavigate("click", next)}
            title={this.props.messages.next}
          >
            <i className="fa fa-angle-right" />
          </button>
        </span>
      </div>
    );
  }
}
