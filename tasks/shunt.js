//
// Register shunt as a Grunt plugin
//


// Include the original
var shunt = require('../shunt');

// Export
module.exports = function(grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks
	grunt.registerMultiTask('shunt', 'Shunt a sh*t version of grunt', function() {

		delete this.data.options;

		// Move files
		shunt(this.data,this.options);
	});
 

};