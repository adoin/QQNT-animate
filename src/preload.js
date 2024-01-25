const { contextBridge, ipcRenderer } = require('electron')

// 在window对象下导出只读对象 访问方法比如render.js中访问 animate.getSettings()
contextBridge.exposeInMainWorld('animate', {
  bind_updateStyle: (callback) => ipcRenderer.on(
    'LiteLoader.animate.updateStyle',
    callback
  ),
  rendererReady: () => ipcRenderer.send(
    'LiteLoader.animate.rendererReady'
  ),
  getSettings: () => ipcRenderer.invoke(
    'LiteLoader.animate.getSettings'
  ),
  setSettings: content => ipcRenderer.invoke(
    'LiteLoader.animate.setSettings',
    content
  ),
  BIND_EVENT: (channel, callback) => {
    ipcRenderer.on(channel, callback)
  },
  triggerContextEnter: () => ipcRenderer.invoke(
    'LiteLoader.animate.contextEnter'
  ),
  BIND_ONCE: (channel, callback) => {
    ipcRenderer.once(channel, callback)
  },
})
