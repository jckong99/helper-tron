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
    const searchItem = req.body && req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.Prefix ? req.body.queryResult.parameters.Prefix : 'Unexpected';
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
            let sendData = '';
            let statList = [];
            
            fullRes = JSON.parse(fullRes);
            
            if (searchItem === 'Unexpected') {
                sendData += 'Error. Failed to parse attribute combination from request.';
            }
            else {
                for (const combo of fullRes) {
                    if (combo.name === searchItem) {
                        for (const stat of combo.attributes) {
                            statList.push(stat.attribute);
                        }
                        break;
                    }
                }
                
                sendData += 'There are ' + statList.length + ' attribute combinations total:\n';
                for (const s of statList) {
                    sendData += s + ' ';
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
