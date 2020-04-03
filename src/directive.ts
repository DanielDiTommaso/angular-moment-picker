import {forEach, isUndefined, isFunction} from 'lodash';
import * as $ from 'jquery';
import * as moment from 'moment';
import { IDirectiveScopeInternal, IModelController } from './definitions';
import { DecadeView, YearView, MonthView, DayView, HourView, MinuteView } from './views';
import { isValidMoment, toValue, toMoment, momentToValue, valueToMoment, setValue, updateMoment, defaultGetToday } from './utility';
import {
	addAriaLabelsForButtons,
	checkFocusableElements, checkValue, detectMinMax,
	focusCurrentlyHighlighted,
	getMomentNext,
	getMomentPrevious,
	handleElementToOpenCalendar, keydownHandler, position, selectValidValue
} from './core.service';
import {all, formats} from './constants';

const templateHtml = require('./template.tpl.html');

export default class Directive {
	public restrict = 'A';
	public require = '?ngModel';
	public transclude = true;
	public template = templateHtml;
	public scope = {
		value: '=?momentPicker',
		model: '=?ngModel',
		locale: '@?',
		format: '@?',
		minView: '@?',
		maxView: '@?',
		startView: '@?',
		rightArrow: '@?',
		leftArrow: '@?',
		minDate: '=?',
		maxDate: '=?',
		startDate: '=?',
		disabled: '=?disable',
		position: '@?',
		inline: '=?',
		validate: '=?',
		autoclose: '=?',
		setOnSelect: '=?',
		isOpen: '=?',
		today: '=?',
		keyboard: '=?',
		showHeader: '=?',
		additions: '=?',
		change: '&?',
		selectable: '&?',
		getToday: '&?',
		elementToOpenCalendar: '=?',
		elementToFocusOnClose: '=?',
		ariaDialogTitle: '@?',
		ariaDefaultPreviousButtonPeriod: '@?',
		ariaDefaultNextButtonPeriod: '@?',
		ariaDefaultParentButtonTitle: '@?',
		ariaPreviousButtonTitleMonthPeriod: '@?',
		ariaNextButtonTitleMonthPeriod: '@?',
		ariaParentButtonTitleMonthPeriod: '@?',
		ariaPreviousButtonTitleYearPeriod: '@?',
		ariaNextButtonTitleYearPeriod: '@?',
		ariaParentButtonTitleYearPeriod: '@?',
		ariaPreviousButtonTitleDecadePeriod: '@?',
		ariaNextButtonTitleDecadePeriod: '@?',
		ariaParentButtonTitleDecadePeriod: '@?',
		ariaUnselectableMessage: '@?',
		ariaYearLabelFormat: '@?',
		ariaMonthLabelFormat: '@?',
		ariaDayLabelFormat: '@?',
		ariaHourLabelFormat: '@?',
		ariaMinuteLabelFormat: '@?',
		ariaSecondLabelFormat: '@?'
	};

	constructor(
		private provider
	) { }

