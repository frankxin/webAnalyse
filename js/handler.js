var fs = require('fs');

var regAllTime = /(\d+)\/(\S+)\/([\d]+):([\d]+):[\S]+[\s\S]+/ ,
    regMainTime = /\[([\s\S]+)\]/;

Array.prototype.distinction = function() {
	var n = {},
		r = [];
	for (var i = 0, max = this.length; i < max; i++) {
		if (!n[this[i]]) {
			n[this[i]] = true;
			r.push(this[i]);
		}
	};
	return r;
}

fs.readFile("../testaccess.log", function(err, logData) {

	if (err) {
		throw err
	};

	var temp, logLine, timeArray,disTimeArray, len, i,separatedTime;

	i = 0;
	timeArray = [];
	disTimeArray = [];
	temp = logData.toString();
	logLine = temp.split("\n");
	len = logLine.length;
	console.log(len);
	/* Array distinction */
	while (len--) {
		temp = logLine[i].match(regMainTime);
		timeArray.push(temp[1]);
		i++;
	}
	//console.log(timeArray[3021]);
	disTimeArray = timeArray.distinction();
	console.log(disTimeArray.length);

	separatedTime = Method.init.separateTime(disTimeArray);
	console.log(separatedTime[0]);
	var month = Method.init.yeardDataHandler(separatedTime);
	console.log(month);
})


var Method = {
	init: {
		initYear: 2014,
		separateTime: function(data) {
			var a = []
			for (var i = 0, max = data.length; i < max; i++) {
				temp = data[i].match(regAllTime);
				a.push(temp);
			};
			return a;
		},
		yearDataHandler: function(data) {

			var tempMonth,
			    n = {};
			(function(){
				n["Jan"] = n["Feb"] = n["Mar"] = n["Apr"] = n["May"] = n["Jun"] = n["Jul"] = n["Aug"] = n["Sep"] =
				n["Oct"] = n["Nov"] = n["Dec"] = 0;
			})();

			console.log("dataHandler works");
			/*analyse month*/
			if (Method.init.initYear == 2014) {
				for (var i = 0, max = data.length; i < max; i++) {
					tempMonth = data[i][2];
					switch (tempMonth){
						case "Jan" :
						case "Feb" :
						case "Mar" :
						case "Apr" :
						case "May" :
						case "Jun" :
						case "Jul" :
						case "Aug" :
						case "Sep" :
						case "Oct" :
						case "Nov" :
						case "Dec" :
							n[tempMonth]++;
							break;
						default :
							console.log('an error occr');
							console.log('tempMonth is ' + tempMonth + '  i is ' + i);

					}
				};
			}
			return n;
		}
	}
}

