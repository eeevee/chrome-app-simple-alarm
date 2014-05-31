(function(exports){
  var AlarmModel = function() {
    this.times = {};
    this.lostAlarms = [];
    this.alarmSound = new Audio("sounds/alarm_railroad.mp3");
    //get the saved alerts
    chrome.storage.sync.get('times', this.syncGetHandler.bind(this));
    //listener to Alarm
    chrome.alarms.onAlarm.addListener(this.onAlarmHandler.bind(this));
  };

  AlarmModel.prototype.alarmNotificationCloseHandler = function(e) {
    this.alarmSound.pause();
    this.alarmSound.currentTime = 0;
  };

  AlarmModel.prototype.syncGetHandler = function(value) {
    for (var key in value.times) {
      var dateNow = new Date();
      var alarmDate = new Date(value.times[key].scheduledTime);
      if(alarmDate.getTime() >= dateNow.getTime()) {
        this.times[key] = value.times[key];
      } else {
        this.lostAlarms.push(value.times[key]);
        chrome.alarms.clear(value.times[key].name);
      }
    }
    //save in session the alarms that still are valid
    this.persistData();
    //show the losted alarms
    if (this.lostAlarms.length > 0) {
      for(var i = 0; i < this.lostAlarms.length; i++) {
        var option = {body: 'Losted: ' + this.lostAlarms[i].name};
        var notification = new Notification("LOSTED ALARMS!!!", option);
        notification.show();
      }
    }
  };

  AlarmModel.prototype.onAlarmHandler = function(alarm) {
    var option = { body: alarm.name };
    var notification = new Notification("ALARM!!!", option);
    notification.show();
    notification.onclose = this.alarmNotificationCloseHandler.bind(this);
    this.playAlarmSound();
    this.clearDispatchedAlarm(alarm);
  };

  AlarmModel.prototype.playAlarmSound = function() {
    this.alarmSound.play();
  };

  AlarmModel.prototype.clearDispatchedAlarm = function(alarm) {
    chrome.alarms.clear(alarm.name);
    var tmpTimes = {};
    for (var key in this.times) {
      if (key !== alarm.name) {
        tmpTimes[key] = this.times[key];
      }
    }
    this.times = tmpTimes;
    this.persistData();
  };

  AlarmModel.prototype.search = function(time) {
    for (var key in this.times) {
      if (key === time) return this.times[key];
    }

    return null;
  };

  AlarmModel.prototype.save = function(time) {
    if (time === '') return false;
    //verify if the alarm was set to today or tomorrow
    var dateNow = new Date();
    var hours = parseInt(time.split(":")[0], 10);
    var minutes = parseInt(time.split(":")[1], 10);
    var isToday = (dateNow.getHours() <= hours && dateNow.getMinutes() <= minutes) ? true : false;
    var dateToSave = new Date();
    if (!isToday) {
      dateToSave.setDate(dateToSave.getDate() + 1);
    }
    dateToSave.setHours(hours);
    dateToSave.setMinutes(minutes);
    chrome.alarms.create(time, {when: dateToSave.getTime()});
    chrome.alarms.get(time, this.getAlarmHandler.bind(this));
    return true;
  };

  AlarmModel.prototype.getAlarmHandler = function(alarm) {
    if(alarm) {
      this.times[alarm.name] = alarm;
      this.persistData();
    }
  };

  AlarmModel.prototype.persistData = function() {
    chrome.storage.sync.set({times:this.times});
  };

  exports.AlarmModel = AlarmModel;
})(window);