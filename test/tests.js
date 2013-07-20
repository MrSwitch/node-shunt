// Tests
var shunt = require('../shunt'),
	fs = require('fs'),
	path = require('path');

// include this adds 'should' to all javascript objects... yeah i thought extending native objects was bad too!
require('should');


// Define the target and the temp files directories
var src = path.normalize(__dirname+'/src/'),
	temp =  path.normalize(__dirname+'/temp/');


// If the temp directory doesn't exist, create it
if(!fs.existsSync(temp)){
	// create the temp folder
	fs.mkdirSync(temp);
}


describe('IndexToMarkDown', function(){
	it("should be able to convert an HTML page to markdown", function(){

		// Input file
		var input = src+'example.html',
			output = temp+'example.md';

		// Ops
		var files = {};

		// Take example.html and create a .md file from it.
		files[output] = input;

		// Create files
		shunt(files);

		// Whats the verdict?
		fs.existsSync(output).should.be[true];

	});
});