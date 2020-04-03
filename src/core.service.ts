import {isValidMoment, KEYS, setValue} from './utility';
import {IView, ViewString} from './definitions';
import * as moment from 'moment';
import {all, precisions} from './constants';
import * as $ from 'jquery';
import {isUndefined, forEach, isFunction} from 'lodash';
import {getOffset} from './helpers';

/* tslint:disable */
export const focusCurrentlyHighlighted = (views, selected, pickerElement) => {
    const rows = views[selected].rows;
    let row,
        column;

    for (let i = 0; i < rows.length && !row; i++) {
        for (let j = 0; j < rows[i].length && !column; j++) {
            if (rows[i][j].class.indexOf('highlighted') !== -1) {
                row = i + 1;
                column = j + 1;
            }
        }
    }

    if (row && column) {
        const cell = <HTMLElement>pickerElement.find('.js-moment-picker-calendar-body ' +
            'tr:nth-child(' + row + ') ' +
            'td:nth-child(' + column + ')')[0];

        if (cell && cell !== document.activeElement) {
            cell.focus();
        }
    }

};

export function handleElementToOpenCalendar(element, pickerElement, container, openCalendar) {
    if (element) {
        pickerElement.off('click touchstart', openCalendar);
        container.off('mousedown', openCalendar);
        element.on('click touchstart', openCalendar);
        element.on('keydown', (event: JQuery.Event) => {
            if (event.keyCode === KEYS.enter || event.keyCode === KEYS.space) {
                openCalendar();
            }
        });
    }
}

export function getMomentPrevious(selected, moment, precision, unit) {
    return selected === 'decade'
        ? moment.clone().year(Math.floor(moment.year() / 10) * 10 - 1).startOf(precision())
        : moment.clone().startOf(precision()).subtract(unit(), precision());
}

export function getMomentNext(selected, moment, precision, unit) {
    return selected === 'decade' ?
        moment.clone().year(Math.floor(moment.year() / 10) * 10 + 10).endOf(precision()) :
        moment.clone().endOf(precision()).add(unit(), precision())
}


export function checkFocusableElements(tabFocusItems, pickerElement) {
    tabFocusItems.previous = tabFocusItems.previous ?
        tabFocusItems.previous :
        pickerElement.find('.js-moment-picker-previous');
    tabFocusItems.parent = tabFocusItems.parent ?
        tabFocusItems.parent :
        pickerElement.find('.js-moment-picker-parent-view');
    tabFocusItems.next = tabFocusItems.next ?
        tabFocusItems.next :
        pickerElement.find('.js-moment-picker-next');

}

export function navigateWithTab(isShiftPressed: boolean, showHeader: boolean, tabFocusItems, pickerElement) {
    let currentlySelected;

    if (!showHeader) {
        return;
    }

    checkFocusableElements(tabFocusItems, pickerElement);
    currentlySelected = $(document.activeElement);

    if (currentlySelected.is(tabFocusItems.previous)) {
        if (isShiftPressed) {
            $('.highlighted')[0].focus();
        } else {
            tabFocusItems.parent.focus();
        }
    } else if (currentlySelected.is(tabFocusItems.parent)) {
        if (isShiftPressed) {
            tabFocusItems.previous.focus();
        } else {
            tabFocusItems.next.focus();
        }
    } else if (currentlySelected.is(tabFocusItems.next)) {
        if (isShiftPressed) {
            tabFocusItems.parent.focus();
        } else {
            $('.highlighted')[0].focus();
        }
    } else {
        if (isShiftPressed) {
            tabFocusItems.next.focus();
        } else {
            tabFocusItems.previous.focus();
        }
    }
}

