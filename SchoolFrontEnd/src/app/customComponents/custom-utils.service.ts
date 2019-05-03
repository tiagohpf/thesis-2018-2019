import { AbstractControl } from "@angular/forms";

import { UtilsCustomService } from "foundations-webct-robot/robot/utils/utils-webct-methods.service";
import { JsonParams } from "foundations-webct-robot/robot/classes/jsonParams.class";

import * as moment from "moment/moment";
import { Timestamp } from "rxjs";
import { forEach } from "@angular/router/src/utils/collection";
import { HttpUrlEncodingCodec } from "@angular/common/http";

export class UtilsCustomLocalService extends UtilsCustomService {
    readonly CURRENT_VERSION = "current_version";

    public formatQuestionCategoriesList(list: string[], other: string = null) {
        /**
         * Utilizado nas operações baseQuestions create e edit;
         * ----
         * Constrói a lista de valores para o select Goal
         * ----
         * Entrada:
         * @list: lista a retornar;
         * @other: para o caso de existir uma opçpão default (ex: add new...);
         * ----
         * Saída: Lista sem valores repetidos, ordenada, e acrescida da opção default, caso exista;
         */

        if (!list || list.length == 0) return other ? [other] : [];

        list = Array.from(new Set(list));
        list = list.filter(s => s);
        list = list.sort();

        if (other) list.push(other);

        return list;
    }

    public buildListFromData(
        data: any[],
        other: string = null,
        key: string = null,
        ...path
    ) {
        /**
         * Prepara a invocação de @formatQuestionCategoriesList(), obtendo uma lista de valores, a partir de qualquer estrutura que receba;
         * @data: estrutura que vai conter a list;
         * @other: opção default;
         * @key: apenas adiciona à lista a retornar, os valores cuja key corresponda a este parâmetro
         * @path: caminho, na estrutura, até à lista de valores
         */

        if (path) {
            path.forEach(entry => {
                data = data[entry];
            });
        }

        if (!data || data.length === 0 || !key) {
            return [other];
        }

        const list: string[] = [];
        data.forEach(entry => {
            if (entry[key]) {
                list.push(entry[key]);
            } else {
                return;
            }
        });

        return this.formatQuestionCategoriesList(list, other);
    }

    public formatUpdateTuple(tuple: any, attr: string): string[] {
        /**
         * Converte a estrutura presente num túplo, para uma estrutura aceite pela api
         */

        try {
            tuple = JSON.parse(tuple);
        } catch (e) {
            console.error("Error parcing tuple object -> ", tuple);
        }

        let arr: string[] = [];
        for (const i in tuple) {
            let value = tuple[i][attr + "${1-" + i + "}"];
            if (tuple[i][attr + "${1-" + i + "}"]) {
                arr.push(value);
            }
        }

        return arr;
    }

    public reverseFormatUpdateTuple(
        id1: string,
        type: string[],
        id2: string,
        name: string[]
    ): Object[] {
        if (type && name && type.length != name.length) {
            console.error(
                "ERROR in reverseFormatUpdateTuple() -> Type and Name arrays dont have the same length"
            );
        }

        let arr: Object[] = [];

        for (let i in type) {
            arr.push({ [id1]: type[i], [id2]: name[i] });
        }

        return arr;
    }

    public validateIfIsNewValue(
        value: string,
        newValue: string,
        valueCtrl: string
    ): string {
        return value !== valueCtrl ? value : newValue;
    }

    public findQuestionPlusIndex(list: Object[], code: string): Object {
        /**
         * Obtém um objecto de uma lista, adiciona-lhe o index em que se encontra no array, e retorna o objecto;
         */

        let index = list.findIndex(obj => obj["codigo"] == code);
        let obj = list.find(obj => obj["codigo"] == code);

        obj["objIndexInArray"] = index;

        return obj;
    }

    public getNameForThisCode(
        codeNamesList: any[],
        code: number | string
    ): string {
        /**
         * Estados dos programas:
         * ----
         * Entrada:
         * @codeNamesList: array com o nome e o statusId para todos os estados possíveis;
         * @code: valor do statusId em questão;
         * ----
         * Saída:
         * Icon + nome de estado correspondente ao statusId;
         */
        const match = codeNamesList.filter(itm => {
            return itm["statusId"] === +code;
        });
        let rtn: string;
        switch (+code) {
            case 1:
                rtn =
                    '<i class="fa fa-certificate fx-icon text-info"></i>&nbsp;' +
                    match[0]["name"];
                break;
            case 2:
                rtn =
                    '<i class="fuxicons fuxicons-mpt fx-icon"></i>&nbsp;' +
                    match[0]["name"];
                break;
            case 3:
                rtn =
                    '<i class="fa fa-check fx-icon text-success"></i>&nbsp;' +
                    match[0]["name"];
                break;
            case 4:
                rtn =
                    '<i class="fa fa-certificate fx-icon text-info"></i>&nbsp;' +
                    match[0]["name"] +
                    '&nbsp;&nbsp;<i class="fa fa-check fx-icon text-success"></i>';
                break;
            case 5:
                rtn =
                    '<i class="fuxicons fuxicons-mpt fx-icon"></i>&nbsp;' +
                    match[0]["name"] +
                    '&nbsp;&nbsp;<i class="fa fa-check fx-icon text-success"></i>';
                break;
            default:
                rtn = "";
        }
        return rtn;
    }

    public buildTableDataGoalTranslations(data: any[]): any[] {
        /**
         * Constrói uma estrutura destinada a preencher a tabela das goal translations (program detail)
         * Este método deverá fica deprecated, uma vez que a referida estrutura de verá ser construida através de uma agregação no mongo
         */

        if (!Array.isArray(data)) {
            data = [data];
        }

        const rtnArr: any[] = [];
        data.forEach(itm => {
            itm["entities"].forEach(entity => {
                const dataObj: any = {};
                dataObj["category"] = itm["displayName"].split("_")[2]
                    ? itm["displayName"].split("_")[2]
                    : itm["displayName"].split("_")[1];
                dataObj["goal"] = entity["value"];
                const translations: any[] = [];
                dataObj["translations"] = entity["synonyms"];
                rtnArr.push(dataObj);
            });
        });
        return rtnArr;
    }

    public buildTableDataSurveyMessages(data: any[]): any[] {
        const rtnArr: any[] = [];
        data.forEach((entry, index) => {
            const dataObj: any = {};
            dataObj["position"] = index + 1;
            dataObj["message"] = entry;
            rtnArr.push(dataObj);
        });
        if (data.length === 0) {
            rtnArr.push({ position: 1, message: "" });
        }
        return rtnArr;
    }

    public addPositionIndex(data: Object[]) {
        data.forEach((entry, index) => {
            entry["positionIndex"] = index + 1;
        });
        return data;
    }

    public buildTranslationArray(data: any[], className?: string): string {
        const rtnArr: any[] = [];
        let rtn = "";

        data.forEach(itm => {
            const tag =
                '<div class="fx-tag-m"><span class="fx-tag-name">' +
                itm +
                "</span></div>";
            rtn += tag;
        });
        return className ? `<div class="${className}">${rtn}</div>` : rtn;
    }

    public buildTranslationArray2(
        data: any[],
        updateTableData: string,
        removed: any[] = null
    ): any[] {
        const rtn: any[] = [];
        if (!data) {
            data = [];
        }
        data.forEach(itm => {
            const itemRemoved: any = removed
                ? removed.find(entry => {
                    return entry["translationColumn"] === itm;
                })
                : null;

            if (itemRemoved) {
                return;
            }

            rtn.push({ translation: itm });
        });
        if (updateTableData) {
            const updateTableDataArr: string[] = JSON.parse(updateTableData);
            updateTableDataArr.forEach(newItm => {
                rtn.push({ translation: newItm });
            });
        }
        return rtn;
    }

    public translationRemovable(
        contextData: any[],
        translation: string,
        categoryContext: string
    ): string {
        let rtn = "false";
        const key = categoryContext + "-sinonimo";
        try {
            if (typeof contextData === "string") {
                contextData = JSON.parse(contextData);
            }
            contextData.forEach(itm => {
                if (itm[key] === translation) {
                    rtn = "true";
                }
            });
            return rtn;
        } catch (err) {
            return rtn;
        }
    }

