(function () {
    window.myBlog = {};

    myBlog.pause = false;
    myBlog.items = [];

    myBlog.selectedDate;
    myBlog.months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

    myBlog.update_time = function () {
        var date;
        var el = document.getElementById("time");
        if (el != null) {
            date = new Date();
            el.innerText = myBlog.add_zero( date.getDate() ) + '.' + myBlog.add_zero( date.getMonth() + 1 ) + '.' + date.getFullYear() + ' ' + myBlog.add_zero( date.getHours() ) + ':' + myBlog.add_zero( date.getMinutes() ) + ':' + myBlog.add_zero( date.getSeconds() );
        }
    };

    myBlog.update_calendar = function (y, m, d) {
        var day;
        var date;
        var year;
        var month;
        var dayWeek;
        var haveItem;
        var lastTime;
        var daysMonth;
        var now = new Date();
        var htmlContent = '';
        var el = document.getElementById("calendar");
        if (d != null) {
            myBlog.selectedDate = new Date(y, m, d);
            date = myBlog.selectedDate;
        } else {
            myBlog.selectedDate = null;
            date = now;
        }
        day = date.getDate();
        month = date.getMonth();
        year = date.getFullYear();
        daysMonth = new Date(year, month + 1, 0).getDate();
        dayWeek = new Date(year, month, 0).getDay();
        htmlContent += '<div class="calendar-month"><span>' + myBlog.months[month] + ' ' + year + '</span>';
        htmlContent += '<img onclick="myBlog.update_calendar(' + year + ', ' + (month - 1) + ', ' + day + ');" class="calendar-left" src="img/left.png"><img onclick="myBlog.update_calendar(' + year + ', ' + (month + 1) + ', ' + day + ');" class="calendar-right" src="img/right.png">';
        htmlContent += '</div>';
        for (var j = 0; j < dayWeek; j++) {
            htmlContent += '<div class="calendar-cell"></div>';
        }
        for (var i = 1; i <= daysMonth; i++) {
            lastTime = new Date(year, month, i);
            haveItem = false;
            for (var j = 0; j < myBlog.items.length; j++) {
                time = new Date(myBlog.items[j].date_published);
                if ( time.getDate() == lastTime.getDate() && time.getMonth() == lastTime.getMonth() && time.getFullYear() == lastTime.getFullYear() ) {
                    haveItem = true;
                    break;
                }
            }
            htmlContent += '<div onclick="myBlog.update_calendar(' + year + ', ' + month + ', ' + i + ');" class="calendar-day' + ( i == now.getDate() && month == now.getMonth() ? " current" : "" ) + (d != null && day == i ? " selected" : "") + (haveItem ? " haveitem" : "") + '">' + i + '</div>';
        }
        if (d != null) {
            htmlContent += '<button onclick="myBlog.update_calendar();">убрать фильтр</button>';
        }
        el.innerHTML = htmlContent;
        myBlog.parse();
    };

    myBlog.update_weather = function () {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://api.open-meteo.com/v1/forecast?latitude=59.5632&longitude=30.1885&current_weather=true", true);
        xhr.onload = xhr.onerror = function () {
            var result;
            var el = document.getElementById("weather");
            if (this.status == 200) {
                try {
                    result = JSON.parse(this.responseText);
                } catch (e) {
                    return;
                }
                el.innerText = result.current_weather.temperature + '°';
            } else {
                el.innerText = '?';
            }
        };
        xhr.send();
    };

    myBlog.add_zero = function (n) {
        return (n < 10) ? ("0" + n) : ("" + n);
    };

    myBlog.parse = function () {
        var y;
        var d;
        var m;
        var now;
        var day;
        var item;
        var time;
        var year;
        var month;
        var count = 0;
        var items = myBlog.items;
        var el = document.getElementById("content");
        if (myBlog.selectedDate != null) {
            now = myBlog.selectedDate;
            day = now.getDate();
            month = now.getMonth();
            year = now.getFullYear();
            el.innerHTML = '<h3>' + myBlog.add_zero(day) + '.' + myBlog.add_zero(month) + '.' + year + '</h3>';
        } else {
            el.innerHTML = '<h3>Все задания</h3>';
        }
        for (var i = 0; i < items.length; i++) {
            item = items[i];
            time = new Date(item.date_published);
            d = time.getDate();
            m = time.getMonth();
            y = time.getFullYear();
            if ( now != null && (d != day || m != month || y != year) ) {
                continue;
            }
            el.innerHTML += '<article><div class="c-time">' + (now != null ? '' : myBlog.add_zero(d) + '.' + myBlog.add_zero(m) + '.' + y + ' ') + myBlog.add_zero( time.getHours() ) + ':' + myBlog.add_zero( time.getMinutes() ) + '</div><a href="' + item.url + '"><div class="c-box"><div class="preview"><img src="' + item.image + '"></div><h4>' + item.title + '</h4><p>' + item.summary + '</p></div></a></article>';
            count++;
        }
        if (count == 0) {
            el.innerHTML += '<div class="c-time">Пусто.</div>';
        }
    };

    myBlog.load = function () {
        var xhr;
        if (myBlog.pause) {
            return;
        }
        xhr = new XMLHttpRequest();
        xhr.open("GET", "feed.json", true);
        xhr.onload = xhr.onerror = function () {
            var item;
            var result;
            myBlog.pause = false;
            if (this.status != 200) {
                alert("Проверьте интернет-соединение.");
                return;
            }
            try {
                result = JSON.parse(this.responseText);
            } catch (e) {
                result = {};
            }
            if (result.items != null) {
                if (result.home_page_url != null) {
                    for (var i = 0; i < result.items.length; i++) {
                        item = result.items[i];
                        item.url = item.url.replace(result.home_page_url, "");
                    }
                }
                myBlog.items = result.items;
            }
            myBlog.update_calendar();
        };
        myBlog.pause = true;
        xhr.send();
    };

    window.addEventListener("load", function () {
        document.getElementById("btnmenu").addEventListener("click", function () {
            document.getElementById("menu").style.visibility = "visible";
        });
        document.getElementById("btnclose").addEventListener("click", function () {
            document.getElementById("menu").style.visibility = "";
        });
        if ( document.getElementById("time") != null ) {
            window.addEventListener("scroll", function () {
                document.getElementById("header").className = window.scrollY > 29 ? "fixed" : "";
            });
            myBlog.update_time();
            myBlog.update_weather();
            setInterval(myBlog.update_time, 1000);
            setInterval(myBlog.update_weather, 1000 * 60 * 60);
        } else {
            document.getElementById("header").style.top = "0";
            document.getElementById("header").className = "fixed";
        }
    });
})();
