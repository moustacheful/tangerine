import Pomelo from "./pomelo";

export default function extractState({ from, to }) {
	return Promise.all([Pomelo.extractLogData(from, to), Pomelo.getProjects()])
		.then(([log, projects]) => {
			return { log: { events: log }, projects };
		})
		.then(state => {
			console.log(state);
			return state;
		});
}