    public updateTableExtraData(
        baseData: string = "",
        update: string = "",
        flag: string = "add",
        removedRow: string = null
    ): string {
        let rtn: string[] = [];
        try {
            if (baseData) {
                const baseDataArr: string[] = JSON.parse(baseData);
                rtn = rtn.concat(baseDataArr);
            }
            if (flag === "add") {
                rtn.push(update);
            } else {
                const removedRowArr = JSON.parse(removedRow);
                let match = false;
                rtn.forEach(entry => {
                    const matchIndex = removedRowArr.findIndex(itm => {
                        return itm["translationColumn"] === entry;
                    });
                    if (matchIndex >= 0) {
                        match = true;
                        return;
                    }
                });

                if (rtn.length > 0 && match) {
                    rtn.splice(rtn.indexOf(update), 1);
                }
            }
            return JSON.stringify(rtn);
        } catch (err) {
            if (flag === "add") {
                rtn.push(update);
            } else {
                if (rtn.length > 0) {
                    rtn.splice(rtn.indexOf(update), 1);
                }
            }
            return JSON.stringify(rtn);
        }
    }

    public getArrayIndex(data: any[], key: string, value: string): string {
        for (const idx in data) {
            if (data[idx][key].toString() === value) {
                return idx;
            }
        }
        return "";
    }

    public getArrayIndex2(data: any[], value: any, key?: string) {
        return key ? data.map(el => el[key]).indexOf(value) : data.indexOf(value);
    }

    public getLast(data: any[]) {
        return data.pop();
    }

    public getArrayEntryByIndex(data: any[], index: number): any {
        if (!data || !index) {
            return null;
        }
        return data[+index];
    }

    public restoreArrayString(data: any[], key: string): string[] {
        if (data && !Array.isArray(data)) {
            data = [data];
        }
        const rtn: string[] = [];
        data.forEach(itm => {
            rtn.push(itm[key]);
        });
        const rtn2 = rtn;
        return rtn;
    }

    public getCourseParam(
        data: any[],
        devAccessToken: string,
        param: string
    ): string {
        try {
            if (typeof data === "string") {
                data = JSON.parse(data);
            }
            if (!Array.isArray(data)) {
                data = [data];
            }
            const rtn = data.find(entry => {
                return entry["devAccessToken"] === devAccessToken;
            });
            switch (param) {
                case "id":
                    return rtn["_id"]["$oid"];
                case "name":
                    return rtn["name"];
                default:
                    return "";
            }
        } catch (err) {
            return "";
        }
    }

    public customTemplateOfValueList(
        data: string,
        key: string,
        value: string
    ): any[] {
        let dataTmp: any;
        let dataArr: any[];
        const rtn: any[] = [];
        try {
            dataTmp = JSON.parse(data);
            dataArr = Array.isArray(dataTmp) ? dataTmp : [dataTmp];
        } catch (e) {
            rtn.push({ key: "", value: "" });
            return rtn;
        }
        dataArr.forEach(entry => {
            const newEntry: any = {
                key: entry[key],
                value: entry[value]
            };
            rtn.push(newEntry);
        });
        if (rtn.length === 0) {
            rtn.push({ key: "", value: "" });
        }
        return rtn;
    }

    public setAvailableStatusFilter(studentId, ...params): string {
        const filledParams = [];
        params.forEach(param => {
            if (param.indexOf("{{") >= 0) {
                return;
            }
            const p = JSON.parse(param);
            if (p.length > 0) {
                const obj = {};
                obj[p[0]] = { $in: [studentId] };
                filledParams.push(obj);
            }
        });
        return JSON.stringify(filledParams);
    }

    public setProgramAvailableStatus(currentStudentId, ...students): string {
        let statusCode = 4;
        /**
         * statusCode 4 -> Available
         * statusCode 3 -> Unlearning
         * statusCode 2 -> Unlearned
         * statusCode 1 -> Learning
         * statusCode 0 -> Learned
         */
        for (let i = 0; i < students.length; i++) {
            const match = students[i].find(entry => {
                return entry["studentId"] === currentStudentId;
            });
            if (match) {
                statusCode = i;
                break;
            }
        }

        switch (statusCode) {
            case 0:
                return '<i class="fuxicons fuxicons-lightbulb fx-status-success"></i>&nbsp;Learned';

            case 1:
                return '<i class="fuxicons fuxicons-standby fx-status-warning"></i>&nbsp;Learning';

            case 2:
                return '<i class="fuxicons fuxicons-lightbulb-off fx-status-error"></i>&nbsp;Unlearned';

            case 3:
                return '<i class="fa fa-ellipsis-h fx-status-warning"></i>&nbsp;Unlearning';

            case 4:
                return '<i class="fuxicons fuxicons-pre-active fx-status-success"></i>&nbsp;Available';

            default:
                return "";
        }
    }

    public setProgramDetailAvailableStatus(
        currentStudentId,
        ...students
    ): string {
        let statusCode = 4;
        /**
         * statusCode 4 -> Available
         * statusCode 3 -> Unlearning
         * statusCode 2 -> Unlearned
         * statusCode 1 -> Learning
         * statusCode 0 -> Learned
         */
        for (let i = 0; i < students.length; i++) {
            const match = students[i].find(entry => {
                return entry["studentId"] === currentStudentId;
            });
            if (match) {
                statusCode = i;
                break;
            }
        }

        switch (statusCode) {
            case 0:
                return "<i class='fuxicons fuxicons-lightbulb fx-status-success'></i>";

            case 1:
                return "<i class='fuxicons fuxicons-standby fx-status-warning'></i>";

            case 2:
                return "<i class='fuxicons fuxicons-lightbulb-off fx-status-error'></i>";

            case 3:
                return "<i class='fa fa-ellipsis-h fx-status-warning'></i>";

            case 4:
                return "<i class='fuxicons fuxicons-pre-active fx-status-success'></i>";

            default:
                return "";
        }
    }

    public setLearnedDate(currentStudentId, studentsLearned, key = "date") {
        const match = studentsLearned.find(entry => {
            return entry["studentId"] === currentStudentId;
        });
        if (key === "date") {
            return match
                ? moment(match[key]).isValid()
                    ? moment(match[key]).format("DD-MM-YYYY HH:mm:ss")
                    : ""
                : "";
        } else {
            return match ? match[key] : "";
        }
    }

    public setTestStatus(status: string): string {
        let rtn = "";
        switch (status) {
            case "failed":
                rtn =
                    '<div class="flex"><i class="fa fa-circle fx-status-error"></i><span class="test-description">Failed</span></div>';
                break;
            case "passed":
                rtn =
                    '<div class="flex"><i class="fa fa-circle fx-status-success"></i><span class="test-description">Passed</span></div>';
                break;
            case "not executed":
                rtn =
                    '<div class="flex"><i class="fa fa-circle fx-status-warning"></i><span class="test-description">Not executed</span></div>';
                break;
            case "under execution":
                rtn =
                    '<div class="flex"><i class="fa fa-spinner fx-status-info"></i><span class="test-description">Under execution</span></div>';
                break;
            default:
                rtn = "";
        }
        return rtn;
    }

    public setTestStatus2(status: string): string {
        let rtn = "";
        switch (status) {
            case "failed":
                rtn = "<i class=fa fa-circle fx-status-error></i>";
                break;
            case "passed":
                rtn = "<i class=fa fa-circle fx-status-success></i>";
                break;
            case "not executed":
                rtn = "<i class=fa fa-circle fx-status-warning></i>";
                break;
            case "under execution":
                rtn = "<i class=fa fa-spinner fx-status-info></i>";
                break;
            default:
                rtn = "";
        }
        return rtn;
    }

