var _ = require("underscore");
var autoprefixer = require("broccoli-autoprefixer");
var cleanCSS = require("broccoli-clean-css");
var funnel = require("broccoli-funnel");
var env = require("broccoli-env").getEnv();
var eslint = require("broccoli-lint-eslint");
var less = require("broccoli-less-single");
var mergeTrees = require("broccoli-merge-trees");
var uglifyJavaScript = require("broccoli-uglify-js");
var webpackify = require("broccoli-webpack");
var packageConfig = require("./package.json");

var dirs = {
  src: "./src",
  js: "./src/js",
  dist: "",
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

var tasks = {
  createJsTree: function () {
    var jsTree = funnel(dirs.js, {
      include: ["**/*.js", "**/*.jsx"],
      destDir: dirs.js
    });

    return jsTree;
  },

  eslint: function (masterTree) {
    return eslint(masterTree, {
      config: ".eslintrc"
    });
  },

  webpack: function (masterTree) {
    var options = {
      entry: dirs.js + "/" + files.mainJs + ".jsx",
      output: {
        filename: dirs.dist + "/" + files.mainJsDist + ".js"
      },
      module: {
        loaders: [
          {
            test: /\.jsx$/,
            loader: "jsx-loader?harmony",
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

    // Extend options with source mapping
    if (env === "development" &&
        !process.env.DISABLE_SOURCE_MAP ||
        process.env.DISABLE_SOURCE_MAP === "false") {
      options.devtool = "source-map";
      options.module.preLoaders = [
        {
          test: /\.js$/,
          loader: "source-map-loader",
          exclude: /node_modules/
        }
      ];
    }

    return webpackify(masterTree, options);
  },

  css: function (masterTree) {
    var cssTree = funnel(dirs.styles, {
      include: ["**/*.less", "**/*.css"]
    });

    var lessTree = less(
      cssTree,
      files.mainLess + ".less",
      dirs.dist + "/" + files.mainCssDist + ".css",
      {}
    );

    lessTree = autoprefixer(lessTree);

    return mergeTrees([masterTree, lessTree], {overwrite: true});
  },

  index: function (masterTree) {
    var indexTree = funnel(dirs.src, {
      files: [files.index]
    });

    return mergeTrees([masterTree, indexTree], {overwrite: true});
  },

  img: function (masterTree) {
    var imgTree = funnel(dirs.img, {
      destDir: dirs.imgDist
    });

    return mergeTrees([masterTree, imgTree], {overwrite: true});
  },

  minifyCSS: function (masterTree) {
    return cleanCSS(masterTree);
  },

  minifyJs: function (masterTree) {
    return uglifyJavaScript(masterTree, {
      mangle: true,
      compress: true
    });
  }
};

var buildTree = _.compose(
  tasks.img,
  tasks.index,
  tasks.css,
  tasks.webpack,
  tasks.eslint,
  tasks.createJsTree
);

if (env === "production") {
  buildTree = _.compose(
    tasks.minifyCSS,
    tasks.minifyJs,
    buildTree
  );
}

module.exports = buildTree();
