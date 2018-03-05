const defaultState = {
	collapsed: true,
};

const namespace = 'DIALOG';
export const TOGGLE_COLLAPSED = `${namespace}:TOGGLE_COLLAPSED`;

export default function(state = defaultState, action) {
	switch (action.type) {
		case TOGGLE_COLLAPSED: {
			return {
				...state,
				collapsed: !state.collapsed,
			};
		}

		default: {
			return {
				...defaultState,
				...state,
			};
		}
	}
}

export const Actions = {
	toggleDialog() {
		return dispatch => {
			dispatch({ type: TOGGLE_COLLAPSED });
		};
	},
};
