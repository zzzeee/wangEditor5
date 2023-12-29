/**
 * @description menu entry
 * @author
 */

import FileCache from './FileCache'

export const fileCacheMenuConf = {
  key: 'fileCache',
  factory() {
    return new FileCache()
  },
}
