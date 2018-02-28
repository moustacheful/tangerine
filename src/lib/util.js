export function getNodeFromString(htmlString) {
	const fragment = document.createElement("template");
	fragment.innerHTML = htmlString;

	return fragment.content;
}
