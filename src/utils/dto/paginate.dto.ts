export class PaginationResponseDto<T> {
  limit: number;
  nextPage: number | null;
  currentPage: number;
  totalNumberOfItems: number;
  foundItems: T[];
}

export class PaginationDto {
  limit: number;
  page: number;
}

export class FilterQuery extends PaginationDto {
  filterKey: string;
  filterValue: string;
}
