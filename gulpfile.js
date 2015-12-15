'use strict';

var path = require('path');
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var nunjucks = require('nunjucks');
var marked = require('marked');
var file = require('gulp-file');
var fs = require('fs');

var nodeModulesDir = path.join(__dirname, '/node_modules');

var readmeFileName = path.join(__dirname, '/readme.md');
var demosPath = path.join(__dirname, '/demos');

var srcDistDir = path.join(__dirname, 'dist');

var srcFiles = [
  path.join(__dirname, '/src/js/module/intro.js'),
  path.join(__dirname, '/src/js/lib/vis4.js'),
  path.join(__dirname, '/src/js/bubbletree.js'),
  path.join(__dirname, '/src/js/layout.js'),
  path.join(__dirname, '/src/js/line.js'),
  path.join(__dirname, '/src/js/loader.js'),
  path.join(__dirname, '/src/js/mouseeventgroup.js'),
  path.join(__dirname, '/src/js/ring.js'),
  path.join(__dirname, '/src/js/transitioner.js'),
  path.join(__dirname, '/src/js/utils.js'),
  path.join(__dirname, '/src/js/vector.js'),
  path.join(__dirname, '/src/js/bubbles/plain.js'),
  path.join(__dirname, '/src/js/bubbles/donut.js'),
  path.join(__dirname, '/src/js/bubbles/icon.js'),
  path.join(__dirname, '/src/js/module/outro.js')
];

var cssFiles = [
  path.join(__dirname, 'src/css/bubbletree.css')
];

var vendorScriptFiles = [
  path.join(nodeModulesDir, '/jquery/dist/jquery.min.js'),
  path.join(nodeModulesDir, '/jquery-migrate/dist/jquery-migrate.min.js'),
  path.join(nodeModulesDir, '/raphael/raphael-min.js'),
  path.join(nodeModulesDir, '/tween.js/src/Tween.js'),
  path.join(srcDistDir, '/bubbletree.js')
];

var templatesPath = path.join(__dirname, 'demos/assets/templates');
var templateRenderer = nunjucks.configure(templatesPath, {
  autoescape: false
});

gulp.task('default', [
  'dist',
  'update-demos'
]);

gulp.task('dist', [
  'sources',
  'sources-minified',
  'styles'
]);

gulp.task('update-demos', [
  'demos',
  'readme',
  'vendor-scripts',
  'custom-styles'
]);

gulp.task('sources', function() {
  return gulp.src(srcFiles)
    .pipe(concat('bubbletree.js'))
    .pipe(gulp.dest(srcDistDir));
});

gulp.task('sources-minified', function() {
  return gulp.src(srcFiles)
    .pipe(sourcemaps.init())
    .pipe(concat('bubbletree.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(srcDistDir));
});

gulp.task('styles', function() {
  return gulp.src(cssFiles)
    .pipe(concat('bubbletree.css'))
    .pipe(gulp.dest(srcDistDir));
});

gulp.task('demos', function() {
  var demos = fs.readdirSync(demosPath).filter(function(file) {
    if (file == 'assets') {
      return false;
    }
    return fs.statSync(path.join(demosPath, file)).isDirectory();
  }).map(function(item) {
    return '* [' + item + '](' + item + '/index.html)';
  }).join('\r\n');

  var content = templateRenderer.render('demos.html', {
    content: marked(demos)
  });
  return file('index.html', content, { src: true })
    .pipe(gulp.dest(path.join(__dirname, '/demos')));
});

gulp.task('readme', function() {
  var content = templateRenderer.render('readme.html', {
    content: marked(fs.readFileSync(readmeFileName, 'utf8'))
  });
  return file('index.html', content, { src: true })
    .pipe(gulp.dest(__dirname));
});

gulp.task('vendor-scripts', ['sources', 'sources-minified'], function() {
  return gulp.src(vendorScriptFiles)
    .pipe(gulp.dest(path.join(__dirname, '/demos/assets/scripts')));
});

gulp.task('custom-styles', function() {
  return gulp.src(path.join(__dirname, '/src/css') + '/*')
    .pipe(gulp.dest(path.join(__dirname, '/demos/assets/styles')));
});
