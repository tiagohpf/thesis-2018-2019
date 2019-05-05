let express = require('express');
let axios = require('axios');
let bodyParser = require('body-parser');
let Promise = require('es6-promise').Promise;
const utf8 = require('utf8');
const cors = require('cors');

let DB_RPD = 'http://amalia-cluster-master.c.ptin.corppt.com:8091/'
let RPD_AACONFIG = `${DB_RPD}alticeAssistantConfig/`;

let AUDIO_FILES_DIR = 'data/audio_files/';
//let DB_PREFIX = 'http://amalia-cluster-master.c.ptin.corppt.com:8091/';
let DB_PREFIX = 'http://10.113.141.31:8080/';
let DB_TRANSCRIPT = DB_PREFIX + 'transcriptions/';
let DB_DIALOGUES = DB_TRANSCRIPT + 'dialogues';
let DB_ENTITIES = DB_TRANSCRIPT + 'entities';
let DB_AACONFIG = DB_PREFIX + 'alticeAssistantConfig/';
//let DB_AACORE = DB_PREFIX + 'alticeAssistantCore/';
let DB_STUDENTS = DB_AACONFIG + 'students';
//let DB_DIALOGUE_HIST = `${DB_AACONFIG}/analytics`
let DB_DIALOGUE_HIST = 'http://amalia-cluster-master.c.ptin.corppt.com:8091/analytics/DialogueHistory';

//let ENTITIES_SERVICE = "http://10.113.134.43:4567/getEntities/";
let ENTITIES_SERVICE = "http://0.0.0.0:4567/getEntities/";
let SW_SERVICE = "http://0.0.0.0:4567/removeStopwords/";
let INTENTS_SERVICE = 'http://10.113.141.31:8900/sofia/question';
//let TRANSCRIPT_SERVICE = 'http://10.113.155.13:5500/';
let TRANSCRIPT_SERVICE = 'http://127.0.0.1:5000/';
let PY_SERVER_DOWNLOAD = 'http://10.113.155.13:5400/';

let app = express();

app.use(cors());
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

app.get("/getSuggestionsOfIntents", (req, res) => {
    axios.get(`${DB_AACONFIG}intentsSuggestions`)
        .then(response => res.send(response.data._embedded))
        .catch(error => res.send(getAxiosErrorMessage(error)));
});

app.get("/suggestIntents/:studentId", (req, res) => {
    let student;
    getStudent(req.params.studentId)
        .then(studentResponse => {
            student = studentResponse;
            // Get Dialogue History of Student
            return getDialoguesOfStudent(student._id.$oid);
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
                            return suggestWithGeneralFallback(student._id.$oid, student.programs, entitiesResponse, text)
                        } else {
                            console.log("Specific fallbacks");
                            //return Promise.resolve('Specific Fallback');
                        }
                    })
            });
            return Promise.all(promises);
        })
        .then(result => {
            console.log('Done Generating suggestions');
            result = flattenArray(result).map(instance => JSON.stringify(instance));
            result = Array.from(new Set(result));
            // Remove undefined instances after flatten array
            result = result.filter(suggestion => typeof suggestion !== "undefined");
            return uploadSuggestions(result)
                .then(response => {
                    res.send(result.map((string) => JSON.parse(string)))
                });
        })
        .catch(error => res.send(error));
});

app.get("/validateSuggestion/:id", (req, res) => {
    updateSuggestionValidation(req.params.id)
        .then(response => res.send(response))
        .catch(error => res.send(getAxiosErrorMessage(error)));
});

app.get("/ignoreSuggestion/:id", (req, res) => {
    ignoreSuggestion(req.params.id)
        .then(response => res.send(response))
        .catch(error => res.send(getAxiosErrorMessage(error)));
});

app.get("/getProgramName/:id", (req, res) => {
    axios.get(`${DB_AACONFIG}programs/${req.params.id}`)
        .then(response => res.send(response.data.name))
        .catch(error => {
            if (error.response.status === 404)
                res.send([]);
        });
});

app.post("/addPhrasesAndEntities", (req, res) => {
    if (req.body.NER) {
        console.log("Add training phrase and entities");
        addPhraseWithEntities(req.body)
            .then(response => res.send(response))
            .catch(error => res.send(error));
    } else {
        console.log("Just add training phrase");
        addTrainingPhrase(req.body)
            .then(response => res.send(response))
            .catch(error => res.send(error));
    }
});

app.post("/removePhrasesAndEntitities", (req,res) => {
    if (req.body.NER) {
        console.log("Remove training phrase and entities");
    } else {
        console.log("Just remove training phrase");
        removeTrainingPhrase(req.body)
            .then(response => res.send(response))
            .catch(error => res.send(error));
    }
});

