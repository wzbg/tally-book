const CalendarConverter = require('../../utils/calendar-converter')
const calendarConverter = new CalendarConverter()

Page({
    data: { // 页面的初始数据
        range: [], // 选择的日期范围
        minDate: '1901-01-01', // 最小日期
        maxDate: '2049-12-31', // 最大日期
        weeks: ['日', '一', '二', '三', '四', '五', '六'] // 星期表头
    },

    onLoad: function () { // 生命周期函数--监听页面加载
        this.goDate() // 默认今天
    },

    goDate: function (date) { // 到指定天
        const today = new Date() // 今天
        today.setHours(0, 0, 0, 0) // 清空时分秒
        if (date) { // 判断传入的日期范围是否合法
            const minDate = new Date(this.data.minDate),
                maxDate = new Date(this.data.maxDate)
            if (date < minDate) {
                date = minDate
            } else if (date > maxDate) {
                date = maxDate
            }
        } else { // 默认今天
            date = today
        }
        date.setHours(0, 0, 0, 0) // 清空时分秒
        const year = date.getFullYear(), // 年
            month = date.getMonth(), // 月
            day = date.getDate(), // 日
            offset = new Date(year, month).getDay(), // 月初星期偏移
            startDate = new Date(year, month, 1 - offset), // 开始日期
            endDate = new Date(year, month + 1, 0), // 结束日期
            length = this.data.weeks.length, // 一星期天数
            rows = Math.ceil((offset + endDate.getDate()) / length), // 日历行数
            range = this.data.range, // 选择的日期范围
            days = [] // 日历表数组
        let sDate, // 公历日期
            lDate, // 农历日期
            ranges = [] // 开始结束范围
        if (range[0]) { // 初始化开始范围
            ranges[0] = range[0].getTime()
            if (range[1]) { // 初始化结束范围
                ranges[1] = range[1].getTime()
            } else {
                ranges[1] = ranges[0]
            }
        }
        ranges.sort()
        for (let i = 0; i < rows * length; i++) { // 日历最大 6行 * 7天 = 42天
            const time = startDate.getTime(), // 毫秒数
                isSelected = date.getTime() === time, // 已选中
                result = calendarConverter.solar2lunar(startDate) // 公历转农历
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
                lDay: result.lDay, // 农历天（数字）
                lunarDay: result.lunarDay, // 农历天
                solarTerms: result.solarTerms, // 节气
                solarFestival: result.solarFestival.split(' '), // 公历节日
                lunarFestival: result.lunarFestival.split(' '), // 农历节日
                isMonth: month === startDate.getMonth(), // 当月
                isRange: ranges[0] <= time && time <= ranges[1], // 选中范围
                isToday: today.getTime() === time, // 今天
                isSelected: isSelected // 已选中该日期
            })
            startDate.setDate(startDate.getDate() + 1) // 下一天
        }
        this.setData({
            year, // 年
            month, // 月
            day, // 日
            date: sDate.replace(/\./g, '-'), // 选择器日期
            sDate, // 公历日期
            lDate, // 农历日期
            days, // 日历表数组
            rows // 日历行数
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

    selectDays: function (event) { // 长按选择日期
        const dataset = event.currentTarget.dataset,
            date = new Date(dataset.year, dataset.month, dataset.day),
            range = this.data.range
        if (range.length > 1) range.shift()
        range.push(date)
        this.setData({ range })
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
        const diffX = touch.pageX - this.page.x,
            diffY = touch.pageY - this.page.y
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