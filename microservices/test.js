let express = require('express');
let axios = require('axios');
let bodyParser = require('body-parser');
let Promise = require('es6-promise').Promise;

let AUDIO_FILES_DIR = 'data/audio_files/';
//let DB_PREFIX = 'http://amalia-cluster-master.c.ptin.corppt.com:8091/';
let DB_PREFIX = 'http://10.113.141.31:8080/';
let DB_TRANSCRIPT = DB_PREFIX + 'transcriptions/';
let DB_DIALOGUES = DB_TRANSCRIPT + 'dialogues';
let DB_ENTITIES = DB_TRANSCRIPT + 'entities';
let DB_AACONFIG = DB_PREFIX + 'alticeAssistantConfig/';
let DB_AACORE = DB_PREFIX + 'alticeAssistantCore/';
let DB_STUDENTS = DB_AACONFIG + 'students';
//let DB_DIALOGUE_HIST = `${DB_AACONFIG}/analytics`
let DB_DIALOGUE_HIST = 'http://10.113.134.43:8090/analytics/DialogueHistory';

//let ENTITIES_SERVICE = "http://10.113.134.43:4567/getEntities/";
let ENTITIES_SERVICE = "http://0.0.0.0:4567/getEntities/";
let SW_SERVICE = "http://0.0.0.0:4567/removeStopwords/";
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
        .catch(error => res.send(getAxiosErrorMessage(error)));
});

app.get("/getTranscription/:id", (req, res) => {
    getTranscription(req.params.id)
        .then(response => res.send(response))
        .catch(error => res.send(getAxiosErrorMessage(error)));
});

app.get("/transcript", (req, res) => {
    let params = createRequestParams(req);
    if (!params.path)
        return res.send("You must define path parameter");

    generateTranscription(req, res).then(response => {
        console.log("Transcription done");
        return generateIntents(req, res, params.fileId).then(() => {
            console.log("Intents done");
            return generateEntities(params.fileId).then(() => {
                console.log("Entities done");
                res.send(response)
            })
        })
    }).catch(error => res.send(getAxiosErrorMessage(error)));
});

app.get("/getEntities", (req, res) => {
    axios.get(DB_ENTITIES)
        .then(response => res.send(response.data._embedded))
        .catch(error => res.send(getAxiosErrorMessage(error)));
});

app.get("/getEntities/:sentence", (req, res) => {
    getEntities(req.params.sentence)
        .then(response => res.send(response.data))
        .catch(error => res.send(getAxiosErrorMessage(error)));
});

app.get("/getIntent/:sentence", (req, res) => {
    let sourceData = getSourceTypeAndName(req.query.program, req.query.student);
    let sessionId = createSessionId();
    getIntent(req.params.sentence, sourceData, sessionId)
        .then(response => res.send(response))
        .catch(error => res.send(getAxiosErrorMessage(error)));
});

app.get("/generateTranscription", (req, res) => {
    generateTranscription(req)
        .then(response => res.send(response))
        .catch(error => res.send(getAxiosErrorMessage(error)));
});

app.get("/generateEntities/:fileId", (req, res) => {
    generateEntities(req.params.fileId)
        .then(response => res.send(response))
        .catch(error => res.send(getAxiosErrorMessage(error)));
});

app.get("/generateIntents/:fileId", (req, res) => {
    generateIntents(req, res, req.params.fileId)
        .then(response => res.send(response))
        .catch(error => res.send(getAxiosErrorMessage(error)));
});

function suggestWithGeneralFallback(studentPrograms, entitiesResponse, text) {
// Foreach in all Programs
    return Promise.all(studentPrograms.map(studentProgram => {
        // Get Program's info
        return getProgram("5cb5bd2d339bdccd5d171d59")
        //return getProgram(studentProgram.programId)
            .then(programResponse => {
                // Get entities and synonyms
                let program = programResponse[0];
                let entities = getEntitiesOfProgram(program);

                return getMatchOfEntities(entitiesResponse.data, entities).then((entitiesMatch) => {
                    let code = program.code;
                    // Foreach Intent on runtimeConfig
                    return program.runtimeConfig.intentINFO[0].collectionData
                        .map(dataIntent => {
                            let displayName = dataIntent.displayName.replace(`${code}_`, '');
                            if (dataIntent.parameters.length > 0) {
                                return dataIntent.parameters.map(parameter => {
                                    return entitiesMatch
                                        .filter(entity => entity === parameter.displayName)
                                        .map(entity => ({
                                            message: text,
                                            programId: "5cb5bd2d339bdccd5d171d59",
                                            // programId: studentProgram.programId,
                                            intent: dataIntent.displayName,
                                            NER: entity
                                        }
                                        ));
                                });
                            }
                            if (intentMatchesEntities(displayName, entitiesResponse.data)) {
                                return {
                                    message: text,
                                    programId: "5cb5bd2d339bdccd5d171d59",
                                    // programId: studentProgram.programId,
                                    intent: dataIntent.displayName,
                                }
                            }
                            console.log('No matches with parameters/entities');
                            return [];
                        });
                });
            });
    })).then((result) => {
        return flattenArray(result);
    }).catch(error => {
        console.error(error)
        return getAxiosErrorMessage(error);
    });
}

