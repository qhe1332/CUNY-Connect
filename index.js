//Necessary Packages
var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
const host = 'localhost';
const port = 8080;

http.createServer(function(req, res)
{
	fs.readFile('index.html', function(err, data)
	{
		if(err)
		{
			res.writeHead(404, {"Content-Type": "text/html"});
			res.write('Error');
			res.end();
		}
		 else{
			res.writeHead(200, {"Content-Type": "text/html"});
			res.write(data);
			console.log(req.url);
			console.log(req.method);
			res.end();
		}
	})
}).listen(port);

console.log(`Server is running on http://${host}:${port}`);