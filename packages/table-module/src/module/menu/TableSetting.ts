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
import { TABLE_SETTING } from '../../constants/svg'
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

class TableSetting implements IButtonMenu {
  readonly title = t('tableModule.settingTable')
  readonly iconSvg = TABLE_SETTING
  readonly tag = 'button'

  readonly showModal = true // 点击 button 时显示 modal
  readonly modalWidth = 300
  private $content: Dom7Array | null = null
  private readonly buttonId = genDomID()
  private readonly tableHeaderPaddingId = genDomID()
  private readonly tableBodyPaddingId = genDomID()
  private readonly cellBorderWidthId = genDomID()
  private nowTableNode: TableElement = {
    type: 'table',
    width: '',
    children: [],
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
    this.nowTableNode = tableNode
    const { buttonId, tableHeaderPaddingId, tableBodyPaddingId, cellBorderWidthId } = that

    const [headContainerElem, headElem] = genModalInputElems(
      t('tableModule.headerPadding'),
      tableHeaderPaddingId,
      t('margin.fourPlaceholder')
    )
    const [bodyContainerElem, bodyElem] = genModalInputElems(
      t('tableModule.bodyPadding'),
      tableBodyPaddingId,
      t('margin.fourPlaceholder')
    )
    const [borderWidthContainerElem, borderWidthElem] = genModalInputElems(
      t('tableModule.cellBorderWidth'),
      cellBorderWidthId,
      t('margin.fourPlaceholder')
    )
    const [buttonContainerElem] = genModalButtonElems(buttonId, t('common.ok'))

    if (this.$content == null) {
      // 第一次渲染
      const $content = $('<div></div>')

      // 绑定事件（第一次渲染时绑定，不要重复绑定）
      $content.on('click', `#${buttonId}`, e => {
        e.preventDefault()

        const cellHeadPaddingVal = ($content.find(`#${tableHeaderPaddingId}`).val() || '').replace(
          ',',
          ' '
        )
        const cellBodyPaddingVal = ($content.find(`#${tableBodyPaddingId}`).val() || '').replace(
          ',',
          ' '
        )
        const cellBorderWidthVal = isNaN($content.find(`#${cellBorderWidthId}`).val())
          ? 1
          : parseInt($content.find(`#${cellBorderWidthId}`).val())
        const props: Partial<TableElement> = {
          headCellPadding: cellHeadPaddingVal,
          bodyCellPadding: cellBodyPaddingVal,
          cellBorderWidth: cellBorderWidthVal || 0,
          // children: that.nowTableNode.children.map(o => {
          //   return {
          //     ...o,
          //     children: o.children.map(o2 => ({
          //       ...o2,
          //       headPadding: cellHeadPaddingVal,
          //       bodyPadding: cellBodyPaddingVal,
          //       borderWidth: cellBorderWidthVal,
          //     }))
          //   }
          // })
        }
        Transforms.setNodes(editor, props, {
          at: DomEditor.findPath(editor, that.nowTableNode),
        })
        // console.log(props, that.nowTableNode)
        for (let row of that.nowTableNode.children) {
          for (let cell of row.children) {
            Transforms.setNodes(
              editor,
              {
                headPadding: cellHeadPaddingVal,
                bodyPadding: cellBodyPaddingVal,
                borderWidth: cellBorderWidthVal,
              },
              {
                at: DomEditor.findPath(editor, cell),
              }
            )
          }
        }

        editor.hidePanelOrModal() // 隐藏 modal
      })

      // 记录属性，重要
      this.$content = $content
    }

    const $content = this.$content
    $content.empty() // 先清空内容

    $content.append(headContainerElem)
    $content.append(bodyContainerElem)
    $content.append(borderWidthContainerElem)
    $content.append(buttonContainerElem)

    $(headElem).val(
      (tableNode.headCellPadding || '').replace(/(^\s*)|(\s*$)/g, '').replace(' ', ',')
    )
    $(bodyElem).val(
      (tableNode.bodyCellPadding || '').replace(/(^\s*)|(\s*$)/g, '').replace(' ', ',')
    )
    $(borderWidthElem).val(tableNode.cellBorderWidth !== undefined ? tableNode.cellBorderWidth : '')

    // focus 一个 input（异步，此时 DOM 尚未渲染）
    setTimeout(() => {
      $(headElem).focus()
    })

    return $content[0]
  }
}

export default TableSetting
