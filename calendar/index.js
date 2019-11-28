import './calendar.css'
import { dom, toggleClass, zerolize, isObject} from './unit.js'

class Calendar {
  constructor(el, options) {
    this.initData(el, options)
    this.checkOptions()
    this.initHtml()
    this.update()
    this.bindEvent()
  }
  checkOptions() {
    if (!this.el) {
      throw new Error('element is required')
    }
    return this
  }
  initData(el, options) {
    let defaultOptions = {
      active: "active",
      today: 'today',
      special: 'special',
    }
    this._initDate()
    this.options = Object.assign({}, defaultOptions, options)
    this.el = typeof el === 'string' ? document.querySelector(el) : el
  }
  _initDate() {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()
    const today = `${year}${zerolize(month + 1)}${zerolize(date.getDate())}`
    this.cur = {
      year,
      month,
      today
    }
  }
  initHtml() {
    this.initStaticHtml()
    this.initDynamicHtml()
  }
  initStaticHtml() {
    const wrapper = dom.create(`<div class= "ui-datepicker-wrapper"></div>`)
    const body = `
      <div class="ui-datepicker-header">
        <a href="#" class="ui-datepicker-btn ${Calendar.PREVY} ui-datepicker-prev-year-btn">上年</a>
        <a href="#" class="ui-datepicker-btn ${Calendar.PREVM} ui-datepicker-prev-month-btn">上月</a>
        <a href="#" class="ui-datepicker-btn ${Calendar.NEXTM} ui-datepicker-next-year-btn">下年</a>
        <a href="#" class="ui-datepicker-btn ${Calendar.NEXTY} ui-datepicker-next-month-btn">下月</a>
        <span class="ui-datepicker-curr-month">2019年11月</span>
      </div>
      <div class="ui-datepicker-body">
        <div class="ui-datepicker-th">日</div>
        <div class="ui-datepicker-th">一</div>
        <div class="ui-datepicker-th">二</div>
        <div class="ui-datepicker-th">三</div>
        <div class="ui-datepicker-th">四</div>
        <div class="ui-datepicker-th">五</div>
        <div class="ui-datepicker-th">六</div>
      </div>
    `;
    wrapper.innerHTML = body.trim()
    document.body.appendChild(wrapper)
    this.wrapper = wrapper
  }
  initDynamicHtml() {
    const {
      ROWS,
      COLS
    } = Calendar
    const dateDivs = []
    const body = this.wrapper.querySelector(Calendar.BODY)
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        const div = dom.create('<div class="ui-datepicker-date"></div>')
        body.appendChild(div)
        dateDivs.push(div)
      }
    }
    this.dateDivs = dateDivs
  }
  setCalendarPos() {
    const {
      wrapper,
      el
    } = this
    const left = el.offsetLeft
    const top = el.offsetTop
    const height = el.clientHeight
    const width = wrapper.clientWidth
    const screenw = window.innerWidth
    if (left + width < screenw) {
      wrapper.style.left = left + 'px'
    } else {
      wrapper.style.left = left - (left + width - screenw) + 'px'
    }
    wrapper.style.top = top + height + 5 + 'px'
  }
  bindEvent() {
    this.el.addEventListener('click', e => {
      this.setCalendarPos()
      toggleClass(this.wrapper, 'active')
    })
    this.wrapper.addEventListener('click', e => {
      const {
        month
      } = this.cur
      const target = e.target
      if (target.matches(Calendar.DATE) || target.matches(`${Calendar.DATE} span`)) {
        this.el.value = this.renderCurDate() + '-' + target.getAttribute('date')
        toggleClass(this.wrapper, 'active')
        return
      }
      if (target.matches(Calendar.PREVM)) {
        if (month - 1 < 0) {
          this.cur.year--
          this.cur.month = 11
        } else {
          this.cur.month--
        }
      } else if (target.matches(Calendar.PREVY)) {
        this.cur.year--
      } else if (target.matches(Calendar.NEXTM)) {
        if (month + 1 >= 12) {
          this.cur.month = 0
          this.cur.year++
        } else {
          this.cur.month++
        }
      } else if (target.matches(Calendar.NEXTY)) {
        this.cur.year++
      }
      this.update()
    })
  }
  update() {
    this.renderCalendar()
    this.renderCurDate()
  }
  renderCurDate() {
    const cur = this.cur
    const date = `${cur.year}-${zerolize(cur.month + 1)}`
    this.wrapper.querySelector(Calendar.CUR).innerHTML = date
    return date
  }
  renderCalendar() {
    const data = this.renderData()
    const dateDivs = this.dateDivs
    const {
      ROWS,
      COLS
    } = Calendar
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        const index = i * COLS + j
        const temp = data[i][j]
        const dom = dateDivs[index]
        dom.className = Calendar.DATE.substr(1)
        temp.class && dom.classList.add(temp.class)
        temp.desc && dom.setAttribute('title', temp.desc)
        if (temp.special) {
          dom.innerHTML = `<span date='${temp.date}' class='special'>${temp.date}</span>`
        } else if (temp.today) {
          dom.innerHTML = `<span date='${temp.date}' class='today'>今</span>`
        } else {
          dom.innerHTML = temp.date
        }
        dom.setAttribute('date', temp.date)
      }
    }
  }
  renderData() {
    const {
      last,
      current
    } = this._getDateInfo()
    let ret = [
      [],
      [],
      [],
      [],
      [],
      []
    ]
    this._getLastMonthDate(ret, last)
    this._getThisMonthDate(ret, current)
    this._getNextMonthDate(ret)
    return ret
  }
  // 获得上个月日期
  _getLastMonthDate(data, last) {
    const lastday = last.day
    const lastdate = last.date
    for (let i = 0; i <= lastday; i++) {
      let date = lastdate - lastday + i
      data[0][i] = {
        date,
        class: 'not-this-month'
      }
    }
  }
  // 获得本个月日期
  _getThisMonthDate(data, current) {
    const cur = this.cur
    const special = this.options.special
    const month = zerolize(cur.month + 1)
    const {
      ROWS,
      COLS
    } = Calendar
    let counter = 1
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (counter <= current.date && !isObject(data[i][j])) {
          const fullDate = month + zerolize(counter)
          data[i][j] = {
            date: counter,
            today: (cur.year + '' + fullDate) === cur.today
          }
          if (special[fullDate]) {
            data[i][j].special = true
            data[i][j].desc = special[fullDate]
          }
          counter++
        }
      }
    }
  }
  // 获得下个月日期
  _getNextMonthDate(data) {
    const {
      ROWS,
      COLS
    } = Calendar
    let counter = 1
    for (let i = ROWS - 2; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (!isObject(data[i][j])) {
          data[i][j] = {
            date: counter,
            class: 'not-this-month'
          }
          counter++
        }
      }
    }
  }
  _getDateInfo() {
    const {
      year,
      month
    } = this.cur
    const last = this._getLastMonthInfo(year, month)
    const current = this._getThisMonthInfo(year, month)
    return {
      last,
      current
    }
  }
  // 获取上个月最后一天是几号和星期几
  _getLastMonthInfo(year, month) {
    const last = new Date(year, month, 0)
    const date = last.getDate()
    const day = last.getDay()
    return {
      date,
      day
    }
  }
  // 获取这个月最后一天是几号和星期几
  _getThisMonthInfo(year, month) {
    const next = new Date(year, month + 1, 0)
    const date = next.getDate()
    const day = next.getDay()
    return {
      date,
      day
    }
  }
}

Calendar.ROWS = 6
Calendar.COLS = 7
Calendar.PREVM = '.ui-datepicker-prev-month-btn'
Calendar.PREVY = '.ui-datepicker-prev-year-btn'
Calendar.NEXTM = '.ui-datepicker-next-month-btn'
Calendar.NEXTY = '.ui-datepicker-next-year-btn'
Calendar.CUR = '.ui-datepicker-curr-month'
Calendar.BODY = '.ui-datepicker-body'
Calendar.DATE = '.ui-datepicker-date'

export default Calendar

export const aname = 'jarvis'

if (typeof window !== 'undefined') {
  window.Calendar = Calendar
}