    public addIndexParam(data: any[]): any[] {
        if (!data) {
            return null;
        }
        const rtn: any[] = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i].hasOwnProperty("index")) {
                rtn.push(data[i]);
                continue;
            }
            const indexedEntry = data[i];
            indexedEntry["index"] = i;
            rtn.push(indexedEntry);
        }
        return rtn;
    }

    public setSortDirection(tblConfig: string): number {
        try {
            const tblConfigObj = JSON.parse(tblConfig);
            const direction = tblConfigObj.sort.direction === "ASC" ? 1 : -1;
            return direction;
        } catch (e) {
            return 0;
        }
    }

    public dynamicDateFromNow(
        timeGap,
        timeUnit: string,
        timeGapDirection: string
    ): string {
        const timeUnitValidOpts = ["days", "weeks", "months", "years"];
        const errorMsg1 =
            "WEBCT dynamicDateFromNow error -> second parameter must be one of the following:\n'days', 'weeks', 'months', 'years'";
        const errorMsg2 =
            "WEBCT dynamicDateFromNow error -> third parameter must be one of the following:\n'past', 'future'";

        if (timeUnitValidOpts.filter(opt => timeUnit === opt).length === 0) {
            console.error(errorMsg1);
        }

        if (!(timeGapDirection === "past" || timeGapDirection === "future")) {
            console.warn(errorMsg2);
        }

        if (timeGapDirection === "past") {
            return moment()
                .subtract(timeGap, timeUnit)
                .format("DD-MM-YYYY");
        } else {
            return moment()
                .add(timeGap, timeUnit)
                .format("DD-MM-YYYY");
        }
    }

    public convertToPercentage(value: number): string {
        return value.toString() ? (value * 100).toFixed(2) + " %" : "";
    }

    public convertToPercentage2(value: number): string {
        return value.toString() ? value + " %" : "";
    }

    public renameDataSets(dataSet: any[], key, changeTo): any {
        const rtn = {};
        rtn[changeTo] = dataSet[key];
        return JSON.stringify(rtn);
    }

    public calculateTotals(key: string, ...data: any[]) {
        const rtn: any[] = [];
        const totalArr: any[] = [];
        data.forEach(entry => {
            const entryObj = typeof entry === "string" ? JSON.parse(entry) : entry;
            totalArr.push(entryObj);
        });

        totalArr.forEach(entry => {
            let totalSum = 0;
            let keyName = Object.keys(entry)[0];
            entry[keyName].forEach(item => {
                totalSum += item[key];
            });

            rtn.push({
                name: keyName,
                value: totalSum
            });
        });

        return rtn;
    }

    public stringToNumber(val: string): number {
        console.log(val, typeof +val);
        return +val;
    }

    public encodeSpecialChars(str: string): string {
        return encodeURIComponent(str);
    }

    public decodeSpecialChars(str: string): string {
        return decodeURIComponent(str);
    }

    public millisecondsToDateString(date) {
        if (isNaN(date)) {
            return date;
        } else {
            return moment(date, "x").isValid()
                ? moment(date, "x").format("DD-MM-YYYY HH:mm:ss")
                : null;
        }
    }

    public restoreMilliseconds(date: string): string {
        let dateObj: any = null;
        try {
            dateObj = JSON.parse(date);
            const newDateObj = {};
            Object.keys(dateObj).forEach(k => {
                newDateObj[k] = moment(dateObj[k])
                    .valueOf()
                    .toString();
            });
            return JSON.stringify(newDateObj);
        } catch (err) {
            console.error(
                "WEBCT custom method restoreMilliseconds -> date range is not valid!"
            );
            return null;
        }
    }

    public uniqueValuesFromData(data, key) {
        if (!Array.isArray(data)) {
            data = [data];
        }
        const rtn: any[] = [];
        data.forEach(entry => {
            if (rtn.length === 0) {
                rtn.push(entry);
            } else if (rtn.length > 0) {
                const exists = rtn.findIndex(newEntry => {
                    return entry[key] === newEntry[key];
                });
                if (exists < 0) {
                    rtn.push(entry);
                }
            }
        });
        return rtn;
    }

    public getStatusTransition(
        availableTransitions: string,
        currentStatus: string,
        transitionType: string
    ): string {
        try {
            const transitionsObj: any[] = JSON.parse(availableTransitions);
            const match = transitionsObj.find(entry => {
                return entry.statusId.toString() === currentStatus;
            });
            switch (transitionType) {
                case "change":
                    return match.nextChangedStatus.toString();
                case "generate":
                    return match.nextGeneratedStatus.toString();
                default:
                    return "";
            }
        } catch (err) {
            return "";
        }
    }

    public getStudentName(data: any[], ids: string[] | string): string {
        if (ids.length <= 0) {
            return "";
        }
        try {
            const matchingNames: string[] = [];

            if (typeof data === "string") {
                data = JSON.parse(data);
            }
            if (!Array.isArray(data)) {
                data = [data];
            }

            if (Array.isArray(ids)) {
                ids.forEach(id => {
                    const match = data.find(itm => {
                        return itm._id.$oid === id;
                    });
                    matchingNames.push(match ? match.name : "non exsistent student");
                });

                if (matchingNames.length <= 0) {
                    return "";
                } else if (matchingNames.length === 1) {
                    return matchingNames[0];
                } else {
                    return "Multiple students (" + matchingNames.length + ")";
                }
            } else {
                const match = data.find(itm => {
                    return itm._id.$oid === ids;
                });
                return match ? match.name : "";
            }
        } catch (err) {
            console.error("WEBCT custom method getStudentName - error!");
            return "";
        }
    }

    public getStudentNames(studentNames, ids) {
        const rtn = [];
        try {
            studentNames = Array.isArray(studentNames)
                ? studentNames
                : JSON.parse(studentNames);
            ids = Array.isArray(ids) ? ids : JSON.parse(ids);
        } catch (err) {
            return [];
        }
        ids.forEach(id => {
            const match = studentNames.find(student => {
                return student["_id"]["$oid"] === id;
            });
            if (match) {
                rtn.push({ id: match["_id"]["$oid"], name: match["name"] });
            } else {
                return;
            }
        });
        return rtn;
    }

    public rebuildMessageArray(data: any[]): string[] {
        if (typeof data === "string") {
            data = JSON.parse(data);
        }
        data = data.sort((a, b) => {
            return +a["position"] - +b["position"];
        });
        const rtn = [];
        data.forEach(entry => {
            rtn.push(entry["message"]);
        });
        return rtn;
    }

    public plusOne(val: string): string {
        return (+val + 1).toString();
    }

    public buildArrStrFromArrObj(arrObj: any, key: string): string {
        const rtn: Object = { $in: [] };
        try {
            arrObj = typeof arrObj === "object" ? arrObj : JSON.parse(arrObj);
            if (!Array.isArray(arrObj)) {
                arrObj = [arrObj];
            }
            arrObj.forEach(entry => {
                rtn["$in"].push(entry[key]);
            });
            return JSON.stringify(rtn);
        } catch (err) {
            return "";
        }
    }

    public buildArrStrFromArrObj2(
        arrObj: any,
        key: string,
        filterField: string
    ): string {
        /* query: */
        /* {$or:[{"belongsTo":["5ad4c16ee6281c4b98710fa3"]},{"belongsTo":["fbdeec598e8c4ae581ae5264f0b39cfc"]}]} */
        try {
            arrObj = typeof arrObj === "object" ? arrObj : JSON.parse(arrObj);
            if (!Array.isArray(arrObj)) {
                arrObj = [arrObj];
            }

            if (arrObj.length === 1) {
                const rtn: Object = {};
                rtn[filterField] = [];

                rtn[filterField].push(arrObj[0][key]);
                return JSON.stringify(rtn);
            } else if (arrObj.length > 1) {
                const rtn: Object = { $or: [] };
                arrObj.forEach(entry => {
                    const filterEntry: Object = { [filterField]: [] };
                    filterEntry[filterField].push(entry[key]);
                    rtn["$or"].push(filterEntry);
                });
                return JSON.stringify(rtn);
            } else {
                return "";
            }
        } catch (err) {
            return "";
        }
    }

    public arrayStringToArrayObjKeyValue(
        data: string[],
        keyName: string = "name"
    ): any[] {
        const rtn: any[] = [];
        try {
            if (typeof data === "string") {
                data = JSON.parse(data);
            }
            data.forEach(entry => {
                const newObj: any = {};
                newObj["key"] = keyName;
                newObj["value"] = entry;
                rtn.push(newObj);
            });
            return rtn;
        } catch (err) {
            return [];
        }
    }

    public setValueConditional(value: string, valueDefault: string): string {
        return value.indexOf("{{") >= 0 && value.indexOf("}}") >= 0
            ? valueDefault
            : value;
    }

    public showRequestFinishMessageForValidate(data, activeTab = ""): string {
        const htmlStr = this.buildFinishMessage(data["error"]);
        if (typeof data === "object") {
            return data["message"] + "<br/><br/>" + htmlStr;
        } else {
            return data;
        }
    }

    public buildFinishMessage(data, htmlStr = "") {
        if (Array.isArray(data)) {
            data.forEach(entry => {
                htmlStr = this.buildFinishMessage(entry, htmlStr);
            });
        } else if (data && typeof data === "object") {
            Object.keys(data).forEach(entry => {
                if (Array.isArray(data[entry]) && data[entry].length > 0) {
                    htmlStr +=
                        "<ul class=remove-list-icon><li><strong>" + entry + ":</strong> [";
                    htmlStr = this.buildFinishMessage(data[entry], htmlStr);
                    htmlStr += "]</li></ul>";
                } else if (Array.isArray(data[entry]) && data[entry].length === 0) {
                    htmlStr +=
                        "<ul class=remove-list-icon><li><strong>" +
                        entry +
                        ":</strong> [ ]</li></ul>";
                } else if (
                    typeof data[entry] === "object" &&
                    Object.keys(data[entry].length > 0)
                ) {
                    htmlStr +=
                        "<ul class=remove-list-icon><li><strong>" + entry + ":</strong> {";
                    htmlStr = this.buildFinishMessage(data[entry], htmlStr);
                    htmlStr += "}</li></ul>";
                } else if (
                    typeof data[entry] === "object" &&
                    Object.keys(data[entry].length === 0)
                ) {
                    htmlStr +=
                        "<ul class=remove-list-icon><li><strong>" +
                        entry +
                        ":</strong> { }</li></ul>";
                } else if (typeof data[entry] === "string") {
                    htmlStr +=
                        "<ul class=remove-list-icon><li><strong>" +
                        entry +
                        ":</strong> " +
                        data[entry] +
                        "</li></ul>";
                }
            });
        } else if (data && typeof data === "string") {
            htmlStr += "<ul class=remove-list-icon><li>" + data + "</li></ul>";
        }

        return htmlStr;
    }

    public showRequestFinishMessage(message, error, activeTab = ""): string {
        localStorage.setItem("activeTab", activeTab);
        if (error) {
            const htmlStr = this.buildFinishMessage(error);
            return message + "<br/><br/>" + htmlStr;
        } else {
            return message;
        }
    }

    public resetLocalStorage(key) {
        localStorage.removeItem(key);
    }

    public setMessageText(message, activeTab) {
        localStorage.setItem("activeTab", activeTab);
        return message;
    }

    public setActiveNav(activeNav) {
        localStorage.setItem("activeNav", activeNav);
    }

    public teste(itm: JsonParams | string) {
        localStorage.setItem("activeTabBool", "true");
    }

    public sortArr(arr): any[] {
        return arr.sort();
    }

    public setFilterFieldRegex(val, regexInit = "^.*"): string {
        if (val.indexOf("{{") >= 0) {
            return regexInit + ".*";
        }
        return regexInit + val + ".*";
    }

    public fixCategoryName(name: string): string {
        return name.split("_")[2] ? name.split("_")[2] : name.split("_")[1];
    }

    public buildCategoriesList(list) {
        const rtn = [];
        list.forEach(entry => {
            rtn.push({
                key: entry,
                value: entry.split("_")[2] ? entry.split("_")[2] : entry.split("_")[1]
            });
        });
        return rtn;
    }

    public replaceCurlyBracesAPI(val: string) {
        return val.indexOf("{{") < 0 ? `"${val}"` : '""';
    }

    public urlPath(
        val1: string,
        val2: string,
        val3: string,
        val4: string,
        val5: string
    ) {
        return val1.indexOf("{{") < 0 ||
            val2.indexOf("{{") < 0 ||
            val3.indexOf("{{") < 0 ||
            val4.indexOf("{{") < 0
            ? "_aggrs/survey_questions"
            : val5;
    }

    public orderingList(data: string): any[] {
        // console.log("data->", data);
        let values = JSON.parse(data);

        let index = values.findIndex(obj => {
            if (!obj.order) obj.order = "";
            return obj.order.indexOf("{{") === 0;
        });
        // console.log(index + 1);
        return index + 1;

        // console.log('teste', data);
        // const rtnArr: any[] = [];
        // values.forEach((entry, index) => {
        //   const dataObj: any = {};
        //   dataObj['order'] = index + 1;
        //   rtnArr.push(dataObj);
        // });

        // if(data.length === 1){

        // }
        // return rtnArr
    }

    public orderQuestions(data: string, position: number, direction: string) {
        console.log("data", data);
        console.log("position", position);
        console.log("direstion", direction);
    }

    public FormatData_ProgressBar_TestSets(data: any): any {
        let finalData = data ? data[0] : {};

        let obj: any[] = [
            {
                option: "Passed on " + finalData["totalPassed"] + " tests",
                description: "",
                value: "passed",
                next: 1,
                count: finalData["totalPassed"] || 0
            },
            {
                option:
                    "Failed on " +
                    (finalData["totalTests"] - finalData["totalPassed"]) +
                    " tests",
                description: "",
                value: "failed",
                next: 2,
                count: !isNaN(finalData["totalTests"])
                    ? finalData["totalTests"] - finalData["totalPassed"]
                    : 0
            },
            {
                option: "not executed",
                description: "",
                value: "not executed",
                next: 3,
                count: !isNaN(finalData["totalTests"])
                    ? finalData["totalTests"] == 0
                        ? 1
                        : 0
                    : 1
            }
        ];
        // console.log("DataTest", obj);

        return obj;
    }
    public FilterIf_Data_ArrayOrObj(data: any, coloumnID: number): Object {
        let compare = obj => obj.testSetId == coloumnID;

        let isObj = data.constructor == Object;
        let isArray = data.constructor == Array;

        if (isObj && data.testSetId === undefined) return;

        if (isObj) return compare(data) ? data : {};
        else if (isArray) return data.filter(obj => compare(obj)) || {};
    }

    public CheckHasData(data: any): string {
        let hasData = "false";

        if (data && (data.length > 0 || data.IXS)) hasData = "true";
        return hasData;
    }
    public CheckHasDataToShow(data: any): boolean {
        let hasData = false;
        let isObj = data.constructor == Object;
        let isArray = data.constructor == Array;

        // console.log('data -----> ', data);

        if (isObj || (isArray && data.length > 0)) return (hasData = true);

        // console.log('data -----> ', hasData);

        return hasData;
    }
    public getIdsFromObjList(data: any): any {
        let result = new Array();

        if (typeof data === "string" && data.indexOf("{{") != -1) return result;

        try {
            result = (typeof data === "object" ? data : JSON.parse(data)).map(
                obj => obj._id.$oid
            );
        } catch (error) {
            console.error("getIdsFromObjList - data param:", data, error);
        }
        return result;
    }
    public getDate_timestamp(): number {
        return Date.now();
    }
    public timestampToDateFormat(
        date: any,
        mask: string = "DD-MM-YYYY HH:mm:ss"
    ): string {
        if (!date || isNaN(date)) {
            return date;
        } else {
            try {
                let timestampNumber = typeof date === "string" ? parseInt(date) : date;
                return moment(timestampNumber).format(mask);
            } catch (e) {
                return date;
            }
        }
    }
    public ChannelsPlans(data: any): any {
        let html = "";
        if (!data) {
            return html;
        }

        data.forEach(element => {
            html += html.length > 0 ? " | " : "";
            switch (element) {
                case "WEB": {
                    html += '<i class="fuxicons fuxicons-network"></i>&nbsp;WEB';
                    break;
                }
                case "Facebook": {
                    html += '<i class="fa fa-facebook"></i>&nbsp;Facebook';
                    break;
                }
                case "IVR": {
                    html += '<i class="fa fa-phone"></i>&nbsp;IVR';
                    break;
                }
                case "Skype": {
                    html += '<i class="fa fa-skype"></i>&nbsp;Skype';
                    break;
                }
            }
        });
        return html;
    }
    public mergeResponse(...response: any[]) {
        let responseArrayObj = [];
        for (let i in response) {
            responseArrayObj[i] = response[i] ? JSON.parse(response[i]) : response[i];
        }

        let list = responseArrayObj[0] ? responseArrayObj[0]._embedded : null;
        let courses = responseArrayObj[1] ? responseArrayObj[1]._embedded : null;
        let plans = responseArrayObj[2] ? responseArrayObj[2]._embedded : null;
        let fallbacks = responseArrayObj[3] ? responseArrayObj[3].fallbacks : null;
        let successes = responseArrayObj[4] ? responseArrayObj[4].successes : null;

        for (let i in list) {
            // courses
            list[i].coursesInfo = [];
            if (list[i].courses) {
                list[i].courses.forEach(courseId =>
                    list[i].coursesInfo.push(courses.find(
                        course => course._id.$oid === courseId
                    )));
            }

            list[i].planInfo = plans.find(
                obj => list[i].plan && list[i].plan.$oid == obj._id.$oid
            );

            let studentStatistics = [];
            if (fallbacks) {
                let studentFallbacks = fallbacks.find(obj => obj._id == list[i].name);
                studentStatistics.push({
                    name: "Fallbacks",
                    value: studentFallbacks ? studentFallbacks.hits_count : 0
                });
            }
            if (successes) {
                let studentSuccesses = successes.find(obj => obj._id == list[i].name);
                studentStatistics.push({
                    name: "Successes",
                    value: studentSuccesses ? studentSuccesses.hits_count : 0
                });
            }

            list[i].statistics = studentStatistics;
        }

        return list;
    }

    public mappingApiValues(...response: any[]) {
        let whereToFind;
        try {
            if (typeof response[0] === "string") {
                whereToFind = JSON.parse(response[0]);
            } else {
                whereToFind = response[0];
            }
        } catch (e) {
            console.error("Error parcing object -> ", whereToFind);
        }

        let whatToFind = response[1];
        let nameOfToFindElement = response[2];

        let result = whereToFind.find(
            obj => obj[nameOfToFindElement] == whatToFind
        );
        return result;
    }
    public studentProgramsNotLearned(...response: any[]) {
        let objectsValues = [];
        let propertyName = response[1];

        objectsValues = response[0]
            .filter(obj => obj[propertyName] == "null" || obj[propertyName] == null)
            .map(obj => obj["programId"]);
        let result = new Array();

        objectsValues.forEach((item, index) => {
            result.push(`${item}`);
        });

        if (result.length > 0) {
            return result;
        } else {
            return null;
        }
    }
    public studentProgramsLearnedIds(...response: any[]) {
        let objectsValues = [];
        let propertyName = response[1];

        objectsValues = response[0]
            .filter(obj => obj[propertyName] != "null" && obj[propertyName] != null)
            .map(obj => ({
                programId: obj["programId"],
                version: obj["versionLearned"]
            }));
        let result = new Array();

        objectsValues.forEach((item, index) => {
            result.push(
                `{'programId': '${item.programId}' ,'version': '${item.version}'}`
            );
        });
        if (result.length > 0 && result.length != 1) {
            return result.join(",");
        } else if (result.length == 1) {
            return result[0];
        } else {
            return null;
        }
    }

    public checkParametersToFilter(...response: any[]) {
        let result = "";

        //console.log(response[1]);

        if (
            response[0] != "{{studentProgramsLearnedIds}}" &&
            response[1] != "{{studentProgramsNotLearnedIds}}"
        ) {
            result =
                '{"$or":[{"$or":[' +
                response[0] +
                ']},{"$or":[{"programId": { "$in": ' +
                response[1] +
                ' } ,"deprecated" : false}]}]}';
        } else if (
            response[0] != "{{studentProgramsLearnedIds}}" &&
            response[1] == "{{studentProgramsNotLearnedIds}}"
        ) {
            result = '{"$or":[' + response[0] + "]}";
        } else if (
            response[0] == "{{studentProgramsLearnedIds}}" &&
            response[1] != "{{studentProgramsNotLearnedIds}}"
        ) {
            result =
                '{"programId": { "$in": ' + response[1] + ' } ,"deprecated" : false}';
        }

        return escape(result.replace(/'/g, '"'));
    }

    public getStudentProgramsByStatus(...response: any[]) {
        let programIds = [];

        let whereToFind = response[0];
        let whatToFind = response[1];
        let nameOfToFindElement = response[2];
        //console.log(programIds);

        whereToFind.forEach((item, index) => {
            let result = item[nameOfToFindElement] == whatToFind;
            if (result == true) programIds.push(`{"$oid": "${item.programId}"}`);
        });
        // console.log(escape('[' + programIds[0] + ']'));

        if (programIds.length > 0 && programIds.length != 1) {
            return escape("[" + programIds.join(",") + "]");
        } else if (programIds.length == 1) {
            return escape("[" + programIds[0] + "]");
        } else {
            return null;
        }
    }
    public buildFilterByID = (response: string) =>
        JSON.parse(response).map(str => ({ $oid: str }));

    public getStudentProgramsByStatusWithoutId(...response: any[]) {
        let programIds = [];

        let whereToFind = response[0];
        let whatToFind = response[1];
        let nameOfToFindElement = response[2];
        // console.log(programIds);

        whereToFind.forEach((item, index) => {
            let result = item[nameOfToFindElement] == whatToFind;
            if (result == true) programIds.push('"' + item.programId + '"');
        });

        return escape("[" + programIds + "]");
    }

    public generateArrayStudentProgramsStructure(...response: any[]) {
        let studentPrograms = new Array();
        let programs = [];

        if (response[0] != "{{studentmdainCardCreate}}")
            programs = JSON.parse(response[0]);

        let lastUpdate = response[1];
        let requestedBy = response[2];

        programs = programs.constructor == Object ? [programs] : programs;

        programs.forEach(program => {
            let obj = this.generateStudentProgramsStructure(
                program._id.$oid,
                lastUpdate,
                requestedBy
            );
            studentPrograms.push(obj);
        });
        return studentPrograms;
    }
    public generateArrayStudentProgramsStructureIDs(...response: any[]) {
        let studentPrograms = new Array();
        let programs = [];

        if (response[0] != "{{studentmdainCardCreate}}")
            programs = JSON.parse(response[0]);

        let lastUpdate = response[1];
        let requestedBy = response[2];

        programs = programs.constructor == Object ? [programs] : programs;

        programs.forEach(program => {
            let obj = this.generateStudentProgramsStructure(
                program,
                lastUpdate,
                requestedBy
            );
            studentPrograms.push(obj);
        });
        return studentPrograms;
    }
    public generateStudentProgramsStructure(...response: any[]) {
        let obj = {};

        obj["programId"] = response[0];
        obj["status"] = "N";
        obj["lastUpdate"] = response[1];
        obj["requestedBy"] = response[2];
        obj["versionLearned"] = "null";
        obj["lastVersionLearned"] = "null";

        return obj;
    }

    public findInArray(data: any, parameter: any, atribute: any) {
        let result = [];
        //console.log("data.constructor -----> ", data);
        let isObj = data.constructor == Object;
        let isArray = data.constructor == Array;
        //console.log(data.constructor);
        if (isObj) {
            data[atribute].forEach(atributeValue => {
                if (atributeValue == parameter) {
                    let obj = {};
                    obj["name"] = data.name;
                    obj["id"] = data["_id"]["$oid"];
                    result.push(obj);
                }
            });
        } else if (isArray) {
            // console.log('data -----> ', data);
            data.forEach(student => {
                student[atribute].forEach(atributeValue => {
                    if (atributeValue == parameter) {
                        let obj = {};
                        obj["name"] = student.name;
                        obj["id"] = student["_id"]["$oid"];
                        obj["image"] = student["image"]
                            ? student["image"]
                            : "assets/images/franck-v-740555-unsplash.jpg";
                        result.push(obj);
                    }
                });
            });
        }
        //console.log("result -----> ", result);
        return result;
    }
    public findCourses(data: any, parameter: any) {
        // console.log("data -----> ", data);
        // console.log("parameter -----> ", parameter);

        let result = [];

        let isObj = data.constructor == Object;
        let isArray = data.constructor == Array;

        if (isObj) {
            // console.log('data -----> ', data);

            let obj = {};
            obj["name"] = data.name;
            obj["id"] = data["_id"]["$oid"];
            result.push(obj);
        } else if (isArray) {
            // console.log('data -----> ', data);

            data.forEach(element => {
                let obj = {};
                obj["name"] = element.name;
                obj["id"] = element["_id"]["$oid"];
                result.push(obj);
            });
        }
        // console.log('result -----> ', result);
        return result;
    }
    public getParameterByIDFilter(...response: any[]) {
        let programs = response[0];
        let result = [];

        programs.forEach((item, index) => {
            result.push(`{"$oid": "${item}"}`);
        });
        return escape("[" + result.join(",") + "]");
    }

    public findById(obj: any, prop: string, value: any) {
        //Early return
        if (obj[prop] === value) {
            return obj;
        }
        var result, p;
        for (p in obj) {
            if (obj.hasOwnProperty(p) && typeof obj[p] === "object") {
                result = this.findById(obj[p], prop, value);
                if (result) {
                    return result;
                }
            }
        }
        return result;
    }

    public generateInObjectIdFilter(ids: string[]) {
        let inObjectIdFilter = [];
        let idsArray = [];

        try {
            if (typeof ids === "string") {
                idsArray = JSON.parse(ids);
            } else {
                idsArray = ids;
            }
        } catch (e) {
            console.error("Error parsing ids Array -> ", ids);
        }

        idsArray.forEach(item => {
            inObjectIdFilter.push(`{"$oid": "${item['id']}"}`);
        });

        if (inObjectIdFilter.length > 0) {
            return "[" + inObjectIdFilter.join(",") + "]";
        } else {
            return null;
        }
    }
    /**
     * replaceTags
     */
    public replaceTagsChatBot = (
        chatBot_TAG: string,
        studentId: string,
        endPoint: string
    ) =>
        chatBot_TAG.replace("[[id]]", studentId).replace(/{{ChatBot}}/g, endPoint);

    /**
     * filterDataToTagObject
     */
    public filterDataToTagObject = (data: any, ids: any) => {
        let result = [];
        if (ids.constructor == Array) {
            ids.forEach(element => {
                result.push(
                    data._embedded
                        .filter(obj => obj["_id"]["$oid"] == element)
                        .map(obj => obj["name"])
                );
            });
            // console.log("1----> ", result);
            return result.join(" , ");
        } else {
            // console.log("ids---> ", ids);
            // console.log("obj---> ", data);

            result.push(
                data._embedded
                    .filter(obj => obj["_id"]["$oid"] == ids)
                    .map(obj => obj["name"])
            );
            // console.log("2---> ", result);
            return result[0];
        }
    };

    /**
     * objToTupleList
     */
    public objToTupleList = (data: any) => {
        if (data.constructor != Array) data = [data];
        let result = [];
        data.forEach((element, index) => {
            let obj = {};
            obj["key"] = index;
            obj["value"] = element;
            result.push(obj);
        });
        return result;
    };
    public tupleListTobj = (data: any) => {
        data = JSON.parse(data);
        let result = [];
        data.forEach(element => {
            result.push(element["value"]);
        });
        return result;
    };

    public getEntityProp = (
        locationConfig: any,
        objParentName: string,
        propertyName?: string
    ) => {
        let resultObj;
        try {
            resultObj = JSON.parse(locationConfig)["entities"][objParentName];
            if (propertyName) {
                resultObj = resultObj[propertyName];
            }
        } catch (error) {
            console.error("Can not find propertie entities.");
        }
        return resultObj;
    };
    public createStudentObj(
        id: string,
        name: string,
        status: string,
        gender: string,
        language: string,
        course: string[],
        imageUri = "/assets/images/franck-v-740555-unsplash.jpg"
    ) {
        return {
            id: id,
            name: name,
            status: status,
            gender: gender,
            language: language,
            course: course,
            imageUri: imageUri,
            entity: "students"
        };
    }

    public createProgramObj(
        id: string,
        name: string,
        status: string,
        language: string,
        categories: string[],
        imageUri = "/assets/images/franck-v-740555-unsplash.jpg"
    ) {
        return {
            id: id,
            name: name,
            status: status,
            language: language,
            tags: categories,
            imageUri: imageUri,
            entity: "programs"
        };
    }

    public getCurrentVersion() {
        console.log('test------------------->getCurrentVersion');
        let currentVersion = sessionStorage.getItem(this.CURRENT_VERSION);
        if (!currentVersion) currentVersion = this.updateCurrentVersion();

        return currentVersion;
    }

    private updateCurrentVersion(newVersion?: string) {
        const currentVersion: string = newVersion || Math.random().toString();
        sessionStorage.setItem(this.CURRENT_VERSION, currentVersion);

        return currentVersion;
    }

    public generateTrainingPhrasesList(trainingPhrases: any, programCode: string = '') {
        const trainingPhrasesListResult: object[] = [];
        try {
            const entityNamePrefix = programCode ? '@' + programCode + '_' : '';
            const trainingPhrasesInputAsObj = typeof trainingPhrases === 'string' ? JSON.parse(trainingPhrases) : trainingPhrases;
            trainingPhrasesInputAsObj.forEach(el => {
                if (!el['trainingPhrase']) {
                    return;
                }
                trainingPhrasesListResult.push(this.generateTrainingPhraseObject(el['trainingPhrase'], entityNamePrefix));
            });

        } catch (err) {
            return console.error('generateTrainingPhrasesList - trainingPhrases:', trainingPhrases);
        }

        return trainingPhrasesListResult;
    }


    public generateTrainingPhraseObject(text: string, entityNamePrefix: string = '') {
        const partsObject = this.divideTextInParts(text, entityNamePrefix);

        return {
            type: "EXAMPLE",
            parts: partsObject,
            timesAddedCount: 2
        };
    }

    public divideTextInParts(text: string, entityNamePrefix: string = '') {
        let startIdx = 0;
        let entityIdx: number;
        const parts: object[] = [];

        const matchEntities = this.extractEntities(text);
        matchEntities.forEach(entity => {
            entityIdx = text.indexOf(entity, startIdx);
            if (startIdx < entityIdx) {
                parts.push(this.createTextPart(text.substring(startIdx, entityIdx)));
            }

            parts.push(this.createEntityPart(entity, entityNamePrefix));
            startIdx = entityIdx + entity.length;
        });

        if (startIdx < text.length - 1) {
            parts.push(this.createTextPart(text.substring(startIdx)));
        }

        return parts;
    }

    private _regexIndexOf(text: string, regex, start = 0) {
        const indexInSuffix = text.slice(start).search(regex);
        return indexInSuffix < 0 ? indexInSuffix : indexInSuffix + start;
    }

    public extractEntities(text: string) {
        return text.match(/\`[^`]+\`/g) || [];
    }

    public regexIndexOf(text: string, regex, start = 0) {
        const indexInSuffix = text.slice(start).search(regex);
        return indexInSuffix < 0 ? indexInSuffix : indexInSuffix + start;
    }

    public formatTrainingPhrase(parts: string[]) {
        const VARIABLE_ENTITY_START = '`';
        const VARIABLE_ENTITY_END = '`';
        const VARIABLE_ENTITY_SEPARATOR = ' | ';
        if (!parts) {
            return parts;
        }

        return parts.map(elem =>
            elem['entityType'] ? (
                VARIABLE_ENTITY_START +
                elem['text'] +
                VARIABLE_ENTITY_SEPARATOR +
                this.getDisplayNameFormated(elem['entityType'], '_') +
                VARIABLE_ENTITY_END
            ) : elem['text']).join('');
    }

    private createTextPart(partText: string) {
        return {
            'text': partText
        }
    }

    private createEntityPart(partText: string, entityNamePrefix: string = '') {
        const VARIABLE_ENTITY_START = '`';
        const VARIABLE_ENTITY_END = '`';
        const VARIABLE_ENTITY_SEPARATOR = ' | ';
        const begin: number = partText.indexOf(VARIABLE_ENTITY_START);
        const end: number = partText.indexOf(VARIABLE_ENTITY_END, begin + 1);

        const value = (begin >= 0 && end > begin + 1) ? partText.substring(begin + 1, end) : partText;
        let variable;
        let entity;
        if (value.indexOf(VARIABLE_ENTITY_SEPARATOR) !== -1) {
            [variable, entity] = value.split(VARIABLE_ENTITY_SEPARATOR);
        }

        return {
            'text': variable || value,
            'alias': variable || value,
            'entityType': (entity && !this._isSystemEntity(entity) ? entityNamePrefix + entity : entity) || value
        };
    }

    private _isSystemEntity(entityName: string) {
        const systemEntityPrefix = '@sys.';
        return entityName.indexOf(systemEntityPrefix) === 0;
    }

    public generateSynonymsList(valuesWithSyn: any) {

        let valuesWithSynObj: object[];
        let entitiesResult: object[] = []
        try {
            valuesWithSynObj = (typeof valuesWithSyn === 'string') ? JSON.parse(valuesWithSyn) : valuesWithSyn;
            valuesWithSynObj.forEach((entity) => {
                let entityObj: object = {
                    value: entity['entityValue'],
                    synonyms: entity['synonyms'].map(elem => elem['value'])
                };

                entitiesResult.push(entityObj);
            });

        } catch (err) {
            return console.error('generateTrainingPhrasesList - trainingPhrases:', valuesWithSyn);
        }

        return entitiesResult;
    }


    /////////////////////////////////////////////////////
    /////////// BILLING
    /////////////////////////////////////////////////////

    public getPlanPrice(amount: number, interval: string = "") {

        if (amount == 0) {
            return "FREE";
        }

        let price: any = amount / 100;
        price = price.toFixed() + '€';

        if (interval) {
            return price + "/" + interval;
        }

        return price;
    }

    public formatPrice(amount: number) {

        let price: any = amount / 100;
        price = price.toFixed() + '€';

        return price;
    }

    public getPlanDescription(plan: string) {
        //TODO: passar a usa meta data do stripe quando a tivermos
        let description: string = '<div class="plan-description"><div style="clear:none; float:left;">100 dialogs month</div><div>1€ each extra dialog</div></div>';

        return description;
    }

    public formatPlanList(planList: any, currentPlan?:any) {

        console.info("formatPlanList: ");
        console.info(currentPlan);

        let finalList = [];

        let minRank = 0;
        let maxRank = 9999999;
        if(currentPlan){
            currentPlan = currentPlan.value;
            minRank = 1;
            if(eval(currentPlan.details.canDowngrade) === false){
                minRank = +currentPlan.details.rank + 1;
            }

            if(eval(currentPlan.details.canUpgrade) === false){
                maxRank = +currentPlan.details.rank - 1;
            }
        }

        console.info("minRank");
        console.info(minRank);
        console.info("maxRank");
        console.info(maxRank);
        

        planList.forEach(function (plan) {

            plan.btnText = "Go to production";
            plan.btnMockToLoad = "billing/go-to-prod-wiz";
            plan.freeSubscription = false;
            plan.paySubscription = false;
            plan.canSubscribe = false;


            if (eval(plan.details.visible) && plan.details.rank >= minRank && plan.details.rank <= maxRank) {
                console.info("plan");
                
                console.info(plan);
                if (!eval(plan.details.canSubscribe)) {
                    plan.price = "Contact Us";
                    plan.details.units = "Contact Us";
                    plan.btnMockToLoad = "contacts";
                    plan.btnText = "Contact Us";
                    
                } else {
                    plan.canSubscribe = true;
                    //set Price label
                    if (plan.amount == 0) {
                        plan.price = "FREE";
                        plan.btnMockToLoad = "billing/go-to-prod-free-wiz";
                        plan.freeSubscription = true;
    
                    } else {
                        let price: any = plan.amount / 100;
                        price = price.toFixed() + '€';
                        plan.paySubscription = true;
                        if (plan.interval) {
                            plan.price = price + "/" + plan.interval;
                        } else {
                            plan.price = price;
                        }
                    }
    
                    
                }
                finalList.push(plan);
            }

        });

        finalList.sort((a, b) => (a.rank > b.rank) ? 1 : -1);
        [finalList[finalList.length - 1], finalList[finalList.length - 2]] =
            [finalList[finalList.length - 2], finalList[finalList.length - 1]];

        console.info(finalList);
        
        return finalList;
    }

    public getAnalyticsKey(ixsId: string, studentId: string) {

        let key = "^" + ixsId + "\\|" + studentId + "\\|[^\\|]*\\|[^!fallbackIntent]";
        //let key = "^" + ixsId.replace(/\./g, "\\.") + "\\|" + studentId + ".*";
        //key = key.replace(/\./g, "\\.").replace(/\\/g, "\\\\");
        key = key.replace(/\\/g, "\\\\");

        return key;
    }

    public utcToLocalTimezone(date: string){
        let changedDate = moment(date).set({hour:0,minute:0,second:0,millisecond:0}).format();

        return changedDate;

    }



    public formatAnalyticsAggregations(data: any, startDate: string, endDate: string) {

         data = this.forceArray(data);
        //o webct desformata o endDate. não da para usar o todayDate() nos mocks
        //let dates = this.explodeDates(moment(startDate), moment(endDate));
        let dates = this.explodeDates(moment(startDate), moment().set({hour:23,minute:59,second:59,millisecond:999}));
        dates.forEach(function (date) {

            let temp = data.find(obj => moment(obj._id).clone().format("DD/MM/YYYY") === date._id);
            
            if (temp) {
                date.hits_count = temp.hits_count;
            }
        }); 

        return dates;
    }

    public todayDate() {
        return moment().toISOString();
    }


    private explodeDates(startDate: any, endDate: any) {
 
        var now = startDate.clone(), dates = [];

        while (now.isSameOrBefore(endDate)) {
            dates.push({ _id: now.clone().format('DD/MM/YYYY'), hits_count: 0 });
            now.add(1, 'days');
        }
        return dates;
    };

    public updatePageParameterWithDelay(obj: JsonParams) {
        setTimeout(function () {
            obj.refresh()

        }, 3000);
    }
    /////////////////////////////////////////////////////
    /////////// END BILLING
    /////////////////////////////////////////////////////

    public courseStudentJoin(students: any, courses: any): any {

        if (students.constructor != Array) students = [students];
        if (courses.constructor != Array) courses = [courses];


        console.log('students -----> ', students);
        courses.forEach(course => {
            course.BO_studentInfo = students.find(
                obj => obj["courses"][0] == course["_id"]["$oid"]
            );
        });
        console.log('courses -----> ', courses);
        return courses;
    }

    /////////////////////////////////////////////////////
    /////////// DIALOG DESIGNER
    /////////////////////////////////////////////////////

    /**
     * Mapeia, caso necessário, um array de valores no formato válido das "Input/Output Variables".
     * @param variables é um array de valores do tipo string ou objecto
     */
    public formatShapeApiInputVariables = (variables: any[]): any[] =>
        this.forceArray(variables).map(data =>
            typeof data == "string"
                ? new Object({ inputValue: data, variable: "" })
                : data
        );
    public formatShapeApiOutputVariables = (variables: any[]): any[] => this.forceArray(variables).map(data => typeof data == "string" ? new Object({ variableName: data, path: "" }) : data)

    /**
     * Formata as "outputVariables", caso existam, para apresentar na configuração da API
     * @param outputVariables "outputVariables" do programa
     */
    public findOutputVariables = (outputVariables: any) => outputVariables ? this.formatShapeApiOutputVariables(outputVariables) : new Array();

    /**
     * Mapeia para um array de objectos um novo array a partir do atrubito recebido
     * @param arr será o array a ser mapeado
     * @param attr será o atributo que queremos guardar
     */
    public mapOutputVariables = (arr: any[]) => arr.map(obj => {

        let path = obj.path;
        if (obj.pathType == 'boolean' || (obj.pathType == 'number' && !isNaN(+obj.path))) {
            try {
                path = JSON.parse(obj.path);
            } catch (e) { }
        } else
            path = obj.pathType == 'reset' ? '' : obj.pathType == 'null' ? null : path;

        return new Object({ ...obj, path, variableName: obj.variableName ? obj.variableName.id : '' });
    });

    /**
     * Identifica o tipo de valor que está a ser colocado no setVariables
     * @param value é o valor introduzido na textbox
     */
    public getPathType = (value: string) => value && value.indexOf('{{') === 0 ? undefined : !value ? 'reset' : value == 'true' || value == 'false' ? 'boolean' : !isNaN(+value) ? 'number' : 'string';

    /**
     * Avalia o tipo de valor que foi guardado ou verifica qual o tipo a aplicar
     * @param path tipo de valor
     * @param value valor
     */
    public evaluatePathType = (path: any, value: any) => path || this.getPathType(value);

    /**
     * Formata uma listagem de valores do ng-select em duas linhas
     * @param list é o array de valores
     */
    public formatValueListTwoLines(list: any) {
        list = list.constructor !== Array ? new Array(list) : list;
        list.forEach(obj => {
            obj.value = `${obj.data.line1 || ""}<br /><font size="2">${obj.data.line2 || ""}</font>`;
        });
        return list;
    }

    /**
     * Filtra os resultados das intents - devolve apenas os que ainda não estão em uso
     * @param intents é a listagem de intents disponíveis
     * @param intentsInUse é o array de intents que já estão a ser usadas
     */
    public disabledIntentsInUse = (selected: string, intents: any[] = new Array(), intentsInUse: string[] = new Array()) => {
        intents = this.forceArray(intents);
        return intents.length == 0 || intentsInUse.length == 0 ? intents : intents.filter(obj => obj.key == selected || intentsInUse.indexOf(obj.key) < 0)
    };

    /**
     * Altera as variáveis do programa para o formato conhecido pelo componente "custom-mentions" (key, value)
     * @param list é a listagem de variáveis
     */
    public mentionsComponentFormat = (list: any[]): any[] => list ? this.formatValueList(this.forceArray(list).map(obj => typeof obj == 'string' ? obj : (obj.displayName || obj.entity)), '', '') : new Array();

    /**
     * Percorre um objecto e cria um array de strings com todas as possibilidades de caminhos que podem ser percorridos
     */
    public createApiPathOptions(variables: any, designerFlowConfig?: JsonParams) {

        let arr: any[] = new Array();
        let context: any[] = new Array();

        if (variables)
            for (let i in variables)
                context.push(new Object({ key: variables[i], value: i }));

        if (designerFlowConfig && designerFlowConfig.value.variables)
            arr = this.mentionsComponentFormat(designerFlowConfig.value.variables);

        return arr.concat(context);
    }

    /**
     * Cria a estrutura das Actions para o BE
     * @param data é a configuração da resposta
     */
    public createAcions(data: string): any {

        if (!data)
            return new Array();

        let form = JSON.parse(data);
        let actions = new Object();
        form.forEach(response => {

            let channelParam = response.find(obj => obj.key == 'channel');
            let renderingParam = response.filter(obj => obj.key == 'rendering' || obj.key == 'action');

            if (!channelParam || !channelParam.value || renderingParam.length == 0)
                return;

            let renderings = new Array();
            renderingParam.map(obj => obj.parameters).forEach(param => {
                renderings = renderings.concat(param.filter(obj => obj.key == 'chatAnswer' || obj.key == 'chatAction'));
            });

            channelParam.value.map(obj => obj.id).forEach(channel => {
                actions[channel] = renderings.map(param => {
                    delete param.dynamicProps;
                    return param.key == 'chatAction' ? new Object({ name: param.value.name, data: this._formatActions(param.value.data) }) : { name: 'rendering', data: param };
                });
            });
        });

        return actions;
    }
    /**
     * Formata o array de actions actions para o formato pretendido
     * @param actions é o array de actions
     */
    private _formatActions = (actions: any[]) => actions.reduce((acc, item) => (acc[item.key] = item.value, acc), {});

    /**
     * Formata o nome da Shape para apresentar o Program e a Shape seleccionadas
     * @param program é o nome do Program
     * @param shape é o nome da Shape
     */
    public programShapeName = (program: string, shape: string) => program + '<br /><small>' + shape + '</small>';

    /////////////////////////////////////////////////////
    /////////// DIALOG DESIGNER
    /////////////////////////////////////////////////////

    public clog(data) {
        console.log('clog ---> ', data);
        return data;
    }

    /**
     * generateUrlWithParams
     * @param url é o url da API sem parameters
     * @param params são os parameters em formado te array de objectos vindos do tupleList
     */
    public generateUrlWithParams(url: string, params: any) {
        params = JSON.parse(params).filter(obj => Object.entries(obj).length !== 0);
        let result = url;

        if (!url.includes("{{") && params.length >= 1 && Object.keys(params[0]).length >= 1) {

            params.forEach((param, index) => {
                if (param[Object.keys(param)[0]] != undefined && param[Object.keys(param)[1]] != undefined) {
                    if (index == 0) {
                        url = url + "?" + param[Object.keys(param)[0]] + "=" + param[Object.keys(param)[1]];
                    } else {
                        url = url + "&" + param[Object.keys(param)[0]] + "=" + param[Object.keys(param)[1]];
                    }
                }
            });

        }

        return url;
    }
    /**
       * tupleLineCounter
       */
    public tupleLineCounter(array: any) {
        let counter = 0;
        if (array.includes("{{")) {
            return "";
        }
        else {
            array = JSON.parse(array).filter(obj => Object.entries(obj).length !== 0);
            if (array.length >= 1 && Object.keys(array[0]).length >= 1) {
                array.forEach((obj, index) => {
                    if (obj[Object.keys(obj)[0]] != undefined && obj[Object.keys(obj)[1]] != undefined) {
                        counter++;
                    }
                });
            }
        }
        return counter.toString();
    }
    /**
       * tupleLineCounter
       * Passar de array de objecto para objecto com multiplos key->value
       * Ex: [{"Key":"header","Value":"value"},{"Key":"header2","Value":"${dynvalue}"}] ---> {"header" :"value" , "header2":"${dynvalue}"}
       */
    public arrayObjToObject(array: any) {
        let result = {};
        array = JSON.parse(array);
        array.forEach(element => {
            let aux = {};
            let key_obj = element[Object.keys(element)[0]];
            let value_obj = element[Object.keys(element)[1]];
            aux[key_obj] = value_obj;
            Object.assign(result, aux);
        });

        return result;
    }

    public getUrlFromUrlNoParameters(url: any) {

        let result = "";
        if (url && url.indexOf("?") != -1) {
            result = url.slice(0, url.indexOf("?"));
        } else {
            result = url;
        }
        return result;
    }


    /*Transform object into array of entries*/
    public valueEntriesFormat(object: any) {
        const arrayAux: any = new Array();
        try {
            if (typeof object == "string")
                object = JSON.parse(object);

            for (let key1 in object) {
                arrayAux.push({ "key": key1, "value": object[key1] })
            }
        } catch (error) {
            console.error(`valueEntriesFormat - param object:${object}.`, error);
        }

        return arrayAux;
    }

    public getDisplayNameFormated(displayName: string, beginCharacters?: string) {
        if (!displayName || !beginCharacters) {
            return displayName;
        }

        const refIdx = displayName.indexOf(beginCharacters);
        if (refIdx !== -1 && refIdx < displayName.length) {
            return displayName.substr(refIdx + beginCharacters.length);
        }
        return displayName;
    }

    /**
     * positionMapObj
     * Criar um objeto position com as propriedades, zoom , lat , long para o component Map
     */
    public positionMapObj = (zoom: any, lat: any, long: any): any => new Object({ zoom: zoom, lat: lat, long: long });

    /**
     * createPathToValueFromString
     * cria um PathToValue valido apartir de uma string "result.abc" etc.
     */
    public createPathToValueFromString = (string: string) => string ? string.split('.') : new Array();

}