export function keydownHandler(e, tabFocusItems) {
    let view: IView = this.views[this.view.selected],
        precision   = precisions[this.view.selected].replace('date', 'day'),
        singleUnit  = this.provider[precision + 'sStep'] || 1,
        operation   = [KEYS.up, KEYS.left].indexOf(e.keyCode) >= 0 ? 'subtract' : 'add',

        highlight   = (vertical?: boolean) => {
            let unitMultiplier = vertical ? view.perLine : 1,
                nextDate = this.view.moment.clone()[operation](singleUnit * unitMultiplier, precision);
            if (this.limits.isSelectable(nextDate, <moment.unitOfTime.StartOf>precision)) {
                this.view.moment = nextDate;
                this.view.update();
                this.view.render();
            } else {
                this.picker.find('div.js-alert-element-aria')
                    .html(`${moment(nextDate).format(this.format)} ${this.ariaUnselectableMessage}`);
            }
        };

    switch (e.keyCode) {
        case KEYS.up:
        case KEYS.down:
            e.preventDefault();
            if (!this.view.isOpen) {
                this.view.open();
            } else if ($(document.activeElement).hasClass('js-moment-picker-item')) {
                highlight(true);
            }
            break;
        case KEYS.left:
        case KEYS.right:
            e.preventDefault();
            if (!this.view.isOpen) break;
            if ($(document.activeElement).hasClass('js-moment-picker-item')) {
                highlight();
            }
            break;
        case KEYS.enter:
        case KEYS.space:
            e.preventDefault();
            if (!this.view.isOpen) break;

            let $activeElement = $(document.activeElement);

            if ($activeElement.hasClass('js-moment-picker-item')) {
                this.view.change(<ViewString>precision);
            } else {
                $activeElement.click();
            }

            break;
        case KEYS.escape:
            this.view.toggle();
            break;
        case KEYS.tab:
            e.preventDefault();
            navigateWithTab(e.shiftKey, this.showHeader, tabFocusItems, this.picker);
            break;
    }
}

export function detectMinMax() {
    this.detectedMinView = this.detectedMaxView = undefined;
    if (!this.format) return;

    let minView, maxView;
    forEach(this.views.formats, (formats, view) => {
        let regexp = new RegExp('(' + formats + ')(?![^\[]*\])', 'g');
        if (!this.format.match(regexp)) return;
        if (isUndefined(minView)) minView = view;
        maxView = view;
    });

    if (isUndefined(minView)) minView = 0;
    else minView = Math.max(0, all.indexOf(minView));
    if (isUndefined(maxView)) maxView = all.length - 1;
    else maxView = Math.min(all.length - 1, all.indexOf(maxView));

    if (minView > all.indexOf(this.minView)) this.minView = all[minView];
    if (maxView < all.indexOf(this.maxView)) this.maxView = all[maxView];

// save detected min/max view to use them to update the model value properly
    this.detectedMinView = all[minView];
    this.detectedMaxView = all[maxView];
}


export function addAriaLabelsForButtons() {
    switch (this.view.selected) {
        case 'month':
            this.ariaParentButtonTitle = this.ariaParentButtonTitleMonthPeriod;
            this.ariaPreviousButtonTitle = this.ariaPreviousButtonTitleMonthPeriod;
            this.ariaNextButtonTitle = this.ariaNextButtonTitleMonthPeriod;
            break;
        case 'year':
            this.ariaParentButtonTitle = this.ariaParentButtonTitleYearPeriod;
            this.ariaPreviousButtonTitle = this.ariaPreviousButtonTitleYearPeriod;
            this.ariaNextButtonTitle = this.ariaNextButtonTitleYearPeriod;
            break;
        case 'decade':
            this.ariaParentButtonTitle = this.ariaParentButtonTitleDecadePeriod;
            this.ariaPreviousButtonTitle = this.ariaPreviousButtonTitleDecadePeriod;
            this.ariaNextButtonTitle = this.ariaNextButtonTitleDecadePeriod;
            break;
        default:
            this.ariaParentButtonTitle = this.ariaDefaultParentButtonTitle;
            this.ariaPreviousButtonTitle = this.ariaDefaultPreviousButtonPeriod;
            this.ariaNextButtonTitle = this.ariaDefaultNextButtonPeriod;
            break;
    }

    if (this.picker.find('th.js-moment-picker-previous.disabled').length) {
        this.ariaPreviousButtonTitle += ' ' + this.ariaUnselectableMessage;
    }
    if (this.picker.find('th.js-moment-picker-next.disabled').length) {
        this.ariaNextButtonTitle += ' ' + this.ariaUnselectableMessage;
    }
}

