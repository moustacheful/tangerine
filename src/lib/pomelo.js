import moment from "moment";
import http from "./http";
import qs from "qs";
import { getNodeFromString } from "../lib/util";

const cache = new Map();

const Pomelo = {
	dateFormat: "DD/MM/YYYY",
	timeFormat: "H:mm",

	getTasksForProject(projectId) {
		const key = `tasks:${projectId}`;
		if (cache.has(key)) return Promise.resolve(cache.get(key));
		return http
			.get(`/daily_tasks/activities?project_id=${projectId}&_=${Date.now()}`)
			.then(res => res.data)
			.then(data => {
				return data.map(({ id, name }) => ({ label: name, value: id }));
			})
			.then(result => {
				cache.set(key, result);
				return result;
			});
	},

	getProjects() {
		return Array.from(document.querySelectorAll("#project_id option"))
			.filter(option => !!option.value)
			.map(option => ({
				value: option.value,
				label: option.textContent
			}));
	},

	extractLogData(from, to, page = 1) {
		const q = qs.stringify({ from, to, page });

		return http
			.get(`/daily_tasks?${q}`)
			.then(res => getNodeFromString(res.data))
			.then(pageData => {
				const results = Pomelo.extractLogDataFromMarkup(pageData);
				if (page > 1) return results;

				const pages = Array.from(
					pageData.querySelectorAll("div.pagination a")
				).reduce((acc, paginationEl) => {
					if (
						paginationEl.classList.contains("next_page") ||
						paginationEl.classList.contains("previous_page")
					)
						return acc;

					const nextQuery = qs.parse(
						paginationEl.getAttribute("href").split("?")[1]
					);
					acc.push(Pomelo.extractLogData(from, to, nextQuery.page));
					return acc;
				}, []);

				return Promise.all(pages).then(pagesResults => {
					return pagesResults.reduce(
						(acc, items) => [...acc, ...items],
						results
					);
				});
			});
	},

	extractLogDataFromMarkup(doc) {
		return Array.from(
			doc.querySelectorAll("table.table-striped tbody tr")
		).map(el => {
			const [duration, startTime, date, title] = Array.from(el.children).map(
				c => c.textContent
			);

			let description = el.children[4].querySelector("a");
			description =
				description.getAttribute("data-original-title") ||
				description.getAttribute("title");
			description = description === "Sin Comentario" ? "" : description;

			const id = el.getAttribute("data-daily-task-id");
			const project = el.children[5].getAttribute("data-project-id");
			const activity = el.children[6].getAttribute("data-activity-id");

			const relatedURLEl = el.children[7].querySelector("a");
			const relatedURL = relatedURLEl ? relatedURLEl.getAttribute("href") : "";

			const start = moment(
				`${date} ${startTime}`,
				`${Pomelo.dateFormat} ${Pomelo.timeFormat}`
			);

			return {
				id,
				start: start.toDate(),
				end: start.add(duration, "hours").toDate(),
				title,
				activity,
				description,
				project,
				relatedURL
			};
		});
	}
};

export default Pomelo;
