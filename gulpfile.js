var autoprefixer = require("gulp-autoprefixer");
var changed = require("gulp-changed");
var connect = require("gulp-connect");
var eslint = require("gulp-eslint");
var gulp = require("gulp");
var gutil = require("gulp-util");
var less = require("gulp-less");
var minifyCSS = require("gulp-minify-css");
var path = require("path");
var uglify = require("gulp-uglify");
var webpack = require("webpack");

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
  index: "index.html"
};

var webpackConfig = {
  entry: dirs.js + "/" + files.mainJs + ".jsx",
  output: {
    path: path.resolve(dirs.dist),
    filename: files.mainJsDist + ".js"
  },
  module: {
    loaders: [
      {
        test: /\.jsx$/,
        loader: "babel-loader",
        exclude: /node_modules/
      }
    ],
    postLoaders: [
      {
        loader: "transform?envify"
      }
    ]
  },
  resolve: {
    extensions: ["", ".jsx", ".js"]
  }
};

// Use webpack to compile jsx into js,
gulp.task("webpack", function (callback) {
  // Extend options with source mapping
  if (process.env.GULP_ENV === "development" &&
    !process.env.DISABLE_SOURCE_MAP ||
    process.env.DISABLE_SOURCE_MAP === "false") {
    webpackConfig.devtool = "source-map";
    webpackConfig.module.preLoaders = [
      {
        test: /\.js$/,
        loader: "source-map-loader",
        exclude: /node_modules/
      }
    ];
  }
  // run webpack
  webpack(webpackConfig, function (err) {
    if (err) {
      throw new gutil.PluginError("webpack", err);
    }
    callback();
  });
});

gulp.task("eslint", function () {
  return gulp.src([dirs.js + "/**/*.?(js|jsx)"])
    .pipe(changed(dirs.dist))
    .pipe(eslint())
    .pipe(eslint.formatEach("stylish", process.stderr));
});

gulp.task("less", function () {
  return gulp.src(dirs.styles + "/" + files.mainLess + ".less")
    .pipe(changed(dirs.dist))
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

gulp.task("images", function () {
  return gulp.src(dirs.img + "/**/*.*")
    .pipe(gulp.dest(dirs.dist + "/" + dirs.imgDist));
});

gulp.task("index", function () {
  return gulp.src(dirs.src + "/" + files.index)
    .pipe(gulp.dest(dirs.dist));
});
gulp.task("connect:server", function () {
  connect.server({
    port: 4200,
    root: dirs.dist,
    livereload: false // TODO
  });
});

gulp.task("serve", ["default", "connect:server"], function () {
  gulp.watch(dirs.styles + "/*", ["less"]);
  gulp.watch(dirs.js + "/**/*.?(js|jsx)", ["eslint", "webpack"]);
  gulp.watch(dirs.img + "/**/*.*", ["images"]);
});

var tasks = [
  "eslint",
  "webpack",
  "less",
  "images",
  "index"
];

if (process.env.GULP_ENV === "production") {
  tasks.push("minify-css", "minify-js");
}
gulp.task("default", tasks);
