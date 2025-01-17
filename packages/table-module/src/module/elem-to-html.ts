/**
 * @description to html
 * @author wangfupeng
 */

import { Element } from 'slate'
import { TableCellElement, TableRowElement, TableElement } from './custom-types'

function tableToHtml(elemNode: Element, childrenHtml: string): string {
  const {
    width = 'auto',
    headCellPadding = '',
    bodyCellPadding = '',
    cellBorderWidth = 1,
  } = elemNode as TableElement

  return (
    '<table ' +
    `style="width: ${width};" ` +
    `data-headCellPadding="${headCellPadding}" ` +
    `data-bodyCellPadding="${bodyCellPadding}" ` +
    `data-cellBorderWidth="${cellBorderWidth}" ` +
    '>' +
    `<tbody>${childrenHtml}</tbody>` +
    '</table>'
  )
}

function tableRowToHtml(elem: Element, childrenHtml: string): string {
  return `<tr>${childrenHtml}</tr>`
}

function tableCellToHtml(cellNode: Element, childrenHtml: string): string {
  const {
    colSpan = 1,
    rowSpan = 1,
    isHeader = false,
    width = 'auto',
    headPadding,
    bodyPadding,
    borderWidth,
  } = cellNode as TableCellElement
  const tag = isHeader ? 'th' : 'td'
  const styleArr: string[] = []
  let padding = isHeader ? headPadding : bodyPadding
  if (padding !== undefined) {
    styleArr.push(`padding: ${padding}`)
  }
  if (borderWidth !== undefined) {
    styleArr.push(`border-width: ${borderWidth}px`)
  }
  const styleStr = styleArr.length ? `style="${styleArr.join(';')}"` : ''
  return `<${tag} colSpan="${colSpan}" rowSpan="${rowSpan}" width="${width}" ${styleStr}>${childrenHtml}</${tag}>`
}

export const tableToHtmlConf = {
  type: 'table',
  elemToHtml: tableToHtml,
}

export const tableRowToHtmlConf = {
  type: 'table-row',
  elemToHtml: tableRowToHtml,
}

export const tableCellToHtmlConf = {
  type: 'table-cell',
  elemToHtml: tableCellToHtml,
}