app.get("/suggestIntents/:studentName", (req, res) => {
    let student;
    getStudent(req.params.studentName)
        .then(studentResponse => {
            student = studentResponse;
            let studentId = student._id.$oid;
            // Get Dialogue History of Student
            return getDialoguesOfStudent(studentId);
        })
        .then(dialoguesResponse => {
            let promises = dialoguesResponse.map(dialogue => {
                let intent = dialogue.topic;
                let text = dialogue.userSays;
                // Get Entities of userSays
                return getEntities(text)
                    .then(entitiesResponse => {
                        if (entitiesResponse.data.length <= 0) {
                            console.log('No Entities in Dialog');
                            return [];
                        }
                        if (intent === "NO_INTENT" || intent === "fallbackIntent") {
                            console.log("General fallback");
                            return suggestWithGeneralFallback(student.programs, entitiesResponse, text)
                        } else {
                            console.log("Specific fallbacks");
                            return Promise.resolve('Specific Fallback');
                        }
                    })
            });
            return Promise.all(promises);
        })
        .then(result => {
            console.log('Done Generating suggestions');
            result = flattenArray(result).map(instance => JSON.stringify(instance));
            res.send(Array.from(new Set(result)).map((string) => JSON.parse(string)));
        })
        .catch(error => res.status(500).send(error));
});

function generateTranscription(req) {
    let params = createRequestParams(req);
    if (!params.path)
        return Promise.reject("You must define path parameter")
    return getTranscription(params.fileId).then(response => {
        if (response.length === 0) {
            console.log("Start Transcription");
            let axiosConfig = {
                method: 'get',
                url: `${TRANSCRIPT_SERVICE}generateTranscription/`,
                params
            }
            return axios(axiosConfig)
                .then(response => response.data)
        }
        else
            throw params.downloadPath;
    });
}

function generateEntities(id) {
    let promises = [];
    let dialogues = [];
    console.log("Start Entities");
    return axios.get(`${DB_DIALOGUES}/${id}`).then(response => {
        response.data.dialogues.forEach(dialogue => {
            if (parseInt(dialogue.speaker) === 1 && dialogue.intent.name === "NO_INTENT") {
                let p = getEntities(dialogue.text).then(result => {
                    let jsonObj = {
                        index: dialogue.index,
                        speaker: dialogue.speaker,
                        text: dialogue.text,
                        entities: result.data
                    };
                    if (dialogue.intent)
                        jsonObj.intent = dialogue.intent;
                    dialogues.push(jsonObj);
                    return {dialogues};
                });
                promises.push(p)
            } else
                dialogues.push(dialogue);
        });

        return Promise.all(promises).then(response => {
            let obj = response[0];

            return axios.patch(`${DB_DIALOGUES}/${id}`, {
                _id: obj.id,
                lastUpdate: new Date().toISOString(),
                dialogues: obj.dialogues
            }).then(() => dialogues);
        });
    }).catch(error => {
        if (error.response.status === 404)
            return [];
        throw error;
    })
}

function generateIntents(req, res, id) {
    console.log("Start Intents");
    return axios.get(`${DB_DIALOGUES}/${id}`).then(response => {
        let dialogues = sortDialoguesByIndex(response.data.dialogues);
        let sourceData = getSourceTypeAndName(req.query.program, req.query.student);
        let clientDialogues = filterBySpeaker(dialogues, 1);
        let sessionId = createSessionId();

        return getIntentsFromDialogues(clientDialogues, sourceData, sessionId).then(() => {
            let operatorDialogues = filterBySpeaker(dialogues, 0);
            dialogues = sortDialoguesByIndex(clientDialogues.concat(operatorDialogues));
            return axios.patch(`${DB_DIALOGUES}/${id}`,
                {
                    _id: response.id,
                    lastUpdate: new Date().toISOString(),
                    dialogues: dialogues,
                    sourceType: sourceData.sourceType,
                    sourceName: sourceData.sourceName
                });
        }).then(() => dialogues);
    });
}

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
        .catch(error => res.send(getAxiosErrorMessage(error)));
    ;
}

function getIntentsFromDialogues(dialogues, sourceData, sessionId) {
    let requests = dialogues.map(dialogue => {
        return {
            question: dialogue.text,
            sessionId,
            VA: {id: sourceData.sourceName, type: sourceData.sourceType},
            isTest: true
        };
    });

    return requests.slice(0).reduce((promise, request, i) => {
        return promise.then(() => {
            return axios({
                method: 'post',
                url: INTENTS_SERVICE,
                data: request
            }).then(response => {
                Object.assign(
                    dialogues[i],
                    {intent: response.data.nlpResponse.intent});
            })
        })
    }, Promise.resolve()).catch(error => {
        console.log("Error in getting intents", error);
        throw error;
    })
}

