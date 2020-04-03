import * as moment from 'moment';
import { IProviderOptions } from './provider';

export type ViewString = 'decade' | 'year' | 'month' | 'day' | 'hour' | 'minute';

export type Value = string | number;

export type Position = 'top left' | 'top right' | 'bottom left' | 'bottom right';

export interface IDirectiveScope extends ng.IScope {
	value?: Value;
	model?: moment.Moment;
	locale?: string;
	format?: string;
	minView?: ViewString;
	maxView?: ViewString;
	startView?: ViewString;
	minDate?: Value;
	maxDate?: Value;
	startDate?: Value;
	disabled?: boolean;
	position?: Position;
	inline?: boolean;
	validate?: boolean;
	autoclose?: boolean;
	setOnSelect?: boolean;
	isOpen?: boolean;
	today?: boolean;
	keyboard?: boolean;
	additions?: {
		top?: string;
		bottom?: string
	};
	getToday?: () => Date | moment.Moment;
	change?: (context: any) => boolean;
	selectable?: (context: any) => boolean;
}

export interface IUtility {
	isValidMoment: (value: any) => boolean;
	toValue: (date: any) => Value;
	toMoment: (date: any) => moment.Moment;
	momentToValue: (momentObject: moment.Moment) => Value;
	valueToMoment: (formattedValue: Value) => moment.Moment;
	setValue: (value: any) => void;
}

export interface IViewItem {
	index: number;
	label: string;
	ariaLabel: string;
	year?: number;
	month?: number;
	date?: number;
	hour?: number;
	minute?: number;
	second?: number;
	class: string;
	selectable: boolean;
}

export interface IView {
	perLine: number;
	headers?: string[];
	rows: IViewItem[][];
	render(elRef): string; // return view title
	set(value: IViewItem): void;
	highlightClosest?(): void;
}

export interface IViewHeaderButton {
	selectable: boolean;
	label: string;
	set: () => void;
}

export interface IDirectiveScopeInternal extends IDirectiveScope, IProviderOptions {
	ariaUnselectableMessage: string;
	ariaDefaultNextButtonPeriod: string;
	ariaDefaultPreviousButtonPeriod: string;
	ariaDefaultParentButtonTitle: string;
	ariaNextButtonTitleDecadePeriod: string;
	ariaPreviousButtonTitleDecadePeriod: string;
	ariaParentButtonTitleDecadePeriod: string;
	ariaNextButtonTitleYearPeriod: string;
	ariaPreviousButtonTitleYearPeriod: string;
	ariaParentButtonTitleYearPeriod: string;
	ariaNextButtonTitleMonthPeriod: string;
	ariaPreviousButtonTitleMonthPeriod: string;
	ariaParentButtonTitleMonthPeriod: string;
	onAfterRender: () => void;
	getToday: () => Date | moment.Moment;
	focusCurrentlyHighlighted: () => void;
	elementToFocusOnClose: JQuery<HTMLElement>;
	elementToOpenCalendar: JQuery<HTMLElement>;
	// utilities
	limits: {
		minDate: moment.Moment;
		maxDate: moment.Moment;
	};

	// views
	views: {
		formats: { [viewString: string]: string };

		// specific view controllers
		decade: IView;
		year: IView;
		month: IView;
		day: IView;
		hour: IView;
		minute: IView;
	};

	// current view
	view: {
		moment: moment.Moment;
		value: Value;
		isOpen: boolean;
		selected: ViewString;
		update: () => void;
		toggle: () => void;
		open: () => void;
		close: (implicit?: boolean) => void;

		// utility
		unit: () => number;
		precision: () => moment.unitOfTime.DurationConstructor;

		// header
		title: string;
		previous: IViewHeaderButton;
		next: IViewHeaderButton;
		setParentView: () => void;

		// body
		render: () => void;
		change: (view?: ViewString) => void;
	};

	// limits detection
	detectedMinView: ViewString;
	detectedMaxView: ViewString;

	// elements
	picker: JQuery<Element>;
	container: JQuery<HTMLElement>;
	input: JQuery<HTMLElement>;
	componentRef: JQuery<HTMLElement>;
}

export interface IModelValidators extends ng.IModelValidators {
	minDate: (modelValue: moment.Moment, viewValue: string) => boolean;
	maxDate: (modelValue: moment.Moment, viewValue: string) => boolean;
}

export interface IModelController extends ng.INgModelController {
	$validators: IModelValidators;
	$modelValue: moment.Moment;
	$viewValue: string;
}
