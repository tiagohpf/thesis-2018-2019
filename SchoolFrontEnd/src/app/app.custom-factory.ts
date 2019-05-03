/**
 * CUSTOM VALIDATIONS
 */
import { PageCustomValidatorService } from 'foundations-webct-robot/robot/pageComponent/page-custom-validations.service';
import { ClientCustomValidatorService } from './customComponents/custom-validations.service';

/**
 * CUSTOM FUNCTIONS
 */
import { UtilsCustomService } from 'foundations-webct-robot/robot/utils/utils-webct-methods.service';
import { UtilsCustomLocalService } from './customComponents/custom-utils.service';

/**
 * CUSTOM VALIDATIONS
 */
export let ClientCustomValidatorProvider = {
  provide: PageCustomValidatorService,
  useFactory: clientCustomValidatorFactory
};

export function clientCustomValidatorFactory() {
  return new ClientCustomValidatorService();
}

/**
 * CUSTOM FUNCTIONS
 */
export let ClientCustomUtilsProvider = {
  provide: UtilsCustomService,
  useFactory: clientCustomUtilsFactory
};

export function clientCustomUtilsFactory() {
  return new UtilsCustomLocalService();
}
