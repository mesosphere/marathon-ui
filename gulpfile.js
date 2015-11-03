var autoprefixer = require("gulp-autoprefixer");
var connect = require("gulp-connect");
var header = require('gulp-header');
var browserSync = require("browser-sync");
var eslint = require("gulp-eslint");
var gulp = require("gulp");
var gutil = require("gulp-util");
var less = require("gulp-less");
var minifyCSS = require("gulp-minify-css");
var path = require("path");
var replace = require("gulp-replace");
var uglify = require("gulp-uglify");
var webpack = require("webpack");
var zip = require("gulp-zip");

var packageInfo = require("./package");

var dirs = {
  src: "./src",
  js: "./src/js",
  dist: "dist",
  styles: "./src/css",
  img: "./src/img",
  imgDist: "img",
  sourceSansPro: "./node_modules/source-sans-pro/WOFF/OTF",
  ionicons: "./node_modules/ionicons/fonts",
  fontsDist: "fonts",
  release: "./release"
};

var files = {
  mainJs: "main",
  mainJsDist: "main",
  mainLess: "main",
  mainCssDist: "main",
  index: "index.html",
  sourceSansPro: "SourceSansPro-Regular.otf.woff",
  sourceSansProBold: "SourceSansPro-Bold.otf.woff"
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
        test: /\.(js|jsx)$/,
        loader: "babel-loader?cacheDirectory",
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: "json-loader",
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
  },
  watch: true
};

// Use webpack to compile jsx into js,
gulp.task("webpack", function (callback) {
  var isFirstRun = true;
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
    } else {
      // This runs after webpack's internal watch rebuild.
      eslintFn();
      browserSync.reload();
    }
  });
});

function eslintFn() {
  return gulp.src([dirs.js + "/**/*.?(js|jsx)"])
    .pipe(eslint())
    .pipe(eslint.formatEach("stylish", process.stderr));
}
gulp.task("eslint", eslintFn);

gulp.task("less", function () {
  return gulp.src(dirs.styles + "/" + files.mainLess + ".less")
    .pipe(less({
      paths: [dirs.styles] // @import paths
    }))
    .pipe(autoprefixer())
    .pipe(gulp.dest(dirs.dist))
    .pipe(browserSync.stream());
});

gulp.task("minify-css", ["less"], function () {
  return gulp.src(dirs.dist + "/" + files.mainCssDist + ".css")
    .pipe(minifyCSS())
    .pipe(gulp.dest(dirs.dist));
});

gulp.task("minify-js", ["webpack"], function () {
  var banner = "/**\n" +
    " * <%= pkg.name %> - <%= pkg.description %>\n" +
    " * @version v@@TEAMCITY_UI_VERSION\n" +
    " * @buildnumber @@TEAMCITY_BUILDNUMBER\n" +
    " * @branchname @@TEAMCITY_BRANCHNAME\n" +
    " */\n";

  return gulp.src(dirs.dist + "/" + files.mainJs + ".js")
    .pipe(uglify())
    .pipe(header(banner, { pkg : packageInfo } ))
    .pipe(gulp.dest(dirs.dist));
});

gulp.task("images", function () {
  return gulp.src(dirs.img + "/**/*.*")
    .pipe(gulp.dest(dirs.dist + "/" + dirs.imgDist));
});

gulp.task("fonts", function () {
  return gulp.src([
      dirs.ionicons + "/**/*.*",
      dirs.sourceSansPro + "/" + files.sourceSansPro,
      dirs.sourceSansPro + "/" + files.sourceSansProBold
    ]).pipe(gulp.dest(dirs.dist + "/" + dirs.fontsDist));
});

gulp.task("index", function () {
  return gulp.src(dirs.src + "/" + files.index)
    .pipe(gulp.dest(dirs.dist));
});

gulp.task("connect:server", function () {
  connect.server({
    port: 4200,
    root: dirs.dist
  });
});

gulp.task("browsersync", function () {
  browserSync.init({
    server: {
      baseDir: dirs.dist
    }
  });
});

gulp.task("watch", function () {
  gulp.watch(dirs.styles + "/**/*", ["less"]);
  gulp.watch(dirs.img + "/**/*.*", ["images"]);
  gulp.watch(dirs.fonts + "/**/*.*", ["fonts"]);
});

gulp.task("replace-js-strings", ["webpack", "eslint", "minify-js"], function () {
  return gulp.src(dirs.dist + "/main.js")
    .pipe(replace("@@ENV", process.env.GULP_ENV))
    .pipe(gulp.dest(dirs.dist));
});

gulp.task("serve", ["default", "connect:server", "watch"]);
gulp.task("livereload", ["default", "browsersync", "watch"]);

var tasks = [
  "eslint",
  "webpack",
  "less",
  "images",
  "fonts",
  "index"
];

if (process.env.GULP_ENV === "production") {
  tasks.push("minify-css", "minify-js", "replace-js-strings");
}
gulp.task("default", tasks);
