module.exports = { GetDate };

function GetDate(time, type) {
  if(type === "hour") { return new Date(new Date() - (time * (60 * 60 * 1000))); }
  else if(type === "day") {
    var date = new Date();
    date.setDate(date.getDate() - time);
    var year = date.getFullYear();
    var month = date.getMonth()+1 < 10 ? `0${ date.getMonth()+1 }` : date.getMonth()+1;
    var day = date.getDate() < 10 ? `0${ date.getDate() }` : date.getDate();
    return new Date(`${ year }-${ month }-${ day } 00:00:00`);
  }
  else { return new Date(); }
}