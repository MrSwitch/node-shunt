// Shunt
// A shit version of grunt
// @author Andrew Dodson

// Require IO operations
var fs = require('fs');
var path = require('path');

var default_opts = {
	// Strings to replace in the files parsed.
	// Key (search) => Value (replace)
	replace : {},

	// Should the scripts be minified and references in HTML scripts include the minified file.
	minify : true,

	// Determines if resources defined in HTML script and link tags are also included in the file.
	processScripts : true,

	// Embed
	// If a link or script points to a resource, load it into the project
	// This is useful if the page contain non-https resources.
	embed : false,

	// MarkDown
	// Triggers in an HTML page that start markdown
	markdownStart : [/<body[^>]*?>/, '<!--/NO-MARKDOWN-->'],
	markdownEnd : ['<!--NO-MARKDOWN-->']
};


// Export
module.exports = (function shunt(o,opts){

	// Merge options
	var opts = merge( default_opts, opts || {} );

	console.log(o);


	// Uglify-JS for compressing Javascript
	var UglifyJS = require("uglify-js");

	// Clean-CSS, exactly that
	var cleanCSS = require("clean-css");

	// newFile
	for(var newFile in o ){ if(o.hasOwnProperty(newFile)){

		var compound = [],
			minified = [],
			files = o[newFile];

		if(typeof(files) === "string"){
			files = [files];
		}

		for(var i=0;i<files.length;i++){

			var name = files[i];

			// Resource Type
			var statMatch = fs.existsSync(name) ? fs.statSync(name) :false;
			var statTarget = fs.existsSync(newFile) ? fs.statSync(newFile) : false;
			if(statMatch&&statMatch.isDirectory()){
				var _o = {};
				traverseFiles(name, function(filename, dir){
					_o[newFile + filename] = dir + filename;
				});

				// If the target is also a directory
				if(statTarget&&statTarget.isDirectory()){
					// Lets just move content
					shunt(_o,opts);
				}
				else {
					// Otherwise the target is just a file so lets add the content to the list of items to be compounded
					// Add files to the target
					var j = 1;
					for(var x in _o){
						// Slide in
						files.splice(i + j++, 0, _o[x]);
					}
				}
				continue;
			}

			else if(newFile.match(/\.min.js$/)){
				compound.push( UglifyJS.minify(name).code );
			}
			else if(newFile.match(/\.js$/)){
				compound.push( fs.readFileSync(name, "utf8") );
				if(opts.minify){
					minified.push( UglifyJS.minify(name).code );
				}
			}
			else if(newFile.match(/\.min.css$/)){
				compound.push( cleanCSS.process(fs.readFileSync(name).toString() ) );
			}
			else if(newFile.match(/\.css$/)){
				compound.push( fs.readFileSync(name, "utf8") );
				if(opts.minify){
					minified.push( cleanCSS.process(fs.readFileSync(name).toString() ) );
				}
			}
			else if(newFile.match(/\.md$/)){
				compound.push( htmlToMarkDown( fs.readFileSync(name, "utf8") ) );
			}
			else if(newFile.match(/\.html$/)){
				compound.push( htmlFormat( fs.readFileSync(name, "utf8"), name.replace(/([^\/]+)$/,'') ) );
			}
			// Else is this a text file?
			else if(newFile.match(/\.(txt|log|json)/)){
				compound.push(fs.readFileSync(name).toString());
			}
			else{
				// File is binary just move it, no string replacement
				console.log('Copied ' + newFile);
				copyFileSync(name, newFile);
			}
		}

		if(compound.length>0){

			for(i=0;i<compound.length;i++){
				for(var x in opts.replace){
					// Replace items of the same name
					compound[i] = compound[i].replace((new RegExp(x,'g')), opts.replace[x]);
				}
			}


			// Write files
			writeFile(newFile, compound.join("\n"));

			// Write files
			if(minified.length){
				writeFile(newFile.replace(/.([^.]+)$/,'.min.$1'), minified.join("\n"));
			}
		}
	}}



	//
	function htmlToMarkDown(s,dir){

		//
		function getAttributes(s){
			var o = {};
			s.replace(/([a-z]+)\s*=\s*("|')?(.*?)(\2)/g, function(m,key,quote,value){
				o[key] = value;
			});
			return o;
		}

		// Replace check
		var entities = [ /\&(check|cross)\;/g,
			function(m,val){
				return {
					check : '&#10003;',
					cross : '&#10007;'
				}[val];
			}
		];

		// Loop through the HTML
		var lines = s.split(/\n/),
			r = [],
			block,
			body = false;

		for(var i=0;i<lines.length;i++){
			var line = lines[i];
			if(!body){
				// Only begin converting lines after the body tag
				if(line.match(/<body[^>]*>/) ||
					line.indexOf('<!--/NO-MARKDOWN-->')>-1){
					body = true;
				}
			}
			else if(line.match('<!--NO-MARKDOWN-->')){
				body = false;
			}
			else if(line.match(/^[\s]/)){
				// Indented code is acceptable
				// replace
				r.push(line.replace(entities[0], entities[1]));
			}
			else{
				var reg = /<(\/)?([a-z0-9]+)(\s[^>]*)?>(?:(.*?)(<\/\2>))?/g;
				r.push(line.replace(reg, function self(m,end,tag,attr,content,closed){

					//
					// are we in a formatted block?
					//
					if(block&&tag!==block){
						return m;
					}
					else{
						block = null;
					}


					var suffix = '',
						prefix = '';
					
					try{
						attr = getAttributes(attr||'');
					}
					catch(e){
						throw m;
					}


					if(tag.match(/h[0-9]/)){
						prefix = tag.replace(/h([0-9])/, function(m,c){
							var a = [];
							a.length = parseInt(c,10);
							return "#" + a.join("#")+" ";
						});
					}
					else if(tag === 'a'){
						prefix = '[';
						suffix = ']('+(attr.href||'')+')';
					}
					else if (tag === 'code'){
						prefix = '`';
						suffix = '`';
					}
					else if (tag === 'li'){
						prefix = '- ';
					}
					else if (tag === 'strike'){
						prefix = '~~';
						suffix = '~~';
					}
					else if (tag === 'b'||tag === 'strong'){
						prefix = '**';
						suffix = '**';
					}
					else if (tag === 'em'||tag === 'i'){
						prefix = '*';
						suffix = '*';
					}
					else if ( ( tag === 'script' && !attr.src ) || tag === 'pre' ){
						if(!end){
							var type = attr.type || (tag === 'script' ? 'javascript' : '');
							prefix = '```'+ type;
							block = tag;
						}
						if(end||closed){
							block = null;
							suffix = '```';
						}
					}
					else if( tag === 'script' && attr.src ){
						prefix = '```html\n' + m;
						suffix = '\n```';
					}
					// Else if the line contains only a single element remove it.
					else if(tag==="table"){
						if(!end&&!closed){
							block = tag;
						}
						return m;
					}
					else if(end){
						return '';
					}					
					return prefix + (content||'').replace(reg,self) + suffix;
				})
				.replace(entities[0], entities[1]));
			}
		}

		return r.join("\n");
	}


	function htmlFormat(buffer,dir){

		dir = dir || '';

		var _o = {};

		// Replace text before any other formatting
		if(opts.replace){
			for(var x in opts.replace){
				// Replace items of the same name
				buffer = buffer.replace((new RegExp(x,'g')), opts.replace[x]);
			}
		}

		if(opts.embed){

			console.log("Embed scripts");
			// Find script tags with local file references
			buffer = buffer.replace(/<script src=([\'\"])(?!https?\:\/\/)(.*?)(\1)><\/script>/g, function(r,quot,m){

				var path = (m.match(/^\//) ? opts.root_dir : '' ) + m ;

				console.log("Embed javascript: "+ path);

				var str;
				if(opts.minify){
					str = UglifyJS.minify(path).code; // Minify
				}
				else{
					str = fs.readFileSync(path).toString();
				}

				return '<script>'+str+'</script>';

			// Find and replace stylesheets with local file references
			}).replace(/<link href=([\'\"])(?!https?\:\/\/)(.*?)(\1) rel="stylesheet"\/>/g, function(r,quot,m){

				var path = (m.match(/^\//) ? opts.root_dir : '' ) + m ;
				console.log("Embed css: "+ path);

				// remove Byte Order mark with replace
				var str = fs.readFileSync(path).toString().replace(/^\uFEFF/, '');
				if(opts.minify){
					str = cleanCSS.process(str);
				}
				return '<style>'+str+'</style>';
			});
		}

		// Replace asset paths
		if(opts.overrideRoot){
			buffer = buffer.replace(/<script ([^\>]*?)src="\/([^\"]+)"([^\>]*?)><\/script>/g, function(r,a,m,z){
				return '<script '+a+'src="' + opts.overrideRoot + m + '"'+z+'></script>';
			}).replace(/<link href="\/([^\'\"]+)" rel="stylesheet"\/>/g, function(r,m){
				return '<link href="' + opts.overrideRoot + m + '" rel="stylesheet"/>';
			});
		}


		// Follow paths and include the source in the response.
		if(opts.processScripts){

			// Find script tags with local file references
			buffer = buffer.replace(/<script src="\.\/([^\"]+)"><\/script>/g, function(r,m){
				// Add file to the list of javascript files to be added
				var newAsset = newFile.replace(/[^\/]*$/,m);
				if(opts.minify){
					newAsset = newAsset.replace(/\.js/,".min.js");
					r = r.replace(/\.js/,'.min.js');
				}
				_o[newAsset] = dir + m;
				return r;

			// Find and replace stylesheets with local file references
			}).replace(/<link href="\.\/([^\'\"]+)" rel="stylesheet"\/>/g, function(r,m){
				var newAsset = newFile.replace(/[^\/]*$/,m);
				if(opts.minify){
					newAsset = newAsset.replace(/\.css/,".min.css");
					r = r.replace(/\.css/,'.min.css');
				}
				_o[newAsset] = dir + m;
				return r;

			// Find and replace... local file references
			}).replace(/\bsrc=([\'\"])(?!https?\:\/\/)([\w].*?)(\1)/ig, function(r,quote,m){
				var newAsset = newFile.replace(/[^\/]*$/,m);
				_o[newAsset] = dir + m;
				return r;
			});

			// Process new assets
			//console.log(dir);
			shunt(_o, opts);
		}

		// Minify html
		/*
		buffer = buffer.replace(/<!--([\s\S]*?)-->/g, function(m,c){
			return c.match(/^\s*\/?ko/) ? m : '';
		});
		buffer = buffer.replace(/[\s\t\n]+/g, ' ').replace(/> </g,'><');
		*/
		return buffer;
	}

});





function traverseFiles(path, callback){
	var files = fs.readdirSync(path);
	files.forEach(function(filename){
		var _path = (path+"/"+filename).replace(/\\/g,'/');

		// Dont include the build script
		if(_path === __filename.replace(/\\/g,'/')){
			return;
		}

		var stat = fs.statSync(_path);
		if(stat.isDirectory()){
			traverseFiles(_path, callback);
		}
		else{
			callback(filename, path, fs.readFileSync(_path));
		}
	});
}


//
// merge
// recursive merge two objects into one, second parameter overides the first
// @param a array
//
function merge(a,b){
	var x,r = {};
	if( typeof(a) === 'object' && typeof(b) === 'object' ){
		for(x in a){if(a.hasOwnProperty(x)){
			r[x] = a[x];
			if(x in b){
				r[x] = merge( a[x], b[x]);
			}
		}}
		for(x in b){if(b.hasOwnProperty(x)){
			if(!(x in a)){
				r[x] = b[x];
			}
		}}
	}
	else{
		r = b;
	}
	return r;
}

function copyFileSync(srcFile, destFile) {

	// Check folder exists, or create it.
	createDir(path.dirname(destFile));


	var BUF_LENGTH = 64 * 1024,
		buff = new Buffer(BUF_LENGTH),
		fdr = fs.openSync(srcFile, "r"),
		fdw = fs.openSync(destFile, "w"),
		bytesRead = 1,
		pos = 0;

	while (bytesRead > 0) {
		bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
		fs.writeSync(fdw, buff, 0, bytesRead);
		pos += bytesRead;
	}
	fs.closeSync(fdr);
	return fs.closeSync(fdw);
}



// Write File
function writeFile(name, code){
	// Does the path exist?
	createDir(path.dirname(name));
	var err = fs.writeFileSync( name, code );
	console.log(name + " created!");
}

function createDir(dirname){
	if( !fs.existsSync(dirname) ) {
		createDir(path.dirname(dirname));
		fs.mkdirSync(dirname);
	}
}

function getAttributes(str){

	var r = {};

	if(!str){
		return r;
	}

	var reg = '\\b([a-z]+)(\\=("|\')(.*?)\\3)?';
	var m = str.match(new RegExp(reg, 'ig'));

	if(!m){
		return r;
	}

	var _reg = new RegExp(reg, 'i');
	for(var i=0;i<m.length;i++){
		var _m = m[i].match(_reg);
		r[_m[1]] = _m[4];
	}
	return r;
}