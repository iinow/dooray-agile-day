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
    const day = _this.getElementsByClassName('postCard__subject')[0].textContent
    return day.includes(lastDay)
  })
}

function getLastDayString(tasks = []) {
  const today = getTodayString()
  const arr = tasks
    .filter((_this) => {
      const str = _this.getElementsByClassName('postCard__subject')[0].textContent
      const dateStrs = getYYYYMMDDWithSlash(str)
      return dateStrs !== today
    }) 
    .map((_this) => {
      const str = _this.getElementsByClassName('postCard__subject')[0].textContent
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
      const subject = _this.getElementsByClassName('postCard__subject')[0]
      const yyyyMMdd = getYYYYMMDDWithSlash(subject.textContent)
      return today === yyyyMMdd
    })
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
        const originTitle = _this.getElementsByClassName('postCard__subject')[0].textContent
        return title === originTitle
      })
      .forEach((_this) => {
        newElements[i].parentElement.addEventListener('click', () => _this.click())
      })
  }
}

function compareToTaskTitleAsc(a, b) {
  const aTitle = a.getElementsByClassName('postCard__subject')[0].textContent
  const bTitle = b.getElementsByClassName('postCard__subject')[0].textContent

  if(aTitle < bTitle) {
    return -1
  }
  return aTitle > bTitle ? 1 : 0
}