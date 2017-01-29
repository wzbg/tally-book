const CalendarConverter = require('../../utils/calendar-converter')
const calendarConverter = new CalendarConverter()

Page({
    data: { // 页面的初始数据
        minDate: '1901-01-01', // 最小日期
        maxDate: '2050-12-31' // 最大日期
    },

    onLoad: function () { // 生命周期函数--监听页面加载
        this.goDate() // 默认今天
        this.setData({
            weeks: ['日', '一', '二', '三', '四', '五', '六'] // 星期表头
        })
    },

    goDate: function (date) { // 到指定天
        const today = new Date() // 今天
        today.setHours(0, 0, 0, 0) // 清空时分秒
        if (date) {
            const minDate = new Date(this.data.minDate),
                maxDate = new Date(this.data.maxDate)
            if (date < minDate) {
                date = minDate
            } else if (date > maxDate) {
                date = maxDate
            }
        } else {
            date = today // 默认今天
        }
        date.setHours(0, 0, 0, 0) // 清空时分秒
        const year = date.getFullYear(), // 年
            month = date.getMonth(), // 月
            day = date.getDate() // 日
        const offset = new Date(year, month).getDay() // 月初星期偏移
        const startDate = new Date(year, month, 1 - offset) // 开始日期
        const days = [] // 日历表数组
        let sDate, // 公历日期
            lDate // 农历日期
        for (let i = 0; i < 42; i++) { // 日历最大 6行 * 7天 = 42天
            const isSelected = date.getTime() === startDate.getTime() // 已选中
            const result = calendarConverter.solar2lunar(startDate) // 公历转农历
            if (isSelected) { // 已选中该日期
                if (result.sMonth < 10) result.sMonth = '0' + result.sMonth // 格式化月份
                if (result.sDay < 10) result.sDay = '0' + result.sDay // 格式化日期
                sDate = `${result.sYear}.${result.sMonth}.${result.sDay}` // 公历日期
                lDate = `${result.cYear}${result.lunarYear}年${result.lunarMonth}月${result.lunarDay}` // 农历日期
            }
            if (result.lDay === 1) { // 月初
                result.lunarDay = (result.isLeap ? '闰' : '') + result.lunarMonth + '月' // 闰月处理
            }
            days.push({
                sDay: startDate.getDate(), // 公历天
                sMonth: startDate.getMonth(), // 公历月
                sYear: startDate.getFullYear(), // 公历年
                lunarDay: result.lunarDay, // 农历天
                solarTerms: result.solarTerms, // 节气
                solarFestival: result.solarFestival, // 公历节日
                lunarFestival: result.lunarFestival, // 农历节日
                isSelected: isSelected, // 已选中该日期
                isMonth: month === startDate.getMonth(), // 当月
                isToday: today.getTime() === startDate.getTime() // 今天
            })
            startDate.setDate(startDate.getDate() + 1) // 下一天
        }
        this.setData({
            year,
            month,
            day,
            date: sDate.replace(/\./g, '-'),
            sDate,
            lDate,
            days
        })
    },

    goToday: function (event) { // 回到今天
        this.goDate()
    },

    dateChange: function (event) { // 日期选择器
        const date = event.detail.value.split('-')
        this.goDate(new Date(date[0], date[1] - 1, date[2]))
    },

    selectDay: function (event) { // 点击选择日期
        const dataset = event.currentTarget.dataset
        this.goDate(new Date(dataset.year, dataset.month, dataset.day))
    },

    touchstart: function (event) { // 触摸开始
        const touch = event.changedTouches[0]
        this.page = { // 记录触摸开始点坐标
            x: touch.pageX,
            y: touch.pageY
        }
    },

    touchend: function (event) { // 触摸结束
        const touch = event.changedTouches[0]
        // 计算滑动差值
        const diffX = touch.pageX - this.page.x
        const diffY = touch.pageY - this.page.y
        if (!diffX && !diffY) return
        // 判断滑动方向
        const direc = Math.abs(diffX) > Math.abs(diffY) ? diffX > 0 ? 'right' : 'left' : diffY > 0 ? 'bottom' : 'top'
        let diffM = 0 // 月份位移
        switch (direc) {
            case 'left':
                diffM++
                break
            case 'right':
                diffM--
                break
        }
        this.goDate(new Date(this.data.year, this.data.month + diffM, this.data.day))
    }
})