function getIntent(sentence, sourceData, sessionId) {
    return axios({
        method: 'post',
        url: INTENTS_SERVICE,
        data: {
            question: sentence,
            sessionId,
            VA: {id: sourceData.sourceName, type: sourceData.sourceType},
            isTest: true
        }
    }).then(response => response.data.nlpResponse.intent);
}

function getStudent(studentName) {
    return axios.get(`${DB_STUDENTS}?filter={'name':'${studentName}'}`)
        .then(response => response.data._embedded[0])
        .catch(error => getAxiosErrorMessage(error));
}

function getDialoguesOfStudent(studentId) {
    return axios.get(`${DB_DIALOGUE_HIST}?filter={'botId':'${studentId}'}`)
        .then(response => response.data._embedded)
        .catch(error => getAxiosErrorMessage(error));
}

function getProgram(programId) {
    return axios.get(`${DB_AACONFIG}programs`)
        .then(response => {
            return response.data._embedded.filter(program => program._id.$oid === programId)
        })
        .catch(error => getAxiosErrorMessage(error));
}

function getEntitiesOfProgram(program) {
    let entities = [];
    program.chapters.forEach(chapter => {
        let displayName = chapter.displayName.replace(`${program.code}_`, '');
        let entitiesFound = chapter.entities.map(entity => {
            let synonyms = entity.synonyms.concat(entity.value);
            return {
                entity: entity.value,
                values: Array.from(new Set(synonyms))
            };
        });
        entities.push({displayName: displayName, values: entitiesFound});
    });
    return entities;
}
const parseNerEntities = (nerEntities) => {
   return Promise.all(nerEntities.map(nerEntity => manageSentence(nerEntity._id)))
};

const parseProgramEntities = (programEntities) => {
    return Promise.all(programEntities.map((programEntity) => {
        return Promise.all(programEntity.values.map(entity => {
            let entityName = entity.entity;
            let values = entity.values;
            return Promise.all(values.map(value => manageSentence(value)))
                .then(parsedValues => ({
                    entity: entityName,
                    values: parsedValues
                }))
        }))

    }))
};

function getMatchOfEntities(nerEntities, programEntities) {
    return Promise.all([
        parseNerEntities(nerEntities),
        parseProgramEntities(programEntities)
    ]).then((response) => {
        let parsedNer = response[0], parsedEntities = flattenArray(response[1]);   
        let entityMatches = [];
        parsedNer.forEach(nerEntity => {
            parsedEntities.filter(entity => entity.values.includes(nerEntity))
                        .map(entity => entityMatches.push(entity.entity));
        })
        return entityMatches;
    })
}

function getSuggestionsOfIntent(collectionData) {
    let suggestions = [];
    if (collectionData.parameters.length > 0) {
        let customParameters = getCustomParameters(collectionData.parameters);
        console.log("Compare parameters");
    }
    else
        console.log("Compare to intent");
    return suggestions;
}

function getIntentsUsed(intentINFO, intents = []) {
    if (intents.length > 0)
        return intentINFO.collectionData.filter(intent => intents.includes(intent.displayName));
    return intentINFO.collectionData;
}

function flattenArray(array) {
    return array.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenArray(val)) : acc.concat(val), []);
}

const intentMatchesEntities = (intent, entities) => entities.filter(entity => entity._id.toLowerCase() === intent.toLowerCase()).length > 0;

const getCustomParameters = (parameters) => parameters.filter(entitie => !entitie.entityTypeDisplayName.includes("@sys"));

const createFileId = (path, volume, speed) => `${path}_${volume}_${speed}`;

const createSessionId = () => `SessionID_${Math.random().toString(36).substring(7)}`;

const createRequestParams = (req) => {
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
        return {}

    return {
        path: path,
        volume: volume,
        speed: speed,
        fileId: fileId,
        downloadPath: PY_SERVER_DOWNLOAD + transcriptPath
    };
}

const sortDialoguesByIndex = (dialogues) => {
    return dialogues.sort((before, next) => {
        return parseInt(before.index) < parseInt(next.index) ? -1 : 1;
    })
}

const filterBySpeaker = (dialogues, speaker) => dialogues.filter(dialogue => parseInt(dialogue.speaker) === speaker);

const getSourceTypeAndName = (program, student) => {
    if (program)
        return {sourceName: program, sourceType: 'PROGRAM'};
    else if (student)
        return {sourceName: student, sourceType: 'STUDENT'};
    else
        return {sourceName: 'pin_puk_Transcriptor', sourceType: 'PROGRAM'};
}

const getAxiosErrorMessage = (e) => {
    let error = e;
    if (e.response)
        error.data = e.response.data;
    else if (e.request)
        error.message = 'No response from server.';
    if (e.message)
        error.message = e.message;
    return error;
};

const manageSentence = (sentence) => {
    let newSentence = sentence.replace(/[-_,&]/, ' ').toLowerCase();
    return axios.get(encodeURI(`${SW_SERVICE}${newSentence}`))
        .then(response => {
            //console.log('Parsed:', response.data)
            return response.data.data;
        })
        .catch(error => getAxiosErrorMessage(error));
}