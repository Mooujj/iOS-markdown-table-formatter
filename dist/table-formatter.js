"use strict";
var formatTable = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if ((from && typeof from === "object") || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, {
            get: () => from[key],
            enumerable:
              !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
          });
    }
    return to;
  };
  var __toCommonJS = (mod) =>
    __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/markdownTableDataHelper.ts
  var markdownTableDataHelper_exports = {};
  __export(markdownTableDataHelper_exports, {
    csvToTableData: () => csvToTableData,
    default: () => formatTable,
    getCellAtPosition: () => getCellAtPosition,
    getCellData: () => getCellData,
    getColumnMaxWidths: () => getColumnMaxWidths,
    getPositionOfCell: () => getPositionOfCell,
    insertColumn: () => insertColumn,
    insertRow: () => insertRow,
    stringToTableData: () => stringToTableData,
    toFormatTableStr: () => toFormatTableStr,
    tsvToTableData: () => tsvToTableData,
  });

  // src/markdownTableData.ts
  var MarkdownTableData = class {
    constructor(
      _text,
      _aligns,
      _alignTexts,
      _columns,
      _cells,
      _leftovers,
      _indent
    ) {
      this.originalText = _text;
      this.aligns = _aligns;
      this.alignTexts = _alignTexts;
      this.columns = _columns;
      this.cells = _cells;
      this.leftovers = _leftovers;
      this.indent = _indent;
    }
  };

  // src/markdownTableUtility.ts
  function splitline(linestr, columnNum, fillstr = "") {
    linestr = linestr.trim();
    if (linestr.startsWith("|")) {
      linestr = linestr.slice(1);
    }
    if (linestr.endsWith("|")) {
      linestr = linestr.slice(0, -1);
    }
    let linedatas = [];
    let startindex = 0;
    let endindex = 0;
    let isEscaping = false;
    let isInInlineCode = false;
    for (let i = 0; i < linestr.length; ++i) {
      if (isEscaping) {
        isEscaping = false;
        endindex++;
        continue;
      }
      const chara = linestr.charAt(i);
      if (chara === "`") {
        isInInlineCode = !isInInlineCode;
        endindex++;
        continue;
      }
      if (isInInlineCode) {
        endindex++;
        continue;
      }
      if (chara === "\\") {
        isEscaping = true;
        endindex++;
        continue;
      }
      if (chara !== "|") {
        endindex++;
        continue;
      }
      let cellstr = linestr.slice(startindex, endindex);
      linedatas.push(cellstr);
      startindex = i + 1;
      endindex = i + 1;
    }
    linedatas.push(linestr.slice(startindex));
    let datas = new Array(columnNum).fill(fillstr);
    for (let i = 0; i < linedatas.length; i++) {
      datas[i] = linedatas[i];
    }
    return datas;
  }
  function getLen(str) {
    let length = 0;
    for (let i = 0; i < str.length; i++) {
      let chp = str.codePointAt(i);
      if (chp === void 0) {
        continue;
      }
      let chr = chp;
      if (doesUse0Space(chr)) {
        length += 0;
      } else if (doesUse3Spaces(chr)) {
        length += 3;
      } else if (doesUse2Spaces(chr)) {
        length += 2;
      } else {
        length += 1;
      }
      let chc = str.charCodeAt(i);
      if (chc >= 55296 && chc <= 56319) {
        i++;
      }
    }
    return length;
  }
  function doesUse0Space(charCode) {
    if (
      charCode === 734 ||
      (charCode >= 768 && charCode <= 879) ||
      (charCode >= 1155 && charCode <= 1159) ||
      (charCode >= 1424 && charCode <= 1487)
    ) {
      return true;
    }
    return false;
  }
  function doesUse2Spaces(charCode) {
    if (
      (charCode >= 9344 && charCode <= 9471) ||
      (charCode >= 9728 && charCode <= 10239) ||
      (charCode >= 10496 && charCode <= 11519) ||
      (charCode >= 11776 && charCode <= 65376) ||
      charCode >= 65440
    ) {
      return true;
    }
    return false;
  }
  function doesUse3Spaces(charCode) {
    if (charCode >= 127744 && charCode <= 130047) {
      return true;
    }
    return false;
  }

  // src/markdownTableDataHelper.ts
  var config = {
    alignData: true,
    alignColumnHeader: true,
    paddedDelimiterRowPipes: false,
  };
  function stringToTableData(tableText) {
    const lines = tableText.split(/\r\n|\n|\r/);
    let getIndent = (linestr) => {
      if (linestr.trim().startsWith("|")) {
        let linedatas = linestr.split("|");
        return linedatas[0];
      } else {
        return "";
      }
    };
    const columns = splitline(lines[0], 0);
    const columnNum = columns.length;
    const indent = getIndent(lines[0]);
    let aligns = new Array();
    let alignTexts = new Array();
    const aligndatas = splitline(lines[1], columnNum, "---");
    for (let i = 0; i < columnNum; i++) {
      alignTexts[i] = aligndatas[i];
      let celldata = aligndatas[i].trim();
      aligns[i] = [celldata[0], celldata.slice(-1)];
    }
    const cells = new Array();
    const leftovers = new Array();
    let cellrow = -1;
    for (let row = 2; row < lines.length; row++) {
      cellrow++;
      const linedatas = splitline(lines[row], columnNum);
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
    _text,
    _aligns,
    _columns,
    _cells,
    _leftovers,
    _indent
  ) {
    let alignTexts = new Array();
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
  function convertSeparatedValuesToTableData(text, separater) {
    let lines = text.split(/\r\n|\n|\r/);
    let columns = new Array();
    let columntexts = lines[0].split(separater);
    let columnCount = columntexts.length;
    for (let i = 0; i < columnCount; i++) {
      columns[i] = columntexts[i].trim();
    }
    let cells = new Array();
    let leftovers = new Array();
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
    let aligns = new Array();
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
  function tsvToTableData(tsvText) {
    return convertSeparatedValuesToTableData(tsvText, "	");
  }
  function csvToTableData(csvText) {
    return convertSeparatedValuesToTableData(csvText, ",");
  }
  function insertRow(tableData, insertAt) {
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
  function insertColumn(tableData, insertAt) {
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
  function getColumnMaxWidths(tableData) {
    let columnNum = tableData.columns.length;
    let maxWidths = new Array();
    for (let i = 0; i < tableData.columns.length; i++) {
      let cellLength = getLen(tableData.columns[i].trim());
      maxWidths[i] = 3 > cellLength ? 3 : cellLength;
    }
    for (let row = 0; row < tableData.cells.length; row++) {
      let cells = tableData.cells[row];
      for (let i = 0; i < cells.length; i++) {
        if (i > columnNum) {
          break;
        }
        let cellLength = getLen(cells[i].trim());
        maxWidths[i] = maxWidths[i] > cellLength ? maxWidths[i] : cellLength;
      }
    }
    return maxWidths;
  }
  function toFormatTableStr(tableData) {
    const alignData = config.alignData;
    const alignHeader = config.alignColumnHeader;
    const paddedDelimiterRowPipes = config.paddedDelimiterRowPipes;
    const maxWidths = getColumnMaxWidths(tableData);
    const columnNum = tableData.columns.length;
    const formatted = new Array();
    for (let row = 0; row < tableData.cells.length; row++) {
      formatted[row] = "";
      formatted[row] += tableData.indent;
      const cells = tableData.cells[row];
      for (let i = 0; i < columnNum; i++) {
        let celldata = "";
        if (i < cells.length) {
          celldata = cells[i].trim();
        }
        const celldata_length = getLen(celldata);
        formatted[row] += "| ";
        if (alignData) {
          let [front, end] = tableData.aligns[i];
          if (front === ":" && end === ":") {
            for (
              let n = 0;
              n < (maxWidths[i] - celldata_length) / 2 - 0.5;
              n++
            ) {
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
      const columnHeader_length = getLen(columnText);
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
  function getPositionOfCell(tableData, cellRow, cellColumn) {
    const line = cellRow <= 0 ? 0 : cellRow;
    const lines = tableData.originalText.split(/\r\n|\n|\r/);
    const linestr = lines[cellRow];
    const cells = splitline(linestr, tableData.columns.length);
    let character = 0;
    character += tableData.indent.length;
    character += 1;
    for (let i = 0; i < cellColumn; i++) {
      character += cells[i].length;
      character += 1;
    }
    return [line, character];
  }
  function getCellAtPosition(tableData, line, character) {
    const row = line <= 0 ? 0 : line;
    const lines = tableData.originalText.split(/\r\n|\n|\r/);
    const linestr = lines[row];
    const cells = splitline(linestr, tableData.columns.length);
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
  function getCellData(tableData, cellRow, cellColumn) {
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
  function formatTable(md) {
    const data = stringToTableData(md);
    return toFormatTableStr(data);
  }
  return __toCommonJS(markdownTableDataHelper_exports);
})();

window.formatTable =
  // if the IIFE returned an object with a `.default` (your function), use that:
  typeof formatTable.default === "function"
    ? formatTable.default
    : // otherwise, if it *is* a function itself, use it:
    typeof formatTable === "function"
    ? formatTable
    : // fallback to something harmless:
      () => {
        throw new Error("No formatTable function available");
      };
