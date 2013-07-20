# Shunt (A Shit alternative to Grunt, hence Sh+unt)

Shunt works on files to combines, minify and replace strings etc, so that what gets spat out is nicely packed for production.

# Install 

	npm install shunt

# Example

	# Include the library
	var shunt = require('shunt');

	# Start Shunting
	shunt({
		# Minify and shunt a single file
		'output.min.js' : 'input.js',

		# Create a combined minified file
		'combine.min.js' : ['input1.js', 'input2.js'],

		# Create an MarkDown file from an HTML file
		'output.md' : 'input.html'
	}, {

		replace : {
			# replace all local development paths with a remote paths, {replace => find, ... }

			'http://remote.com/' : '//localhost/'
		}
	})

# Semi Automating

I use Sublime Text 2, and have set this up in a script which gets called when

# Contributing

Yeah go on, it'll make you feel good about yourself.