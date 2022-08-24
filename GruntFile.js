
module.exports = function (grunt) {


	// Load Grunt tasks declared in the package.json file
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	// Project configuration.
	grunt.initConfig({

		watch: {
			scripts: {
				files: [
					'src/js/**/*.js',
					'src/maps/**/*.json',
					'src/gfx/**/*',
					'!src/js/start_GEN.js'
				],
				tasks: ['build']
			},
			pages: {
				files: [
					'src/html/*.*'
				],
				tasks: ['copy:html']
			}
		},
		'http-server': {
			dev: {
				root: 'dist',
				port: 3116,
				runInBackground: true
			}
		},
		image: {
			dev: {
				options: {
					optipng: false,
					pngquant: false,
					zopflipng: false,
					jpegRecompress: false,
					mozjpeg: false,
					gifsicle: false,
					svgo: false
				},
				files: {
					'dist/t.png': 'src/gfx/tiles.png',
				}
			},
			prod: {
				options: {
					optipng: false,
					pngquant: true,
					zopflipng: true,
					jpegRecompress: false,
					mozjpeg: true,
					gifsicle: true,
					svgo: true
				},
				files: {
					'dist/t.png': 'src/gfx/tiles.png',
				}
			},
		},
		closureCompiler: {
			options: {
				compilerFile: 'node_modules/google-closure-compiler-java/compiler.jar',
				compilerOpts: {
					compilation_level: 'ADVANCED_OPTIMIZATIONS',
					language_out: 'ECMASCRIPT_2019',
					jscomp_off: 'checkVars',
					assume_function_wrapper: true
				},
			},
			targetName: {
				src: 'dist/js/index_prod.js',
				dest: 'dist/js/i.js'
			}
		},
		uglify: {
			options: {
				compress: {
					global_defs: {
						'DEBUG': false
					},
					dead_code: true
				},
				mangle: {
					//properties: true,
					reserved: ['TileMaps', 'world', 'layers']
				},
			},
			my_target: {
				files: {
					'dist/i.min.js': ['dist/js/i.js']
				}
			}
		},
		clean: ['dist/*.html', 'dist/js/'],
		concat: {
			dev: {
				files: {
					'dist/index.html': [
						'src/html/index_dev.html'
					],
				}
			},
			shared: {
				files: {
					'dist/js/index.js': [
						'src/js/lib/*.js',
						'src/js/main.js',
						'src/js/DEFS.js',
						'src/js/**/*.js',
						'src/js/start_GEN.js',
					]
				}
			},
			prod: {
				files: {
					'dist/index.html': [
						'src/html/index_prod.html'
					],
					'dist/js/index_prod.js': [
						'dist/lib/engine.all.release.js',
						'dist/js/index.js'
					]
				}
			}
		},
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('roadroller', 'compress the js file', function () {
		// NOT WORKING! :-(
		require("child_process").spawn('npx' ['roadroller', 'dist/i.min.js', '-o', 'dist/i.min.js'], { cwd: './' });

	});
	grunt.registerTask('zip', 'compress the files and create archive', function () {
		// NOT WORKING! :-(
		require("child_process").spawn('zip -X9 a.zip index.html t.png', null, { cwd: './dist' });

	});
	grunt.registerTask('rollup', 'combine html and js', function () {

		let src = grunt.file.read('dist/i.min.js');

		grunt.file.write('dist/index.html', '<script>' + src + '</script>');

	});
	grunt.registerTask('processMap', 'get map data from Tiled', function () {
		
		// ADD MAPS HERE!
		let maps = ["start", "level2", "forest"];

		let str = '// THIS FILE IS GENERATED BY THE BUILD SCRIPT\n';
		str += 'let mapData = [];\n';

		for (let i = 0; i < maps.length; i++) {
			let mapJson = grunt.file.readJSON('src/maps/' + maps[i] + '.json');
			str += 'mapData[' + i + '] = { w: ' + mapJson.width + ', h: ' + mapJson.height + ', data: ['
				+ mapJson.layers[0].data.toString().replaceAll(',0,', ',,').replaceAll(',0,', ',,') + '] }; \n';
		}
		
		str += '\ninit();'
		
		grunt.file.write('src/js/start_GEN.js', str);
	});

	// TODO: add roadroller to script
	// npx roadroller dist/i.min.js -o dist/i.min.js
	// "zip -X9" for max compression !

	grunt.registerTask('dev', [
		'watch'
	]);
	grunt.registerTask('build', ['clean', 'processMap', 'concat:dev', 'concat:shared', 'image:dev']);
	grunt.registerTask('default', ['build', 'http-server', 'dev']);
	grunt.registerTask('prod', ['clean', 'image:prod', 'concat:shared', 'concat:prod', 'closureCompiler', 'uglify']);
	grunt.registerTask('web', ['http-server', 'dev']);

};