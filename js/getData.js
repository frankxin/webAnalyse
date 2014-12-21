var fs = require('fs');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/websiteDetect');

var db = mongoose.connection;
db.on('error',console.error.bind(console, 'connection error:'));

db.once('open',function callback(){  //数据库连接检测
	console.log("connect successful");
})


fs.readFile('../myaccess.log',function(err,logData){
	if(err) throw err;

	var text = logData.toString();
	var logLine = text.split('\n');
	var logJson = [];
	var count = 0;
	var savecount = 0;
	for (var i = 0; i < logLine.length; i++) {
		var visitedIP = logLine[i].match(/\d+\.\d+\.\d+\.\d+/); //模式匹配类127.0.0.1
		var visitedTime = logLine[i].match(/\[([\s\S]+)\]/); //匹配类 07/May/2014:15:45:49 +0800
		var methodCata = logLine[i].match(/\"([\s\S]+)\"/); //匹配类 GET / HTTP/1.1
		var stateCode = logLine[i].split(" ")[logLine[i].split(" ").length - 2]; //获取状态码
		var sendBit = logLine[i].split(" ").pop(); //获取发送字节数
		if (visitedIP||visitedTime||methodCata||stateCode||sendBit) {
			var tempData = {
				"visitedIP" : visitedIP,
				"visitedTime" : visitedTime[1],
				"methodCata" : methodCata[1],
				"stateCode" : stateCode,
				"sendBit" : sendBit
			};
		}else{
			console.log("erro+1");
		}
		logJson.push(tempData);
	};
	var logSchema = mongoose.Schema({      //just like a struct
		visitedIP: String,
		visitedTime: String,
		methodCata: String,
		stateCode: Number,
		sendBit: String
	});
	var log = mongoose.model('log', logSchema);

	for (var i = 0; i < logJson.length; i++) {
		var item = new log({
			visitedIP: logJson[i].visitedIP,
			visitedTime: logJson[i].visitedTime,
			methodCata: logJson[i].methodCata,
			stateCode: logJson[i].stateCode,
			sendBit: logJson[i].sendBit
		});
		count++;
		item.save(function(err,item){        //save it
			if (err) return console.error(err);
		});
	};
	console.log(count);
	
})