import myData from "../test-data/paging/page-test1.json"; // Assuming data.json is in the same directory

import { Pager } from "../../src/objects";

interface TestObj {
    id: number;
    title: string;
    date_published: string;
}

const pagerTestObj = new Pager<TestObj>(myData, 5);

const page1 = pagerTestObj.getRowsForPage(1);
console.log(page1);
