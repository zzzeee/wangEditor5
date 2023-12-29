/**
 * @description to html
 * @author wangfupeng
 */

import { Element } from 'slate'
import { ImageElement } from './custom-types'

function imageToHtml(elemNode: Element, childrenHtml: string): string {
  const { src, alt = '', href = '', style = {} } = elemNode as ImageElement
  const { width = '', height = '', margin = '' } = style

  let styleStr = ''
  if (width) styleStr += `width: ${width};`
  if (height) styleStr += `height: ${height};`
  if (margin) styleStr += `margin: ${margin};`
  return `<img src="${src}" alt="${alt}" data-href="${href}" style="${styleStr}"/>`
}

export const imageToHtmlConf = {
  type: 'image',
  elemToHtml: imageToHtml,
}
