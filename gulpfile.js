var gulp =          require('gulp'),
    sass         =  require('gulp-sass'),
    browserSync =   require('browser-sync'),
    php =           require('gulp-connect-php'),
    autoprefixer =  require('gulp-autoprefixer');
    reload      =   browserSync.reload;
    connect =       require('gulp-connect'),
    processhtml =   require('gulp-processhtml'),
    rename =        require("gulp-rename"),
    concat =        require('gulp-concat'),
    babelify =      require('babelify'),
    browserify =    require('browserify'),
    gutil =         require('gulp-util'),
    header =        require('gulp-header'),
    del =           require('del'),
    path =          require('path'),
    jshint =        require('gulp-jshint'),
    changed =       require('gulp-changed'),
    runSequence =   require('run-sequence'),
    livereload =    require('gulp-livereload'),
    postcss =       require('gulp-postcss'),
    sourcemaps =    require('gulp-sourcemaps'),
    imagemin =      require('gulp-imagemin');
    //autoprefixer =  require('autoprefixer');
    uglify =        require('gulp-uglify');
    source =        require("vinyl-source-stream");
    streamify =     require('gulp-streamify');

var data = {
    paths : {
        dist: 'dist',
        html: '.',
        assets: 'assets',
        shop_assets: '../assets'
    },

    vendors : {
        concat_js : [
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/vue/dist/vue.min.js',
        ],

        js : [
            'bower_components/html5shiv/dist/html5shiv.min.js',
            'bower_components/jquery/dist/*.min.map',
        ],

        css : [
            'bower_components/bulma/css/bulma.min.css',
            'bower_components/animate-css/animate.min.css',
            'bower_components/font-awesome/css/*.*.*',
        ],

        img : [

        ],

        fonts : [

        ]
    },
};

 var targets = {
     dev : {
         environment: 'dev',
         data: {
            assets: data.paths.assets + '/',
            shop_assets: data.paths.shop_assets + '/',
            header_class: 'header-full',
            navbar_class: 'navbar navbar-default navbar-header-full navbar-dark',
            navbar_brand_class: 'navbar-brand hidden-lg hidden-md hidden-sm',
            navbar_nav_class: 'nav navbar-nav'
        },
     },
 };

var path_js = path.join(data.paths.dist, data.paths.assets, 'js'),
    path_css = path.join(data.paths.dist, data.paths.assets, 'css'),
    path_img = path.join(data.paths.dist, data.paths.assets, 'img'),
    path_fonts = path.join(data.paths.dist, data.paths.assets, 'fonts'),
    path_html = path.join(data.paths.dist, data.paths.html);

gulp.task('vendor', function() {
    gulp.src(data.vendors.concat_js)
        .pipe(concat("vendors.js"))
        //.pipe(uglify())
        .pipe(gulp.dest(path_js));

    gulp.src(data.vendors.js)
        .pipe(gulp.dest(path_js));

    gulp.src(data.vendors.css)
        .pipe(concat("vendors.css"))
        .pipe(gulp.dest(path_css));

    gulp.src(data.vendors.img)
        .pipe(gulp.dest(path_img));

    gulp.src(data.vendors.fonts)
        .pipe(gulp.dest(path_fonts));
});



gulp.task('scss', function () {
	gulp.src('./src/scss/**/*.scss')
		//.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		//.pipe(sourcemaps.write({includeContent: false}))
		//.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(autoprefixer(['last 3 versions', 'ie >= 8', 'Android >= 4', 'iOS >= 8']))
        .pipe(header('@charset "UTF-8";\n\n'))
        .pipe(rename({
          extname: '.min.css'
        }))
		//.pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path_css))
        .pipe(reload({stream:true}));
});

// gulp.task('autoprefixer', function () {
//     return gulp.src(['dist/assets/css/**/*.css', '!dist/assets/css/vendors.css'])
//         .pipe(sourcemaps.init())
//         .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
//         .pipe(sourcemaps.write('.'))
//         .pipe(gulp.dest('dist/assets/css/'));
// });

gulp.task('js', function() {
    browserify('src/js/app.js', { debug: true })
        .transform(babelify)
        .bundle()
        .on("error", function (err) { console.log("Error : " + err.message); })
        .pipe(source("app.js"))
        .pipe(streamify(sourcemaps.init()))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest(path_js))
});

gulp.task('favicon', function() {
    gulp.src('src/html/favicon.ico')
        .pipe(gulp.dest(path_html))
});

gulp.task('html', function() {
    gulp.src(['src/html/**/*.html', '!src/html/layout/**/*'])
        .pipe(processhtml({
            recursive: true,
            process: true,
            strip: true,
            environment: targets.dev.environment,
            data: targets.dev.data,
        }))
        .pipe(gulp.dest(path.join(path_html)))
        // .pipe(connect.reload());
        .pipe(reload({stream:true}));
});

gulp.task('img', function() {
    gulp.src('src/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest(path_img))
        // .pipe(connect.reload());
        .pipe(reload({stream:true}));
});

// gulp.task('img:dev', function() {
//     gulp.src('src/img/**/*')
//         .pipe(gulp.dest(path_img))
//         // .pipe(connect.reload());
//         .pipe(reload({stream:true}));
// });

gulp.task('css', function() {
    gulp.src('src/css/**/*')
        .pipe(gulp.dest(path_css));
});

gulp.task('php', function() {
    gulp.src('src/html/**/*.php')
        .pipe(gulp.dest(path_html));
});

gulp.task('clean', function() {
    del.sync([
        path.join('.', data.paths.dist),
        path.join('.', 'tmp'),
    ]);
});

gulp.task('watch', function() {
    gulp.watch(['src/scss/**/*.scss'], ['scss']);
    gulp.watch(['src/js/**/*.js'], ['js']);
    gulp.watch(['src/html/**/*.html'], ['html']);
    gulp.watch(['src/css/*.css'], ['css']);
    gulp.watch(['src/img/**/*'], ['img']);
});

// Static server
gulp.task('server', function() {
	php.server({ base: './dist', port: 3300, keepalive: true, bin: '/Applications/MAMP/bin/php/php7.2.8/bin/php', ini: '/Applications/MAMP/bin/php/php7.2.8/conf/php.ini'});
});

// for PHP
gulp.task('browser-sync',['server'], function() {
    browserSync({
        //server: {
          //  baseDir: "./",
            baseDir: './dist',
	proxy: "127.0.0.1:3300",
	port: 8000,
	open: true,
	notify: false,
        //}
    });
});

gulp.task('bs-reload', function () {
    browserSync.reload()
});

//start server & watch
gulp.task('default', function() {
    runSequence(
        'dev',
        ['browser-sync', 'watch']
    );
});

//build
gulp.task('build', function() {
    runSequence(
        'clean',
        ['vendor', 'scss', 'css', 'img', 'js', 'html', 'php', 'favicon'],
        // 'autoprefixer'
    );
});

gulp.task('dev', function() {
    runSequence(
        'clean',
        ['vendor', 'scss', 'css', 'img', 'js', 'html', 'php']
    );
});
gulp.task('clean', function() {
    del.sync([
        path.join('.', data.paths.dist),
        path.join('.', 'tmp'),
    ]);
});

