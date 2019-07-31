

// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
var request = require('request');
var https = require('https');


const BASE_URL = 'https://api.darksky.net/forecast/4958db58f571a7e1cc1e2ea3744137ce/43.6532,-79.3832?units=auto';

const IMAGE_BASE = process.env.WEATHER_IMAGE_BASE;

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Welcome to Dress Smart. You can ask me what you should wear or bring with you according to today\'s weather.';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

/*
const WhatShouldIWearIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'WhatShouldIWearIntent';
    },
    async handle(handlerInput) {
        let outputSpeech = 'This is the default message.';

        var dateToday = handlerInput.requestEnvelope.request.intent.slots.When.value;
        //const suggestions=getWeatherText(getWeather(dateToday));
        
        const response = await getWeather();
        console.log(response);

        //const speechText ='Soo\'s a women. Hello how chuchu? I\'m a girl what about chu? '+dateToday;
        //const speechText=suggestions;
        return handlerInput.responseBuilder
            //.speak(speechText)
            //.speak(suggestions)
            .speak("hi"+response.value.temperature)
            //.reprompt(speechText)
            .getResponse();
    }
};*/



const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speechText = 'Hello World!';
        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        
        //var dateToday = handlerInput.requestEnvelope.request.intent.slots.When.value;

        const speechText = 'It is going to be cold today, with a low of -10 degrees. I suggest you wear a winter jacket.';

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `Sorry, I couldn't understand what you said. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
/*
const WhatShouldIWearIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'WhatShouldIWearIntent';
  },
  async handle(handlerInput) {
    let outputSpeech = 'This is the default message.';

    await getRemoteData(BASE_URL)
      .then((response) => {
        const data = JSON.parse(response);
        outputSpeech= outputSpeech+data.currently.temperature;
      })
      .catch((err) => {
        //set an optional error message here
        outputSpeech = err.message;
      });

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .getResponse();

  },
};*/

const WhatShouldIWearIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'WhatShouldIWearIntent';
  },
  async handle(handlerInput) {
    let outputSpeech = 'This is the default message.';

    await getRemoteData(BASE_URL)
      .then((response) => {
        const data = JSON.parse(response);
        outputSpeech= getSuggestion(data);
      })
      .catch((err) => {
        //set an optional error message here
        outputSpeech = err.message;
      });


    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .getResponse();

  },
};

const getRemoteData = function (url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? require('https') : require('http');
    const request = client.get(url, (response) => {
      response.setEncoding('utf8');
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Failed with status code: ' + response.statusCode));
      }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err) => reject(err))
  })
};



/*
function getWeather(day) {
   return new Promise(function(resolve, reject) {
        if (!day || day.toString() === 'Invalid Date') {
            return reject('Invalid date for weather!');
        }

        request({
            url: BASE_URL,
            json: true
        }, function(err, res, body) {
            let data, text, card,
                simpleDate = day.toISOString().split('T')[0];

            if (err || res.statusCode >= 400) {
                console.error(res.statusCode, err);
                return reject('Unable to get weather data!');
            }

            body.daily.data.forEach(function(dailyData) {
                if ((new Date(dailyData.time * 1000)).toISOString().split('T')[0] === simpleDate) {
                    data = dailyData;
                }
            });

            if (!data) {
                return reject('I have no data for that day!');
            }

            text = getWeatherText(data);
            card = {
                type: 'Standard',
                title: 'Weather for ' + simpleDate,
                text: text,
                image: {
                    smallImageUrl: IMAGE_BASE + data.icon + '.png',
                    largeImageUrl: IMAGE_BASE + data.icon + '.png'
                }
            };

            resolve( { text, card } );
        });
    });
}*/
/*
function getWeather() {
    return new Promise(((resolve, reject) => {
    var options = {
        host: 'api.darksky.net',
        port: 443,
        path: '/forecast/4958db58f571a7e1cc1e2ea3744137ce/43.6532,79.3832',
        method: 'GET',
    };
    
    const request = https.request(options, (response) => {
      response.setEncoding('utf8');
      let returnData = '';

      response.on('data', (chunk) => {
        returnData += chunk;
      });

      response.on('end', () => {
        resolve(JSON.parse(returnData));
      });

      response.on('error', (error) => {
        reject(error);
      });
    });
    request.end();
  }));
}
*/

function getSuggestion(data) {
    let conditions;
    //conditions="here. ";
    conditions="It is "+data.currently.summary+". The average temperature today is "+data.currently.temperature+ " degrees celcius. ";

    if (data.currently.precipProbability > 0.7 && data.currently.precipIntensityMax > 0.05) {
        if (data.currently.precipType === 'rain') {
            conditions += 'Don\'t forget your umbrella. ';
        } else {
            conditions += 'Brace yourself for the snow. ';
        }
    } else if (data.currently.temperatureMax > 93 || data.currently.apparentTemperatureMax > 98) {
        if (data.currently.dewPoint > 72 || data.currently.humidity > 0.75) {
            conditions += 'It\'s going to be nasty. ';
        } else {
            conditions += 'Prepare for a scorcher. ';
        }
    } else if (data.currently.temperatureMax < 35) {
        if (data.currently.windSpeed > 15) {
            conditions += 'Prepare for bitter cold wind in your face. ';
        } else {
            conditions += 'Bitterly cold temperatures are in store for. ';
        }
    } else if (data.currently.dewPoint > 72 && data.currently.humidity > 0.75) {
        conditions += 'The humidity is going to be brutal. ';
    } else if (data.currently.cloudCover > 0.85) { 
        conditions += 'It will be very cloudy. ';
    } else if (data.currently.cloudCover < 0.1) {
        if (data.currently.windSpeed > 15) {
            conditions += 'Lots of sun and breezy conditions are in store. ';
        } else {
            conditions += 'There will be lots of sunshine. ';
        }
    } else if (data.currently.windSpeed > 20) {
        conditions += 'It\'s going to be gusty. ';
    } else {
        conditions += 'Looks like an average day. ';
    }

    return conditions;
}

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        WhatShouldIWearIntentHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    
    .addErrorHandlers(
        ErrorHandler)
    
        .lambda();
