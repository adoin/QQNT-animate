const plugin_path = LiteLoader.plugins['animate'].path.plugin
const animatePrefix = 'animate__'
const entrances = [
  'backInDown',
  'backInLeft',
  'backInRight',
  'backInUp',
  'bounceIn',
  'bounceInDown',
  'bounceInLeft',
  'bounceInRight',
  'bounceInUp',
  'fadeIn',
  'fadeInDown',
  'fadeInDownBig',
  'fadeInLeft',
  'fadeInLeftBig',
  'fadeInRight',
  'fadeInRightBig',
  'fadeInUp',
  'fadeInUpBig',
  'fadeInTopLeft',
  'fadeInTopRight',
  'fadeInBottomLeft',
  'fadeInBottomRight',
  'lightSpeedInRight',
  'lightSpeedInLeft',
  'rotateIn',
  'rotateInDownLeft',
  'rotateInDownRight',
  'rotateInUpLeft',
  'rotateInUpRight',
  'jackInTheBox',
  'rollIn',
  'zoomIn',
  'zoomInDown',
  'zoomInLeft',
  'zoomInRight',
  'zoomInUp',
  'slideInDown',
  'slideInLeft',
  'slideInRight',
  'slideInUp',
]
const exits = [
  'backOutDown',
  'backOutLeft',
  'backOutRight',
  'backOutUp',
  'bounceOut',
  'bounceOutDown',
  'bounceOutLeft',
  'bounceOutRight',
  'bounceOutUp',
  'fadeOut',
  'fadeOutDown',
  'fadeOutDownBig',
  'fadeOutLeft',
  'fadeOutLeftBig',
  'fadeOutRight',
  'fadeOutRightBig',
  'fadeOutUp',
  'fadeOutUpBig',
  'fadeOutTopLeft',
  'fadeOutTopRight',
  'fadeOutBottomRight',
  'fadeOutBottomLeft',
  'lightSpeedOutRight',
  'lightSpeedOutLeft',
  'rotateOut',
  'rotateOutDownLeft',
  'rotateOutDownRight',
  'rotateOutUpLeft',
  'rotateOutUpRight',
  'rollOut',
  'zoomOut',
  'zoomOutDown',
  'zoomOutLeft',
  'zoomOutRight',
  'zoomOutUp',
  'slideOutDown',
  'slideOutLeft',
  'slideOutRight',
  'slideOutUp',
]
const highlights = [
  'bounce',
  'flash',
  'pulse',
  'rubberBand',
  'shakeX',
  'shakeY',
  'headShake',
  'swing',
  'tada',
  'wobble',
  'jello',
  'heartBeat',
  'flip',
  'flipInX',
  'flipInY',
  'flipOutX',
  'flipOutY',
]
const chatEnterCmd = [
  'nodeIKernelProfileListener/onProfileSimpleChanged',
  'nodeIKernelGroupListener/onGroupBulletinChange',
  'nodeIKernelGroupListener/onGroupAllInfoChange'
]

function observeElement (selector, callback, interval = 100) {
  const timer = setInterval(function () {
    const element = document.querySelector(selector)
    if (element) {
      if (callback) {
        callback()
        console.log('已检测到', selector)
      }
      clearInterval(timer)
    }
  }, interval)
}

