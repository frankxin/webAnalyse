var a = "127.0.0.1 - - [24/May/2014:17:09:54 +0800] \"GET /phpmyadmin/main.php?token=fa86156ddc04101fcff5812a7a4439a6 HTTP/1.1\" 200 7708";
a.match(/\[(\d+)\/(\S+)\/([\d]+):(([\d]+):[\S]+)[\s\S]+\]/);

// Result is ["[24/May/2014:17:09:54 +0800]", "24", "May", "2014", "17:09:54", "17"]