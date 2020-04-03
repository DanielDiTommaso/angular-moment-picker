import * as angular from 'angular';
import Provider, { IProviderOptions } from './provider';
import Directive from './directive';

angular
	.module('moment-picker', [])
	.provider('momentPicker', [() => new Provider()])
	.directive('momentPicker', ['momentPicker', (momentPicker: IProviderOptions) => {
			return new Directive(momentPicker);
		}
	]);

export { Provider, Directive };
