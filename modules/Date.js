var d = new Date();
var s = d.getSeconds();
var m = d.getMinutes();
var h = d.getHours();
var day = d.getDate();
var month = d.getMonth()+ 1;
var y = d.getFullYear();
if (s<10) var s = '0'+d.getSeconds();
if (m<10) var m = '0'+d.getMinutes();
if (h<10) var h = '0'+d.getHours();
if (day<10) var day = '0'+d.getDate();
if (month<10) var month = '0'+d.getMonth();
var datetime = y+'-'+month+'-'+day+' '+h+':'+m+':'+s;
var date = y+'-'+month+'-'+day;
var time = h+':'+m+':'+s;


exports.dateTime = function () {
   return datetime;
}
exports.date = function () {
   return date;
}
exports.time = function () {
   return time;
}
