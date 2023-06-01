import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EnchantCostCalculator } from 'src/app/servives/enchant-cost-calculator.service';
import { NotificationService } from 'src/app/servives/notification.service';
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
	savedUrls: { name: string; url: string; type: EnchantingType; id: number }[] = [];
	showSavedUrls: boolean = false;

	public typeImages = {
		phys: '../../assets/phys_weapon.png',
		mag: '../../assets/magic_weapon.png',
		armor: '../../assets/armor.png',
		'full-body': '../../assets/full_body.png',
	};

	constructor(
		private _calculator: EnchantCostCalculator,
		private _notificationService: NotificationService,
		private route: ActivatedRoute
	) {
		this.enchantType = EnchantingType.Physical;
	}

	public ngOnInit() {
		this.route.queryParams.subscribe((params) => {
			this.itemPriceValue = +params['i'] || 0;
			this.enchantScrollPriceValue = +params['s'] || 0;
			this.enchantType = params['t'] || this.enchantType;
			this.recalculatePrices();
		});
		this.loadSavedUrls();
	}

	private _generateUrl() {
		return `${window.location.origin}${window.location.pathname}?t=${this.enchantType}&i=${this.itemPriceValue}&s=${this.enchantScrollPriceValue}`;
	}

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

	public onSaveClick() {
		const name = prompt('Enter a name for the saved URL:');
		if (name) {
			const url = this._generateUrl();
			const savedUrl = { name, url, type: this.enchantType, id: this.savedUrls.length + 1 };
			this.savedUrls.push(savedUrl);
			this.saveUrlsToLocalStorage();
			this.showSavedUrls = true;
		}
	}

	public onSavedUrlDelete(id: number) {
		this.savedUrls = this.savedUrls.filter((v) => v.id !== id);
		this.saveUrlsToLocalStorage();
	}

	loadSavedUrls() {
		const savedUrlsString = localStorage.getItem('savedUrls');
		if (savedUrlsString) {
			this.savedUrls = JSON.parse(savedUrlsString);
			this.showSavedUrls = true;
		}
	}

	saveUrlsToLocalStorage() {
		localStorage.setItem('savedUrls', JSON.stringify(this.savedUrls));
	}

	public onShareClick() {
		const url = this._generateUrl();
		navigator.clipboard.writeText(url).then(() => {
			this._notificationService.showSuccess('URL copied to clipboard');
		});
	}
}
