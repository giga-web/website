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

/* 端口 */
var port = 3000;

/* 域名 */
var host = address.ip();

/* 公共路径 */
var publicPath = '';

/* 启动服务器 */
browserSync.init({
  server: {
    baseDir: "build"
  },
  port: port,
  host: host,
  open: 'external', // https://browsersync.io/docs/options#option-open
});

/* 清空打包目录 */
function clean() {
  return del('build/**', {force:true});
}

/* 处理 indexhtml */
function indexhtml() {
  var html = gulp.src('src/index.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@root',
      context: {
        version: '?='+ new Date().getTime(),
        publicPath: publicPath,
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
        version: '?='+ new Date().getTime(),
        publicPath: publicPath,
      },
      indent: true
    }))
    .pipe(gulp.dest('build/pages/'));

  return html;
}

/* 处理 indexcss */
function indexcss() {
  var processors = [
    autoprefixer(),
    cssnano
  ];

  return gulp.src("src/cdn/css/*.scss")
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulp.dest("build/cdn/css/"));
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
    .pipe(gulp.dest("build/cdn/css/"));
}

/* 处理 indexjs */
function indexjs() {
  return gulp.src("src/cdn/javascript/*.js", { sourcemaps: true })
    // .pipe(uglify())
    .pipe(gulp.dest("build/cdn/javascript/", { sourcemaps: '.' }));
}

/* 处理 js */
function js() {
  return gulp.src("src/cdn/javascript/**/*.js", { sourcemaps: true })
    // .pipe(uglify())
    .pipe(gulp.dest("build/cdn/javascript/", { sourcemaps: '.' }));
}

/* 处理 asserts */
function asserts() {
  return gulp.src("src/cdn/asserts/**")
    .pipe(gulp.dest("build/cdn/asserts/"))
}

/* 处理 media */
function media() {
  return gulp.src("src/cdn/media/**")
    .pipe(gulp.dest("build/cdn/media/"))
}

/* 处理 js 库 */
function libs() {
  return gulp.src("libs/**")
    .pipe(gulp.dest("build/libs/"))
}

/* 监听文件变化，重载服务 */
function server(argument) {
  gulp.watch(["src/fragments/*.html", "src/index.html"], indexhtml);
  gulp.watch(["src/fragments/*.html", "src/pages/*.html"], html);

  gulp.watch("src/cdn/css/*.scss", indexcss);
  gulp.watch("src/cdn/css/**/*.scss", css);

  gulp.watch("src/cdn/javascript/*.js", indexjs);
  gulp.watch("src/cdn/javascript/**/*.js", js);

  gulp.watch("src/cdn/asserts/**", asserts);

  gulp.watch("src/cdn/media/**", media);

  gulp.watch("libs/**", libs);

  gulp.watch("build").on('change', browserSync.reload);
}

/* 启动处理序列 */
exports.default = gulp.series(clean, indexhtml, html, indexcss, css, indexjs, js, asserts, media, libs, server);
