/* 打包 */
var gulp = require('gulp');
/* 删除目录、文件 */
var del = require('del');
/* CSS 扩展 */
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
/* CSS 压缩 */
var cssnano = require('cssnano');
/* 文件插入 */
var fileinclude  = require('gulp-file-include');
/* 丑化 */
var uglify  = require('gulp-uglify');
/* 开发服务器 */
var browserSync = require('browser-sync').create();
/* 本地IP地址 */
var address = require('address');
/* 自动前缀 */
var autoprefixer = require('autoprefixer');

/* 启动服务器 */
browserSync.init({
  server: {
    baseDir: "build"
  },
  port: 3000,
  host: address.ip(),
  open: 'external', // https://browsersync.io/docs/options#option-open
});

/* 清空打包目录 */
function clean() {
  return del('build/**', {force:true});
}

/* 处理 index */
function index() {
  var html = gulp.src('src/index.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@root',
      context: {
        version: '?='+ new Date().getTime()
      },
      indent: true
    }))
    .pipe(gulp.dest('build/'));

  return html;
}

/* 处理 html */
function html() {
  var html = gulp.src('src/pages/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@root',
      context: {
        version: '?='+ new Date().getTime()
      },
      indent: true
    }))
    .pipe(gulp.dest('build/pages/'));

  return html;
}

/* 处理 css */
function css() {
  var processors = [
    autoprefixer(),
    cssnano
  ];

  return gulp.src("src/cdn/css/**/*.scss")
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulp.dest("build/cdn/"));
}

/* 处理 js */
function js() {
  return gulp.src("src/cdn/javascript/**/*.js", { sourcemaps: true })
    // .pipe(uglify())
    .pipe(gulp.dest("build/cdn/", { sourcemaps: '.' }));
}

/* 处理 asserts */
function asserts() {
  return gulp.src("src/asserts/**")
    .pipe(gulp.dest("build/asserts/"))
}

/* 处理 media */
function media() {
  return gulp.src("src/cdn/media/**")
    .pipe(gulp.dest("build/cdn/media/"))
}

/* 处理 js 库 */
function libs() {
  return gulp.src("src/cdn/libs/**")
    .pipe(gulp.dest("build/cdn/libs/"))
}

/* 监听文件变化，重载服务 */
function server(argument) {
  gulp.watch("src/index.html", index);
  gulp.watch("src/pages/*.html", html);
  gulp.watch("src/cdn/css/**/*.scss", css);
  gulp.watch("src/cdn/javascript/**/*.js", js);
  gulp.watch("src/asserts/**", asserts);
  gulp.watch("src/cdn/media/**", media);
  gulp.watch("src/cdn/libs/**", libs);

  gulp.watch("build").on('change', browserSync.reload);
}

/* 启动处理序列 */
exports.default = gulp.series(clean, index, html, css, js, asserts, media, libs, server);
