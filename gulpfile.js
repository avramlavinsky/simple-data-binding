var gulp = require('gulp');
var Server = require('karma').Server;
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');//not working
var minify = require('gulp-minify');
var stripCode = require('gulp-strip-code');
var clean = require('gulp-clean');

// Delete the dist directory
gulp.task('clean', function () {
    return gulp.src('./dist')
    .pipe(clean());
});

gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('lint', function () {
    return gulp.src(['./build/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('strip', function () {
    gulp.src('build/*.js')
      .pipe(stripCode())
      .pipe(gulp.dest('dist'));
});

gulp.task('compress', function () {
    gulp.src(['build/*.js'])
      .pipe(stripCode())
      .pipe(minify())
      .pipe(gulp.dest('dist'))
});

gulp.task('make', ['clean'], function () {
    gulp.src(['build/*.js'])
      .pipe(stripCode())
      .pipe(minify())
      .pipe(gulp.dest('dist'))
});

gulp.task('make', ['clean', 'compress']);

gulp.task('default', ['lint', 'test', 'compress']);

