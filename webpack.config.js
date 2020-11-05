const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';
const ifProd = x => isProd && x;

module.exports = {
    mode: isProd ? 'production' : 'development',
    entry: './src/typescript/index.ts',
    devtool: isProd ? undefined : 'source-map',
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        compress: true,
        port: 9000
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'main.js',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                    }
                },
                exclude: /node_modules/,
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: !isProd,
                        },
                    },
                    // Compiles Sass to CSS
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: !isProd,
                            implementation: require('sass'),
                            sassOptions: {
                                fiber: require('fibers'),
                                outputStyle: 'compressed',
                            },
                        },
                    },
                ],
            }
        ]
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            eslint: {
                files: './src/typescript/**/*.{ts,tsx,js,jsx}',
            }
        }),
    ]
};