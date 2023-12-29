/**
 * @description fileCache menu
 * @author
 */

import { IButtonMenu, IDomEditor, t } from '@wangeditor/core'

class FileCache implements IButtonMenu {
  title = t('fileCache.title')
  tag = 'button'
  alwaysEnable = true

  getValue(editor: IDomEditor): string | boolean {
    return ''
  }

  isActive(editor: IDomEditor): boolean {
    return editor.isFullScreen
  }

  isDisabled(editor: IDomEditor): boolean {
    return false
  }

  exec(editor: IDomEditor, value: string | boolean) {
    console.log(editor, value)
  }
}

export default FileCache
