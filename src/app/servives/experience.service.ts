import { Injectable } from '@angular/core';
import { Experience } from '../entity/experience/experience';
import { BaseGenericService } from './base-generic.service';
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class ExperienceService extends BaseGenericService<Experience> {
	protected override apiUrl: string = environment.experienceApiHost;
}
