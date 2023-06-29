import {formatDateToWords, getNextDay, getPreviousDay, format, isWithinNextWeek} from "../../src/utils";

describe("utils", () => {
    it("converts date to words", () => {
        expect(formatDateToWords(new Date(), "%dd-%mm-%YYYY")).toBe("today");
        expect(formatDateToWords(getNextDay(new Date()), "%dd-%mm-%YYYY")).toBe("tomorrow");
        expect(formatDateToWords(getPreviousDay(new Date()), "%dd-%mm-%YYYY")).toBe("yesterday");
        expect(formatDateToWords(new Date(Date.UTC(2017, 0, 2)), "%dd-%mm-%YYYY")).toBe("02-01-2017");

        const nextNextDay = getNextDay(getNextDay(new Date()));
        expect(formatDateToWords(nextNextDay, "XX")).not.toBe("XX");
        const nextWeekNextDay = getNextDay(getNextDay(getNextDay(getNextDay(getNextDay(getNextDay(getNextDay(getNextDay(new Date()))))))));
        expect(formatDateToWords(nextWeekNextDay, "XX")).toBe("XX");
    });

    it("converts date to format", () => {
        expect(format(new Date(Date.UTC(2017, 0, 2)), "%dd-%mm-%YYYY")).toBe("02-01-2017");
        expect(format(new Date(Date.UTC(2017, 0, 2)), "%dddd")).toBe("Monday");
    });

    it("knows when a data is within the next week", () => {
        expect(isWithinNextWeek(new Date(Date.UTC(2017, 0, 2)),
            new Date(Date.UTC(2017, 0, 2)))).toBe(true);
        expect(isWithinNextWeek(new Date(Date.UTC(2017, 0, 2)),
            new Date(Date.UTC(2017, 0, 8)))).toBe(true);
        expect(isWithinNextWeek(new Date(Date.UTC(2017, 0, 2)),
            new Date(Date.UTC(2017, 0, 9)))).toBe(false);
        expect(isWithinNextWeek(new Date(Date.UTC(2017, 0, 2)),
            new Date(Date.UTC(2017, 0, 1)))).toBe(false);
        expect(isWithinNextWeek(new Date(Date.UTC(2017, 0, 2)),
            new Date(Date.UTC(2016, 11, 30)))).toBe(false);

        expect(isWithinNextWeek(new Date(Date.UTC(2016, 11, 30)),
            new Date(Date.UTC(2017, 0, 1)))).toBe(true);
        expect(isWithinNextWeek(new Date(Date.UTC(2016, 11, 30)),
            new Date(Date.UTC(2017, 0, 5)))).toBe(true);
        expect(isWithinNextWeek(new Date(Date.UTC(2016, 11, 30)),
            new Date(Date.UTC(2017, 0, 6)))).toBe(false);

        expect(isWithinNextWeek(new Date(Date.UTC(2016, 11, 30)),
            new Date(Date.UTC(2018, 0, 1)))).toBe(false);
        expect(isWithinNextWeek(new Date(Date.UTC(2017, 0, 2)),
            new Date(Date.UTC(2018, 0, 3)))).toBe(false);
    });
});