const throttle = (fn, time, triggerFirstTime = false) => {
  let timer = null
  let firstTime = triggerFirstTime
  return function (...args) {
    if (firstTime) {
      fn.apply(this, args)
      firstTime = false
      return
    }
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args)
        timer = null
      }, time)
    }
  }
}
const insertAnimateCss = () => {
  // 固定动画
  const animateCssLinkElement = document.createElement('link')
  animateCssLinkElement.rel = 'stylesheet'
  animateCssLinkElement.href = `local:///${plugin_path}/src/styles/animate.css`
  document.head.appendChild(animateCssLinkElement)
  // 动态变量
  const dynamicCssLinkElement = document.createElement('link')
  dynamicCssLinkElement.rel = 'stylesheet'
  dynamicCssLinkElement.href = `local:///${plugin_path}/src/styles/dynamic.css`
  document.head.appendChild(dynamicCssLinkElement)
  // 补丁
  const patchCssLinkElement = document.createElement('link')
  patchCssLinkElement.rel = 'stylesheet'
  patchCssLinkElement.href = `local:///${plugin_path}/src/styles/patch.css`
  document.head.appendChild(patchCssLinkElement)
}
try {
  // 页面加载完成时触发
  const styleHead = document.createElement('style')
  document.head.appendChild(styleHead)
  
  animate.bind_updateStyle((event, message) => {
    styleHead.textContent = message
  })
  animate.BIND_EVENT('animate_log', (event, message) => {
    console.log('animate_log', message)
  })
  const handleChatEnter = (config) => {
    const duration = config.contextEntrancesDuration || 1
    const el = document.querySelector('.two-col-layout__main> .vue-component> .group-panel')
    if (el) {
      el.style['--animate-duration'] = duration + 's'
      if (!el.classList.contains('animate__animated')) {
        /*初始化class*/
        el.classList.add('animate__animated', animatePrefix + config.contextEnterType)
      } else if (el.classList.contains(animatePrefix + config.contextEnterType)) {
        el.setAttribute('animate', 'disabled')
        setTimeout(() => {
          el.removeAttribute('animate')
        }, 0)
      } else {
        /*class有animate__animated，但是是其他类型 先删除animatePrefix开头的class*/
        el.classList.forEach((className) => {
          if (className.startsWith(animatePrefix)) {
            el.classList.remove(className)
          }
        })
        /*再添加新的class*/
        el.classList.add('animate__animated', animatePrefix + config.contextEnterType)
      }
    } else {
      console.log('找不到.two-col-layout__main')
    }
  }
  animate.BIND_EVENT('IPC_DOWN_2', async (...args) => {
    const config = await animate.getSettings()
    if (chatEnterCmd.includes(args?.[2]?.[0]?.cmdName)) {
      handleChatEnter(config)
    } else if ('onActivityChange' === args?.[2]?.[0]?.cmdName) {
      const payload = args?.[2]?.[0]?.payload
      if (payload) {
        handleWindowShow(config)
      } else {
        handleWindowMinimize(config)
      }
    }
  })
  
  animate.rendererReady()
  
  // 判断操作系统类型
  const osType = LiteLoader.os.platform === 'win32'
    ? 'windows' : LiteLoader.os.platform === 'linux'
      ? 'linux' : LiteLoader.os.platform === 'darwin'
        ? 'mac' : ''
  document.documentElement.classList.add(osType)
  observeElement('body', insertAnimateCss)
} catch (error) {
  console.log('[渲染进程错误]', error)
}
// 打开设置界面时触发
export const onSettingWindowCreated = async view => {
  try {
    const html_file_path = `local:///${plugin_path}/src/settings.html`
    view.innerHTML = await (await fetch(html_file_path)).text()
    // 获取设置
    const settings = await animate.getSettings()
    const contextEnterTypePicker = view.querySelector('.context-entrances')
    const contextEntrancesDurationPicker = view.querySelector('.pick-context-entrances-duration')
    const sendHighlightTypePicker = view.querySelector('.send-highlight')
    const sendHighlightDurationPicker = view.querySelector('.pick-send-highlight-duration')
    if (contextEnterTypePicker) {
      contextEnterTypePicker.innerHTML = entrances.map(entrance => `<option value="${entrance}">${entrance}</option>`).join('')
      contextEnterTypePicker.value = settings.contextEnterType
      contextEnterTypePicker.addEventListener('change', (event) => {
        // 修改settings的contextEnterType值
        settings.contextEnterType = event.target.value
        // 将修改后的settings保存到settings.json
        animate.setSettings(settings)
      })
    }
    if (contextEntrancesDurationPicker) {
      contextEntrancesDurationPicker.value = settings.contextEntrancesDuration
      contextEntrancesDurationPicker.addEventListener('change', (event) => {
        // 修改settings的contextEntrancesDuration值
        settings.contextEntrancesDuration = event.target.value
        // 将修改后的settings保存到settings.json
        animate.setSettings(settings)
      })
    }
    if (sendHighlightTypePicker) {
      sendHighlightTypePicker.innerHTML = highlights.map(highlight => `<option value="${highlight}">${highlight}</option>`).join('')
      sendHighlightTypePicker.value = settings.sendHighlightType
      sendHighlightTypePicker.addEventListener('change', (event) => {
        // 修改settings的sendHighlightType值
        settings.sendHighlightType = event.target.value
        // 将修改后的settings保存到settings.json
        animate.setSettings(settings)
      })
    }
    if (sendHighlightDurationPicker) {
      sendHighlightDurationPicker.value = settings.sendHighlightDuration
      sendHighlightDurationPicker.addEventListener('change', (event) => {
        // 修改settings的sendHighlightDuration值
        settings.sendHighlightDuration = event.target.value
        // 将修改后的settings保存到settings.json
        animate.setSettings(settings)
      })
    }
    /*todo 后续其他动画*/
  } catch (e) {
    console.log('init animate setting error', e)
  }
}
