import moment from "moment";
import http from "./http";
import $ from "jquery";
import qs from "qs";

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
		const result = Array.from(
			document.querySelectorAll("#project_id option")
		).map(option => ({
			value: option.value,
			label: option.textContent
		}));

		return Promise.resolve(result);
	},

	extractLogData(from, to, page = 1) {
		const q = qs.stringify({ from, to, page });

		return http
			.get(`/daily_tasks?${q}`)
			.then(res => $(res.data))
			.then(pageData => {
				const results = Pomelo.extractLogDataFromMarkup(pageData);
				if (page > 1) return results;

				const pages = pageData
					.find("div.pagination a:not(.next_page, .previous_page)")
					.map((i, paginationEl) => {
						const nextQuery = qs.parse(
							paginationEl.getAttribute("href").split("?")[1]
						);
						return Pomelo.extractLogData(from, to, nextQuery.page);
					});

				return Promise.all(pages).then(pagesResults => {
					return pagesResults.reduce(
						(acc, items) => [...acc, ...items],
						results
					);
				});
			});
	},

	extractLogDataFromMarkup(doc) {
		return doc
			.find("table.table-striped tbody tr")
			.map((i, el) => {
				const [
					duration,
					startTime,
					date,
					title,
					,
					projectString,
					activity
					// url,
				] = Array.from(el.children).map(c => c.textContent);

				let description = $(el.children[4]).find("a[rel=tooltip]");
				description =
					description.data("original-title") || description.attr("title");
				description = description === "Sin Comentario" ? "" : description;

				console.log(description);
				const id = $(el.children[8])
					.find("a")
					.first()
					.attr("href")
					.split("=")[1];
				const start = moment(
					`${date} ${startTime}`,
					`${Pomelo.dateFormat} ${Pomelo.timeFormat}`
				);

				const projectEl = $("#project_id option")
					.toArray()
					.find(el => el.textContent === projectString);

				const projectId = projectEl ? projectEl.value : undefined;

				return {
					id,
					start: start.toDate(),
					end: start.add(duration, "hours").toDate(),
					title,
					activity,
					description,
					editable: false,
					project: projectId
				};
			})
			.toArray();
	}
};

export default Pomelo;
