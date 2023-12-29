/**
 * @description fileCache module
 * @author
 */

import { IModuleConf } from '@wangeditor/core'
import { fileCacheMenuConf } from './menu/index'

const uploadImage: Partial<IModuleConf> = {
  menus: [fileCacheMenuConf],
  // editorPlugin: withUploadImage,
}

export default uploadImage
