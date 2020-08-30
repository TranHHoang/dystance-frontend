const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /(node_modules|\.webpack)/,
                use: {
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true
                    }
                }
            },
            {
                test: /\.css$/,
                use: [{ loader: "style-loader" }, { loader: "css-loader" }]
            }
        ]
    },
    plugins: [new ForkTsCheckerWebpackPlugin()],
    resolve: {
        extensions: [".js", ".ts", ".jsx", ".tsx", ".css"]
    }
};
