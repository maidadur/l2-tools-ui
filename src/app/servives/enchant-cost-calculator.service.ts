import { Injectable } from '@angular/core';
import {
	armorChances,
	fullArmorChances,
	mageWeaponChances,
	physicalWeaponChances,
} from '../constants/enchant-cost/enchant-cost';
import { EnchantingType } from '../types/enchanting-cost/enchanting.type';
import { max } from 'lodash';

@Injectable({
	providedIn: 'root',
})
export class EnchantCostCalculator {
	private _calculateCost(
		enchChances: { [x: number]: number },
		enchPrices: { [x: number]: number },
		totalPrice: number,
		scrollPrice: number,
		currentGrade = 1
	): { [x: number]: number } {
		var chance = enchChances[currentGrade];
		var maxEnchantGrade = <number>(max(Object.keys(enchChances).map(Number)) || 0);
		var modifier = 1 - chance;
		totalPrice = totalPrice * modifier + scrollPrice + totalPrice;
		enchPrices[currentGrade] = totalPrice;
		if (currentGrade < maxEnchantGrade) {
			currentGrade++;
			return this._calculateCost(enchChances, enchPrices, totalPrice, scrollPrice, currentGrade);
		}
		return enchPrices;
	}

	public calculateCost(type: EnchantingType, itemPrice: number, scrollPrice: number): { [x: number]: number } {
		let enchChances;
		const enchPrices: { [x: number]: number } = {};
		switch (type) {
			case EnchantingType.Physical:
				enchChances = physicalWeaponChances;
				break;
			case EnchantingType.Magical:
				enchChances = mageWeaponChances;
				break;
			case EnchantingType.Armor:
				enchChances = armorChances;
				break;
			case EnchantingType.Fullbody:
				enchChances = fullArmorChances;
				break;
		}
		return this._calculateCost(enchChances, enchPrices, itemPrice, scrollPrice);
	}
}
