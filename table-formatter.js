// after you import or paste mtdh/stringToTableData & toFormatTableStr...
/**
 * @param {string} md
 * @returns {string}
 */
function formatTable(md) {
  const data = mtdh.stringToTableData(md);
  return mtdh.toFormatTableStr(data);
}
// expose for WebView
window.formatTable = formatTable;
