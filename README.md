# Shunt 
*A Shit alternative to Grunt, hence Shunt*

Shunt works on files to combine, minify and replace strings etc. What gets spat out is nicely packed for production.

# Install 

	npm install shunt --save-dev

# Example (Gruntless)

Write a build.js script, this is where you sort the shit out. Here's an example...

	// Include the library
	var shunt = require('shunt');

	// Start Shunting
	shunt(
		// Files to shunt `target:file(s)`
		{
			// Minify and shunt a single file
			'output.min.js' : 'input.js',

			// Create a combined minified file
			'combine.min.js' : ['input1.js', 'input2.js'],

			// Create an MarkDown file from an HTML file
			'output.md' : 'input.html',

			// Move an HTML file
			'output.html' : 'input.html'
		},

		// OPTIONS
		{
			replace : {
				// replace all local environment strings with development paths e.g. {find => replace, ... }
				'http://localhost/' : 'http://remote.com/'
			}
		}
	);

Then run it `node build.js`, got it? Boom!

# Example (Gruntful)

Shunt also doubles as a plugin for Grunt, a la shizame...

	shunt : {
		// Slightly different structure

		// Task's
		subtask :{
			// shunt files, as above
		},
		// [, subtask2 : {} [, etc...]];

		// options
		options : {
			// e.g. replace
		}
	}




# Magic shit

Moving an html file to a new place, also grabs relative files links to .css and .js files and moves them too (by default they also get minified, again Boom!).

	shunt({
		'bin/index.html' : 'src/index.html'
	})


# Automate

Not unique to this project but here's how i automate the build process in Sublime Text 2.

After creating a script like `build.js` above (actually i prefix with a underscore to make it different, e.g. `_build.js`, do this, it'll sit nicely at the top of your file lists!)

In Sublime Text 2 go to "Tools" -> "Build System" -> "New Build System..."

Paste the following code

	{
		"cmd": ["node", "${file_path:${folder}}/_build.js", "$file_path"],
		"working_dir" : "${file_path:${folder}}"
	}

Save with a memorable name e.g. "build.js", aka "build.js.sublime-build". Then go back into "Tools" -> "Build System" and select it. 

Now from the directory where it is installed type, Ctrl + B ... you should see some action.


# Contributing

Yeah go on, it'll make you feel good about yourself.