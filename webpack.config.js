const fs = require('fs')
const path = require('path')

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const distDir = path.join(__dirname, 'dist')
const browserDir = path.join(__dirname, 'src')
const nodeDir = path.join(browserDir, 'node')

const browserEntries = fs.readdirSync(path.join(browserDir, 'pages'))
const nodeEntries = fs.readdirSync(nodeDir)

// ECMAScript version to transpile to.
const ecmaVersion = 2015

// External dependencies that should not be resolved.
// https://webpack.js.org/configuration/externals/
const externals = [
  // BrightSign modules.
  ({ context, request }, callback) => {
    if (/^@brightsign\/\w+$/i.test(request)) {
      return callback(null, 'commonjs2 ' + request)
    }
    callback()
  }
]

const swcOptionsNode = {
  jsc: {
    parser: {
      syntax: 'typescript',
      dynamicImport: true
    },
    target: `es${ecmaVersion}`,
    paths: { '~/*': ['./*'] },
    baseUrl: '.'
  }
}

const swcOptionsBrowser = {
  jsc: {
    ...swcOptionsNode.jsc,
    parser: {
      ...swcOptionsNode.jsc.parser,
      tsx: true
    },
    transform: { react: { runtime: 'automatic' } }
  }
}

const svgrOptions = {
  icon: true,
  typescript: true,
  memo: true
}

const terserOptions = {
  terserOptions: {
    ecma: ecmaVersion,
    module: true,
    toplevel: true,
    compress: { passes: 3 },
    format: { comments: false }
  },
  extractComments: false
}

const browser = (env, argv) => ({
  entry: Object.fromEntries(browserEntries.map(name => (
    [name, path.join(browserDir, 'pages', name, 'index')]
  ))),
  output: {
    filename: '[name].js',
    path: path.join(distDir, 'browser'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(m?[jt]s)|([jt]sx)$/i,
        loader: 'swc-loader',
        options: swcOptionsBrowser,
        include: browserDir
      },
      {
        test: /\.css$/i,
        use: [
          argv.mode === 'production'
            ? MiniCssExtractPlugin.loader
            : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: argv.mode === 'production'
                  ? [
                      'postcss-import',
                      'tailwindcss',
                      'autoprefixer',
                      [
                        'cssnano',
                        { preset: ['advanced', { discardComments: { removeAll: true } }] }
                      ]
                    ]
                  : [
                      'tailwindcss'
                    ]
              }
            }
          }
        ],
        include: browserDir
      },
      {
        test: /\.(png|jpe?g|webp|avif|gif)$/i,
        type: 'asset',
        generator: {
          filename: 'images/[name][ext][query]'
        }
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx$/i,
        loader: '@svgr/webpack',
        options: svgrOptions
      },
      {
        test: /\.mp4$/i,
        type: 'asset/resource',
        generator: {
          filename: 'videos/[name][ext][query]'
        }
      }
    ]
  },
  resolve: {
    alias: { '~': __dirname },
    extensions: ['.tsx', '.jsx', '.mts', 'mjs', '.ts', '...']
  },
  optimization: {
    minimize: argv.mode === 'production',
    minimizer: [
      new TerserPlugin(terserOptions)
    ],
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    ...browserEntries.map(name => (
      new HtmlWebpackPlugin({
        filename: `${name}.html`,
        chunks: [name]
      })
    ))
  ].concat(argv.mode === 'production'
    ? new MiniCssExtractPlugin({
      filename: 'main.css'
    })
    : []
  ),
  devServer: {
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    }
  },
  externals: externals
})

const node = (env, argv) => ({
  entry: Object.fromEntries(nodeEntries.map(entryName => {
    const baseName = path.basename(entryName, path.extname(entryName))
    return [baseName, path.join(nodeDir, baseName)]
  })),
  output: {
    filename: '[name].js',
    path: path.join(distDir, 'node'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.c?[jt]s$/i,
        loader: 'swc-loader',
        include: nodeDir,
        options: swcOptionsNode
      }
    ]
  },
  resolve: {
    alias: { '~': __dirname },
    extensions: ['.cts', 'cjs', '.ts', '...']
  },
  optimization: {
    minimize: argv.mode === 'production',
    minimizer: [
      new TerserPlugin(terserOptions)
    ],
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin()
  ],
  target: 'node',
  externals: externals
})

module.exports = (env, argv) => [browser(env, argv), node(env, argv)]
