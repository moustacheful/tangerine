export default {
	get(key) {
		return localStorage.getItem(`tangerine:${key}`);
	},
	set(key, value) {
		localStorage.setItem(`tangerine:${key}`, value);
	}
};
