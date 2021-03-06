import { SuDate } from "./sudate";
import * as assert from "./assert";

let sud1 = SuDate.make(2003, 11, 27, 16, 37, 33, 123);
let sud2: SuDate;
let sud3 = SuDate.make(2003, 12, 3, 0, 0, 0, 0);
let sud4 = SuDate.make(2003, 12, 3, 0, 0, 12, 345);
let sud5 = SuDate.make(2003, 12, 3, 1, 2, 3, 4);
let sud6 = SuDate.make(2005, 1, 1, 16, 37, 33, 123);

assert.equal(sud1.Year(), 2003);
assert.equal(sud1.Month(), 11);
assert.equal(sud1.Day(), 27);
assert.equal(sud1.Hour(), 16);
assert.equal(sud1.Minute(), 37);
assert.equal(sud1.Second(), 33);
assert.equal(sud1.Millisecond(), 123);

assert.equal(sud1.WeekDay(), 4);
assert.equal(sud1.WeekDay("MON"), 3);
assert.equal(sud1.WeekDay(4), 0);

assert.equal(sud3.MinusDays(sud1), 6);
assert.equal(sud4.MinusSeconds(sud3), 12.345);

sud2 = sud3.Plus(0, 0, 0, 1, 2, 3, 4);
assert.equal(sud2, sud5);

sud2 = sud1.Plus(1, 1, 5);
assert.equal(sud2, sud6);

assert.equal(sud1.FormatEn("dddd, MMMM d, yyyy"), "Thursday, November 27, 2003");
assert.equal(sud1.FormatEn("ddd, MMM. dd, \\'yy"), "Thu, Nov. 27, '03");
assert.equal(sud1.FormatEn("MM/dd/yy"), "11/27/03");
assert.equal(sud1.FormatEn("yyyyMMdd"), "20031127");
assert.equal(sud1.FormatEn("h:mmaa"), "4:37pm");
assert.equal(sud1.FormatEn("HH:mm:ss"), "16:37:33");
assert.equal(sud1.FormatEn("yyyy-MM-dd H:mm"), "2003-11-27 16:37");
assert.equal(sud1.FormatEn("dd \\de MMM"), "27 de Nov");
assert.equal(sud1.FormatEn("dd 'de' MMM"), "27 de Nov");

sud2 = SuDate.parse("#20150326.122334456", "yyyyMMdd")!;
assert.equal(sud2.FormatEn("yyyy-MM-dd H:mm:ss"), "2015-03-26 12:23:34");
sud2 = SuDate.parse("2000/3/4 8:34:56", "yyyyMMdd")!;
assert.equal(sud2.FormatEn("yyyy-MM-dd H:mm:ss"), "2000-03-04 8:34:56");

function literal(s: string): void {
    assert.equal(SuDate.literal(s)!.toString(), s);
}
literal("#19990101")!;
literal("#19990101.1234");
literal("#19990101.123456");
literal("#19990101.010203456");
assert.equal(SuDate.literal(""), null);
assert.equal(SuDate.literal("#19990229"), null);
assert.equal(SuDate.literal("#19990229.285959000"), null);

assert.equal(SuDate.fromDate(sud5.toDate()), sud5);
