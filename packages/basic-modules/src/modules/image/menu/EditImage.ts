/**
 * @description editor image menu
 * @author wangfupeng
 */

import { Node, Range } from 'slate'
import {
  IModalMenu,
  IDomEditor,
  DomEditor,
  genModalInputElems,
  genModalButtonElems,
  t,
} from '@wangeditor/core'
import $, { Dom7Array, DOMElement } from '../../../utils/dom'
import { genRandomStr } from '../../../utils/util'
import { PENCIL_SVG } from '../../../constants/icon-svg'
import { updateImageNode } from '../helper'
import { ImageElement, ImageStyle } from '../custom-types'

/**
 * 生成唯一的 DOM ID
 */
function genDomID(): string {
  return genRandomStr('w-e-edit-image')
}

class EditImage implements IModalMenu {
  readonly title = t('image.edit')
  readonly iconSvg = PENCIL_SVG
  readonly tag = 'button'
  readonly showModal = true // 点击 button 时显示 modal
  readonly modalWidth = 300
  private $content: Dom7Array | null = null
  private readonly srcInputId = genDomID()
  private readonly altInputId = genDomID()
  private readonly hrefInputId = genDomID()
  private readonly buttonId = genDomID()
  private readonly sizeInputId = genDomID()
  private readonly marginInputId = genDomID()

  getValue(editor: IDomEditor): string | boolean {
    // 编辑图片，用不到 getValue
    return ''
  }

  private getImageNode(editor: IDomEditor): Node | null {
    return DomEditor.getSelectedNodeByType(editor, 'image')
  }

  isActive(editor: IDomEditor): boolean {
    // 无需 active
    return false
  }

  exec(editor: IDomEditor, value: string | boolean) {
    // 点击菜单时，弹出 modal 之前，不需要执行其他代码
    // 此处空着即可
  }

  isDisabled(editor: IDomEditor): boolean {
    const { selection } = editor
    if (selection == null) return true
    if (!Range.isCollapsed(selection)) return true // 选区非折叠，禁用

    const imageNode = DomEditor.getSelectedNodeByType(editor, 'image')

    // 未匹配到 image node 则禁用
    if (imageNode == null) return true
    return false
  }

  getModalPositionNode(editor: IDomEditor): Node | null {
    return this.getImageNode(editor)
  }

  getModalContentElem(editor: IDomEditor): DOMElement {
    const { srcInputId, altInputId, hrefInputId, buttonId, sizeInputId, marginInputId } = this

    const selectedImageNode = this.getImageNode(editor)
    if (selectedImageNode == null) {
      throw new Error('Not found selected image node')
    }

    // 获取 input button elem
    const [srcContainerElem, inputSrcElem] = genModalInputElems(t('image.src'), srcInputId)
    const $inputSrc = $(inputSrcElem)
    const [altContainerElem, inputAltElem] = genModalInputElems(t('image.desc'), altInputId)
    const $inputAlt = $(inputAltElem)
    const [hrefContainerElem, inputHrefElem] = genModalInputElems(t('image.link'), hrefInputId)
    const $inputHref = $(inputHrefElem)

    // 后加
    const [sizeContainerElem, inputSizeElem] = genModalInputElems(
      t('image.size'),
      sizeInputId,
      t('image.sizePlaceholder')
    )
    const $inputSize = $(inputSizeElem)
    const [marginContainerElem, inputMarginElem] = genModalInputElems(
      t('margin.four'),
      marginInputId,
      t('margin.fourPlaceholder')
    )
    const $inputMargin = $(inputMarginElem)

    const [buttonContainerElem] = genModalButtonElems(buttonId, t('common.ok'))

    if (this.$content == null) {
      // 第一次渲染
      const $content = $('<div></div>')

      // 绑定事件（第一次渲染时绑定，不要重复绑定）
      $content.on('click', `#${buttonId}`, e => {
        e.preventDefault()

        const src = $content.find(`#${srcInputId}`).val()
        const alt = $content.find(`#${altInputId}`).val()
        const href = $content.find(`#${hrefInputId}`).val()
        const imgStyle: ImageStyle = {}
        const sizeArr = $content.find(`#${sizeInputId}`).val().split(',')
        if (sizeArr.length > 0 && sizeArr[0] != '') {
          imgStyle.width = sizeArr[0]
        } else {
          imgStyle.width = ''
        }
        if (sizeArr.length > 1 && sizeArr[1] != '') {
          imgStyle.height = sizeArr[1]
        } else {
          imgStyle.height = ''
        }
        imgStyle.margin = ($content.find(`#${marginInputId}`).val() || '').replace(',', ' ')
        this.updateImage(editor, src, alt, href, imgStyle)
        editor.hidePanelOrModal() // 隐藏 modal
      })

      // 记录属性，重要
      this.$content = $content
    }

    const $content = this.$content
    $content.empty() // 先清空内容

    // append inputs and button
    $content.append(srcContainerElem)
    $content.append(altContainerElem)
    $content.append(hrefContainerElem)
    $content.append(sizeContainerElem)
    $content.append(marginContainerElem)
    $content.append(buttonContainerElem)

    // 设置 input val
    const { src, alt = '', href = '', style = {} } = selectedImageNode as ImageElement
    $inputSrc.val(src)
    $inputAlt.val(alt)
    $inputHref.val(href)
    $inputSize.val(style.width || style.height ? `${style.width || ''},${style.height || ''}` : '')
    // $inputMargin.val((
    //   style.marginTop || style.marginRight || style.marginBottom || style.marginLeft) ?
    //   `${style.marginTop || ''},${style.marginRight || ''},${style.marginBottom || ''},${style.marginLeft || ''}`
    //   :
    //   ''
    // )
    $inputMargin.val((style.margin || '').replace(/(^\s*)|(\s*$)/g, '').replace(' ', ','))

    // focus 一个 input（异步，此时 DOM 尚未渲染）
    setTimeout(() => {
      $inputSrc.focus()
    })

    return $content[0]
  }

  private updateImage(
    editor: IDomEditor,
    src: string,
    alt: string = '',
    href: string = '',
    style: ImageStyle = {}
  ) {
    if (!src) return

    // 还原选区
    editor.restoreSelection()

    if (this.isDisabled(editor)) return

    // 修改图片信息
    updateImageNode(editor, src, alt, href, style)
  }
}

export default EditImage
