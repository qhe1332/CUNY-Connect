//Necessary Packages
var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
const host = 'localhost';
const port = 8080;

/*CompareData function
	- compare user data with accounts in database
	- return an double array of #ofSimilarHobby and user objects */
function compareData(userInfo)
{   
	var output = [];
	var data = fs.readFileSync("database.txt"); //read data from database
	data = data.toString().split(";"); //split into an array of json obj

    // for each array passed as an argument to the function
    for (var i = 0; i < data.length; i++) {
		var dbaseAccount = JSON.parse(data[i]); //parse the json object
		var outputItem = []; //subarray
		outputItem[0] = 0;

		if(dbaseAccount.email != userInfo.email){
			for (var j = 0; j< userInfo.hobby.length; j++){
				for (var k = 0; k< dbaseAccount.hobby.length; k++){
					if (dbaseAccount.hobby[k] == userInfo.hobby[j]){
						outputItem[0] ++;
					}
				}  
			}
		}
		if(outputItem[0] != 0)
		{
			outputItem.push(dbaseAccount);
			output.push(outputItem);
		}
	}
    //sort output array, from most hobby in common to least
    for(var i = 0; i < output.length-1; i++)
	{
        for(var j = i+1; j < output.length; j++)
		{
			if(output[i][0] < output[j][0])
			{
				var temp = output[i];
				output[i] = output[j];
				output[j] = temp;
			}
		}
    }
    return output;
}    



/*DisplayMatch function
	- search for the complete user info in database
	- execute comparData function
	- return the resulting double array*/
function displayMatch(userInfo)
{
	var data = fs.readFileSync("database.txt"); //read data from database
	data = data.toString().split(";"); //split into an array of json obj string
	for(var i = 0; i < data.length; i++)
	{
		var dbaseAccount = JSON.parse(data[i]); //parse the json object
		if(dbaseAccount.email == userInfo.email)
		{
			userInfo = dbaseAccount;
			break;
		}
	}

	matchArr = compareData(userInfo);
	return matchArr;
}



/* Validation function
	- check if all fields are filled. If not return "fill"
	- check if the email in account is a cuny email. If not return "email"
	- return "pass" if pass validation*/
function validate(accountInfo)
{
	message = "pass";
	if(accountInfo.user == "" || accountInfo.pass == "" || accountInfo.first == "" || accountInfo.last == "")
	{
		message = "fill";
		return message;
	}
	if(!accountInfo.email.endsWith("cuny.edu"))
	{
		message = "email";
		return message;
	}
	return message;
	
}


/* signIn function
 	- check if the email provided is a cuny email/validation, if not, return error message page
	- check if email, username, and password is within the database, if not, return error message page
	- return user object*/
function signIn(accountInfo)
{
	if(!accountInfo.login)
	{
		console.log("Login not found");
		return;
	}
	
	/*check info validation */
	if(validate(accountInfo) == "fill" || validate(accountInfo) == "email")
	{
		console.log("Validation failed");
		return;
	}
	/*check if email, username, and password match in database */
	var data = fs.readFileSync("database.txt"); //read data from database
	data = data.toString().split(";"); //split into an array of json obj
	for(var i = 0; i < data.length; i++)
	{
		var dbaseAccount = JSON.parse(data[i]); //parse the json object
		if(dbaseAccount.email == accountInfo.email && dbaseAccount.user == accountInfo.user && dbaseAccount.pass == accountInfo.pass)
		{
			console.log("Account Found");
			console.log(dbaseAccount);
			return dbaseAccount;
		}
	}
	console.log("Account not found");
	return;
}

/* Registration function
	- check info validation, if "fill" or "email", return that str.
	- check if account is already in database. If not, return accountInfo object (data will be added into database after completing quiz)*/
function registration(accountInfo)
{
	if (!accountInfo.register)
	{
		console.log("Register not found");
		return;
	}
	/*check info validation */
	if(validate(accountInfo) == "fill" || validate(accountInfo) == "email")
	{
		console.log("Validation failed:");
		return validate(accountInfo); //return str
	}

	/*check if the same email exist in database*/
	var data = fs.readFileSync("database.txt"); //read data from database
	data = data.toString().split(";"); //split into an array of json obj string
	for(var i = 0; i < data.length; i++)
	{
		var dbaseAccount = JSON.parse(data[i]); //parse the json object
		if(dbaseAccount.email == accountInfo.email)
		{
			console.log("Account already existed");
			return;
		}
	}

	return accountInfo; //return account object
}	
/*Questionnaire function
	- check if the POST request is a quiz
	- add new user data and quiz answer into database*/
function storeQuizData(inputData)
{
	if(!inputData.questionnaire)
	{
		console.log("Questionnaire not found.");
		return;
	}

	fs.appendFile("database.txt", ";" + JSON.stringify(inputData), function(err){}); //add to database
	
	console.log("New Account");
	console.log(inputData);
	return inputData;
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
					var inputData = qs.parse(input.toString());

					if(pathname == "match.html")
					{
						console.log(inputData);
						matchArray = displayMatch(inputData);
					}
					userObj = registration(inputData);
					userObj2 = signIn(inputData);
					userObject = storeQuizData(inputData);
					if(typeof userObj === 'string')//if a str is returned, there's an error
					{
						if(userObj == "fill")
						{
							console.log("Please fill in all information!");
							res.writeHead(301, {"Location": "/fillError.html"}); //error page
						}
						else{
							console.log("Invalid email. Please enter your CUNY Email.");
							res.writeHead(301, {"Location": "/emailError.html"}); //error page
						}
					}else if(inputData.register && userObj == undefined)
					{
						res.writeHead(301, {"Location": "/signUpError.html"}); //error page
					}
					else if(inputData.login && userObj2 == undefined)
					{
						console.log("Login Failed: Please try again.");
						res.writeHead(301, {"Location": "loginError.html"}); //error page
					}else{
						res.writeHead(200, {"Content-Type": "text/html"}); //html file
					}
					res.write(data);
					if(userObject != undefined) //going to match.html after creating profile
					{
						res.write("<script>data = " + JSON.stringify(userObject) + "</script>"); //userInfo
						res.write("<script>matchArr = " + JSON.stringify(matchArray) + "</script>"); //array of matching people
					}
					else{
						if(userObj2 != undefined) //going to match.html after login
						{
							res.write("<script>data = " + JSON.stringify(userObj2) + "</script>");
							res.write("<script>matchArr = " + JSON.stringify(matchArray) + "</script>");
						}
						else{ 
							res.write("<script>data = " + JSON.stringify(userObj) + "</script>");
						}
					}
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