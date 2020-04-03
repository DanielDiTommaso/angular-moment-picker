import { IView, IViewItem, IDirectiveScopeInternal, IModelController } from '../definitions';
import { IProviderOptions } from '../provider';
import { isValidMoment } from '../utility';
import {isSelectable} from '../core.service';

export default class DecadeView implements IView {
	public perLine: number = 4;
	public rows: IViewItem[][] = [];

	constructor(
		private $scope: IDirectiveScopeInternal,
		private $ctrl: IModelController,
		private provider: IProviderOptions) { }

	public render(elRef): string {
		let year = this.$scope.view.moment.clone(),
			firstYear = Math.floor(year.year() / 10) * 10 - 1;

		this.rows = [];
		year.year(firstYear);
		for (let y = 0; y < 12; y++) {
			let index = Math.floor(y / this.perLine),
				selectable = isSelectable.apply(this.$scope, [year, elRef, 'year']);

			if (!this.rows[index]) this.rows[index] = [];
			this.rows[index].push(<IViewItem>{
				index: year.year(),
				label: year.format(this.provider.yearsFormat),
				ariaLabel: year.format(this.$scope.ariaYearLabelFormat),
				year: year.year(),
				class: [
					this.$scope.keyboard && year.isSame(this.$scope.view.moment, 'year') ? 'highlighted' : '',
					!selectable || [0, 11].indexOf(y) >= 0 ? 'disabled' : isValidMoment(this.$ctrl.$modelValue) && year.isSame(this.$ctrl.$modelValue, 'year') ? 'selected' : ''
				].join(' ').trim(),
				selectable: selectable
			});
			year.add(1, 'years');
		}
		// return title
		return [year.subtract(2, 'years').format('YYYY'), year.subtract(9, 'years').format('YYYY')].reverse().join(' - ');
	}

	public set(year: IViewItem): void {
		if (!year.selectable) return;
		this.$scope.view.moment.year(year.year);
		this.$scope.view.update();
		this.$scope.view.change('year');
	}
}
