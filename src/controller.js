window.addEventListener('DOMContentLoaded', function(){
  var model = new AlarmModel();
  var inputTime = document.getElementById('inputTime');
  var btnSave = document.getElementById('save');
  
  btnSave.addEventListener('click', function(e){
    model.save(inputTime.value);
    inputTime.value = '';
  });
});