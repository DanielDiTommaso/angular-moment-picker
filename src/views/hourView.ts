import {forEach} from 'lodash';
import * as moment from 'moment';
import { IView, IViewItem, IDirectiveScopeInternal, IModelController } from '../definitions';
import { IProviderOptions } from '../provider';
import { isValidMoment } from '../utility';
import {isSelectable} from '../core.service';

export default class HourView implements IView {
	public perLine: number = 4;
	public rows: IViewItem[][] = [];

	constructor(
		private $scope: IDirectiveScopeInternal,
		private $ctrl: IModelController,
		private provider: IProviderOptions) { }

	public render(elRef): string {
		let i = 0,
			minute = this.$scope.view.moment.clone().startOf('hour').minute(this.provider.minutesStart),
			minutesFormat = this.provider.minutesFormat || moment.localeData(this.$scope.locale).longDateFormat('LT').replace(/[aA]/, '').trim();

		this.rows = [];
		for (let m = 0; m <= this.provider.minutesEnd - this.provider.minutesStart; m += this.provider.minutesStep) {
			let index = Math.floor(i / this.perLine),
				selectable = isSelectable.apply(this.$scope, [minute, elRef, 'minute']);

			if (!this.rows[index]) this.rows[index] = [];
			this.rows[index].push(<IViewItem>{
				index: minute.minute(),
				label: minute.format(minutesFormat),
				ariaLabel: minute.format(this.$scope.ariaMinuteLabelFormat),
				year: minute.year(),
				month: minute.month(),
				date: minute.date(),
				hour: minute.hour(),
				minute: minute.minute(),
				class: [
					this.$scope.keyboard && minute.isSame(this.$scope.view.moment, 'minute') ? 'highlighted' : '',
					!selectable ? 'disabled' : isValidMoment(this.$ctrl.$modelValue) && minute.isSame(this.$ctrl.$modelValue, 'minute') ? 'selected' : ''
				].join(' ').trim(),
				selectable: selectable
			});
			i++;
			minute.add(this.provider.minutesStep, 'minutes');
		}
		if (this.$scope.keyboard) this.highlightClosest();
		// return title
		return this.$scope.view.moment.clone().startOf('hour').format('lll');
	}

	public set(minute: IViewItem): void {
		if (!minute.selectable) return;
		this.$scope.view.moment.year(minute.year).month(minute.month).date(minute.date).hour(minute.hour).minute(minute.minute);
		this.$scope.view.update();
		this.$scope.view.change('minute');
	}

	public highlightClosest(): void {
		let minutes = <IViewItem[]>[], minute;
		forEach(this.rows, (row) => {
			forEach(row, (value) => {
				if (Math.abs(value.minute - this.$scope.view.moment.minute()) < this.provider.minutesStep) minutes.push(value);
			});
		});
		minute = minutes.sort((value1, value2) => {
			return Math.abs(value1.minute - this.$scope.view.moment.minute()) > Math.abs(value2.minute - this.$scope.view.moment.minute()) ? 1 : 0;
		})[0];
		if (!minute || minute.minute - this.$scope.view.moment.minute() == 0) return;
		this.$scope.view.moment.year(minute.year).month(minute.month).date(minute.date).hour(minute.hour).minute(minute.minute);
		this.$scope.view.update();
		if (minute.selectable) minute.class = (minute.class + ' highlighted').trim();
	}
}
