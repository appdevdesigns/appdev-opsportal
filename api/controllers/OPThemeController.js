/**
 * OPThemeController
 *
 * @description :: Server-side logic for managing Opthemes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs');
var path = require('path');
var sass = require('node-sass');
var pathToThemeFolder = path.join(__dirname, '..', '..', 'assets', 'opstools', 'OPTheme','themes');
var async = require('async');


// Path to directory where all sass declarations are in place
var pathToImportFolder = path.join(pathToThemeFolder, '..', 'scss');

var currentTheme = '';
var themeContent = '';

// Read default theme template content
var themeTemplate = fs.readFile(pathToImportFolder + '/main.scss', 'utf8', function (err, content) {
	if (err) {
		ADCore.error.log('Cannot read theme template', {error: err});
		throw err;
	}
	themeContent = content;
});

// Get name of theme from the first line of the generated CSS
function getThemeName(filename, line_no) {
    var stream = fs.readFileSync(pathToThemeFolder + '/' + filename).toString();

    // The next lines should be improved
    var lines = stream.split("\n");

    if(lines.length >= +line_no){
        label = lines[+line_no].replace("/* ", "").replace(" */", "");
        return label;
    }
}

// Restore variables from CSS so you can edit them
function getThemeVars(filename) {
    var stream = fs.readFileSync(pathToThemeFolder + '/' + filename).toString();

    var regExp = /\/\* Begin Variables \*\/([^)]+)\/\* End Variables \*\//;
    var matches = regExp.exec(stream);

    var themeVars = [];
    var themeArray = [];
    var recordVars = false;

    //var lines = stream.split("\n");
    var match = matches[1];
    var sliced = match.slice(2,-5);
    var blob = sliced.replace(/(\r\n|\n|\r|\s)/gm,"");
    var lines = blob.split(";}#");

    lines.forEach(function(v){
        themeArray.push(v.split("{color:"));
    });
    themeArray.forEach(function(v){
        key = v[0];
        value = v[1];
        themeVars.push({key: key, value: value});
    });

    return themeVars;
}

/**
 * Get inputs and turn them into css properties declarations
 * @param  {inputs} variables [css properties which user chose]
 * @return {string}           [Custom css]
 */
var getCustomVariables = function (variables) {

	var output = '';
	Object.keys(variables).forEach(function (key) {
		if (!key) { // filter out any blank value so it retains theme default color
			return '';
		} else {
			output += '$' + key + ':' + variables[key] + ';';
		}
	});

	return output;
}

/**
 * Write theme file to storage
 * @param  {string} name  [User chosen name]
 * @param  {string} theme [Whole theme content (custom + template)]
 * @return {void}
 */
var writeTheme = function (name, theme) {

	var themeName = name.replace(/ /g,"_").trim().toLowerCase();
	fs.writeFile(pathToThemeFolder + '/' + themeName + '.css', theme, function (err, result) {
		if (err) {
			ADCore.error.log('Error writing theme file', {error: err});
			throw err;
		}
	});
}

