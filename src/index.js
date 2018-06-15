import moment from "moment";
import "moment/locale/es";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import React from "react";
import ReactDOM from "react-dom";
import Pomelo from "./lib/pomelo";
import App from "./App";
import reducer from "./reducer";

import "react-select/dist/react-select.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./stylus/main.styl";

(function() {
  const store = createStore(
    reducer,
    {
      projects: Pomelo.getProjects(),
    },
    applyMiddleware(thunk)
  );

  const renderApp = () => {
    ReactDOM.render(
      <Provider store={store}>
        <App />
      </Provider>,
      document.getElementById("root")
    );
  };

  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);

  renderApp();

  if (module.hot) {
    module.hot.accept("./App", renderApp);
  }
})();
