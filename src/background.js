var MAIN_PAGE = "window.html";
var TEST_PAGE = "tests/tests.html";
var MAIN_BOUNDS = {width:300, height:400};
var TEST_BOUNDS = {width:800, height:600};

chrome.app.runtime.onLaunched.addListener(function(){
  chrome.app.window.create(MAIN_PAGE,
    {bounds: MAIN_BOUNDS}
  );
});