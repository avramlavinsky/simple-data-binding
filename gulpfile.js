var gulp = require('gulp');
var Server = require('karma').Server;

gulp.task('hello', function () {
    console.log('Hello Avram');
});

// Run test once and exit
gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

