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
    axios.get(DB_DIALOGUES)
        .then(response => res.send(response.data._embedded))
        .catch(error => res.send(error))
});

app.get("/getTranscription/:id", (req, res) => {
    let id = req.params.id;
    axios.get(`${DB_DIALOGUES}/${id}`)
        .then(response => res.send(response.data))
        .catch(error => res.send(error));
});

app.get("/transcript", (req, res) => {
    let path = req.query.path;
    let transcriptPath = null;
    let volume = parseInt(req.query.volume);
    let speed = parseFloat(req.query.speed);
    let sourceData = getSourceTypeAndName(req.query.program, req.query.student);

    if (!volume)
        volume = 0;
    if (!speed)
        speed = 1.0;
    let fileId = createFileId(path, volume, speed);

    if (!path)
        res.send("You must use path parameter");
    else {
        transcriptPath = `${fileId}.trs`;
        path = `${AUDIO_FILES_DIR + path}.wav`;
    }

    let params = {
        path: path,
        volume: volume,
        speed: speed,
        fileId: fileId,
        downloadPath: PY_SERVER_DOWNLOAD + transcriptPath,
        sourceName: sourceData.sourceName,
        sourceType: sourceData.sourceType
    }

    getTranscription(fileId).then(response => {
        if (response.length !== 0)
            res.send(PY_SERVER_DOWNLOAD + transcriptPath);
        else {
            request({ url: `${TRANSCRIPT_SERVICE}transcript/`, qs: params }, function (err, response, body) {
                res.send(body);
            });
        }
    }).catch(error => res.send(error));
});

app.get("/getEntities", (req, res) => {
    axios.get(DB_ENTITIES)
        .then(response => res.send(response.data._embedded))
        .catch(error => res.send(error))
});

app.get("/getEntities/:sentence", (req, res) => {
    let sentence = req.params.sentence;
    getEntities(sentence)
        .then(response => res.send(response.data))
        .catch(error => res.send(error))
});

app.get("/getIntent/:sentence", (req, res) => {
    let sentence = req.params.sentence;
    let sourceData = getSourceTypeAndName(req.query.program, req.query.student);
    getIntent(sentence, sourceData)
        .then(response => res.send(response))
        .catch(error => res.send(error))
});

app.get("/generateTranscription", (req, res) => {
    let path = req.query.path;
    let transcriptPath = null;
    let volume = parseInt(req.query.volume);
    let speed = parseFloat(req.query.speed);

    if (!volume)
        volume = 0;
    if (!speed)
        speed = 1.0;
    let fileId = createFileId(path, volume, speed);

    if (path) {
        transcriptPath = `${fileId}.trs`;
        path = `${AUDIO_FILES_DIR + path}.wav`;
    }
    else
        res.send("You must use path parameter");

    let params = {
        path: path,
        volume: volume,
        speed: speed,
        fileId: fileId,
        downloadPath: PY_SERVER_DOWNLOAD + transcriptPath
    };

    getTranscription(fileId).then(response => {
        if (response.length === 0) {
            request({ url: `${TRANSCRIPT_SERVICE}generateTranscription/`, qs: params }, function (err, response, body) {
                res.send(body);
            });
        }
        else
            res.send(PY_SERVER_DOWNLOAD + transcriptPath);
    }).catch(error => res.send(error));
});

app.get("/generateEntities/:fileId", (req, res) => {
    let id = req.params.fileId;
    let promises = [];
    let dialogues = [];
    let entities = [];

    axios.get(`${DB_DIALOGUES}/${id}`).then(response => {
        response.data.dialogues.forEach(dialogue => {
            let p = getEntities(dialogue.text).then(result => {
                let jsonObj = {
                    index: dialogue.index,
                    speaker: dialogue.speaker,
                    text: dialogue.text,
                    entities: result.data
                };

                if (dialogue.intents)
                    jsonObj.intents = dialogue.intents;
                entities.push.apply(entities, result.data);
                dialogues.push(jsonObj);
                return { entities, dialogues };
            });
            promises.push(p)
        });

        return Promise.all(promises).then(response => {
            let obj = response[0];
            
            return axios.patch(`${DB_DIALOGUES}/${id}`, {
                _id: obj.id,
                lastUpdate: new Date().toISOString(),
                entities: obj.entities,
                dialogues: obj.dialogues
            }).then(r => res.send(JSON.stringify(r.data)));
        });
    })
});

app.get("/generateIntents/:fileId", (req, res) => {
    let id = req.params.fileId;
    let sourceData = getSourceTypeAndName(req.query.program, req.query.student);
    let promises = [];
    let dialogues = [];
    let intents = [];

    axios.get(`${DB_DIALOGUES}/${id}`).then(response => {
        response.data.dialogues.forEach(dialogue => {
            let p = getIntent(dialogue.text, sourceData).then(result => {
                let jsonObj = {
                    index: dialogue.index,
                    speaker: dialogue.speaker,
                    text: dialogue.text,
                    intent: result,
                };

                if (dialogue.entities)
                    jsonObj.entities = dialogue.entities;
                intents.push(result);
                dialogues.push(jsonObj);
                return { intents, dialogues };
            });
            promises.push(p);
        });

        return Promise.all(promises).then(response => {
            let obj = response[0];
            
            return axios.patch(`${DB_DIALOGUES}/${id}`, {
                _id: obj.id,
                lastUpdate: new Date().toISOString(),
                intents: obj.intents,
                dialogues: obj.dialogues,
                sourceName: sourceData.sourceName,
                sourceType: sourceData.sourceType
            }).then(r => res.send(JSON.stringify(r.data)));
        });
    })
});

function getTranscription(id) {
    return axios.get(`${DB_DIALOGUES}/${id}`)
        .then(response => response.data)
        .catch(error => {
            if (error.response.status === 404)
                return [];
            throw error;
    });
}

function getEntities(sentence) {
    return axios.get(encodeURI(ENTITIES_SERVICE + sentence))
        .then(response => response.data)
}

function getIntent(sentence, sourceData) {
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
            VA: {
                id: sourceData.sourceName,
                type: sourceData.sourceType
            },
            isTest: true
        }
    }).then(response => response.data.nlpResponse.intent);
}

const createFileId = (path, volume, speed) => `${path}_${volume}_${speed}`;

function getSourceTypeAndName(program, student) {
    let sourceName, sourceType;

    if (program) {
        sourceName = program;
        sourceType = 'PROGRAM';
    } else if (student) {
        sourceName = student;
        sourceType = 'STUDENT';
    } else {
        sourceName = 'pin_puk_Transcriptor';
        sourceType = 'PROGRAM';
    }

    return {
        sourceName: sourceName,
        sourceType: sourceType
    };
}
