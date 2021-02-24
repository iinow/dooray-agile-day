const titleRegex = /^dailylog-(\d{4}\/\d{1,2}\/\d{1,2})-([가-힣]+)$/i

setTimeout(init, 3000)

function init() {
  const postBoxContainerTasks = getPostBoxContainerTasks()
  if(!postBoxContainerTasks) {
    return
  }

  const todayTasks = getTodayTasks(postBoxContainerTasks)
  const lastTasks = getLastDayTasks(postBoxContainerTasks)

  createPostBoxContainer('오늘', todayTasks, '#00bfa5')
  createPostBoxContainer('마지막날', lastTasks, '#ec407a')

  document.addEventListener('keydown', e => handleDocumentKeyDown(e, convertTaskMap(todayTasks, lastTasks)))
}

/**
 * @returns { userName: { taskName: { taskTag } } }
 */
function convertTaskMap(todayTasks = [], lastTasks = []) {
  const res = {}

  todayTasks.forEach(task => {
    const taskName = getSubjectTag(task).textContent
    const userName = getName(taskName)
    if(!res[userName]) {
      res[userName] = {}
    }
    res[userName][taskName] = task
  })

  lastTasks.forEach(task => {
    const taskName = getSubjectTag(task).textContent
    const userName = getName(taskName)
    if(!res[userName]) {
      res[userName] = {}
    }
    res[userName][taskName] = task
  })

  return res
}

function getPostBoxContainerTasks() {
  const container = document.getElementsByClassName("dragPostBoxContainer")
  if(container.length === 0) {
    return false
  }

  const tasks = container[0].getElementsByClassName("postCard__subject")
  const res = []
  for(let i = 0; i < tasks.length; i++) {
    if(titleRegex.test(tasks[i].textContent)) {
      res.push(tasks[i].parentElement)
    }
  }
  
  return res
}

function getYYYYMMDDWithSlash(title) {
  return titleRegex.exec(title)[1]
}

function getName(title) {
  return titleRegex.exec(title)[2]
}

function getLastDayTasks(tasks) {
  const lastDay = getLastDayString(tasks)
  return tasks.filter((_this) => {
    const day = getSubjectTag(_this).textContent
    return day.includes(lastDay)
  })
}

function getLastDayString(tasks = []) {
  const today = getTodayString()
  const arr = tasks
    .filter((_this) => {
      const str = getSubjectTag(_this).textContent
      const dateStrs = getYYYYMMDDWithSlash(str)
      return dateStrs !== today
    }) 
    .map((_this) => {
      const str = getSubjectTag(_this).textContent
      const dateStrs = getYYYYMMDDWithSlash(str).split('/')
      const year = dateStrs[0]
      const month = dateStrs[1].length === 1 ? `0${dateStrs[1]}` : dateStrs[1]
      const day = dateStrs[2].length === 1 ? `0${dateStrs[2]}` : dateStrs[2]
      return `${year}/${month}/${day}`
    })

  arr.sort()
  const last = arr[arr.length - 1]
  const strs = last.split('/')
  
  return `${strs[0]}/${Number(strs[1])}/${Number(strs[2])}`
}

function getTodayString() {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const dayOfMonth = date.getDate()
  return `${year}/${month}/${dayOfMonth}`
}

function getTodayTasks(tasks) {
  const today = getTodayString()

  return tasks
    .filter(( _this) => {
      const subject = getSubjectTag(_this)
      const yyyyMMdd = getYYYYMMDDWithSlash(subject.textContent)
      return today === yyyyMMdd
    })
}

function getSubjectTag(tag) {
  return tag.getElementsByClassName('postCard__subject')[0]
}

function createPostBoxContainer(containerName = '', tasks = [], containerNameColor = '') {
  tasks.sort(compareToTaskTitleAsc)
  const container = getPostBoxContainer()
  const copyHtml = getPostBoxContainerBoxFirst().cloneNode(true).getRootNode()
  container.insertBefore(copyHtml, getPostBoxContainerBoxFirst())

  const titleWrap = getPostBoxContainerBoxFirst().getElementsByClassName('dragPostBoxTitle__dummyWrap')[0]
  titleWrap.getElementsByClassName('dragPostBoxTitle__name')[0].textContent = containerName
  titleWrap.getElementsByClassName('dragPostBoxTitle__name')[0].style.color = containerNameColor
  titleWrap.getElementsByClassName('dragPostBoxTitle__count')[0].textContent = tasks.length

  getPostBoxContainerBoxFirst().getElementsByClassName('dragPostBoxBody__list')[0].innerHTML = tasks
    .map((_this) => _this.outerHTML)
    .join('')

  setClickListener(tasks)
}

function getPostBoxContainerBoxFirst() {
  return document.getElementsByClassName('dragPostBoxContainer__box')[0]
}

function getPostBoxContainer() {
  return document.getElementsByClassName('dragPostBoxContainer')[0]
}

function setClickListener(originTasks = []) {
  const newElements = getPostBoxContainerBoxFirst().getElementsByClassName('postCard__subject')
  for(let i = 0; i < newElements.length; i++) {
    const title = newElements[i].textContent

    originTasks
      .filter((_this) => {
        const originTitle = getSubjectTag(_this).textContent
        return title === originTitle
      })
      .forEach((_this) => {
        newElements[i].parentElement.addEventListener('click', () => _this.click())
      })
  }
}

function compareToTaskTitleAsc(a, b) {
  const aTitle = getSubjectTag(a).textContent
  const bTitle = getSubjectTag(b).textContent

  if(aTitle < bTitle) {
    return -1
  }
  return aTitle > bTitle ? 1 : 0
}

function handleDocumentKeyDown(e, taskMap = {}) {
  const modalTaskName = findModalTaskName()
  if(!modalTaskName) {
    return
  }

  const userName = getName(modalTaskName)
  let userIdx = null
  let taskIdx = null

  Object.keys(taskMap)
    .forEach((key, index) => {
      if(key !== userName) {
        return
      }
      userIdx = index
    })
  
  Object.keys(taskMap)
    .forEach((key) => {
      Object.keys(taskMap[key]).forEach((taskKey, index) => {
        if(taskKey !== modalTaskName) {
          return
        }
        taskIdx = index
      }) 
    })

  switch(e.key) {
    case 'ArrowLeft':
      taskIdx--
      break
    case 'ArrowRight':
      taskIdx++
      break
    case 'ArrowDown':
      userIdx++
      break
    case 'ArrowUp':
      userIdx--
      break
    default:
      return
  }

  let matchTag = null

  Object.keys(taskMap)
    .forEach((key, userIndex) => {
      if(userIdx !== userIndex) {
        return
      }
      Object.keys(taskMap[key]).forEach((taskKey, taskIndex) => {
        if(taskIdx !== taskIndex) {
          return
        }
        closeModal()
        taskMap[key][taskKey].click()
      }) 
    })
}

function findModalTaskName() {
  const res = document.getElementsByClassName('modal-dialog')
  if(res.length === 0) {
    return
  }

  const modal = res[0]
  return modal.getElementsByClassName('subject ng-binding ng-scope')[0]?.textContent
}

function closeModal() {
  document.getElementsByClassName('modal ng-isolate-scope modal-itemview in')[0]?.click()
}