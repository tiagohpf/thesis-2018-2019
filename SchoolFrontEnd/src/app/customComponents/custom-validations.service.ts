import { AbstractControl } from '@angular/forms';

import { PageCustomValidatorService } from 'foundations-webct-robot/robot/pageComponent/page-custom-validations.service';
import { Validator, ValidatorDefs } from 'foundations-webct-robot/robot/classes/validator.class';
import { JsonParams } from 'foundations-webct-robot/robot/classes/jsonParams.class';
import { FormControl } from '@angular/forms/src/model';

export class ClientCustomValidatorService extends PageCustomValidatorService {

  private _questionPositions: Object = new Object;

  public customValidator(parameter: JsonParams, fnName: string, parametersWidthData: JsonParams[]) {

    return (control: AbstractControl): { [key: string]: any } => {
      switch (fnName) {
        case 'function1-name-here':
          return parameter.id == 'customerTeste1' && control.value != 'condition1' ? { [fnName]: true } : null;
        case 'function2-name-here':
          return parameter.id == 'customerTeste2' && control.value != 'condition2' ? { [fnName]: true } : null;
        case 'validateQuestionMarkers':
          return this._validateQuestionMarkers(parameter, parametersWidthData, fnName);
        case 'validateQuestionMarkersRepeat':
          return this._validateQuestionMarkersRepeat(parameter, parametersWidthData, fnName);
        case 'validateCharLimit3':
          return this._validateCharLimit(parameter, 3, fnName);
        case 'validateCharLimit20':
          return this._validateCharLimit(parameter, 20, fnName);
        case 'validateCharLimit50':
          return this._validateCharLimit(parameter, 50, fnName);
        case 'validateCharLimit200':
          return this._validateCharLimit(parameter, 200, fnName);
        case 'validateCharLowerLimit30':
          return this._validateCharLimit(parameter, 30, fnName, true);
        case 'preventShapeUniqName':
          return this._preventShapeUniqName(control, fnName, parametersWidthData);
        default:
          return null;
      }
    };
  }

  private _preventShapeUniqName(control: AbstractControl, fnName: string, parametersWidthData: JsonParams[]) {

    let shapesNamesInUse = parametersWidthData.find(obj => obj.key == 'shapesNamesInUse');
    if (!shapesNamesInUse || !shapesNamesInUse.value || shapesNamesInUse.value.length == 0)
      return null;

    return shapesNamesInUse.value.indexOf(control.value) >= 0 ? { [fnName]: true } : null;
  }

  private _validateQuestionMarkers(parameter: JsonParams, parametersWidthData: JsonParams[], fnName: string): { [key: string]: any } {

    if (!parameter.value) {
      if (this._questionPositions[parameter.id])
        delete this._questionPositions[parameter.id];
      return null;
    }

    let questionParam = parametersWidthData.find(obj => obj.id == 'question');
    if (!questionParam) {
      console.error('_validateQuestionAction() -> No question parameter found!');
      return null;
    }
    if (!questionParam.value) {
      return null
    };

    let start = questionParam.value.toLowerCase().indexOf(parameter.value.toLowerCase());
    if (!questionParam.value || (questionParam.value && start >= 0)) {
      this._questionPositions[parameter.id] = {
        start: start,
        end: questionParam.value.indexOf(parameter.value) + parameter.value.length
      };
      return null;
    }

    return { [fnName]: true };
  }

  private _validateQuestionMarkersRepeat(parameter: JsonParams, parametersWidthData: JsonParams[], fnName: string): { [key: string]: any } {

    if (!parameter.value)
      return null;

    let question = parametersWidthData.find(obj => obj.id == 'question');
    if (!question.value)
      return null;

    let action = parametersWidthData.find(obj => obj.id == 'actionInQuestion');
    let subject = parametersWidthData.find(obj => obj.id == 'subjectInQuestion');
    let subSubject = parametersWidthData.find(obj => obj.id == 'subSubjectInQuestion');
    if (!question || !action || !subject || !subSubject) {
      console.error('_validateQuestionMarkersRepeat() -> Parameters missing found!');
      return null;
    }


    let myPosition = this._questionPositions[parameter.id];

    // let startMerge = positions.find(obj => obj['end'] >= myPosition['start'] && obj['id'] != myPosition['id']);
    // let endMerge = positions.find(obj => obj['start'] <= myPosition['end'] && obj['id'] != myPosition['id']);

    for (let i in this._questionPositions) {

      if (!myPosition || i == parameter.id)
        continue;

      let pos = this._questionPositions[i];

      if (myPosition['start'] < pos['end'] && myPosition['start'] >= pos['start']) {
        return { [fnName]: true };
      } else if (myPosition['start'] < pos['end'] && myPosition['start'] < pos['start']) {
        if (myPosition['end'] >= pos['start'])
          return { [fnName]: true };
      }

    }


    // if (startMerge || endMerge)
    //   return { [fnName]: true };


    // console.log('myPosition ---> ', myPosition);


    // let fieldsPosition: JsonParams[] = [action, subject, subSubject];

    // console.log('this._questionPositions ---> ', this._questionPositions);

    // for (let obj of fieldsPosition) {
    //   if (obj.id == parameter.id || !obj.value)
    //     continue;

    //   let objStringEnd = question.value.indexOf(obj.value) + obj.value.length;

    //   let paramStringStart = question.value.indexOf(parameter.value);

    //   console.log('--------------------> ');
    //   console.log('obj.id ---> ', obj.id);
    //   console.log('objStringEnd ---> ', objStringEnd);
    //   console.log('paramStringStart ---> ', paramStringStart);

    //   if (objStringEnd > paramStringStart)
    //     return { [fnName]: true };

    // }

    return null;
  }

  private _validateCharLimit(parameter: JsonParams, limit: number, fnName: string, lowerLimit = false): { [key: string]: any } {
    if (!parameter.value || typeof parameter.value !== 'string')
      return null;

    if (lowerLimit) {
      if (parameter.value.length < limit) {
        return { [fnName]: true };
      } else {
        return null;
      }
    } else {
      if (parameter.value.length > limit) {
        return { [fnName]: true };
      } else {
        return null;
      }
    }
  }

}
