import MarkdownTableData from "./markdownTableData";
import * as Utility from "./markdownTableUtility";

const config = {
  alignData: true,
  alignColumnHeader: true,
  paddedDelimiterRowPipes: false,
};

export function stringToTableData(tableText: string): MarkdownTableData {
  const lines = tableText.split(/\r\n|\n|\r/);

  let getIndent = (linestr: string) => {
    if (linestr.trim().startsWith("|")) {
      let linedatas = linestr.split("|");
      return linedatas[0];
    } else {
      return "";
    }
  };

  const columns = Utility.splitline(lines[0], 0);
  const columnNum = columns.length;
  const indent = getIndent(lines[0]);

  let aligns: [string, string][] = new Array();
  let alignTexts: string[] = new Array();
  const aligndatas = Utility.splitline(lines[1], columnNum, "---");
  for (let i = 0; i < columnNum; i++) {
    alignTexts[i] = aligndatas[i];
    let celldata = aligndatas[i].trim();
    aligns[i] = [celldata[0], celldata.slice(-1)];
  }

  const cells: string[][] = new Array();
  const leftovers: string[] = new Array();
  let cellrow = -1;
  for (let row = 2; row < lines.length; row++) {
    cellrow++;

    const linedatas = Utility.splitline(lines[row], columnNum);
    cells[cellrow] = linedatas.slice(0, columnNum);

    leftovers[cellrow] = "";
    if (linedatas.length > columnNum) {
      const leftoverdatas = linedatas.slice(columnNum, linedatas.length);
      leftovers[cellrow] = leftoverdatas.join("|");
    }
  }

  return new MarkdownTableData(
    tableText,
    aligns,
    alignTexts,
    columns,
    cells,
    leftovers,
    indent
  );
}

function CreateMarkdownTableData(
  _text: string,
  _aligns: [string, string][],
  _columns: string[],
  _cells: string[][],
  _leftovers: string[],
  _indent: string
): MarkdownTableData {
  let alignTexts: string[] = new Array();
  for (let column = 0; column < _aligns.length; column++) {
    alignTexts[column] = _aligns[column][0] + "-" + _aligns[column][1];
  }
  return new MarkdownTableData(
    _text,
    _aligns,
    alignTexts,
    _columns,
    _cells,
    _leftovers,
    _indent
  );
}

function convertSeparatedValuesToTableData(
  text: string,
  separater: string
): MarkdownTableData {
  let lines = text.split(/\r\n|\n|\r/);
  let columns: string[] = new Array();
  let columntexts = lines[0].split(separater);
  let columnCount = columntexts.length;

  for (let i = 0; i < columnCount; i++) {
    columns[i] = columntexts[i].trim();
  }

  let cells: string[][] = new Array();
  let leftovers: string[] = new Array();
  for (let row = 1; row < lines.length; row++) {
    cells[row - 1] = new Array();
    for (let column = 0; column < columnCount; column++) {
      cells[row - 1][column] = " ";
    }

    leftovers[row - 1] = "";

    let lineValues = lines[row].split(separater);

    for (let column = 0; column < lineValues.length; column++) {
      if (column >= columnCount) {
        leftovers[row - 1] += separater + lineValues[column];
        continue;
      }
      cells[row - 1][column] = lineValues[column].trim();
    }
  }

  let aligns: [string, string][] = new Array();
  for (let column = 0; column < columnCount; column++) {
    aligns[column] = [":", "-"];
  }

  const table = CreateMarkdownTableData(
    "",
    aligns,
    columns,
    cells,
    leftovers,
    ""
  );
  return CreateMarkdownTableData(
    toFormatTableStr(table),
    aligns,
    columns,
    cells,
    leftovers,
    ""
  );
}

export function tsvToTableData(tsvText: string): MarkdownTableData {
  return convertSeparatedValuesToTableData(tsvText, "\t");
}

export function csvToTableData(csvText: string): MarkdownTableData {
  return convertSeparatedValuesToTableData(csvText, ",");
}

