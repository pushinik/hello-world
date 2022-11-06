(function () {
    window.Game = {};

    Game.clicks = 0;
    Game.startTime = 0;
    Game.endTime = 0;
    Game.numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    Game.selected = "";
    Game.win = false;
    Game.items = [];

    Game.start = function () {
        var vert;
        var randomindex;
        var canvas = Game.canvas = document.createElement("canvas");
        Game.ctx = canvas.getContext("2d");
        canvas.width = 600;
        canvas.height = 400;
        canvas.style.background = "#000000";
        canvas.style.borderRadius = "10px";
        canvas.style.width = "100%";
        canvas.style.maxWidth = "600px";
        for (var j = 0; j < 4; j++) {
            vert = [];
            for (var i = 0; i < 4; i++) {
                randomindex = Math.round( Math.random() * (Game.numbers.length - 1) );
                vert.push(Game.numbers[randomindex]);
                Game.numbers.splice(randomindex, 1);
            }
            Game.items.push(vert);
        }
        canvas.addEventListener("pointerdown", Game.onClick);
        document.getElementById("app").append(canvas);
        Game.update();
    };

    Game.onClick = function (e) {
        var i;
        var j;
        var prenum;
        var canvas = Game.canvas;
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        x *= canvas.width / rect.width;
        y *= canvas.height / rect.height;
        x -= 120;
        y -= 20;
        x /= 90;
        y /= 90;
        x = Math.floor(x);
        y = Math.floor(y);
        if (Game.selected != "") {
            if ( Game.selected == (x + 1) + "," + y ) {
                i = x + 1;
                j = y;
            } else if ( Game.selected == (x - 1) + "," + y ) {
                i = x - 1;
                j = y;
            } else if ( Game.selected == x + "," + (y + 1) ) {
                i = x;
                j = y + 1;
            } else if ( Game.selected == x + "," + (y - 1) ) {
                i = x;
                j = y - 1;
            }
            if (i != null && j != null) {
                prenum = Game.items[j][i];
                Game.items[j][i] = Game.items[y][x];
                Game.items[y][x] = prenum;
                Game.clicks++;
            }
            Game.selected = "";
        } else if (y < Game.items.length && x < Game.items[0].length && x >= 0 && y >= 0) {
            Game.selected = x + "," + y;
        }
        if (Game.startTime == 0) {
            Game.startTime = new Date().getTime();
        }
    };

    Game.update = function () {
        var sec;
        var vert;
        var count = 0;
        var flag = true;
        var canvas = Game.canvas;
        var ctx = Game.ctx;
        ctx.fillStyle = "#78ffc8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = "center";
        if (Game.win) {
            ctx.font = "40px serif";
            ctx.fillStyle = "#ffffff";
            sec = Math.round( (Game.endTime - Game.startTime) / 1000 );
            min = Math.floor(sec / 60);
            sec -= 60 * min;
            ctx.fillText("Время: " + min + " м " + sec + " с", canvas.width / 2, canvas.height / 2 - 25);
            ctx.fillText("Кол-во перестановок: " + Game.clicks, canvas.width / 2, canvas.height / 2 + 25);
        } else {
            ctx.font = "70px serif";
            ctx.strokeStyle  = "#ffffff";
            ctx.lineWidth = 5;
            for (var j = 0; j < Game.items.length; j++) {
                vert = Game.items[j];
                for (var i = 0; i < vert.length; i++) {
                    ctx.fillStyle = "#ffffff";
                    ctx.strokeRect(120 + i * 90, 20 + j * 90, 90, 90);
                    if (Game.selected == i + "," + j) {
                        ctx.fillStyle = "#fff06b";
                    } else if ( Game.selected == (i + 1) + "," + j || Game.selected == (i - 1) + "," + j || Game.selected == i + "," + (j + 1) || Game.selected == i + "," + (j - 1) ) {
                        ctx.fillStyle = "#ff795e";
                    }
                    ctx.fillText(vert[i], 165 + i * 90, 90 + j * 90);
                    if (count > 0 && Game.items[i > 0 ? j : j - 1][i > 0 ? i - 1 : (Game.items[j - 1].length - 1)] > vert[i]) {
                        flag = false;
                    }
                    count++;
                }
            }
            if (flag) {
                Game.win = true;
                Game.endTime = new Date().getTime();
            }
            window.requestAnimationFrame(Game.update);
        }
    };

    window.addEventListener("load", function () {
        Game.start();
    });
})();
