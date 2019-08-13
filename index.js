'use strict';

// Module imports
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');

// Const var declarations
const BASE_URL = 'https://api.guildwars2.com/v2';

// Attribute name conversion function
function convertAttributeName (attribute) {
    var returnName;
    
    switch (attribute) {
        case 'CritDamage':
            returnName = 'Ferocity';
            break;
        case 'ConditionDamage':
            returnName = 'Condition Damage';
            break;
        case 'ConditionDuration':
            returnName = 'Expertise';
            break;
        case 'BoonDuration':
            returnName = 'Concentration';
            break;
        case 'Healing':
            returnName = 'Healing Power';
            break;
        default:
            returnName = attribute;
    }
    
    return returnName;
}

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
            var comboObject;
            let majorStatNames = [];
            let minorStatNames = [];
            let majorStatMult = -1.0;
            
            fullRes = JSON.parse(fullRes);
            
            if (searchItem === 'Unexpected') {
                sendData += 'Error. Failed to parse attribute combination from request.';
            }
            else if (searchItem === 'Celestial') {
                sendData += 'The Celestial combination offers equal amounts of Power, Precision, Toughness, Vitality, Condition Damage, Ferocity, and Healing Power.';
            }
            else {
                // Find attribute combination matching desired prefix
                for (const combo of fullRes) {
                    if (combo.name === searchItem) {
                        comboObject = combo;
                        
                        // Find multiplier value of major attribute(s)
                        for (const stat of combo.attributes) {
                            if (majorMult < stat.multiplier) {
                                majorMult = stat.multiplier;
                            }
                        }
                        break;
                    }
                }
                
                // Divide attributes into major and minor categories
                for (const stat of comboObject.attributes) {
                    if (stat.multiplier === majorMult) {
                        majorStatNames.push(convertAttributeName(stat.attribute));
                    }
                    else {
                        minorStatNames.push(convertAttributeName(stat.attribute));
                    }
                }
                
                // Construct grammatically-correct sentence
                sendData += 'The ' + searchItem + ' combination offers ';
                if (majorStatNames.length > 1) {
                    sendData += majorStatNames[0] + ' and ' + majorStatNames[1] + ' as major attributes as well as ';
                }
                else {
                    sendData += majorStatNames[0] + ' as a major attribute as well as ';
                }
                sendData += minorStatNames[0] + ' and ' + minorStatnames[1] + ' as minor attributes.';
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
