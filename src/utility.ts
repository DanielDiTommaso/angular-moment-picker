import {forEach} from 'lodash';
import * as moment from 'moment';
import { Value, ViewString } from './definitions';
import {all, precisions} from './constants';

export const KEYS = { up: 38, down: 40, left: 37, right: 39, escape: 27, enter: 13, tab: 9, space: 32 };

export const isValidMoment = (value: moment.Moment | Value): boolean => {
	return moment.isMoment(value) && value.isValid();
};

export const toValue = (date: moment.Moment | Value, format: string, locale: string): Value => {
	let momentDate = <moment.Moment>date;
	if (!isValidMoment(date)) momentDate = toMoment(date, format, locale);
	return momentToValue(momentDate, format);
};

export const toMoment = (date: moment.Moment | Value, format: string, locale: string): moment.Moment => {
	let momentDate = moment(date, format, locale);
	if (!isValidMoment(momentDate)) momentDate = undefined;
	return momentDate;
};

export const momentToValue = (momentObject: moment.Moment, format: string): Value => {
	if (!isValidMoment(momentObject)) return undefined;
	return !format ? momentObject.valueOf() : momentObject.format(format);
};

export const valueToMoment = (formattedValue: Value): moment.Moment => {
	let momentValue: moment.Moment;
	if (!formattedValue) return momentValue;
	if (!this.format) momentValue = moment(formattedValue);
	else momentValue = moment(formattedValue, this.format, this.locale);
	if (this.model) {
		// set value for each view precision (from Decade View to minView)
		const views = all.slice(0, all.indexOf(this.detectedMinView));
		forEach(views, (view: ViewString) => {
			const precision = precisions[view];
			momentValue[precision](this.model[precision]());
		});
	}
	return momentValue;
};

export const setValue = (value: moment.Moment | Value, callback): void => {
	let modelValue = isValidMoment(value) ? (<moment.Moment>value).clone() : valueToMoment.apply(this, [<Value>value]),
		viewValue = momentToValue(modelValue, this.format);
	this.model = updateMoment(this.model, modelValue);
	callback(viewValue, modelValue);
};

export const updateMoment = (model: moment.Moment, value: moment.Moment): moment.Moment => {
	if (!isValidMoment(model) || !value) model = value;
	else {
		if (!model.isSame(value)) {
			// set value for each view precision (from Decade View to maxView)
			const views = all.slice(0, all.indexOf(this.detectedMaxView) + 1);
			forEach(views, (view: ViewString) => {
				const precision = precisions[view];
				model[precision](value[precision]());
			});
		}
	}
	return model;
};

export const defaultGetToday = (): Date => {
	return new Date();
};
