export namespace HtmlUtils {
  export function cleanUp(html: string) {
    return html
      .replace(new RegExp("[\n\r\t]*", "gi"), "")
      .replace(new RegExp(" class=\"tv\"", "gi"), "")
      .replace(new RegExp(" +", "gi"), " ")
      .replace(new RegExp("\s?(<\/?(p|ol|li|h\d)>)\s?", "gi"), "$1")
      .replace(new RegExp(" <sup>\s?", "gi"), "<sup>")
      .replace(new RegExp(" </sup>", "gi"), "</sup>")
      .replace(new RegExp(" +", "gi"), " ");
  }

  export const findRowIndexMatching = (rows: string[], search: string) => {
    return rows.findIndex(it => it.includes(search));
  };

  export const executeWithRowIndexMatching = <T>(rows: string[], search: string, callback: (index: number) => T, maxIndex?: number): T | undefined => {
    const rowIndex = findRowIndexMatching(rows, search);
    if (rowIndex < 0 || (maxIndex !== undefined && rowIndex >= maxIndex)) {
      return undefined;
    }
    return callback(rowIndex);
  };
}
