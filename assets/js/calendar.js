class Calendar {
  today = {};
  current_date = {};
  diaries = {};

  static formatDate(dateObj) {
    return {
      year: dateObj.getFullYear(),
      month: dateObj.getMonth() + 1,
      date: dateObj.getDate(),
      day: dateObj.getDay()
    }
  };

  static getMonthDays(dateObj) {
    const date = Calendar.formatDate(dateObj)
    const dayCountMap = {
      1:31, 2:date.year%4?28:29, 3:31, 4:30, 5:31, 6:30, 7:31,
      8:31, 9:30, 10:31, 11:30, 12:31
    }
    return {
      dayCount: dayCountMap[date.month],
      firstDay: (7 - (date.date - date.day + 6) % 7) % 7
    }
  };

  static getDiaries(path) {
    var diaries
    $.ajax({
      url: path,
      async: false,
      dataType: 'json',
      success: function (response) {
        diaries = response
      }
    });

    return diaries
  }

  fillCalendar(dateObj) {
    const date = Calendar.formatDate(dateObj)
    const today = Calendar.formatDate(this.today)
    const month_days = Calendar.getMonthDays(dateObj)

    var diaries_days
    if (this.diaries[String(date.year)]) {
      diaries_days = this.diaries[String(date.year)][date.month >= 10 ? String(date.month) : "0"+String(date.month)]
      diaries_days = diaries_days ? diaries_days : {}
    } else {
      diaries_days = {}
    }

    document.getElementById("calendar-year").value = date.year
    document.getElementById("calendar-month").value = date.month

    const day_container = document.querySelector(".calendar-days")
    var day_els = ""
    const m_fmt = date.month < 10 ? "0" + date.month : date.month
    for (let d = 1; d <= month_days.dayCount; d++) {
        const d_fmt = d < 10 ? "0" + d : d
        const is_today = date.year == today.year && date.month == today.month && d == date.date
        day_els += `<span${ is_today ? ' class="today"' : '' }>${ diaries_days[d_fmt] ? '<a href="/diary/'+date.year+'/'+m_fmt+'/'+d_fmt+'">' : '' }${d_fmt}${ diaries_days[d_fmt] ? '</a>' : '' }</span>`
    }
    day_container.innerHTML = '<span class="empty"></span>'.repeat(month_days.firstDay) + day_els

    window.pjax.refresh(document.getElementById("Calendar"));
  }

  constructor() {
    this.today = new Date()
    this.current_date = new Date()
    this.current_date.setDate(1)  // avoiding date out of range
    this.diaries = Calendar.getDiaries('/data/diaries.json')

    function is_same_month(dateObj1, dateObj2) {
      return dateObj1.getFullYear() == dateObj2.getFullYear() && dateObj1.getMonth() == dateObj2.getMonth()
    }

    document.querySelector(".calendar-year-month").innerHTML =
      `<input type="text" id="calendar-year" placeholder="${this.today.getFullYear()}"/>年<input type="text" id="calendar-month" placeholder="${this.today.getMonth() + 1}"/>月`
    document.getElementById("calendar-year").value = this.today.getFullYear()
    document.getElementById("calendar-month").value = this.today.getMonth() + 1

    this.fillCalendar(this.today) // fill other parts

    const input_year = document.getElementById("calendar-year")
    const input_month = document.getElementById("calendar-month")
    const on_year_month_change = (e)=> {
      if (e.code == "Enter") {
        var year = input_year.value ? input_year.value : this.today.getFullYear()
        var month = input_month.value ? input_month.value : this.today.getMonth() + 1
        this.current_date.setMonth(month - 1)
        this.current_date.setYear(year)
        if (is_same_month(this.current_date, this.today)) {
          this.fillCalendar(this.today)
        } else {
          this.fillCalendar(this.current_date)
        }
      }
    }
    input_year.onkeydown = on_year_month_change
    input_month.onkeydown = on_year_month_change

    document.querySelector(".calendar-header-prev").innerHTML =
`<button id="calendar-year-prev"><i class="fa-solid fa-angles-left"></i></button>
<button id="calendar-month-prev"><i class="fa-solid fa-chevron-left"></i></button>`

    document.querySelector(".calendar-header-next").innerHTML =
`<button id="calendar-month-next"><i class="fa-solid fa-chevron-right"></i></button>
<button id="calendar-year-next"><i class="fa-solid fa-angles-right"></i></button>`

    document.getElementById("calendar-year-prev").onclick = ()=> {
      this.current_date.setYear(this.current_date.getFullYear() - 1)
      if (is_same_month(this.current_date, this.today)) {
        this.fillCalendar(this.today)
      } else {
        this.fillCalendar(this.current_date)
      }
    }
    document.getElementById("calendar-year-next").onclick = ()=> {
      this.current_date.setYear(this.current_date.getFullYear() + 1)
      if (is_same_month(this.current_date, this.today)) {
        this.fillCalendar(this.today)
      } else {
        this.fillCalendar(this.current_date)
      }
    }
    document.getElementById("calendar-month-prev").onclick = ()=> {
      this.current_date.setMonth(this.current_date.getMonth() - 1)
      if (is_same_month(this.current_date, this.today)) {
        this.fillCalendar(this.today)
      } else {
        this.fillCalendar(this.current_date)
      }
    }
    document.getElementById("calendar-month-next").onclick = ()=> {
      this.current_date.setMonth(this.current_date.getMonth() + 1)
      if (is_same_month(this.current_date, this.today)) {
        this.fillCalendar(this.today)
      } else {
        this.fillCalendar(this.current_date)
      }
    }
  };
}

document.addEventListener("DOMContentLoaded", function() {
    new Calendar()
})
