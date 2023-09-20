import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Guid } from 'guid-typescript';
import { BaseService} from './base-http-service.service';
import { BaseEntity } from '../entity/base-entity';
import { SelectOptions } from '../entity/select-options';

@Injectable({
	providedIn: 'root'
})
export class BaseGenericService<TEntity extends BaseEntity> extends BaseService {

	constructor(protected http: HttpClient) {
		super();
	}

	getAll(options?: SelectOptions): Observable<TEntity[]> {
		let url = this.apiUrl + "/list";
		return this.http.post<TEntity[]>(url, options, this.httpOptions)
			.pipe(
				catchError(this.handleError)
			);
	} 

	get(id: string): Observable<TEntity> {
		const url = `${this.apiUrl}/${id}`;
		return this.http.get<TEntity>(url)
			.pipe(
				catchError(this.handleError)
			);
	}

	add(entity: TEntity): Observable<any> {
		return this.http.post<TEntity>(this.apiUrl, entity, this.httpOptions)
			.pipe(
				catchError(this.handleError)
			);
	}

	update(entity: TEntity): Observable<any> {
		return this.http.put<TEntity>(this.apiUrl, entity, this.httpOptions);
	}

	delete(id: Guid): Observable<any> {
		const url = `${this.apiUrl}/${id}`;
		return this.http.delete<TEntity>(url, this.httpOptions)
			.pipe(
				catchError(this.handleError)
			);
	}
}
