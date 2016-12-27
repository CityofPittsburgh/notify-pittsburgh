var restify = require('restify'),
	request = require('request'),
	account = process.env.TWILIO_ACCOUNT,
	number = process.env.TWILIO_NUMBER,
	token = process.env.TWILIO_TOKEN,
	baseUrl = "https://api.twilio.com/2010-04-01/",
	notificationUrl = baseUrl + 'Accounts/' + account + '/Messages.json',
	notifications = {
		"snow": "Calling all Snow Angels! Can you shovel today?"
	};

// Handle notification requests.
function notify(req, res, next) {
	if(!req.body) {
		res.send(400);
		next();
	}

	// For each number.
	for(var property in req.body) {

		// Standardize recipient number.  (Remove non-numbers.)  (Remove initial '1' if present.)
		var recipient = req.body[property].replace(/[^0-9]/g, "").replace(/^1(.*)/g, "$1");
		console.log("Queueing message to " + recipient);

		// Queue message.
		request.post(
			{
				auth: {
					"user": account,
					"pass": token
				},
				url: notificationUrl,
				form: {
					"To": "+1" + recipient,
					"From": number,
					"Body": notifications[req.params.notification]
				}
			},
			function(error, httpResponse, body) {
				if(error) { 
					console.log(error);
				} else if(body) { 
					console.log(body); 
				}
			}
		);
	}
	res.send(201);
	next();
}

// Create server.
var server = restify.createServer();

// Configure server.
server.use(restify.bodyParser({ mapParams: false }));
server.post('/notifications/:notification', notify);

// Start server.
server.listen(process.env.NOTIFY_PORT, function() {
	console.log('%s listening at %s', server.name, server.url);
});
