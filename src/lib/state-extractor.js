import $ from "jquery";
import http from "./http";
import moment from "moment";
import qs from "qs";
import Pomelo from "./pomelo";

function extractLogDataFromMarkup(doc) {
  return doc
    .find("table.table-striped tbody tr")
    .map((i, el) => {
      const [
        duration,
        startTime,
        date,
        activity,
        ,
        projectString,
        activityType
        // url,
      ] = Array.from(el.children).map(c => c.textContent);

      const id = $(el.children[8]).find("a").first().attr("href").split("=")[1];
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
        start: start.format(),
        end: start.add(duration, "hours").format(),
        title: activity,
        activityType,
        editable: false,
        project: {
          id: projectId,
          label: projectString
        }
      };
    })
    .toArray();
}

function extractLogData(from, to, page = 1) {
  const q = qs.stringify({ from, to, page });

  return http
    .get(`/daily_tasks?${q}`)
    .then(res => $(res.data))
    .then(pageData => {
      const results = extractLogDataFromMarkup(pageData);
      if (page > 1) return results;

      const pages = pageData
        .find("div.pagination a:not(.next_page, .previous_page)")
        .map((i, paginationEl) => {
          const nextQuery = qs.parse(
            paginationEl.getAttribute("href").split("?")[1]
          );
          return extractLogData(from, to, nextQuery.page);
        });

      return Promise.all(pages).then(pagesResults => {
        return pagesResults.reduce((acc, items) => [...acc, ...items], results);
      });
    });
}

function extractProjects() {
  const result = $("#project_id option").toArray().map(option => ({
    value: option.value,
    label: option.textContent
  }));

  return Promise.resolve(result);
}

export default function extractState({ from, to }) {
  return Promise.all([
    extractLogData(from, to),
    extractProjects()
  ]).then(([log, projects]) => {
    console.log(log);
    return { log, projects };
  });
}
