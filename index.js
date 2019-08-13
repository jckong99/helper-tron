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
    const searchItem = req.body.result && req.body.result.parameters && req.body.result.parameters.Prefix ? req.body.result.parameters.Prefix : 'Failed search item parsing';
    const searchURL = encodeURI(BASE_URL + '/itemstats/584');
    
    // HTTPS get request
    https.get(searchURL, apiRes => {
        apiRes.setEncoding('utf8');

        let fullRes = '';

        // Listener for data event
        apiRes.on('data', data => {
            fullRes += data;
        });

        // Listener for end event
        apiRes.on('end', () => {
            fullRes = JSON.parse(fullRes);
            let sendData = 'Successful retrieval!\n';
            sendData += fullRes;
            
            return res.json({
                speech: sendData,
                displayText: sendData,
                source: 'get-prefix-stats'
            });
        });
    }, (error) => {
        return res.json({
            speech: 'Something went wrong!',
            displayText: 'Something went wrong!',
            source: 'get-prefix-stats'
        });
    });
});

// Set server to listen for activity
server.listen(PORT, () => {
    console.log('Listening on port ' + PORT + '...');
});