function removeTrainingPhrase(body) {
    return getProgram(body.programId)
        .then(program => {
            let lessons = [];
            program[0].lessons.forEach(lesson => {
                if (lesson.displayName === body.intent)
                    lesson.trainingPhrases = removeSimpleTrainingPhrase(body.text, lesson.trainingPhrases);
                lessons.push(lesson)
            })
            return axios.patch(`${RPD_AACONFIG}programs/${body.programId}`, {
                lessons
            }).then(response => response)
                .catch(error => getAxiosErrorMessage(error));
        }).catch(error => getAxiosErrorMessage(error));
}

function addTrainingPhrase(body) {
    return getProgram(body.programId)
        .then(program => {
            let lessons = [];
            program[0].lessons.forEach(lesson => {
                if (lesson.displayName === body.intent)
                    lesson.trainingPhrases.push(createSimpleTrainingPhrase(body.text));
                lessons.push(lesson);
            })
            return axios.patch(`${RPD_AACONFIG}programs/${body.programId}`, {
                lessons
            }).then(response => response)
                .catch(error => getAxiosErrorMessage(error));
        }).catch(error => getAxiosErrorMessage(error));
}

function removeSimpleTrainingPhrase(text, trainingPhrases) {
    return trainingPhrases
        .filter(trainingPhrase => getTextOfParts(trainingPhrase.parts) !== text);
}

function addPhraseWithEntities(body) {
    return getProgram(body.programId)
        .then(program => {
            let lessons = [], chapters = [];
            let matches = getMatchesOfWordsAndEntities(body.text, body.NER);
            body.text = replaceTextByEntities(body.text, matches).split("\\")
                .map(value => value = value.trim())
                .filter(value => value.length > 0);

            program[0].lessons.forEach(lesson => {
                if (lesson.displayName === body.intent) 
                    lesson.trainingPhrases.push(createComplexTrainingPhrase(body.text, matches, program[0].code));
                lessons.push(lesson);
            })
            
            let entities = getAllEntitiesOfChapters(program[0].chapters);
            entities = flattenArray(mergeEntities(entities, matches));
            let notUsedEntities = entities.slice();
            program[0].chapters.forEach(chapter => {
                chapter.entities.map(entity => {
                    entities.filter(e => e.value === entity.value)
                        .map(e => {
                            entity.synonyms = e.synonyms
                            notUsedEntities = notUsedEntities.filter(notEntity => notEntity.value != e.value);
                        })
                });
                chapters.push(chapter);
            })
            notUsedEntities.map(entity => chapters.push(createChapter(entity, program[0].code)));
            return axios.patch(`${RPD_AACONFIG}programs/${body.programId}`, {
                lessons,
                chapters
            }).then(response => response)
                .catch(error => getAxiosErrorMessage(error));

        }).catch(error => getAxiosErrorMessage(error));
}

function mergeEntities(entities, matches) {
    let entitiesMerge = [];
    matches.forEach(match => {
        let entitiesFound = entities.filter(entity => entity.value === match.entity)
        if (entitiesFound.length > 0) {
            entitiesFound.map(entity => {
                if (!entity.synonyms.includes(match.value))
                    entity.synonyms.push(match.value);
            });
        } else
            entitiesFound.push({
                value: match.entity,
                synonyms: Array.from(new Set([match.value, match.value]))
            });
        entitiesMerge.push(entitiesFound);
    })
    return entitiesMerge;
}

function getMatchesOfWordsAndEntities(text, NER) {
    let matches = [];
    NER.forEach(entity => {
        let values = entity.values.filter(value => text.includes(value));
        if (values.length > 0) {
            let longest = values.reduce((a, b) => a.length > b.length ? a : b, '');
            matches.push({
                entity: entity.entity,
                value: longest
            });
        }
    });
    return matches
}

function replaceTextByEntities(text, matches) {
    matches.forEach(entity => {
        text = text.replace(entity.value, `\\${entity.entity}\\`);
    })
    return text;
}

function uploadSuggestions(suggestions) {
    let promises = suggestions.map(suggestion => {
        return getSuggestion(JSON.parse(suggestion)._id)
            .then(response => {
                // Post just new instances
                if (response.length === 0) {
                    return axios({
                        method: 'post',
                        url: `${DB_AACONFIG}intentsSuggestions`,
                        headers: { "Content-Type": "application/json" },
                        data: suggestion
                    }).then(response => response);
                }
            })
            .catch(error => getAxiosErrorMessage(error))
    })
    return Promise.all(promises);
}

function updateSuggestionValidation(id) {
    return getSuggestion(id)
        .then(response => {
            let validated = false;
            if (response.validated === false)
                validated = true;
            return axios.patch(utf8.encode(`${DB_AACONFIG}intentsSuggestions/${id}`), {
                validated,
                lastUpdate: new Date().toISOString()
            })
                .then(r => r);
        }).catch(error => getAxiosErrorMessage(error))
}

function ignoreSuggestion(id) {
    return getSuggestion(id)
        .then(response => {
            return axios.patch(utf8.encode(`${DB_AACONFIG}intentsSuggestions/${id}`), {
                ignore: true,
                lastUpdate: new Date().toISOString()
            })
                .then(r => r);
        }).catch(error => getAxiosErrorMessage(error))
}

