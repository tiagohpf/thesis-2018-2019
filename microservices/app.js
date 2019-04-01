let express = require('express');
let axios = require('axios');
let bodyParser = require('body-parser');
let Promise = require('es6-promise').Promise;
let request = require('request');

let AUDIO_FILES_DIR = 'data/audio_files/';
let DB_PREFIX = 'http://10.113.141.31:8080/transcriptions/';
let DB_DIALOGUES = DB_PREFIX + 'dialogues';
let DB_ENTITIES = DB_PREFIX + 'entities';
let ENTITIES_SERVICE = "http://10.113.134.43:4567/getEntities/";
let INTENTS_SERVICE = 'http://10.113.141.31:8900/sofia/question';
//let TRANSCRIPT_SERVICE = 'http://10.113.155.13:5500/';
let TRANSCRIPT_SERVICE = 'http://127.0.0.1:5000/';
let PY_SERVER_DOWNLOAD = 'http://10.113.155.13:5400/';

let app = express();

app.use(bodyParser.json());
app.set('json spaces', 4);

let server = app.listen(3500, function () {
    console.log("Server listen on 3500");
});

server.setTimeout(300000);

app.get("/getTranscriptions", (req, res) => {
    axios.get(DB_DIALOGUES).then(response => {
        res.send(response.data._embedded);
    })
        .catch(error => {
            res.send(error);
        });
});

app.get("/getTranscription/:id", (req, res) => {
    let id = req.params.id;
    axios.get(`${DB_DIALOGUES}/${id}`).then(response => {
        res.send(response.data);
    })
        .catch(error => {
            res.send(error);
        });
});

app.get("/transcript", (req, res) => {
    let path = req.query.path;
    let transcript_path = null;
    let volume = parseInt(req.query.volume);
    let speed = parseFloat(req.query.speed);
    let student = req.query.student;

    if (!volume)
        volume = 0;
    if (!speed)
        speed = 1.0;
    if (!student)
        student = 'Telco';
    let file_id = createFileId(path, volume, speed);

    if (!path)
        res.send("You must use path parameter");
    else {
        transcript_path = `${file_id}.trs`;
        path = `${AUDIO_FILES_DIR + path}.wav`;
    }

    let params = {
        path: path,
        volume: volume,
        speed: speed,
        file_id: file_id,
        download_path: PY_SERVER_DOWNLOAD + transcript_path,
        student: student
    };

    getTranscription(file_id).then(response => {
        if (response.length !== 0)
            res.send(PY_SERVER_DOWNLOAD + transcript_path);
        else {
            request({ url: `${TRANSCRIPT_SERVICE}transcript/`, qs: params }, function (err, response, body) {
                res.send(body);
            });
        }
    }).catch(error => {
        res.send(error);
    });

});

app.get("/getEntities", (req, res) => {
    axios.get(DB_ENTITIES).then(response => {
        res.send(response.data._embedded);
    })
        .catch(error => {
            res.send(error);
        })
});

app.get("/getEntities/:sentence", (req, res) => {
    let sentence = req.params.sentence;
    getEntities(sentence).then(response => {
        res.send(response.data);
    })
        .catch(error => {
            res.send(error);
        })
});

app.get("/getIntent/:sentence", (req, res) => {
    let sentence = req.params.sentence;
    let student = req.query.student;

    if (!student)
        student = 'Telco';

    getIntent(sentence, student).then(response => {
        res.send(response);
    })
        .catch(error => {
            res.send(error);
        })
});

app.get("/generateTranscription", (req, res) => {
    let path = req.query.path;
    let transcript_path = null;
    let volume = parseInt(req.query.volume);
    let speed = parseFloat(req.query.speed);

    if (!volume)
        volume = 0;
    if (!speed)
        speed = 1.0;
    let file_id = createFileId(path, volume, speed);

    if (path) {
        transcript_path = `${file_id}.trs`;
        path = `${AUDIO_FILES_DIR + path}.wav`;
    }
    else res.send("You must use path param");

    let params = {
        path: path,
        volume: volume,
        speed: speed,
        file_id: file_id,
        download_path: PY_SERVER_DOWNLOAD + transcript_path
    };

    getTranscription(file_id).then(response => {
        if (response.length === 0) {
            request({ url: `${TRANSCRIPT_SERVICE}generateTranscription/`, qs: params }, function (err, response, body) {
                res.send(body);
            });
        }
        else
            res.send(PY_SERVER_DOWNLOAD + transcript_path);
    }).catch(error => {
        res.send(error);
    });
});

app.get("/generateEntities/:file_id", (req, res) => {
    let id = req.params.file_id;
    let promises = [];
    let dialogues = [];
    let entities = [];

    axios.get(`${DB_DIALOGUES}/${id}`).then(response => {
        
        response.data.dialogues.forEach(dialogue => {
            let p = getEntities(dialogue.text).then(result => {
                let json_obj = {
                    index: dialogue.index,
                    speaker: dialogue.speaker,
                    text: dialogue.text,
                    entities: result.data
                };

                if (dialogue.intents)
                    json_obj.intents = dialogue.intents;

                entities.push.apply(entities, result.data);
                dialogues.push(json_obj);
                return { entities, dialogues };
            });
            promises.push(p)
        });

        return Promise.all(promises).then(response => {
            let obj = response[0];
            return axios.patch(`${DB_DIALOGUES}/${id}`, {
                _id: obj.id,
                last_update: new Date().toISOString(),
                entities: obj.entities,
                dialogues: obj.dialogues
            }).then(r => {
                res.send(JSON.stringify(r.data));
            });
        });
    }).catch(error => {
        throw error;
    });
});

app.get("/generateIntents/:file_id", (req, res) => {
    let id = req.params.file_id;
    let student = req.query.student;
    let promises = [];
    let dialogues = [];
    let intents = [];

    if (!student)
        student = 'Telco';

    axios.get(`${DB_DIALOGUES}/${id}`).then(response => {
        let data = response.data;

        data.dialogues.forEach(dialogue => {
            let p = getIntent(dialogue.text, student).then(result => {
                let json_obj = {
                    index: dialogue.index,
                    speaker: dialogue.speaker,
                    text: dialogue.text,
                    intent: result,
                    student: student
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
            return axios.patch(`${DB_DIALOGUES}/${id}`, {
                _id: obj.id,
                last_update: new Date().toISOString(),
                intents: obj.intents,
                dialogues: obj.dialogues
            }).then(r => {
                res.send(JSON.stringify(r.data));
            });
        });
    }).catch(error => {
        throw error;
    });
});

function getTranscription(id) {
    return axios.get(`${DB_DIALOGUES}/${id}`).then(response => {
        return response.data;
    })
        .catch(error => {
            if (error.response.status === 404)
                return [];
            throw error;
        });
}

function getEntities(sentence) {
    return axios.get(encodeURI(ENTITIES_SERVICE + sentence)).then(response => {
        return response.data;
    }).catch(error => {
        throw error;
    });
}

function getIntent(sentence, student) {
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
            VA: student,
            isTest: true
        }
    })
        .then(response => {
            return response.data.nlpResponse.intent;
        }).catch(error => {
            throw error;
        });
}

function createFileId(path, volume, speed) {
    return `${path}_${volume}_${speed}`;
}
