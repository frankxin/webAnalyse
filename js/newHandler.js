var mysql = require("mysql"),
    fs = require("fs");

var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'alwaysonline',
  database : 'webanalyse'
});

var option = {
	update : false,
	refresh : 86400000, //should be 3600000
	cp: 0    //read log last pointer
}

db.connect(function(err) {
	if (err) {
		console.error('error connecting: ' + err.stack);
		return;
	}

	console.log('connected as id ' + db.threadId);

	if (!option.update) {
		readFile("../testaccess.log", function(logTimeArr) {

			var a = logTimeArr.countIt(),
				arrInit = [];

			console.log(a);

			var ss = {};
			for (var i = 0; i < 25; i++) {
				var tempa = [];
				if (i < 10) {
					var c = i + 1,
						day = '0' + c;
					tempa = Method.init.generateDay(2014, 'Dec', day);
				} else {
					tempa = Method.init.generateDay(2014, 'Dec', i + 1);
				}
		     	arrInit.push(tempa);
				var s = Method.init.generateDayCount(tempa);
				for (var j in s) {
				ss[j] = s[j];
				};
			};

			//update data
			for (s in a) {
				ss[s] = a[s];
			};
			for (s in ss) {
				var post = {
					date: s,
					count: ss[s]
				};
				db.query('INSERT INTO dayTable SET ?', post, function(err) {
					if (err) {
						throw err;
					}
				})
			}

			console.log(ss);
			console.log(option.cp);
			var sq = "UPDATE  CP SET pointer = " + db.escape(option.cp);
			db.query(sq, function(err) {
				if (err) {
					throw err;
				} else {
					console.log("insert cp succesful!!");
				}
			});
			db.end();
		}); 
	}else{
		handler();
		setInterval(handler, option.refresh);
		function handler(){
			db.query("select * from CP ", function(err, rows) {

				option.cp = rows[0].pointer;

				console.log(option.cp);

				readFile("../testaccess.log", function(logTimeArr) {
					var a = logTimeArr.countIt();
					var date = new Date();
					date = date.toDateString();
					var tempDate = date.split(" ");
					if (tempDate[2] < 10) {
						tempDate[2] = "0" + parseInt(tempDate[2]);
					}

					var tempD = Method.init.generateDay(tempDate[3], tempDate[1], tempDate[2]);
					var s_temp = Method.init.generateDayCount(tempD);

					for (s in s_temp){
						var post = {
							date : s,
							count : s_temp[s]
						};
						db.query('INSERT INTO dayTable SET ?' , post , function(err){
							if (err) {
								throw err;
							}
						})
					}
					

					//update data in database
					for (s in a) {
						s_temp[s] = a[s];
					};

					for (s in s_temp) {
						var post_date = {
							date: s
						};
						var post_count = {
							count : s_temp[s]
						};
						var query = db.query("UPDATE dayTable SET ? WHERE date = ?",[post_count , s], function(err) {
							if (err) {
								throw err;
							}
						})
					}
					console.log(s_temp);
					console.log(option.cp);
					var sq = "UPDATE  CP SET pointer = " + db.escape(option.cp);
					db.query(sq, function(err) {
						if (err) {
							throw err;
						} else {
							console.log("update cp succesful!!");
						}
					});
				})
			})
		}
	};
});

var regAllTime = /(\d+)\/(\S+)\/([\d]+):([\d]+):[\S]+[\s\S]+/ ,
    regMainTime = /\[([\s\S]+)\]/;

var Method = {
	init : {
		/**
		 * [generateDay description]
		 * @param  {[type]} year
		 * @param  {[type]} month
		 * @param  {[type]} day
		 * @return {[type]}
		 */
		generateDay : function (year , month , day){
			var arr = [],
			    str = '';
			str = year + '-' + month + '-' + day;
			for (var i = 0; i < 24; i++) {
				var temps = '';
				if(i < 10){
					temps = str + '&&0' + i
				}else{
					temps = str + '&&' + i;
				}
			    arr.push(temps);
			};
			return arr;
		},
		generateDayCount : function(arr){
			var s = {};
			for (var i = 0; i < 24; i++) {
				s[arr[i]] = 0;
			};
			return s;
		},
		dataHandler: function(logData) {

			var temp, logLine, timeArray, disTimeArray, len, i, separatedTime , nwTimeArr;

			i = option.cp;
			timeArray = [];
			disTimeArray = [];
			temp = logData.toString();
			logLine = temp.split("\n");
			len = logLine.length - option.cp;
			console.log(len);
			/* Array distinction */
			while (len--) {
				temp = logLine[i].match(regMainTime);
				timeArray.push(temp[1]);
				i++;
				option.cp++;
			}

			disTimeArray = timeArray.distinction();
			console.log(disTimeArray.length);

			separatedTime = Method.init.separateTime(disTimeArray);
			console.log(separatedTime[0]);

			nwTimeArr = Method.init.formatArr(separatedTime)

			return nwTimeArr;

		},
		formatArr: function(data) {

			var nArr = [],
				str = '';

			for (var i = 0, max = data.length; i < max; i++) {

				str = '';
				str = data[i][3] + '-' + data[i][2] + '-' + data[i][1] + '&&' + data[i][4];
				nArr.push(str);
			};

			return nArr;
		},
		separateTime: function(data) {
			var a = []
			for (var i = 0, max = data.length; i < max; i++) {
				temp = data[i].match(regAllTime);
				a.push(temp);
			};
			return a;
		}
	}
}

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
/**
 * [countIt count how many times for each distinct item]
 * @return {[object]}
 */
Array.prototype.countIt = function(){
	var n = {},
	    m = {},
	    r = [];
	for (var i = 0 , max= this.length ; i < max; i++) {
		if(!n[this[i]]) {
			n[this[i]] = true;
			m[this[i]] = 0;
		}else{
			m[this[i]]++;
		}
	};
	for (s in m){
		m[s]++;
	}
	return m;
}

/**  business logic start  **/
/**
 * [readFile description]
 * @param  path{[String]}
 * @param  callback{Function}
 */
function readFile(path , callback) {
	fs.readFile(path , function(err, logData) {

		var logTimeArr = Method.init.dataHandler(logData);

		callback(logTimeArr);

		//console.log(logTimeArr);
	});
}

