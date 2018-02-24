import autobind from "autobind-decorator";
import React from "react";
import { EventEmitter } from "events";

const eventBus = new EventEmitter();
export default {
  push(message, type = "success") {
    eventBus.emit("push", { message, type, ts: new Date().getTime() });
  }
};

class Toasts extends React.Component {
  constructor() {
    super();
    eventBus.on("push", item => {
      this.setState({ items: [item, ...this.state.items] });
      this.scheduleRemoval();
    });
  }

  state = { items: [] };

  scheduleRemoval() {
    setTimeout(
      () =>
        this.setState({
          items: this.state.items.slice(0, -1)
        }),
      5000
    );
  }

  render() {
    return (
      <div className="toasts-container">
        {this.state.items.reverse().map(item => (
          <div key={item.ts} className={`toast alert alert-${item.type}`}>
            {item.message}
          </div>
        ))}
      </div>
    );
  }
}
export const ToastsComponent = autobind(Toasts);
