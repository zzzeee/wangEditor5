/**
 * @description table full width menu
 * @author wangfupeng
 */

import { Transforms, Range } from 'slate'
import {
  IButtonMenu,
  IDomEditor,
  DomEditor,
  t,
  genModalInputElems,
  genModalButtonElems,
} from '@wangeditor/core'
import { SET_COLUMN_WIDTH } from '../../constants/svg'
import { TableElement } from '../custom-types'
import { getFirstRowCells } from '../helpers'
import { genRandomStr } from '../../utils/util'
import $, { Dom7Array, DOMElement } from '../../utils/dom'

/**
 * 生成唯一的 DOM ID
 */
function genDomID(): string {
  return genRandomStr('w-e-edit-table')
}

class ColumnWidth implements IButtonMenu {
  readonly title = t('tableModule.setColumnWidth')
  readonly iconSvg = SET_COLUMN_WIDTH
  readonly tag = 'button'

  readonly showModal = true // 点击 button 时显示 modal
  readonly modalWidth = 300
  private $content: Dom7Array | null = null
  private readonly buttonId = genDomID()

  private inputIdArr: string[] = []

  getInputIdByIndex = index => {
    return index < this.inputIdArr.length ? this.inputIdArr[index] : ''
  }

  getValue(editor: IDomEditor): string | boolean {
    // 无需获取 val
    return ''
  }

  isActive(editor: IDomEditor): boolean {
    // 无需 active
    return false
  }

  isDisabled(editor: IDomEditor): boolean {
    const { selection } = editor
    if (selection == null) return true
    if (!Range.isCollapsed(selection)) return true

    const tableNode = DomEditor.getSelectedNodeByType(editor, 'table')
    if (tableNode == null) {
      // 选区未处于 table node ，则禁用
      return true
    }
    return false
  }

  exec(editor: IDomEditor, value: string | boolean) {
    // 点击菜单时，弹出 modal 之前，不需要执行其他代码
    // 此处空着即可
  }

  getModalPositionNode(editor: IDomEditor): Node | null {
    // return DomEditor.getSelectedNodeByType(editor, 'table')
    return null
  }

  getModalContentElem(editor: IDomEditor): DOMElement {
    // 获取第一行所有 cell
    let tableNode = DomEditor.getSelectedNodeByType(editor, 'table') as TableElement
    if (tableNode == null) {
      throw new Error('Not found selected table node')
    }
    const firstRowCells = getFirstRowCells(tableNode)
    if (!firstRowCells.length) {
      throw new Error('Not found selected table cell node')
    }

    const that = this
    const { buttonId } = that

    // 获取输入框的元素数据
    // const inputIdArr: string[] = []
    this.inputIdArr = []
    const inputContainerElemArr: any[] = []
    const inputElementArr: any[] = []
    const vals: string[] = []
    firstRowCells.forEach((cell, index) => {
      let id = genDomID()
      // inputIdArr.push(id)
      this.inputIdArr.push(id)
      const [containerElem, element] = genModalInputElems(
        t('tableModule.rowNumbersWidth').replace('%d', String(index + 1)),
        id
      )
      inputContainerElemArr.push(containerElem)
      inputElementArr.push($(element))
      vals.push(cell.width || '')
    })

    const [buttonContainerElem] = genModalButtonElems(buttonId, t('common.ok'))

    if (this.$content == null) {
      // 第一次渲染
      const $content = $('<div></div>')

      // 绑定事件（第一次渲染时绑定，不要重复绑定）
      $content.on('click', `#${buttonId}`, e => {
        e.preventDefault()
        // 设置 单元格宽度
        firstRowCells.forEach((cell, index) => {
          // cell.width = $content.find(`#${that.getInputIdByIndex(index)}`).val() || ''
          Transforms.setNodes(
            editor,
            { width: $content.find(`#${that.getInputIdByIndex(index)}`).val() || '' },
            {
              at: DomEditor.findPath(editor, cell),
            }
          )
        })

        editor.hidePanelOrModal() // 隐藏 modal
      })

      // 记录属性，重要
      this.$content = $content
    }

    const $content = this.$content
    $content.empty() // 先清空内容

    for (let o of inputContainerElemArr) {
      $content.append(o)
    }
    $content.append(buttonContainerElem)

    for (let i in inputElementArr) {
      inputElementArr[i].val(vals[i])
    }

    // focus 一个 input（异步，此时 DOM 尚未渲染）
    setTimeout(() => {
      inputElementArr[0].focus()
    })

    return $content[0]
  }
}

export default ColumnWidth