module.exports = {

	  _config: {},


	  // post /optheme
	  create:function(req, res) {

	  	var params = req.allParams();
	  	var name = req.param('name');

		// TODO: do what you need to do here to run SASS and create a new theme in the pathToThemeFolder
		// for now my simple test example:

		// TODO: error checking on existing files and overwriting.

	  	if (name) {

	  		// fetch color values
	  		var customVariables = getCustomVariables(params.vars);

	  		// compile sass
	  		sass.render({
				data: customVariables + themeContent,  // prepend custom variables so they can override default template
				includePaths: [
					pathToImportFolder  // node-sass will look into these paths if it encounter any @import in template
				]
				}, function(err, result) {
					if (err) {
						res.AD.error('Error compiling theme');
						return false;
					}
					try {
						writeTheme(name, "/\* " + name + " */\n" + result.css);
					} catch (err) {
						res.AD.err('Error writing theme');
					}
				}
			);

			res.AD.success('Theme created');

	  	} else {
	  		res.AD.error('name is required');
	  	}


	  },


	  // post /optheme/set-default
	  setDefault:function(req, res) {
	  	// chosen theme file should be registered as the default opstheme
	  	var name = req.param('name');

// TODO: make this a permanent setting
//
// but for now:
        file = name.replace(/ /g,"_").trim().toLowerCase() + ".css";
		currentTheme = file;

	  	res.AD.success('theme set.');

	  },

	  // post /optheme/delete
	  delete:function(req, res) {
	  	// chosen theme file that should be deleted
	  	var name = req.param('name');

        fs.unlinkSync(pathToThemeFolder + "/" + name);

	  	res.AD.success('theme deleted');

	  },

	  // get /optheme
	  list:function(req, res) {
	  	// return all the themes currently defined in the system.

	  	// read in the files in
	  	fs.readdir(pathToThemeFolder, function(err, files){
	  		if (err) {
	  			ADCore.error.log('Error reading OPTheme.theme folder', {error:err, path:pathToThemeFolder });
	  			var newError = new Error('Unable to read themes on server.');
	  			newError.err = err;
	  			res.AD.error(newError);
	  		} else {

	  			var filesToIgnore = ['.DS_Store', '.gitkeep', '.gitignore'];
	  			var themes = [];
	  			files.forEach(function(file){
	  				if (filesToIgnore.indexOf(file) == -1) {
                        themeName = getThemeName(file, 0);
                        themes.push({ name: themeName, filename: file });
		  			}
	  			});
	  			res.AD.success(themes);
	  		}
	  	})
	  },

	  // get /optheme/get-variables
	  getVariables:function(req, res) {
	  	// return all the selected themes variables so you can edit them
	  	var filename = req.param('name');
        themeVars = getThemeVars(filename);
	    res.AD.success(themeVars);
	  },


	  	// get /optheme/theme
		theme: function(req, res) {
			// called by OpsPortal when loading.  if a theme is returned, it
			// will be loaded.
			//
			// must return the pathToTheme as it relates to the [sails]/assets directory
			//
			// if nothing then return {}
			// else
			// return { name: 'path/to/theme.css' }

			var result = {};

			if (currentTheme != '' && currentTheme != undefined) {
				var theme = path.join(pathToThemeFolder, currentTheme);
				theme = theme.split('assets')[1];

				result.name = theme;
			}

			res.AD.success(result);
		},

		// get /optheme/preview?name=light_skin.css
		preview: function (req,res) {
          	
			var fs = require('fs');
			var path = require('path');

            var cssFile = req.query.name;
            var cssContent ='/* No css file was requested */';
            var htmlContent = "";

            async.series([

            	function getCss(next){

            		if(cssFile && typeof cssFile !== 'undefined'){

                        //get css file content
                        var pathToCss = path.join(__dirname, '..', '..', 'assets', 'opstools', 'OPTheme', 'themes', cssFile);
                        fs.readFile(pathToCss, 'utf8', function(err, contents){
                            if (err) {
                                if (err.code == 'ENOENT') {
                                    // file didn't exist! 
                                    // What should we do?
                                    next();   // <-- continue on without 
                                } else {

                                    next(err);
                                }
                                
                                return;
                            }
                            cssContent = contents;
                            next();
                        });

		            } else {
		            	next();
		            }
            	},


                function getHTML(next){

                    var pathToHTML = path.join(__dirname, '..', '..', 'assets', 'opstools', 'OPTheme', 'views', 'OPTheme', 'iframe.html');
                    fs.readFile(pathToHTML, 'utf8', function(err, contents){
                        if (err) {
                            next(err);
                            return;
                        }
                        htmlContent = contents;
                        next();
                    })
                }

            ], function (err, results){

                if (err) {

// TODO: be smarter about error handling here:
res.badRequest(); // assuming their fault, of course
return;

                }

                //inject stylesheet into html content
                htmlContent = htmlContent.toString().replace('STYLESHEET_HERE',cssContent);
                res.setHeader('Content-Type', 'text/html');             
                res.send(htmlContent);
                res.end();

            })
		
		}

};

