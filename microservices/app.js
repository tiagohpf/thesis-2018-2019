let express = require('express');
let axios = require('axios');
let bodyParser = require('body-parser');
let url = require('url');
let Promise = require('es6-promise').Promise;

let request = require('request');
let Requests = require('./requests');
let DB_PREFIX = 'http://10.113.141.31:8080/transcriptions/';
let DB_DIALOGUES = DB_PREFIX + 'dialogues';
let DB_ENTITIES = DB_PREFIX + 'entities';
let ENTITIES_SERVICE = "http://10.113.134.43:4567/getEntities/";
let INTENTS_SERVICE = 'http://10.113.141.31:8900/sofia/question';

let app = express();

app.use(bodyParser.json());
app.set('json spaces', 4);

var server = app.listen(3500, function () {
    console.log("Server listen on 3500")
});

server.setTimeout(250000);

app.get("/getTranscriptions", (req, res) => {
    axios.get(DB_DIALOGUES)
        .then(function (response) {
            res.send(response.data._embedded);
        })
        .catch(function (error) {
            res.send(error);
        });
});

app.get("/getTranscription/:id", (req, res) => {
    let id = req.params['id'];
    axios.get(DB_DIALOGUES + "/" + id)
        .then(function (response) {
            res.send(response.data);
        })
        .catch(function (error) {
            res.send(error);
        });
});

app.get("/transcript", (req, res) => {
    let query = url.parse(req.url, true).query;
    let path = query['path'];
    let volume = parseInt(query['volume']);
    let speed = parseFloat(query['speed']);

    if (!path)
        res.send("You must use path param");
    if (!volume)
        volume = 0;
    if (!speed)
        speed = 1.0;

    let params = {
        "path": path,
        "volume": volume,
        "speed": speed
    };

    request({ url: 'http://localhost:5000/transcript/', qs: params }, function (err, response, body) {
        res.send(body);
    });
});

app.get("/getEntities", (req, res) => {
    axios.get(DB_ENTITIES)
        .then(function (response) {
            res.send(response.data._embedded);
        })
        .catch(function (error) {
            res.send(error);
        })
});

app.get("/getEntities/:sentence", (req, res) => {
    var sentence = req.params['sentence'];
    axios.get("http://10.113.134.43:4567/getEntities/" + sentence)
        .then(function (response) {
            res.send(response.data.data)
        })
        .catch(function (error) {
            res.send(error);
        });
});

app.get("/getIntent/:sentence", (req, res) => {
    let sentence = req.params['sentence'];
    axios({
        method: 'post',
        url: INTENTS_SERVICE,
        headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            'postman-token': 'f66f3311-d2ad-5ea5-5f83-7ad26df1d1d9',
        },
        data: {
            question: sentence,
            sessionId: 'teste1',
            VA: 'Telco',
            isTest: true
        }
    })
        .then(function (response) {
            res.send(response.data.nlpResponse.intent);
        })
        .catch(function (error) {
            res.send(error);
        });
});

app.get("/generateTranscription", (req, res) => {
    let query = url.parse(req.url, true).query;
    let path = query['path'];
    let volume = parseInt(query['volume']);
    let speed = parseFloat(query['speed']);

    if (!path)
        res.send("You must use path param");
    if (!volume)
        volume = 0;
    if (!speed)
        speed = 1.0;

    let params = {
        "path": path,
        "volume": volume,
        "speed": speed
    };

    request({ url: 'http://localhost:5000/generateTranscription/', qs: params }, function (err, response, body) {
        res.send(body);
    });
});

app.get("/generateEntities/:file_id", (req, res) => {
    return new Promise((resolve, reject) => {
        let id = req.params['file_id'];
        let promises = [];
        let dialogues = [];
        let entities = [];

        axios.get(DB_DIALOGUES + "/" + id).then(response => {
            var data = response.data;

            data.dialogues.forEach(dialogue => {
                let p = getEntities(dialogue.text).then(result => {
                    let json_obj = {
                        "index": dialogue.index,
                        "speaker": dialogue.speaker,
                        "text": dialogue.text,
                        "entities": result.data
                    };
                    if (dialogue.intents)
                        json_obj["intents"] = dialogue.intents
                    entities.push.apply(entities, result.data);
                    dialogues.push(json_obj);
                    return {
                        "entities": entities,
                        "dialogues": dialogues
                    };
                });
                promises.push(p)
            });

            Promise.all(promises).then(response => {
                var obj = response[0];
                axios.patch(DB_DIALOGUES + "/" + id, {
                    _id: obj.id,
                    entities: obj["entities"],
                    dialogues: obj["dialogues"]
                }).then(r => {
                    res.send(JSON.stringify(r.data));
                });
            });

        });
        /*.catch(error => {
            res.send(error);
        })*/
    });
});

app.get("/generateIntents/:file_id", (req, res) => {
    let id = req.params['file_id'];
    let promises = [];
    let dialogues = [];
    let intents = [];

    axios.get(DB_DIALOGUES + "/" + id).then(response => {
        let data = response.data;

        data.dialogues.forEach(dialogue => {
            let p = getIntent(dialogue.text).then(result => {
                let json_obj = {
                    index: dialogue.index,
                    speaker: dialogue.speaker,
                    text: dialogue.text,
                    intent: result
                };
                if (dialogue.entities)
                    json_obj.entities = dialogue.entities;
                intents.push(result);
                dialogues.push(json_obj);
                return { intents, dialogues };
            });
            promises.push(p);
        });

        return Promise.all(promises).then(response => {
            let obj = response[0];
            return axios.patch(DB_DIALOGUES + "/" + id, {
                _id: obj.id,
                intents: obj.intents,
                dialogues: obj.dialogues
            }).then(r => {
                res.send(JSON.stringify(r.data));
            });
        });

    });
    /*.catch(error => {
        res.send(error);
    })*/
});

function getEntities(sentence) {
    return new Promise((resolve, reject) => {
        axios.get(encodeURI(ENTITIES_SERVICE + sentence)).then(response => {
            resolve(response.data);
        }).catch(error => {
            reject(error);
        });
    });
};

function getIntent(sentence) {
    return axios({
        method: 'post',
        url: INTENTS_SERVICE,
        headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            'postman-token': 'f66f3311-d2ad-5ea5-5f83-7ad26df1d1d9',
        },
        data: {
            question: sentence,
            sessionId: `SessionID_${Math.random().toString(36).substring(7)}`,
            VA: 'Telco',
            isTest: true
        }
    })
        .then(response => {
            return response.data.nlpResponse.intent;
        }).catch(error => {
            throw error;
        });
}