export function insertRow(
  tableData: MarkdownTableData,
  insertAt: number
): MarkdownTableData {
  const columns = tableData.columns;
  const aligns = tableData.aligns;
  const cells = tableData.cells;
  const leftovers = tableData.leftovers;
  const column_num = tableData.columns.length;
  const indent = tableData.indent;

  cells.splice(
    insertAt,
    0,
    Array.from({ length: column_num }, () => "  ")
  );
  leftovers.splice(insertAt, 0, "");

  const text =
    tableData.originalText +
    "\n" +
    tableData.indent +
    "|" +
    "  |".repeat(tableData.columns.length);

  return CreateMarkdownTableData(
    text,
    aligns,
    columns,
    cells,
    leftovers,
    indent
  );
}

export function insertColumn(
  tableData: MarkdownTableData,
  insertAt: number
): MarkdownTableData {
  let columns = tableData.columns;
  let aligns = tableData.aligns;
  let cells = tableData.cells;
  let leftovers = tableData.leftovers;
  let column_num = tableData.columns.length;
  let indent = tableData.indent;

  columns.splice(insertAt, 0, "");
  aligns.splice(insertAt, 0, ["-", "-"]);
  for (let i = 0; i < cells.length; i++) {
    cells[i].splice(insertAt, 0, "");
  }

  const table = CreateMarkdownTableData(
    "",
    aligns,
    columns,
    cells,
    leftovers,
    indent
  );
  return CreateMarkdownTableData(
    toFormatTableStr(table),
    aligns,
    columns,
    cells,
    leftovers,
    indent
  );
}

export function getColumnMaxWidths(tableData: MarkdownTableData): number[] {
  let columnNum = tableData.columns.length;

  let maxWidths: number[] = new Array();
  for (let i = 0; i < tableData.columns.length; i++) {
    let cellLength = Utility.getLen(tableData.columns[i].trim());
    maxWidths[i] = 3 > cellLength ? 3 : cellLength;
  }

  for (let row = 0; row < tableData.cells.length; row++) {
    let cells = tableData.cells[row];
    for (let i = 0; i < cells.length; i++) {
      if (i > columnNum) {
        break;
      }
      let cellLength = Utility.getLen(cells[i].trim());
      maxWidths[i] = maxWidths[i] > cellLength ? maxWidths[i] : cellLength;
    }
  }

  return maxWidths;
}

