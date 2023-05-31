import { Component } from '@angular/core';
import { EnchantCostCalculator } from 'src/app/servives/enchant-cost-calculator.service';
import { EnchantingType } from 'src/app/types/enchanting-cost/enchanting.type';
import { Unit } from 'src/app/types/enchanting-cost/unit.type';

@Component({
	selector: 'app-enchanting-cost',
	templateUrl: './enchanting-cost.component.html',
	styleUrls: ['./enchanting-cost.component.scss'],
})
export class EnchantingCostComponent {
	enchantType: EnchantingType;
	itemPriceValue: number = 0;
	enchantScrollPriceValue: number = 0;
	prices: number[] = [];
	maxEnchant = 18;
	public unit = 2;
	public unitCaption = 'Million';

	constructor(private _calculator: EnchantCostCalculator) {
		this.enchantType = EnchantingType.Physical;
	}

	public ngOnInit() {
		this.prices = Array.from({ length: 18 }, (_, index) => 0);
	}

	// Rest of your component logic

	public toggleCheckbox(checkboxNumber: EnchantingType) {
		this.enchantType = checkboxNumber;
		this.recalculatePrices();
	}

	public onSliderChanged() {
		switch (this.unit) {
			case Unit.One:
				this.unitCaption = 'Adena';
				break;
			case Unit.Thousand:
				this.unitCaption = 'Thousands';
				break;
			case Unit.Million:
				this.unitCaption = 'Millions';
				break;
		}
		this.recalculatePrices();
	}

	public typeChanged(value: string) {
		this.enchantType = <EnchantingType>value;
		this.recalculatePrices();
	}

	public recalculatePrices() {
		const enchPrices = this._calculator.calculateCost(
			this.enchantType,
			this.itemPriceValue,
			this.enchantScrollPriceValue
		);
		let values = Object.values(enchPrices);
		values = values.map((value) => {
			return Math.round(value * 100) / 100;
		});
		this.prices = values;
	}
}
