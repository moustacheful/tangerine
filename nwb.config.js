const webpack = require("webpack");

module.exports = nwb => {
	return {
		type: "react-app",
		webpack: {
			publicPath: "https://localhost:5000/",
			rules: {
				babel: {
					test: /\.jsx?/
				}
			},
			extra: {
				resolve: {
					extensions: [".js", "index.js", ".jsx"]
				},
				plugins: [new nwb.webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)]
			}
		},
		devServer: {
			https: true
		}
	};
};
