/*
 * grunt-wiredup
 * https://github.com/codeecho/grunt-wiredup
 *
 * Copyright (c) 2015 Adam Knight
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var wiredep = require("wiredep");
  var fs = require("fs-extra");
  var path = require("path");

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('wiredup', 'Inject dependencies into your source code', function() {
    this.requiresConfig(['wiredup', this.target, 'target']);
    this.requiresConfig(['wiredup', this.target, 'src']);
    var options = this.options(this.data);
    var target_path = path.resolve(process.cwd(), options.target);
    var root_path = path.relative(target_path, process.cwd()) + "/";
    options.src = options.target + options.src;
    options.fileTypes = {
      html: {
        replace: {
          js: function(fpath) {
            var rpath = fpath.substring(root_path.length);
            return '<script src="' + rpath + '"> </script>';
          },
          css: function(fpath) {
            var rpath = fpath.substring(root_path.length);
            return '<link rel="stylesheet" href="' + rpath + '"> </script>';
          }
        }
      }
    };
    var result = wiredep(options);
    if (result.js) {
      for (var i = 0; i < result.js.length; i++) {
        var file = result.js[0];
        processFile(target_path, file);
      }
    }
    if (result.css) {
      for (var i = 0; i < result.css.length; i++) {
        var file = result.css[0];
        processFile(target_path, file);
      }
    }
  });

  function processFile(target_path, file) {
    var fpath = path.relative(process.cwd(), file);
    var contents = fs.readFileSync(file);
    var dest_path = path.resolve(target_path, fpath);
    fs.ensureFileSync(dest_path);
    fs.writeFileSync(dest_path, contents);
  }

};