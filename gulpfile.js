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

var readmeFileName = path.join(__dirname, '/readme.md');
var demosPath = path.join(__dirname, '/demos');

var srcDistDir = path.join(__dirname, 'dist');

var srcFiles = [
  path.join(__dirname, 'src/js/bubbletree.js'),
  path.join(__dirname, 'src/js/layout.js'),
  path.join(__dirname, 'src/js/line.js'),
  path.join(__dirname, 'src/js/loader.js'),
  path.join(__dirname, 'src/js/mouseeventgroup.js'),
  path.join(__dirname, 'src/js/ring.js'),
  path.join(__dirname, 'src/js/transitioner.js'),
  path.join(__dirname, 'src/js/utils.js'),
  path.join(__dirname, 'src/js/vector.js'),
  path.join(__dirname, 'src/js/bubbles/plain.js'),
  path.join(__dirname, 'src/js/bubbles/donut.js'),
  path.join(__dirname, 'src/js/bubbles/icon.js')
];

var cssFiles = [
  path.join(__dirname, 'src/css/bubbletree.css')
];

gulp.task('default', [
  'sources',
  'sources-minified',
  'styles',
  'demos',
  'readme'
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
  var env = nunjucks.configure(path.join(__dirname, '/templates'), {
    autoescape: false
  });

  var demos = fs.readdirSync(demosPath).filter(function(file) {
    return fs.statSync(path.join(demosPath, file)).isDirectory();
  }).map(function(item) {
    return '* [' + item + '](' + item + '/index.html)';
  }).join('\r\n');
  console.log(demos);

  var content = env.render('demos.html', {
    content: marked(demos)
  });
  return file('index.html', content, { src: true })
    .pipe(gulp.dest(path.join(__dirname, '/demos')));
});

gulp.task('readme', function() {
  var env = nunjucks.configure(path.join(__dirname, '/templates'), {
    autoescape: false
  });
  var content = env.render('readme.html', {
    content: marked(fs.readFileSync(readmeFileName, 'utf8'))
  });
  return file('index.html', content, { src: true })
    .pipe(gulp.dest(__dirname));
});
