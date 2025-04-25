export function splitline(
  linestr: string,
  columnNum: number,
  fillstr: string = ""
) {
  linestr = linestr.trim();
  if (linestr.startsWith("|")) {
    linestr = linestr.slice(1);
  }
  if (linestr.endsWith("|")) {
    linestr = linestr.slice(0, -1);
  }

  let linedatas: string[] = [];
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

  let datas: string[] = new Array(columnNum).fill(fillstr);
  for (let i = 0; i < linedatas.length; i++) {
    datas[i] = linedatas[i];
  }
  return datas;
}

export function getLen(str: string): number {
  let length = 0;
  for (let i = 0; i < str.length; i++) {
    let chp = str.codePointAt(i);
    if (chp === undefined) {
      continue;
    }
    let chr = chp as number;
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
    if (chc >= 0xd800 && chc <= 0xdbff) {
      i++;
    }
  }
  return length;
}

function doesUse0Space(charCode: number): boolean {
  if (
    charCode === 0x02de ||
    (charCode >= 0x0300 && charCode <= 0x036f) ||
    (charCode >= 0x0483 && charCode <= 0x0487) ||
    (charCode >= 0x0590 && charCode <= 0x05cf)
  ) {
    return true;
  }
  return false;
}

function doesUse2Spaces(charCode: number): boolean {
  if (
    (charCode >= 0x2480 && charCode <= 0x24ff) ||
    (charCode >= 0x2600 && charCode <= 0x27ff) ||
    (charCode >= 0x2900 && charCode <= 0x2cff) ||
    (charCode >= 0x2e00 && charCode <= 0xff60) ||
    charCode >= 0xffa0
  ) {
    return true;
  }
  return false;
}

function doesUse3Spaces(charCode: number): boolean {
  if (charCode >= 0x1f300 && charCode <= 0x1fbff) {
    return true;
  }
  return false;
}
