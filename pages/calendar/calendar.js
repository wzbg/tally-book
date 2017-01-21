const CalendarConverter = require('../../utils/calendar-converter')
const calendarConverter = new CalendarConverter()

// 月份天数表
const DAY_OF_MONTH = [
    [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
]

// 判断当前年是否闰年
const isLeapYear = year => {
    return (year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)) ? 1 : 0
}

// 获取当月有多少天
const getDayCount = (year, month) => {
    return DAY_OF_MONTH[isLeapYear(year)][month]
}

// 获取当前索引下是几号
const getDay = index => {
    return index - curDayOffset
}

const pageData = {
    date: '',          // 当前日期字符串

    // arr数据是与索引对应的数据信息
    arrIsShow: [],     // 是否显示此日期
    arrDays: [],       // 关于几号的信息
    arrInfoEx: [],     // 农历节假日等扩展信息
    arrInfoExShow: [], // 处理后用于显示的扩展信息

    // 选择一天时显示的信息
    detailData: {
        curDay: '',    // detail中显示的日信息
        curInfo1: '',
        curInfo2: '',
    }
}

// 设置当前详细信息的索引，前台的详细信息会被更新
const setCurDetailIndex = index => {
    const curEx = pageData.arrInfoEx[index]
    curDay = curEx.sDay - 1
    pageData.detailData.curDay = curEx.sDay
    pageData.detailData.curInfo1 = '农历' + curEx.lunarMonth + '月' + curEx.lunarDay
    pageData.detailData.curInfo2 = curEx.cYear + curEx.lunarYear + '年 ' + curEx.cMonth + '月 ' + curEx.cDay + '日 ' + curEx.lunarFestival
}

// 刷新全部数据
const refreshPageData = (year, month, day) => {
    pageData.date = year + '年' + (month + 1) + '月'

    const offset = new Date(year, month).getDay()

    for (let i = 0; i < 42; ++i) {
        pageData.arrIsShow[i] = i < offset || i >= getDayCount(year, month) + offset ? false : true
        pageData.arrDays[i] = i - offset + 1
        const d = new Date(year, month, i - offset + 1)
        const dEx = calendarConverter.solar2lunar(d)
        pageData.arrInfoEx[i] = dEx
        if ('' != dEx.lunarFestival) {
            pageData.arrInfoExShow[i] = dEx.lunarFestival
        }
        else if ('初一' === dEx.lunarDay) {
            pageData.arrInfoExShow[i] = dEx.lunarMonth + '月'
        }
        else {
            pageData.arrInfoExShow[i] = dEx.lunarDay
        }
    }

    setCurDetailIndex(day - 1)
}

let curDate, curMonth, curYear, curDay

Page({
    data: pageData,

    onLoad: function () { // 生命周期函数--监听页面加载
        this.goDate()
        this.goToday()
        this.setData({
            weeks: ['日', '一', '二', '三', '四', '五', '六'] // 星期表头
        })
    },

    goDate: function (date) {
        date = date || new Date() // 日期
        const year = date.getFullYear(), // 年
            month = date.getMonth(), // 月
            day = date.getDate() // 日
        const offset = new Date(year, month).getDay() // 月初星期偏移
        const startDate = new Date(year, month, 1 - offset) // 开始日期
        const days = [] // 日历表数组
        let sDate, // 公历日期
            lDate // 农历日期
        for (let i = 0; i < 42; i++) {
            const sDay = startDate.getDate() // 当天
            const result = calendarConverter.solar2lunar(startDate) // 公历转农历
            if (sDay === day) { // 选中日期
                sDate = `${result.sYear}.${result.sMonth}.${result.sDay}` // 公历日期
                lDate = `${result.cYear}${result.lunarYear}年${result.lunarMonth}月${result.lunarDay}` // 农历日期
            }
            startDate.setDate(sDay + 1) // 下一天
            days.push({
                sDay: result.sDay, // 公历天
                lunarDay: result.lunarDay, // 农历天
                solarTerms: result.solarTerms, // 节气
                solarFestival: result.solarFestival, // 公历节日
                lunarFestival: result.lunarFestival, // 农历节日
            })
        }
        console.log(days)
        this.setData({ sDate, lDate, days })
    },

    goToday: function (e) {
        curDate = new Date()
        curMonth = curDate.getMonth()
        curYear = curDate.getFullYear()
        curDay = curDate.getDate()
        refreshPageData(curYear, curMonth, curDay)
        this.setData(pageData)
    },

    goLastMonth: function (e) {
        if (0 == curMonth) {
            curMonth = 11
            --curYear
        }
        else {
            --curMonth
        }
        refreshPageData(curYear, curMonth, 0)
        this.setData(pageData)
    },

    goNextMonth: function (e) {
        if (11 == curMonth) {
            curMonth = 0
            ++curYear
        }
        else {
            ++curMonth
        }
        refreshPageData(curYear, curMonth, 0)
        this.setData(pageData)
    },

    selectDay: function (e) {
        setCurDetailIndex(e.currentTarget.dataset.dayIndex)
        this.setData({
            detailData: pageData.detailData
        })
    },

    bindDateChange: function (e) {
        const arr = e.detail.value.split('-')
        refreshPageData(arr[0], arr[1] - 1, arr[2])
        this.setData(pageData)
    }
})