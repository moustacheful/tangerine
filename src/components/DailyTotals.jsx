import { h, Component } from "preact";

export default ({ totals }) => {
	if (!totals) return null;

	return (
		<div className="daily-totals flex-parent">
			<div>Total</div>
			{totals.map((total, i) => (
				<div key={i} className="flex-extend">{total} hrs</div>
			))}
		</div>
	);
};
