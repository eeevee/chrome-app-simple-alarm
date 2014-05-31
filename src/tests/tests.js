var inputTime;
var btnSave;
var model;
var mouseEvent = new MouseEvent('click');

/*CRUD*/

module('crud', {
  setup: function(){
    inputTime = document.getElementById('inputTime');
    btnSave = document.getElementById('save');
    model = new window.AlarmModel();
  }, teardown: function(){
    chrome.storage.sync.clear(); 
  }
});

asyncTest("quando clicar no botao 'save', salvar a hora que é para alarmar", function(){
  expect(2);
  inputTime.value = "14:57";
  btnSave.addEventListener('click',  function(e){
    ok(model.save(inputTime.value));
  });
  btnSave.dispatchEvent(mouseEvent);
  window.setTimeout(function(){
    ok(model.search(inputTime.value) !== null);
    start();
  }, 100);
});

test("quando tento salvar um valor vazio, o model não deve permitir", function(){
  inputTime.value = "";
  btnSave.addEventListener('click',  function(e){
    ok(model.save(inputTime.value) === false);
  });
  btnSave.dispatchEvent(mouseEvent);
});

/*SYNC*/

module('sync', {
  setup: function(){
    inputTime = document.getElementById('inputTime');
    inputTime.value = "12:00";
    model = new window.AlarmModel();
  }, teardown: function(){
    chrome.storage.sync.clear(); 
  }
});

asyncTest("quando salvo um valor, o chrome tem que persistir os dados", function(){
  expect(2);
  model.save(inputTime.value);
  setTimeout(function(){
    chrome.storage.sync.get('times', function(value){
      ok(value && value.times);
      var hasKey = false;
      for (var key in value.times) {
        if (key === inputTime.value) {
          hasKey = true;
          break;
        }
      }
      ok(hasKey);
      start();
    });
  }, 100);
});

asyncTest("quando eu peço uma chave do storage, o valor retornado deve ser o esperado", function(){
  expect(4);
  var time1 = "12:05";
  var time2 = "13:15";
  var time3 = "14:25";
  var hasTime1 = false;
  var hasTime2 = false;
  var hasTime3 = false;
  model.save(time1);
  model.save(time2);
  model.save(time3);
  setTimeout(function(){
    chrome.storage.sync.get('times', function(value){
      var count = 0;
      for (var key in value.times) {
        if (key === time1) {
          hasTime1 = true;
        }
        if (key === time2) {
          hasTime2 = true;
        }
        if (key === time3) {
          hasTime3 = true;
        }
        count++;
      }
      ok(count == 3);
      ok(hasTime1);
      ok(hasTime2);
      ok(hasTime3);
      start();
    });
  }, 100);
});

/*ALARM*/
var dateNow;
var hours;
var minutes;

module('alarm', {
  setup: function(){
    model = new window.AlarmModel();
    dateNow = new Date();
    hour = dateNow.getHours();
    minutes = dateNow.getMinutes();
  },teardown: function(){
    chrome.alarms.clearAll();
    //chrome.storage.sync.clear();
  }
});

asyncTest("quando salvar um alarme para uma hora que ainda não ocorreu hoje, o alarme tem que ser disparado hoje", function(){
  expect(1);
  var time = hour.toString() + ":" + (minutes + 1).toString();
  model.save(time);
  setTimeout(function(){
    var alarm = model.search(time);
    var alarmDate = new Date(alarm.scheduledTime);
    ok(dateNow.getDate() === alarmDate.getDate());
    start();
  }, 100);
});

asyncTest("quando salvar um alarme para uma hora depois de hoje, o alarme tem que ser para amanhã", function(){
  expect(1);
  var time = hour.toString() + ":" + (minutes - 1).toString();
  model.save(time);
  setTimeout(function(){
    var alarm = model.search(time);
    var alarmDate = new Date(alarm.scheduledTime);
    ok(dateNow.getDate() + 1 === alarmDate.getDate());
    start();
  }, 100);
});

/*APP INITIALIZE*/
module('app initialize', {
  setup: function(){
    model = new window.AlarmModel();
    dateNow = new Date();
    hour = dateNow.getHours();
    minutes = dateNow.getMinutes();
    var timeAfter = hour.toString() + ":" + (minutes + 1).toString();
    model.save(timeAfter);
    var timeBefore = hour.toString() + ":" + (minutes - 10).toString();
    model.save(timeBefore);
    model = new window.AlarmModel();
  }, teardown: function(){
    chrome.alarms.clearAll();
  }
});


asyncTest("quando carregar o aplicativo, tem que carregar os alarmes já existentes", function(){
  expect(1);
  setTimeout(function(){
    var count = 0;
    for (var key in model.times) {
      count ++; 
    }
    ok(count > 0);
    start();
  }, 100);
});

/*
asyncTest("quando carregar o aplicativo, tem que listar os alarmes perdidos", function(){
  expect(1);
  setTimeout(function(){
    ok(model.lostAlarms.length > 0);
    start();
  }, 100);
});
*/