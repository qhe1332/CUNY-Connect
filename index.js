//Necessary Packages
var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
const host = 'localhost';
const port = 8080;

http.createServer(function(req, res)
{
	res.writeHead(200, {'Content-Type': 'text/plain'})
	fs.readFile('index.html', function(err, data)
	{
		if (err)
		{
			console.log(err)
			res.writeHead(404)
			res.write('Error: File Not Found')
		}
		else
		{
			res.writeHead(200, {"Content-Type": "text/html"})
			res.write(data)
		}
	})
    res.end()
}).listen(port)

console.log(`Server is running on http://${host}:${port}`)