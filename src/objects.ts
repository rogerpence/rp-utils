import { divideWithRemainder } from "./math";
import { type NavigationObject, type PagerObj } from "./types";

/**
 * Paginates an array of navigation objects and returns page metadata.
 *
 * @template T - The frontmatter type extending Record<string, any>
 * @param {NavigationObject<T>[]} allObjects - The complete array of navigation objects to paginate
 * @param {number} pageSize - Number of items per page
 * @param {number} pageNumber - The page number to retrieve (1-based index)
 * @returns {PagerObj<T>} Object containing paginated data and metadata. See {@link PagerObj}
 * @property {number} pageNumber - The current page number (1-based)
 * @property {boolean} isFirstPage - True if this is the first page
 * @property {boolean} isLastPage - True if this is the last page
 * @property {number} totalPages - Total number of pages available
 * @property {number} rowsReturned - Total number of rows for this page returned
 *
 * @example
 * Returns page 2 with 10 items per page
 * ```typescript
 * const result = getPagedData(navigationObjects, 10, 2);
 * console.log(result.pagedData);      // Items 11-20
 * console.log(result.isFirstPage);    // false
 * console.log(result.totalPages);     // Total number of pages
 * ```
 *
 * @remarks
 * This replaces the Pager class. See {@link Pager}.
 */
export function getPagedData<T extends Record<string, any>>(
    allObjects: NavigationObject<T>[],
    pageSize: number,
    pageNumber: number
): PagerObj<T> {
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedData = allObjects.slice(startIndex, endIndex);
    const pageCount = divideWithRemainder(allObjects.length, 10);
    const lastPage =
        pageCount.remainder === 0 ? pageCount.quotient : pageCount.quotient + 1;

    return {
        pagedData,
        pageNumber,
        isFirstPage: pageNumber === 1,
        isLastPage: pageNumber === lastPage,
        totalPages: Math.ceil(allObjects.length / pageSize),
        rowsReturned: allObjects.length,
    };
}

/**
 * An enhanced generic pagination utility class for dividing an array of items into pages.
 *
 * Page numbers are 1-based (first page is page 1, not 0).
 * Returns -1 for previous/next page numbers when at boundaries.
 * Automatically adjusts the last row index if it exceeds the array length.
 * Includes validation, utility methods, and immutability features.
 *
 * @template T - The type of objects contained in the array to be paginated
 * @deprecated - replaced by getPagedData(). See {@link getPagedData}.
 * @example
 * ```ts
 * interface User {
 *   id: number;
 *   name: string;
 * }
 *
 * const users: User[] = [
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' },
 *   ... more users
 * ];
 *
 * const pager = new PagerNew<User>(users, 10);
 * const page1 = pager.getRowsForPage(1);
 *
 * Returns object with dataRows, navigation info, and metadata
 * ```
 */
export class Pager<T> {
    readonly rowCount: number;
    readonly pageSize: number;
    readonly totalPages: number;
    private readonly arr: T[];

    /**
     * Creates a new PagerNew instance.
     *
     * @param arr - The array of items to paginate
     * @param pageSize - The number of items to display per page
     * @throws {TypeError} If arr is not an array
     * @throws {RangeError} If pageSize is not a positive integer
     */
    constructor(arr: T[], pageSize: number) {
        if (!Array.isArray(arr)) {
            throw new TypeError("arr must be an array");
        }
        if (pageSize <= 0 || !Number.isInteger(pageSize)) {
            throw new RangeError("pageSize must be a positive integer");
        }

        // Create a shallow copy to prevent external array modifications
        // Note: Objects within the array are still shared references
        this.arr = [...arr];
        this.rowCount = arr.length;
        this.pageSize = pageSize;
        this.totalPages = this.#getTotalPages(this.rowCount, this.pageSize);
    }

    /**
     * Checks if a page number is valid.
     *
     * @param pageNumber - The page number to validate
     * @returns True if the page number is valid
     */
    isValidPage(pageNumber: number): boolean {
        return pageNumber >= 1 && pageNumber <= this.totalPages;
    }

    /**
     * Checks if there is a next page.
     *
     * @param pageNumber - Current page number
     * @returns True if there is a next page
     */
    hasNextPage(pageNumber: number): boolean {
        return pageNumber < this.totalPages;
    }

    /**
     * Checks if there is a previous page.
     *
     * @param pageNumber - Current page number
     * @returns True if there is a previous page
     */
    hasPrevPage(pageNumber: number): boolean {
        return pageNumber > 1;
    }

