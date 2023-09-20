export class SelectOptions {
	offset?: number;
	count?: number;
	orderOptions?: [{
		column: string,
		isAscending?: boolean
	}]
}