	public link = ($scope: IDirectiveScopeInternal, $element: ng.IAugmentedJQuery, $attrs: ng.IAttributes, $ctrl: IModelController) => {
			let tabFocusItems = {
				previous: null,
				parent: null,
				next: null
			};

			$scope.componentRef = $element;

			$scope.getToday = isFunction($scope.getToday) && $attrs['getToday'] ? $scope.getToday : defaultGetToday;

			$scope.onAfterRender = () => {
				const $activeElement = $(document.activeElement);
				checkFocusableElements(tabFocusItems, $scope.picker);

				const shouldFocus = !($activeElement.is(tabFocusItems.previous) ||
					$activeElement.is(tabFocusItems.parent) ||
					$activeElement.is(tabFocusItems.next));

				if (shouldFocus) {
					focusCurrentlyHighlighted($scope.views, $scope.view.selected, $scope.picker);
				}
			};

		const setValueCallback = (viewValue, modelValue) => {
			$ctrl.$modelValue = updateMoment.apply($scope, [$ctrl.$modelValue, modelValue]);
			if ($attrs['ngModel'] != $attrs['momentPicker']) $scope.value = viewValue;
			if ($attrs['ngModel']) {
				$ctrl.$setViewValue(viewValue);
				$ctrl.$render(); // render input value
			}
		};

			// one-way binding attributes
			forEach([
				'locale', 'format', 'minView', 'maxView', 'startView', 'position', 'inline', 'validate', 'autoclose',
				'setOnSelect', 'today', 'keyboard', 'showHeader', 'leftArrow', 'rightArrow', 'additions', 'ariaDialogTitle',
				'ariaDefaultPreviousButtonPeriod', 'ariaDefaultNextButtonPeriod', 'ariaDefaultParentButtonTitle',
				'ariaPreviousButtonTitleMonthPeriod', 'ariaNextButtonTitleMonthPeriod', 'ariaParentButtonTitleMonthPeriod',
				'ariaPreviousButtonTitleYearPeriod', 'ariaNextButtonTitleYearPeriod', 'ariaParentButtonTitleYearPeriod',
				'ariaPreviousButtonTitleDecadePeriod', 'ariaNextButtonTitleDecadePeriod', 'ariaParentButtonTitleDecadePeriod',
				'ariaLabelFormat', 'ariaYearLabelFormat', 'ariaMonthLabelFormat', 'ariaDayLabelFormat',
				'ariaHourLabelFormat', 'ariaMinuteLabelFormat', 'ariaSecondLabelFormat', 'ariaUnselectableMessage'
			], (attr: string) => {
				if (isUndefined($scope[attr])) $scope[attr] = this.provider[attr];
				if (isUndefined($attrs[attr])) $attrs[attr] = $scope[attr];
			});

			// check if ngModel has been set
			if (!$attrs['ngModel']) $ctrl = <IModelController>{};

			// limits
			$scope.limits = {
				minDate: toMoment($scope.minDate, $scope.format, $scope.locale),
				maxDate: toMoment($scope.maxDate, $scope.format, $scope.locale),
				isAfterOrEqualMin: (value: moment.Moment, precision?: moment.unitOfTime.StartOf) => {
					return isUndefined($scope.limits.minDate) || value.isAfter($scope.limits.minDate, precision) || value.isSame($scope.limits.minDate, precision);
				},
				isBeforeOrEqualMax: (value: moment.Moment, precision?: moment.unitOfTime.StartOf) => {
					return isUndefined($scope.limits.maxDate) || value.isBefore($scope.limits.maxDate, precision) || value.isSame($scope.limits.maxDate, precision);
				},
				isSelectable: (value: moment.Moment, precision?: moment.unitOfTime.StartOf) => {
					let selectable: boolean = true;
					let retVal;
					try {
						if (isFunction($scope.selectable) && $attrs['selectable']) selectable = $scope.selectable({ date: value, type: precision });
					} finally {
						retVal = $scope.limits.isAfterOrEqualMin(value, precision) && $scope.limits.isBeforeOrEqualMax(value, precision) && selectable;
					}
					return retVal;
				},
				checkView: () => {
					if (isUndefined($scope.view.moment)) $scope.view.moment = moment().locale($scope.locale);
					if (!$scope.limits.isAfterOrEqualMin($scope.view.moment)) $scope.view.moment = $scope.limits.minDate.clone();
					if (!$scope.limits.isBeforeOrEqualMax($scope.view.moment)) $scope.view.moment = $scope.limits.maxDate.clone();
					$scope.view.update();
					$scope.view.render();
				}
			};

			$scope.views = {
				// for each view, `$scope.views.formats` object contains the available moment formats
				// formats present in more views are used to perform min/max view detection (i.e. 'LTS', 'LT', ...)
				formats,

				// specific views
				decade:	new DecadeView	($scope, $ctrl, this.provider),
				year:	new YearView	($scope, $ctrl, this.provider),
				month:	new MonthView	($scope, $ctrl, this.provider),
				day:	new DayView		($scope, $ctrl, this.provider),
				hour:	new HourView	($scope, $ctrl, this.provider),
				minute:	new MinuteView	($scope, $ctrl, this.provider),
			};
			$scope.view = {
				moment: undefined,
				value: undefined,
				isOpen: false,
				selected: $scope.startView,
				update: () => { $scope.view.value = momentToValue($scope.view.moment, $scope.format); },
				toggle: () => { $scope.view.isOpen ? $scope.view.close() : $scope.view.open(); },
				open: () => {
					if ($scope.disabled || $scope.view.isOpen || $scope.inline) return;
					addAriaLabelsForButtons.apply($scope);
					$scope.isOpen = true;
					$scope.view.isOpen = true;
					if ($ctrl.$modelValue) {
						selectValidValue.apply($scope, [$ctrl.$modelValue, setValueCallback]);
					}
					document.body.appendChild($scope.picker[0]);
					position.apply($scope);
				},
				close: (implicit?: boolean) => {
					if (!$scope.view.isOpen || $scope.inline) return;

					$scope.isOpen = false;
					$scope.view.isOpen = false;
					$scope.view.selected = $scope.startView;
					$scope.picker[0].parentNode.removeChild($scope.picker[0]);
					if (implicit) {
						return;
					}
					if (!$scope.elementToFocusOnClose || $scope.elementToFocusOnClose.is($scope.input)) {
						$scope.input[0].focus();
					} else {
						$scope.elementToFocusOnClose[0].focus();
					}
				},
				// utility
				unit: () => $scope.view.selected == 'decade' ? 10 : 1,
				precision: () => <moment.unitOfTime.DurationConstructor>$scope.view.selected.replace('decade', 'year'),
				// header
				title: '',
				previous: {
					label: $scope.leftArrow,
					selectable: true,
					set: () => {
						if ($scope.view.previous.selectable) {
							$scope.view.moment.subtract($scope.view.unit(), $scope.view.precision());
							$scope.view.update();
							$scope.view.render();
						}
					}
				},
				next: {
					selectable: true,
					label: $scope.rightArrow,
					set: () => {
						if ($scope.view.next.selectable) {
							$scope.view.moment.add($scope.view.unit(), $scope.view.precision());
							$scope.view.update();
							$scope.view.render();
						}
					}
				},
				setParentView: () => { $scope.view.change(all[Math.max(0, all.indexOf($scope.view.selected) - 1)]); },
				// body
				render: () => {
					let momentPrevious = getMomentPrevious($scope.view.selected, $scope.view.moment, $scope.view.precision, $scope.view.unit),
						momentNext = getMomentNext($scope.view.selected, $scope.view.moment, $scope.view.precision, $scope.view.unit);

					$scope.view.previous.selectable = $scope.limits.isAfterOrEqualMin(momentPrevious, $scope.view.precision());
					$scope.view.previous.label = $scope.view.previous.selectable ? $scope.leftArrow : '&nbsp;';
					$scope.view.next.selectable = $scope.limits.isBeforeOrEqualMax(momentNext, $scope.view.precision());
					$scope.view.next.label = $scope.view.next.selectable ? $scope.rightArrow : '&nbsp;';
					$scope.view.title = $scope.views[$scope.view.selected].render();
				},
				change: (view) => {
					let nextView = all.indexOf(view),
						minView  = all.indexOf($scope.minView),
						maxView  = all.indexOf($scope.maxView);

					const update = () => {
						setValue.apply($scope, [$scope.view.moment, setValueCallback]);
						$scope.view.update();
						if ($attrs['ngModel']) $ctrl.$commitViewValue();
					};

					if ($scope.setOnSelect) update();
					if (nextView < 0 || nextView > maxView) {
						if (!$scope.setOnSelect) update();
						if ($scope.autoclose) setTimeout($scope.view.close);
					} else if (nextView >= minView) {
						$scope.view.selected = view;
						addAriaLabelsForButtons.apply($scope);
						$scope.picker.find('th.js-moment-picker-parent-view').blur().focus();
					}
				}
			};

			// creation
			$scope.picker = $($element[0].querySelectorAll('.moment-picker'));
			$scope.container = <JQuery<HTMLElement>>$($scope.picker[0].querySelectorAll('.moment-picker-container'));
			$scope.input = $element[0].tagName.toLowerCase() != 'input' && $element[0].querySelectorAll('input').length > 0
				? $($element[0].querySelectorAll('input'))
				: $($element[0]);
			if (!$scope.elementToFocusOnClose) {
				$scope.elementToFocusOnClose = $scope.input;
			}
			$scope.input.addClass('moment-picker-input').attr('tabindex', 0);
			($scope.position || '').split(' ').forEach((className: string) => $scope.picker.addClass(className));
			if (!$scope.inline) $scope.picker[0].parentNode.removeChild($scope.picker[0]);
			else {
				$element.after($scope.picker);
				$scope.picker.addClass('inline');
			}

			// initialization
			detectMinMax.apply($scope);
			$scope.limits.checkView();
			// model controller is initialized after linking function
			setTimeout(() => {
				if ($attrs['ngModel']) {
					if (!$ctrl.$modelValue && $scope.value) $ctrl.$setViewValue($scope.value);
					$ctrl.$commitViewValue();
					$ctrl.$render();
				} else {
					if ($scope.value) $ctrl.$modelValue = valueToMoment.apply($scope, [$scope.value]);
				}
				// view initialization
				if ($scope.startDate) $scope.view.moment = toMoment($scope.startDate, $scope.format, $scope.locale);
				else if (isValidMoment($ctrl.$modelValue)) $scope.view.moment = $ctrl.$modelValue.clone();
				$scope.view.update();
				$scope.view.render();
			});

			// model <-> view conversion
			if ($attrs['ngModel']) {
				$ctrl.$parsers.push((viewValue) => updateMoment.apply($scope, [$ctrl.$modelValue, valueToMoment.apply($scope, [viewValue])]) || true);
				$ctrl.$formatters.push((modelValue) => momentToValue(modelValue, $scope.format) || '');
				$ctrl.$viewChangeListeners.push(() => { if ($attrs['ngModel'] != $attrs['momentPicker']) $scope.value = $ctrl.$viewValue; });
				$ctrl.$validators.minDate = (value) => $scope.validate || !isValidMoment(value) || $scope.limits.isAfterOrEqualMin(value);
				$ctrl.$validators.maxDate = (value) => $scope.validate || !isValidMoment(value) || $scope.limits.isBeforeOrEqualMax(value);
			}

			// properties listeners
			if ($attrs['ngModel'] != $attrs['momentPicker'])
				$scope.$watch('value', (newValue: string, oldValue: string) => {
					if (newValue !== oldValue) setValue.apply($scope, [newValue, setValueCallback]);
				});
			$scope.$watch(() => momentToValue($ctrl.$modelValue, $scope.format), (newViewValue, oldViewValue) => {
				if (newViewValue == oldViewValue) return;

				let newModelValue = valueToMoment.apply($scope, [newViewValue]);
				setValue.apply($scope, [newModelValue, setValueCallback]);
				checkValue.apply($scope, [$ctrl.$modelValue, setValueCallback]);
				$scope.view.moment = (newModelValue || moment().locale($scope.locale)).clone();
				$scope.view.update();
				$scope.view.render();
				if (isFunction($scope.change) && $attrs['change']) {
					let oldModelValue = valueToMoment.apply($scope, [oldViewValue]);
					$scope.$evalAsync(() => $scope.change({ newValue: newModelValue, oldValue: oldModelValue }));
				}
			});
			$scope.$watch(() => $ctrl.$modelValue && $ctrl.$modelValue.valueOf(), () => {
				let viewMoment = (isValidMoment($ctrl.$modelValue) ? $ctrl.$modelValue : moment().locale($scope.locale)).clone();
				if (!viewMoment.isSame($scope.view.moment)) {
					$scope.view.moment = viewMoment;
					$scope.view.update();
					$scope.view.render();
				}
			});
			$scope.$watch('view.selected', () => $scope.view.render());
			$scope.$watchGroup(['minView', 'maxView'], () => {
				// auto-detect minView/maxView
				detectMinMax.apply($scope);
				// limit startView
				$scope.startView = all[
					Math.max(
						Math.min(
							all.indexOf($scope.startView),
							all.indexOf($scope.maxView)
						),
						all.indexOf($scope.minView)
					)
				];
				$scope.view.selected = $scope.startView;
			});
			$scope.$watchGroup([
				() => toValue($scope.minDate, $scope.format, $scope.locale),
				() => toValue($scope.maxDate, $scope.format, $scope.locale)
			], () => {
				forEach(['minDate', 'maxDate'], (field: string) => {
					$scope.limits[field] = toMoment($scope[field], $scope.format, $scope.locale);
				});
				checkValue.apply($scope, [$ctrl.$modelValue, setValueCallback]);
				$scope.limits.checkView();
				$scope.view.render();
			});
			$scope.$watch(() => toValue($scope.startDate, $scope.format, $scope.locale), (newViewValue, oldViewValue) => {
				if (newViewValue == oldViewValue) return;

				$scope.view.moment = valueToMoment.apply($scope, [newViewValue]);
				$scope.view.update();
				$scope.view.render();
			});
			$attrs.$observe('locale', (locale: string) => $scope.locale = locale);
			$scope.$watch('elementToOpenCalendar', (element: JQuery<HTMLElement>) => handleElementToOpenCalendar(element, $element, $scope.container, openCalendar));
			$scope.$watch('locale', (locale: string, previous: string) => {
				if (isUndefined(previous) || locale == previous) return;
				if (isValidMoment($ctrl.$modelValue)) setValue.apply($scope, [$ctrl.$modelValue.locale(locale), setValueCallback]);
				if (isValidMoment($scope.view.moment)) $scope.view.moment = $scope.view.moment.locale(locale);
				if (isValidMoment($scope.limits.minDate)) $scope.limits.minDate = $scope.limits.minDate.locale(locale);
				if (isValidMoment($scope.limits.maxDate)) $scope.limits.maxDate = $scope.limits.maxDate.locale(locale);
				$scope.view.render();
			});
			$scope.$watch('validate', () => {
				checkValue.apply($scope, [$ctrl.$modelValue, setValueCallback]);
			});
			$scope.$watch('isOpen', (isOpen: boolean) => {
				if ($scope.inline) $scope.view.isOpen = true;
				else if (!isUndefined(isOpen) && isOpen != $scope.view.isOpen) $scope.view.toggle();
			});

			// event listeners
			const openCalendar = () => {
				$scope.$evalAsync(() => {
					$scope.view.open();
				});
			};

			$scope.picker
				.on('keydown', (e: JQuery.Event) => {
					if ($scope.keyboard) {
						keydownHandler.apply($scope, [e, tabFocusItems]);
						$scope.$evalAsync();
					}
				});

			$scope.picker[0].addEventListener('blur', () => {
				setTimeout(() => {
					const isFocusedInsidePicker = !!$scope.picker.find(document.activeElement).length;

					if (!isFocusedInsidePicker) {
						$scope.view.close(true);
					}
				}, 0, false);
			}, true);

			if (!$scope.elementToOpenCalendar) {
				$element.on('click touchstart', openCalendar);
				$scope.container.on('mousedown', openCalendar);
			}
			$(window).on('resize scroll', position.bind($scope));

			// unbind events on destroy
			$scope.$on('$destroy', () => {
				if ($scope.elementToOpenCalendar) {
					$scope.elementToOpenCalendar.off();
				}
				tabFocusItems.previous = null;
				tabFocusItems.parent = null;
				tabFocusItems.next = null;
				$scope.input.off('focus click touchstart blur keydown');
				$element.off('click touchstart');
				$scope.container.off('mousedown');
				$scope.picker.remove();
				$(window).off('resize scroll', position.bind($scope));
			});
	}
}
