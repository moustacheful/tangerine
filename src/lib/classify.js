export default function classify(definition) {
	const keys = Object.keys(definition);

	return keys.filter(key => !!definition[key]).join(" ");
}