export function toFormatTableStr(tableData: MarkdownTableData): string {
  const alignData = <boolean>config.alignData;
  const alignHeader = <boolean>config.alignColumnHeader;
  const paddedDelimiterRowPipes = <boolean>config.paddedDelimiterRowPipes;

  const maxWidths = getColumnMaxWidths(tableData);

  const columnNum = tableData.columns.length;
  const formatted: string[] = new Array();

  for (let row = 0; row < tableData.cells.length; row++) {
    formatted[row] = "";
    formatted[row] += tableData.indent;
    const cells = tableData.cells[row];
    for (let i = 0; i < columnNum; i++) {
      let celldata = "";
      if (i < cells.length) {
        celldata = cells[i].trim();
      }
      const celldata_length = Utility.getLen(celldata);

      formatted[row] += "| ";
      if (alignData) {
        let [front, end] = tableData.aligns[i];
        if (front === ":" && end === ":") {
          for (let n = 0; n < (maxWidths[i] - celldata_length) / 2 - 0.5; n++) {
            formatted[row] += " ";
          }
          formatted[row] += celldata;
          for (let n = 0; n < (maxWidths[i] - celldata_length) / 2; n++) {
            formatted[row] += " ";
          }
        } else if (front === "-" && end === ":") {
          for (let n = 0; n < maxWidths[i] - celldata_length; n++) {
            formatted[row] += " ";
          }
          formatted[row] += celldata;
        } else {
          formatted[row] += celldata;
          for (let n = 0; n < maxWidths[i] - celldata_length; n++) {
            formatted[row] += " ";
          }
        }
      } else {
        formatted[row] += celldata;
        for (let n = celldata_length; n < maxWidths[i]; n++) {
          formatted[row] += " ";
        }
      }
      formatted[row] += " ";
    }
    formatted[row] += "|";

    if (tableData.leftovers[row].length > 0) {
      formatted[row] += tableData.leftovers[row];
    }
  }

  let columnHeader = "";
  columnHeader += tableData.indent;
  for (let i = 0; i < columnNum; i++) {
    const columnText = tableData.columns[i].trim();
    const columnHeader_length = Utility.getLen(columnText);

    columnHeader += "| ";
    if (alignHeader) {
      const [front, end] = tableData.aligns[i];
      if (front === ":" && end === ":") {
        for (
          let n = 0;
          n < (maxWidths[i] - columnHeader_length) / 2 - 0.5;
          n++
        ) {
          columnHeader += " ";
        }
        columnHeader += columnText;
        for (let n = 0; n < (maxWidths[i] - columnHeader_length) / 2; n++) {
          columnHeader += " ";
        }
      } else if (front === "-" && end === ":") {
        for (let n = 0; n < maxWidths[i] - columnHeader_length; n++) {
          columnHeader += " ";
        }
        columnHeader += columnText;
      } else {
        columnHeader += columnText;
        for (let n = 0; n < maxWidths[i] - columnHeader_length; n++) {
          columnHeader += " ";
        }
      }
    } else {
      columnHeader += columnText;
      for (let n = columnHeader_length; n < maxWidths[i]; n++) {
        columnHeader += " ";
      }
    }
    columnHeader += " ";
  }
  columnHeader += "|";

  for (let i = 0; i < columnNum; i++) {
    const [front, end] = tableData.aligns[i];
    if (paddedDelimiterRowPipes) {
      tableData.alignTexts[i] = " " + front;
    } else {
      tableData.alignTexts[i] = front + "-";
    }
    for (let n = 1; n < maxWidths[i] - 1; n++) {
      tableData.alignTexts[i] += "-";
    }
    if (paddedDelimiterRowPipes) {
      tableData.alignTexts[i] += end + " ";
    } else {
      tableData.alignTexts[i] += "-" + end;
    }
  }
  let tablemark = "";
  tablemark += tableData.indent;
  for (let i = 0; i < tableData.alignTexts.length; i++) {
    const alignText = tableData.alignTexts[i];
    tablemark += "|" + alignText;
  }
  tablemark += "|";

  formatted.splice(0, 0, columnHeader);
  formatted.splice(1, 0, tablemark);

  return formatted.join("\r\n");
}

export function getPositionOfCell(
  tableData: MarkdownTableData,
  cellRow: number,
  cellColumn: number
): [number, number] {
  const line = cellRow <= 0 ? 0 : cellRow;

  const lines = tableData.originalText.split(/\r\n|\n|\r/);
  const linestr = lines[cellRow];

  const cells = Utility.splitline(linestr, tableData.columns.length);

  let character = 0;
  character += tableData.indent.length;
  character += 1;
  for (let i = 0; i < cellColumn; i++) {
    character += cells[i].length;
    character += 1;
  }

  return [line, character];
}

export function getCellAtPosition(
  tableData: MarkdownTableData,
  line: number,
  character: number
): [number, number] {
  const row = line <= 0 ? 0 : line;

  const lines = tableData.originalText.split(/\r\n|\n|\r/);
  const linestr = lines[row];

  const cells = Utility.splitline(linestr, tableData.columns.length);

  let column = -1;
  let cell_end = tableData.indent.length;
  for (let cell of cells) {
    column++;
    cell_end += 1 + cell.length;

    if (character <= cell_end) {
      break;
    }
  }

  return [row, column];
}

export function getCellData(
  tableData: MarkdownTableData,
  cellRow: number,
  cellColumn: number
): string {
  if (cellRow === 0) {
    return tableData.columns.length > cellColumn
      ? tableData.columns[cellColumn]
      : "";
  }
  if (cellRow === 1) {
    return tableData.alignTexts.length > cellColumn
      ? tableData.alignTexts[cellColumn]
      : "";
  }
  if (cellRow >= tableData.cells.length + 2) {
    return "";
  }

  return tableData.cells[cellRow - 2][cellColumn];
}

export default function formatTable(md: string): string {
  const data = stringToTableData(md);
  return toFormatTableStr(data);
}