function getSuggestion(id) {
    return axios.get(utf8.encode(`${DB_AACONFIG}intentsSuggestions/${id}`))
        .then(response => response.data)
        .catch(error => {
            if (error.response.status === 404)
                return [];
            return error;
        });
}

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
                    return { dialogues };
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
            VA: { id: sourceData.sourceName, type: sourceData.sourceType },
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
                    { intent: response.data.nlpResponse.intent });
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
            VA: { id: sourceData.sourceName, type: sourceData.sourceType },
            isTest: true
        }
    }).then(response => response.data.nlpResponse.intent);
}

function suggestWithGeneralFallback(studentId, studentPrograms, entitiesResponse, text) {
    let botId = studentId;
    return parseEntities(entitiesResponse.data).then((NER) => {
        // Foreach in all Programs
        return Promise.all(studentPrograms.map(studentProgram => {
            // Get Program's info
            return getProgram(studentProgram.programId).then(programResponse => {
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
                                            _id: removeAccents(`${text}_${studentProgram.programId}`),
                                            message: text,
                                            programId: studentProgram.programId,
                                            program: program.name,
                                            intent: dataIntent.displayName,
                                            entity: entity,
                                            NER: NER,
                                            lastUpdate: new Date().toISOString(),
                                            validated: false,
                                            ignore: false,
                                            botId
                                        }));
                                });
                            }
                            else if (intentMatchesEntities(displayName, entitiesResponse.data)) {
                                return {
                                    _id: removeAccents(`${text}_${studentProgram.programId}`),
                                    message: text,
                                    programId: studentProgram.programId,
                                    program: program.name,
                                    intent: dataIntent.displayName,
                                    lastUpdate: new Date().toISOString(),
                                    validated: false,
                                    ignore: false,
                                    botId
                                }
                            }
                            console.log('No matches with parameters/entities');
                            return [];
                        });
                });
            });
        })).then((result) => {
            return flattenArray(result);
        }).catch(error => getAxiosErrorMessage(error));
    })
}

function getStudent(studentId) {
    return axios.get(`${DB_STUDENTS}/${studentId}`)
        .then(response => response.data)
        .catch(error => {
            if (error.response.status === 404)
                return [];
            return error;
        });
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
        entities.push({ displayName: displayName, values: entitiesFound });
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

function parseEntities(entities) {
    return Promise.all(entities.map(entity => getValuesOfEntity(entity._id)
        .then(parsedValues => ({
            entity: parsedValues._id,
            values: parsedValues.values
        })))).then(response => response);
}

function getValuesOfEntity(entity) {
    return axios.get(`${DB_ENTITIES}/${entity}`)
        .then(response => response.data)
        .catch(error => getAxiosErrorMessage(error));
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
        return { sourceName: program, sourceType: 'PROGRAM' };
    else if (student)
        return { sourceName: student, sourceType: 'STUDENT' };
    else
        return { sourceName: 'pin_puk_Transcriptor', sourceType: 'PROGRAM' };
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
        .then(response => response.data.data)
        .catch(error => getAxiosErrorMessage(error));
}

const removeAccents = (sentence) => {
    sentence = sentence.replace(/[àáâãäå]/, "a");
    sentence = sentence.replace(/[èéêëẽ]/, "e");
    sentence = sentence.replace(/[ìíîï]/, "i");
    sentence = sentence.replace("ñ", "n");
    sentence = sentence.replace(/[òóôõö]/, "o");
    sentence = sentence.replace("œ", "oe");
    sentence = sentence.replace(/[ùúûü]/, "u");
    sentence = sentence.replace(/[ýÿ]/, "y");
    return sentence;
}

const createSimpleTrainingPhrase = (text) => {
    return {
        "type": "EXAMPLE",
        "parts": [
            {
                "text": text
            }
        ],
        "timesAddedCount": 2
    }
}

const createComplexTrainingPhrase = (text, matches, code) => {
    matches = matches.map(entity => entity.entity);
    let parts = [];
    text.map(value => {
        if (matches.includes(value)) {
            parts.push({
                "text": value,
                "alias": value,
                "entityType": `@${code}_${value}`
            });
        } else {
            parts.push({
                "text": value
            });
        }
    });
    return parts;
}

const getAllEntitiesOfChapters = (chapters) => {
    let entities = [];
    chapters.forEach(chapter => {
        chapter.entities.map(entity => {
            entities.push({
                value: entity.value,
                synonyms: entity.synonyms
            })
        })
    })
    return entities;
}

const createChapter = (entity, code) => {
    return {
        displayName: `${code}_${entity.value}`,
        kind: 'KIND_MAP',
        entities: [
            {
                value: entity.value,
                synonyms: entity.synonyms
            }
        ]
    }
}

const getTextOfParts = (parts) => {
    let text = new String();
    parts.forEach(part => text += part.text + " ")
    return text.trim().replace(/\s\s+/g, ' ');
}