var gulp = require('gulp');
var Server = require('karma').Server;
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');//not working
var minify = require('gulp-minify');
var stripCode = require('gulp-strip-code');
var clean = require('gulp-clean');
var gzip = require('gulp-gzip');
var concat = require('gulp-concat');


gulp.task('clean', function () {
    // Delete the dist directory
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
    gulp.src(['build/*.js', 'dist/simpledatabinding-full.js'])
      .pipe(stripCode())
      .pipe(minify())
      .pipe(gulp.dest('dist'));
    
    gulp.src(['dist/*min.js'])
      .pipe(gzip())
      .pipe(gulp.dest('dist'));
});

gulp.task('zip', function () {
    gulp.src(['dist/*min.js'])
      .pipe(gzip())
      .pipe(gulp.dest('dist'));
});

gulp.task('concat', function () {
    gulp.src(['build/simpledatabinding.js', 'build/livearrays.js'])
      .pipe(concat('simpledatabinding-full.js'))
      .pipe(stripCode())
      .pipe(gulp.dest('dist'));
});

gulp.task('make', ['concat', 'compress', 'zip']);

gulp.task('default', ['lint', 'test', 'make']);

