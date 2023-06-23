import {formatDateToWords, getNextDay, getPreviousDay, format} from "../../src/utils";

describe("utils", () => {
  it("converts date to words", () => {
    expect(formatDateToWords(new Date(), "%dd-%mm-%YYYY")).toBe("today");
    expect(formatDateToWords(getNextDay(new Date()), "%dd-%mm-%YYYY")).toBe("tomorrow");
    expect(formatDateToWords(getPreviousDay(new Date()), "%dd-%mm-%YYYY")).toBe("yesterday");
    expect(formatDateToWords(new Date(Date.UTC(2017, 0, 2)), "%dd-%mm-%YYYY")).toBe("02-01-2017");
  });

  it("converts date to format", () => {
    expect(format(new Date(Date.UTC(2017, 0, 2)), "%dd-%mm-%YYYY")).toBe("02-01-2017");
    expect(format(new Date(Date.UTC(2017, 0, 2)), "%dddd")).toBe("Monday");
  });
});
