(function () {
    window.myBlog = {};

    myBlog.pause = false;
    myBlog.items = [];

    myBlog.parse = function () {
        var items = myBlog.items;
        
    };

    myBlog.load = function () {
        var xhr;
        if (myBlog.pause) {
            return;
        }
        xhr = new XMLHttpRequest();
        xhr.open("GET", "feed.json", true);
        xhr.onload = xhr.onerror = function () {
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
                myBlog.items = result.items;
            }
            myBlog.parse();
        };
        myBlog.pause = true;
        xhr.send();
    };

    window.addEventListener("load", function () {
        myBlog.load();
    });
})();
