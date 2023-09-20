import { throwError } from 'rxjs';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';

export class BaseService {
	
	protected apiUrl: string = '';

	protected httpOptions = {
		headers: new HttpHeaders({ 'Content-Type': 'application/json' })
	};

	protected handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			console.error('An error occurred:', error.error.message);
		} else {
			console.error(
				`Backend returned code ${error.status}, ` +
				`body was: ${error.error}`);
		}
		return throwError(
			'Something bad happened; please try again later.');
	};
}
