import qs from "qs";
import axios from "axios";

require('promise.prototype.finally').shim();

const instance = axios.create();
const csrfToken = document
	.querySelector('meta[name="csrf-token"]')
	.getAttribute("content");

instance.defaults.headers.common = {
	"X-Requested-With": "XMLHttpRequest",
	"X-CSRF-TOKEN": csrfToken
};

instance.interceptors.request.use(config => {
	const { method, headers, data } = config;

	const customHeaders = {};

	if (method !== "get") {
		customHeaders["Content-type"] = "application/x-www-form-urlencoded";
		config.data = data
			? qs.stringify({ ...data, authenticity_token: csrfToken })
			: config.data;
	}

	config.headers = {
		...headers.common,
		...headers[method],
		...customHeaders
	};

	return config;
});

export default instance;
