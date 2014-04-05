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

//
// After running a shunt test, remove the temp folder
afterEach(function(done){
//	removeDir(temp+"/*");
	done();
});



/////////////////////////////////////
// TESTS
/////////////////////////////////////

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



describe('Copying files', function(){
	it("should create the directory structure", function(){

		var a = ['style/style.css','media/audio/hangup.mp3'];

		// Ops
		var files = {};
		// Take example.html and create a .md file from it.
		a.forEach(function(a){
			files[temp+a] = src+a;
		});


		// Create files
		shunt(files);

		// Take example.html and create a .md file from it.
		a.forEach(function(a){
			// Whats the verdict?
			fs.existsSync(temp+a).should.be[true];
		});
	});
});


/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
///////////////UTILS/////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

function removeDir(path){
	var files = [];
	var root = !path.match(/\/\*$/);

	path = path.replace(/\/\*$/,'');

	if( fs.existsSync(path) ) {
		files = fs.readdirSync(path);
		files.forEach(function(file,index){
			var curPath = path + "/" + file;
			if(fs.statSync(curPath).isDirectory()) { // recurse
				removeDir(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		if(root){
			fs.rmdirSync(path);
		}
	}
}