    /**
     * Gets the first and last row indices for a given page number.
     * Adjusts the last index if it exceeds the total row count.
     *
     * @param pageNumber - The page number (1-based)
     * @returns An object containing the first and last row indices
     * @throws {RangeError} If pageNumber is invalid
     */
    getBoundingRowsForPage(pageNumber: number) {
        if (!this.isValidPage(pageNumber)) {
            throw new RangeError(
                `Page number must be between 1 and ${this.totalPages}`
            );
        }

        let boundingRows = this.#getBoundingRowsForPage(
            pageNumber,
            this.pageSize
        );
        if (boundingRows.last >= this.rowCount) {
            boundingRows.last = this.rowCount - 1;
        }
        return boundingRows;
    }

    /**
     * Retrieves the data rows for a specific page along with navigation information and metadata.
     *
     * @param pageNumber - The page number to retrieve (1-based)
     * @returns An object containing:
     * - `dataRows`: Array of items for the requested page
     * - `prevPageNumber`: Previous page number, or -1 if on first page
     * - `nextPageNumber`: Next page number, or -1 if on last page
     * - `currentPage`: The current page number
     * - `totalPages`: Total number of pages
     * - `hasNext`: Boolean indicating if there is a next page
     * - `hasPrev`: Boolean indicating if there is a previous page
     * - `startIndex`: The starting index (0-based) of items on this page
     * - `endIndex`: The ending index (0-based) of items on this page
     * @throws {RangeError} If pageNumber is invalid
     */
    getRowsForPage(pageNumber: number) {
        if (!this.isValidPage(pageNumber)) {
            throw new RangeError(
                `Page number must be between 1 and ${this.totalPages}`
            );
        }

        const boundingRows = this.getBoundingRowsForPage(pageNumber);
        const { previous, next } = this.#getPrevAndNextPage(pageNumber);

        return {
            dataRows: this.arr.slice(boundingRows.first, boundingRows.last + 1),
            prevPageNumber: previous,
            nextPageNumber: next,
            currentPage: pageNumber,
            totalPages: this.totalPages,
            hasNext: next !== -1,
            hasPrev: previous !== -1,
            startIndex: boundingRows.first,
            endIndex: boundingRows.last,
        };
    }

    /**
     * Gets a range of page numbers for pagination UI.
     * Useful for displaying "1 2 3 ... 8 9 10" style pagination controls.
     *
     * @param currentPage - Current page number
     * @param range - Number of pages to show on each side of current page (default: 2)
     * @returns Array of page numbers to display
     */
    getPageRange(currentPage: number, range: number = 2): number[] {
        if (!this.isValidPage(currentPage)) {
            throw new RangeError(
                `Page number must be between 1 and ${this.totalPages}`
            );
        }
        if (range < 0 || !Number.isInteger(range)) {
            throw new RangeError("range must be a non-negative integer");
        }

        const start = Math.max(1, currentPage - range);
        const end = Math.min(this.totalPages, currentPage + range);

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    /**
     * Gets all pages as an array of page data.
     * Warning: This can be memory-intensive for large datasets.
     *
     * @returns Array of all pages with their data
     */
    getAllPages() {
        return Array.from({ length: this.totalPages }, (_, i) =>
            this.getRowsForPage(i + 1)
        );
    }

    /**
     * Gets metadata about the pagination without fetching data.
     *
     * @returns Object containing pagination metadata
     */
    getMetadata() {
        return {
            totalItems: this.rowCount,
            pageSize: this.pageSize,
            totalPages: this.totalPages,
            isEmpty: this.rowCount === 0,
        };
    }

    /**
     * Calculates the previous and next page numbers relative to the current page.
     * Returns -1 for boundaries (no previous page on page 1, no next page on last page).
     *
     * @private
     * @param currentPageNumber - The current page number
     * @returns Previous and next page numbers
     */
    #getPrevAndNextPage(currentPageNumber: number) {
        return {
            previous: currentPageNumber - 1 === 0 ? -1 : currentPageNumber - 1,
            next:
                currentPageNumber + 1 > this.totalPages
                    ? -1
                    : currentPageNumber + 1,
        };
    }

    /**
     * Calculates the total number of pages needed for the given data.
     *
     * @private
     * @param rows - Total number of rows
     * @param pageSize - Number of rows per page
     * @returns Total number of pages
     */
    #getTotalPages(rows: number, pageSize: number): number {
        if (rows === 0) return 0;
        return Math.ceil(rows / pageSize);
    }

    /**
     * Calculates the first and last row indices for a given page.
     *
     * @private
     * @param pageNumber - The page number (1-based)
     * @param pageSize - Number of rows per page
     * @returns First and last row indices (0-based)
     */
    #getBoundingRowsForPage(pageNumber: number, pageSize: number) {
        const last = pageNumber * pageSize - 1;
        return {
            first: last - pageSize + 1,
            last,
        };
    }
}