export function position() {
    if (!this.view.isOpen || this.position || this.inline) return;

    let element = this.componentRef[0],
        picker = <HTMLElement>this.picker.children()[0],
        hasClassTop = this.picker.hasClass('top'),
        hasClassRight = this.picker.hasClass('right'),
        offset = getOffset(this.componentRef[0]),
        top = offset.top - window.pageYOffset,
        left = offset.left - window.pageXOffset,
        winWidth = window.innerWidth,
        winHeight = window.innerHeight,
        shouldHaveClassTop = top + window.pageYOffset - picker.offsetHeight > 0 && top > winHeight / 2,
        shouldHaveClassRight = left + picker.offsetWidth > winWidth,
        pickerTop = offset.top + (shouldHaveClassTop ? 0 : element.offsetHeight) + 'px',
        pickerLeft = offset.left + 'px',
        pickerWidth = element.offsetWidth + 'px';

    if (!hasClassTop && shouldHaveClassTop) this.picker.addClass('top');
    if (hasClassTop && !shouldHaveClassTop) this.picker.removeClass('top');
    if (!hasClassRight && shouldHaveClassRight) this.picker.addClass('right');
    if (hasClassRight && !shouldHaveClassRight) this.picker.removeClass('right');
    if (this.picker.css('top') !== pickerTop) this.picker.css('top', pickerTop);
    if (this.picker.css('left') !== pickerLeft) this.picker.css('left', pickerLeft);
    if (this.picker.css('width') !== pickerWidth) this.picker.css('width', pickerWidth);
}

export function checkValue(modelValue, callback) {
    if (!isValidMoment(modelValue) || !this.validate) return;
    selectValidValue.apply(this, [modelValue, callback]);
}

export function selectValidValue(modelValue, callback) {
        if (!isAfterOrEqualMin.apply(this, modelValue)) setValue(this.limits.minDate, callback);
        if (!isBeforeOrEqualMax.apply(this, modelValue)) setValue(this.limits.maxDate, callback);
}

export function checkView() {
        if (isUndefined(this.view.moment)) this.view.moment = moment().locale(this.locale);
        if (!isAfterOrEqualMin.apply(this, this.view.moment)) this.view.moment = this.limits.minDate.clone();
        if (!isBeforeOrEqualMax.apply(this, this.view.moment)) this.view.moment = this.limits.maxDate.clone();
        this.view.update();
        this.view.render();
}

export function isSelectable(value: moment.Moment, elRef, precision?: moment.unitOfTime.StartOf) {
    let selectable: boolean = true;
    let retVal;

    try {
        if (isFunction(this.selectable) && attributeSelector(elRef, 'selectable')) selectable = this.selectable({ date: value, type: precision });
    } finally {
        retVal = isAfterOrEqualMin.apply(this, [value, precision]) && isBeforeOrEqualMax.apply(this, [value, precision]) && selectable;
    }
    return retVal;
}

export function attributeSelector(elRef, attribute: string): string {
    return elRef.attr(attribute);
    // let domAttr = document.getElementsByClassName('moment-picker')[0].previousElementSibling.attributes[attribute]
    //
    // return domAttr.value;
}

export function isBeforeOrEqualMax(value: moment.Moment, precision?: moment.unitOfTime.StartOf) {
    return isUndefined(this.limits.maxDate) || value.isBefore(this.limits.maxDate, precision) || value.isSame(this.limits.maxDate, precision);
}

export function isAfterOrEqualMin(value: moment.Moment, precision?: moment.unitOfTime.StartOf) {
    return isUndefined(this.limits.minDate) || value.isAfter(this.limits.minDate, precision) || value.isSame(this.limits.minDate, precision);
}

