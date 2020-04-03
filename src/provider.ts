import {assignIn, cloneDeep} from 'lodash';
import { ViewString, Position } from './definitions';

export interface IProviderOptions {
	locale?: string;
	format?: string;
	ariaDialogTitle?: string;
	ariaParentButtonTitle?: string;
	ariaPreviousButtonTitle?: string;
	ariaNextButtonTitle?: string;
	ariaYearLabelFormat?: string;
	ariaMonthLabelFormat?: string;
	ariaDayLabelFormat?: string;
	ariaHourLabelFormat?: string;
	ariaMinuteLabelFormat?: string;
	ariaSecondLabelFormat?: string;
	minView?: ViewString;
	maxView?: ViewString;
	startView?: ViewString;
	position?: Position;
	inline?: boolean;
	validate?: boolean;
	autoclose?: boolean;
	setOnSelect?: boolean;
	today?: boolean;
	keyboard?: boolean;
	showHeader?: boolean;
	leftArrow?: string;
	rightArrow?: string;

	// Decade View
	yearsFormat?: string;

	// Year View
	monthsFormat?: string;

	// Month View
	daysFormat?: string;

	// Day View
	hoursFormat?: string;
	hoursStart?: number;
	hoursEnd?: number;

	// Hour View
	minutesFormat?: string;
	minutesStep?: number;
	minutesStart?: number;
	minutesEnd?: number;

	// Minute View
	secondsFormat?: string;
	secondsStep?: number;
	secondsStart?: number;
	secondsEnd?: number;
}

export default class Provider {
	private settings: IProviderOptions = <IProviderOptions>{
		locale: 'en',
		format: 'L LTS',
		ariaDialogTitle: 'Date Picker',
		ariaDefaultParentButtonTitle: 'Parent view',
		ariaParentButtonTitleMonthPeriod: 'Month selector expanded. Use arrow keys to change months. Use ENTER to select date',
		ariaParentButtonTitleYearPeriod: 'Year selector expanded. Use arrow keys to change years. Use ENTER to select month',
		ariaParentButtonTitleDecadePeriod: 'Decade selector expanded. Use arrow keys to change year. Use ENTER to select year',
		ariaDefaultPreviousButtonPeriod: 'Previous period',
		ariaDefaultNextButtonPeriod: 'Next period',
		ariaPreviousButtonTitleMonthPeriod: 'Previous month',
		ariaPreviousButtonTitleYearPeriod: 'Previous year',
		ariaPreviousButtonTitleDecadePeriod: 'Previous decade',
		ariaNextButtonTitleMonthPeriod: 'Next month',
		ariaNextButtonTitleYearPeriod: 'Next year',
		ariaNextButtonTitleDecadePeriod: 'Next decade',
		ariaUnselectableMessage: 'cannot be selected',
		ariaYearLabelFormat: 'YYYY',
		ariaMonthLabelFormat: 'MMMM, YYYY',
		ariaDayLabelFormat: 'dddd, LL',
		ariaHourLabelFormat: 'dddd, LL, LT',
		ariaMinuteLabelFormat: 'LT',
		ariaSecondLabelFormat: 'LTS',
		minView: 'decade',
		maxView: 'minute',
		startView: 'year',
		inline: false,
		validate: true,
		autoclose: true,
		setOnSelect: false,
		today: false,
		keyboard: false,
		showHeader: true,
		leftArrow: '&larr;',
		rightArrow: '&rarr;',

		// Decade View
		yearsFormat: 'YYYY',

		// Year View
		monthsFormat: 'MMM',

		// Month View
		daysFormat: 'D',

		// Day View
		hoursFormat: 'HH:[00]',
		hoursStart: 0,
		hoursEnd: 23,

		// Hour View
		minutesStep: 5,
		minutesStart: 0,
		minutesEnd: 59,

		// Minute View
		secondsFormat: 'ss',
		secondsStep: 1,
		secondsStart: 0,
		secondsEnd: 59
	};

	public options(options: IProviderOptions): IProviderOptions {
		assignIn(this.settings, options);
		return cloneDeep(this.settings);
	}

	public $get(): IProviderOptions {
		return this.settings;
	}
}
