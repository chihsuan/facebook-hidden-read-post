(function(window, chrome) {

  if (window.location.pathname !== '/')
    return;

  var storagePrfix = 'fb-refine';
  var prevStorageData = {};
  var newStorageData = {};
  var lastUpdate = new Date();
  var postNumber = 0;

  window.onscroll = updatePostWall;
  getLocalStorage('data', init);

  function init(data) {
    if (!data)
      data = {}
    prevStorageData = $.extend({}, data);
    newStorageData = data;
    updatePostWall(true);
    updatePostStorage();
    for (var hashKey in prevStorageData) {
      // expire
      if (diffDays(new Date(prevStorageData[hashKey]), lastUpdate) > 1) {
        delete prevStorageData[hashKey];
      }
    }
  }

  $.fn.scrollStopped = function(callback) {
    if (window.location.pathname !== '/')
      return;
    var that = this, $this = $(that);
    $this.scroll(function(ev) {
      clearTimeout($this.data('scrollTimeout'));
      $this.data('scrollTimeout', setTimeout(callback.bind(that), 850, ev));
    });
  };
  
  $(window).scrollStopped(function() {
    if (window.location.pathname !== '/')
      return;
    updatePostWall(true);
    updatePostStorage();
  });

  function updatePostWall(forceUpdate) {
    forceUpdate = forceUpdate ? forceUpdate : false
    // update when exceed one second
    if (!forceUpdate && diffSeconds(new Date(), lastUpdate) < 1) {
      lastUpdate = new Date();
      return;
    }

    // post class
    var posts = $('._5jmm');

    posts.each(function() {
      // if have hidden
      if(this.style.disply === 'none')
        return; 

      // use post link as identify 
      var postHref = $(this).find('a._5pcq').attr('href');

      if(isRead(postHref)) {
        $(this).hide();
      }

      var headerText = $(this).find('.fcg').eq(0).text();
      if (!postHref && headerText && isRead(headerText)) {
        $(this).hide();
      }
    });

    // make sure there is one post on wall
    //if (posts.length === 0)
      //updatePostWall(true, true);
  }

  function isRead(key) {
    if (key && prevStorageData.hasOwnProperty(key)) {
      return true;
    }
    return false;
  }
  
  function bottomOfView(el) {
    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;

    while(el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
      left += el.offsetLeft;
    }

    return (
      top > (window.pageYOffset + window.innerHeight)
    ); 
  }

  function updatePostStorage() {
    var posts = $('._5jmm');
    var index = 0;

    posts.each(function() {
      if (bottomOfView(this)) {
        return;
      }

      // use post link as identify 
      var postHref = $(this).find('._5pcq').attr('href');
      savePost(postHref)
      
      var headerText = $(this).find('.fcg').eq(0).text();
      if (!postHref && headerText) {
        savePost(headerText)
      }
    });
  }

  function savePost(key) {
    if (key && !newStorageData.hasOwnProperty(key)) {
      // save with datetime
      newStorageData[key] = +new Date();
      saveToLocalStorage('data', newStorageData);
    }
  }

  function saveToLocalStorage(key, value, saveTo) {
    if (!saveTo) saveTo = 'local';
    var data = {};
    data[storagePrfix+key] = value;
    chrome.storage[saveTo].set(data, function() {
      if (chrome.runtime.error) 
       console.log("Runtime error.");
   });
  }

  function getLocalStorage(key, cb, opts, from) {
    if (!from) from = 'local';
    chrome.storage[from].get(storagePrfix+key, function (result) {
      if (result) {
        cb(result[storagePrfix+key], opts);
      }
    });
  }

  function diffDays(current, from) {
    var timeDiff = Math.abs(current.getTime() - from.getTime());
    var diff = (timeDiff / (1000 * 60 * 60 * 24));
    return diff;
  }

  function diffSeconds(current, from) {
    var timeDiff = Math.abs(current.getTime() - from.getTime());
    var diff = (timeDiff / (1000));
    return diff;
  }

})(window, chrome);
