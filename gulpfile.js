var gulp = require('gulp');
var Server = require('karma').Server;
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');//not working

// Run test once and exit
gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('jshint', function () {
    return gulp.src(['./build/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('default', ['jshint', 'test']);

