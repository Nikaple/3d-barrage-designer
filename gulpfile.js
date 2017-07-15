// generated on 2017-07-14 using generator-webapp 3.0.1
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const del = require('del');
const runSequence = require('run-sequence');

const $ = gulpLoadPlugins();

gulp.task('styles', () => {
  return gulp.src('app/styles/*.css')
    .pipe($.cssnano({safe: true, autoprefixer: false}))
    .pipe(gulp.dest('dist/styles'));
});


gulp.task('scripts', () => {
  return gulp.src('app/scripts/*.js')
    .pipe($.plumber())
    .pipe($.babel())
    .pipe($.uglify({compress: {drop_console: true}}))
    .pipe(gulp.dest('dist/scripts'));
});

function lint(files) {
  return gulp.src(files)
    .pipe($.eslint({ fix: true }))
    .pipe($.eslint.format());
}

gulp.task('lint', () => {
  return lint('app/scripts/*.js')
    .pipe(gulp.dest('app/scripts'));
});

gulp.task('html', ['styles', 'scripts'], () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if(/\.html$/, $.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: {compress: {drop_console: true}},
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/images/*')
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('build', ['lint', 'html', 'images'], () => {
  return gulp.src('.tmp/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', () => {
  return new Promise(resolve => {
    runSequence(['clean'], 'build', resolve);
  });
});
