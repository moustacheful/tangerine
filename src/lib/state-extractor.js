import $ from "jquery";
import axios from "./axios";
import moment from "moment";

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
      const start = moment(`${date} ${startTime}`, "DD/MM/YYYY H:mm");
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

function extractLogDataPage({from, to, page = 1}) {
  const q = qs.stringify({ from,to, page });

  axios.get(`/daily_tasks?${q}`)
    .then(res => $(res.data))
    .then(pageData => {
      const results = [extractLogDataFromMarkup(pageData)]
      if (page > 1) return results
      if (page === 1) {
        const pages = pageData
          .find('div.pagination a:not(.next_page, .previous_page)')
          .map((i, paginationEl) => {
            const p = paginationEl.getAttribute(href);
            return extractLogDataPage(from, to, p)
          })

        return [results, ...pages]
      }

      return
    })
}

function extractLogData() {
  const selector = "table.table-striped tbody tr";
  const result = extractLogDataFromMarkup($(selector));

  const otherPages = $("div.pagination a:not(.next_page, .previous_page)")
    .map((i, page) => {
      const url = page.getAttribute("href");
      console.log(url);
      return axios
        .get(url)
        .then(({ data }) => $(data).find(selector))
        .then(items => extractLogDataFromMarkup(items));
    })
    .toArray();

  return Promise.all(otherPages).then(pageData => {
    return pageData.reduce((acc, results) => {
      return [...acc, ...results];
    }, result);
  });
}

function extractProjects() {
  const result = $("#project_id option").toArray().map(option => ({
    value: option.value,
    label: option.textContent
  }));

  return Promise.resolve(result);
}

export default function extractState() {
  return Promise.all([
    extractLogData(),
    extractProjects()
  ]).then(([log, projects]) => {
    console.log(log);
    return { log, projects };
  });
}
