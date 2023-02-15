var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const fs = require('fs');

app.use(bodyParser.json());


const {
	Validator,
	ValidationError,
} = require("express-json-validator-middleware");

const { validate } = new Validator();

function validationErrorMiddleware(error, request, response, next) {
	if (response.headersSent) {
		return next(error);
	}

	const isValidationError = error instanceof ValidationError;
	if (!isValidationError) {
		return next(error);
	}

	response.status(400).json({
		errors: error.validationErrors,
	});

	next();
}

const userSchema = {
	type: "object",
	required: ["patientName", "hospitalName"],
	properties: {
		patientName: {
			type: "string",
			minLength: 1,
		},
		address: {
			type: "string",
			minLength: 1,
		},
        hospitalName: {
			type: "string",
			minLength: 1,
		},
		date: {
			type: "string",
			minLength: 1,
		},
		billAmount: {
			type: "integer",
			minimum: 1,
		},
	},
};

app.listen(3000, function(){
    console.log("Started at port 3000")
});

app.post('/items', validate({ body: userSchema }), function (req, res, next){
    res.setHeader('Content-Type', 'application/json');
    console.log("Added bill information")
    console.log(req.body);  
    res.send("Added Successfully: To check all the list of bills go to http://localhost:3000/items "); 

    var item = req.body;
    var data = fs.readFileSync('bills.json', 'utf8');  
    var list = (data.length) ? JSON.parse(data): [];
    if (list instanceof Array) list.push(item)
    else list = [item]  
    fs.writeFileSync('bills.json', JSON.stringify(list));
    next();
    });

app.use(validationErrorMiddleware);

app.get("/items", function(req,res){
    res.setHeader('Content-Type', 'application/json');
    fs.readFile('bills.json', (err, data) => {
        if (err) throw err;
        let bills = JSON.parse(data);
        console.log(bills);
        res.send(bills);
        
    });
})

