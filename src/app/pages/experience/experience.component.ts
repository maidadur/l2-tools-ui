import { Component } from '@angular/core';
import { map } from 'rxjs';
import { Experience } from 'src/app/entity/experience/experience';
import { SelectOptions } from 'src/app/entity/select-options';
import { ExperienceService } from 'src/app/servives/experience.service';

@Component({
	selector: 'app-experience',
	templateUrl: './experience.component.html',
	styleUrls: ['./experience.component.scss'],
})
export class ExperienceComponent {
	protected entities: Experience[] = [];

	public currentLevel?: number;
	public targetLevel?: number;
	public diffExp: number = 0;
	public expPrice: number = 1000000;
	public totalPrice: number = 0;

	constructor(private _service: ExperienceService) {}

	protected getDecimalPart(value: number): number {
		return value % 1.0;
	}

	public ngOnInit(): void {
		this._service
			.getAll({
				count: -1,
				offset: 0,
				orderOptions: [
					{
						column: 'Level',
						isAscending: true,
					},
				],
			} as SelectOptions)
			.pipe(
				map((entities: Experience[]) => {
					this.entities = entities;
				})
			)
			.subscribe();
	}

	public recalculatePrices(): void {
		const targetLevel = this.targetLevel || 0;
		const currentLevel = this.currentLevel || 0;

		var targetLvlEntity = this.entities.find((i) => i.level === Math.floor(targetLevel));
		var targetNextLvlEntity = this.entities.find((i) => i.level === Math.floor(targetLevel) + 1);
		var currentLvlEntity = this.entities.find((i) => i.level === Math.floor(currentLevel));
		var currentNextLvlEntity = this.entities.find((i) => i.level === Math.floor(currentLevel) + 1);

		var targetLvlExp = +(targetLvlEntity?.expCount || 0);
		var targetNextLvlExp = +(targetNextLvlEntity?.expCount || 0);
		var currentLvlExp = +(currentLvlEntity?.expCount || 0);
		var currentNextLvlExp = +(currentNextLvlEntity?.expCount || 0);

		const targetLvlPercents = this.getDecimalPart(targetLevel);
		const currentLevelPercents = this.getDecimalPart(currentLevel);

		this.diffExp =
			targetLvlExp +
			(targetNextLvlExp - targetLvlExp) * targetLvlPercents -
			(currentLvlExp + (currentNextLvlExp - currentLvlExp) * currentLevelPercents);
		this.totalPrice = (this.diffExp / 1000000) * this.expPrice;
	}
}
