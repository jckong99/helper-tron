'use strict';

// Module imports
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');

// Const var declarations
const BASE_URL = 'https://api.guildwars2.com/v2';

// Express server setup
const PORT = process.env.PORT || 5000;
const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));
server.use(bodyParser.json());

// Server post to /get-prefix-stats route
server.post('/get-prefix-stats', (req, res) => {
    const searchItem = req.body && req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.Prefix ? req.body.queryResult.parameters.Prefix : 'Unidentified';
    const searchURL = encodeURI(BASE_URL + '/itemstats?ids=all');
    
    // HTTPS get request
    https.get(searchURL, apiRes => {
        let fullRes = '';

        // Listener for data event
        apiRes.on('data', data => {
            fullRes += data;
        });

        // Listener for end event
        apiRes.on('end', () => {
            fullRes = JSON.parse(fullRes);
            let sendData = 'Response: ';
            if (searchTerm === 'Unidentified') {
                sendData += 'Error. Failed to parse attribute combination from request.';
            }
            else {
                var combo;
                for (combo of fullRes) {
                    if (combo.name === searchTerm) {
                        var stat;
                        for (stat of combo.attributes) {
                            sendData += stat.attribute + ' ';
                        }
                        break;
                    }
                }
            }
            
            return res.json({
                fulfillmentText: sendData,
                source: 'get-prefix-stats'
            });
        });
    }, (error) => {
        return res.json({
            fulfillmentText: 'Something went wrong!',
            source: 'get-prefix-stats'
        });
    });
});

// Set server to listen for activity
server.listen(PORT, () => {
    console.log('Listening on port ' + PORT + '...');
});
