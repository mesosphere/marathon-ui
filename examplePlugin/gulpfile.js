var autoprefixer = require("gulp-autoprefixer");
var connect = require("gulp-connect");
var header = require("gulp-header");
var eslintFormatter = require("eslint/lib/formatters/stylish");
var gulp = require("gulp");
var gutil = require("gulp-util");
var less = require("gulp-less");
var minifyCSS = require("gulp-minify-css");
var path = require("path");
var fs = require("fs");
var replace = require("gulp-replace");
var uglify = require("gulp-uglify");
var webpack = require("webpack");
var WebpackNotifierPlugin = require('webpack-notifier');
var zip = require("gulp-zip");

var packageInfo = require("./package");

var dirs = {
  src: "./src",
  js: "./src/js",
  dist: "dist",
  styles: "./src/css",
  img: "./src/img",
  imgDist: "img"
};

var files = {
  mainJs: "main",
  mainJsDist: "main",
  mainLess: "main",
  mainCssDist: "main",
  eslintRc: "./.eslintrc"
};

var webpackWatch = true;

var webpackConfig = {
  entry: dirs.js + "/" + files.mainJs + ".js",
  eslint: {
    configFile: files.eslintRc,
    formatter: eslintFormatter
  },
  output: {
    path: path.resolve(dirs.dist),
    filename: files.mainJsDist + ".js"
  },
  module: {
    preLoaders: [
      {
        test: /\.(js|jsx)$/,
        loader: "eslint-loader",
        exclude: /node_modules/
      }
    ],
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: "babel",
        exclude: /node_modules/,
        query: {
          cacheDirectory: true
        }
      },
      {
        test: /\.json$/,
        loader: "json-loader",
        exclude: /node_modules/
      }
    ],
    postLoaders: [
      {
        loader: "transform/cacheable?envify"
      }
    ]
  },
  resolve: {
    extensions: ["", ".jsx", ".js"]
  },
  watch: webpackWatch
};

// Use webpack to compile jsx into js,
gulp.task("webpack", function (callback) {
  var isFirstRun = true;
  // run webpack
  webpack(webpackConfig, function (err, stats) {
    if (err) {
      throw new gutil.PluginError("webpack", err);
    }

    gutil.log("[webpack]", stats.toString({
      children: false,
      chunks: false,
      colors: true,
      modules: false,
      timing: true
    }));

    if (isFirstRun) {
      // This runs on initial gulp webpack load.
      isFirstRun = false;
      callback();
    }
  });
});

gulp.task("less", function () {
  return gulp.src(dirs.styles + "/" + files.mainLess + ".less")
    .pipe(less({
      paths: [dirs.styles] // @import paths
    }))
    .pipe(autoprefixer())
    .pipe(gulp.dest(dirs.dist));
});

gulp.task("minify-css", ["less"], function () {
  return gulp.src(dirs.dist + "/" + files.mainCssDist + ".css")
    .pipe(minifyCSS())
    .pipe(gulp.dest(dirs.dist));
});

gulp.task("minify-js", ["webpack"], function () {
  return gulp.src(dirs.dist + "/" + files.mainJs + ".js")
    .pipe(uglify())
    .pipe(gulp.dest(dirs.dist));
});

gulp.task("connect:server", function () {
  connect.server({
    port: 4202,
    root: dirs.dist
  });
});

gulp.task("watch", function () {
  gulp.watch(dirs.styles + "/**/*", ["less"]);
});

gulp.task("replace-js-strings", ["webpack", "minify-js"], function () {
  return gulp.src(dirs.dist + "/main.js")
    .pipe(replace("@@ENV", process.env.GULP_ENV))
    .pipe(gulp.dest(dirs.dist));
});

gulp.task("serve", ["default", "connect:server", "watch"]);

var tasks = [
  "webpack",
  "less"
];

if (process.env.GULP_ENV === "production") {
  tasks.push("minify-css", "minify-js", "replace-js-strings");
}
gulp.task("default", tasks);
