const fs = require('fs')
const path = require('path')
const { BrowserWindow, ipcMain, webContents } = require('electron')
const pluginDataPath = LiteLoader.plugins['animate'].path.data
const settingsPath = path.join(pluginDataPath, 'animate_settings.json')

const csspath = path.join(__dirname, 'src/styles/dynamic.css')
const passLog = (webcontents,args) => {
  webcontents.send(
    'LiteLoader.animate.log',
    ...args
  )
}
const log = (...args) => {
  const window = BrowserWindow.getFocusedWindow()
  window.console.log(`[animate]`, ...args)
}
// 防抖函数
const debounce = (fn, time) => {
  let timer = null
  return function (...args) {
    timer && clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, time)
  }
}
const getConfig = () => {
  let config = {}
  try {
    const data = fs.readFileSync(settingsPath, 'utf-8')
    config = JSON.parse(data)
  } catch (e) {
    log('读取配置json错误', e)
  }
  return config
}
const updateStyle = (webContents, settingsPath) => {
  const config = getConfig()
  fs.readFile(csspath, 'utf-8', (err, data) => {
    if (err) {
      throw err
      return
    }
    /* todo 不同的选择器 不同的var*/
    let preloadString = `
        /*待扩展：动态全局默认css变量实现比如按钮得无事件的动画*/
        .send-btn-wrap:has(.sendable)｛
          --animate-duration: ${config.sendHighlightDuration}s;
          --animate-type: ${config.sendHighlightType};
        ｝
        `
    fs.writeFileSync(csspath, preloadString, 'utf-8')
  })
}
// 监听CSS修改-开发时候用的
const watchCSSChange = (webContents, settingsPath) => {
  fs.watch(csspath, 'utf-8', debounce(() => {
    updateStyle(webContents, settingsPath)
  }, 100))
}

// 监听配置文件修改
const watchSettingsChange = (webContents, settingsPath) => {
  fs.watch(settingsPath, 'utf-8', debounce(() => {
    updateStyle(webContents, settingsPath)
  }, 100))
}
const initSettingFile = () => {
// fs判断插件路径是否存在，如果不存在则创建（同时创建父目录（如果不存在的话））
  if (!fs.existsSync(pluginDataPath)) {
    fs.mkdirSync(pluginDataPath, { recursive: true })
  }
// 判断settings.json是否存在，如果不存在则创建
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, JSON.stringify({
      contextEntrancesDuration: 1,
      contextEnterType: 'fadeIn',
    }))
  }
}
initSettingFile()

ipcMain.on(
  'LiteLoader.animate.rendererReady',
  (event, message) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    updateStyle(window.webContents, settingsPath)
  }
)

// 监听渲染进程的updateStyle事件
ipcMain.on(
  'LiteLoader.animate.updateStyle',
  (event, settingsPath) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    updateStyle(window.webContents, settingsPath)
  })

// 监听渲染进程的watchCSSChange事件
ipcMain.on(
  'LiteLoader.animate.watchCSSChange',
  (event, settingsPath) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    watchCSSChange(window.webContents, settingsPath)
  })

// 监听渲染进程的watchSettingsChange事件
ipcMain.on(
  'LiteLoader.animate.watchSettingsChange',
  (event, settingsPath) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    watchSettingsChange(window.webContents, settingsPath)
  })

ipcMain.handle(
  'LiteLoader.animate.getSettings',
  (event, message) => getConfig()
)

ipcMain.handle(
  'LiteLoader.animate.setSettings',
  (event, content) => {
    try {
      const new_config = JSON.stringify(content)
      fs.writeFileSync(settingsPath, new_config, 'utf-8')
    } catch (error) {
      log(error)
    }
  }
)

// 创建窗口时触发
module.exports.onBrowserWindowCreated = window => {
  window.on('ready-to-show', () => {
    const url = window.webContents.getURL()
    if (url.includes('app://./renderer/index.html')) {
      watchCSSChange(window.webContents, settingsPath)
      watchSettingsChange(window.webContents, settingsPath)
    }
  })
}
