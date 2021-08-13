//Necessary Packages
var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
const host = 'localhost';
const port = 8080;

function alertMessage(message)
{
	alert(message);
	return;
}
/* Validation 
	- check if all fields are filled
	- check if the email in account is a cuny email.
	- return true if pass validation, else return false*/
function validate(accountInfo)
{
	if(accountInfo.user == "" || accountInfo.pass == "" || accountInfo.first == "" || accountInfo.last == "")
	{
		console.log("Please fill in all information!");
		return false;
	}
	if(!accountInfo.email.endsWith("cuny.edu"))
	{
		console.log("Invalid email. Please enter your CUNY Email.");
		return false;
	}
	return true;
	
}

/* Registration function
	- check info validation, if false, return.
	- check if account is already in database. If not, add to database. */
function registration(accountInfo)
{
	if (!accountInfo.register)
	{
		console.log("Register not found");
		return;
	}
	/*check info validation */
	if(!validate(accountInfo))
	{
		console.log("Validation failed");
		return;
	}

	/*check if the same email exist in database*/
	var data = fs.readFileSync("database.txt"); //read data from database
	data = data.toString().split(";"); //split into an array of json obj
	for(var i = 0; i < data.length; i++)
	{
		var dbaseAccount = JSON.parse(data[i]); //parse the json object
		if(dbaseAccount.email == accountInfo.email)
		{
			console.log("Account already existed");
			return;
		}
	}

	fs.appendFile("database.txt", ";" + JSON.stringify(accountInfo), function(err){}); //add to database
	
	console.log("New Account");
	console.log(accountInfo);
	return accountInfo; //return account object
}	


/* Web Server */
http.createServer(function(req, res)
{
	var pathname = url.parse(req.url).pathname.substr(1); //parse the request url to get file name
	console.log("Request for " + pathname + " received.");
	fs.readFile(pathname, function(err, data) //read the file
	{
		if(err) //if error, return 404
		{
			res.writeHead(404, {"Content-Type": "text/html"});
			res.write('Error');
			res.end();
		}
		else{
			if(req.method == "POST") //handle POST request
			{
				req.on('data', function(input){
					var accountInfo = qs.parse(input.toString());

					userObj = registration(accountInfo);
					if(userObj == undefined)
					{
						res.writeHead(301, {"Location": "/index.html"}); //stay on page
					}
					else{
						res.writeHead(200, {"Content-Type": "text/html"}); //html file
					}

					res.write(data);
					res.write("<script>data = " + JSON.stringify(userObj) + "</script>");
					res.end();
				})
			}
			else{
				if(pathname.endsWith("css"))
				{
					res.writeHead(200, {"Content-Type": "text/css"}); //css file
				}
				else{
					res.writeHead(200, {"Content-Type": "text/html"}); //html file
				}
				res.write(data);
				res.end();
			}
		}
	})
}).listen(port);

console.log(`Server is running on http://${host}:${port}`);