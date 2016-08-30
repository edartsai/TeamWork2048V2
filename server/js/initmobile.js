//(function () {
//  var supportTouch = $.support.touch,
//    scrollEvent = "touchmove scroll",
//    touchStartEvent = supportTouch ? "touchstart" : "mousedown",
//    touchStopEvent = supportTouch ? "touchend" : "mouseup",
//    touchMoveEvent = supportTouch ? "touchmove" : "mousemove";
//  $.event.special.swipeupdown = {
//    setup: function () {
//      var thisObject = this;
//      var $this = $(thisObject);
//      $this.bind(touchStartEvent, function (event) {
//        var data = event.originalEvent.touches ?
//          event.originalEvent.touches[0] :
//          event,
//          start = {
//            time: (new Date).getTime(),
//            coords: [data.pageX, data.pageY],
//            origin: $(event.target)
//          },
//          stop;
//        function moveHandler(event) {
//          if (!start) {
//            return;
//          }
//          var data = event.originalEvent.touches ?
//            event.originalEvent.touches[0] :
//            event;
//          stop = {
//            time: (new Date).getTime(),
//            coords: [data.pageX, data.pageY]
//          };
//          // prevent scrolling
//          if (Math.abs(start.coords[1] - stop.coords[1]) > 10) {
//            event.preventDefault();
//          }
//        }
//        $this
//          .bind(touchMoveEvent, moveHandler)
//          .one(touchStopEvent, function (event) {
//            $this.unbind(touchMoveEvent, moveHandler);
//            if (start && stop) {
//              if (stop.time - start.time < 1000 &&
//                Math.abs(start.coords[1] - stop.coords[1]) > 30 &&
//                Math.abs(start.coords[0] - stop.coords[0]) < 75) {
//                start.origin
//                  .trigger("swipeupdown")
//                  .trigger(start.coords[1] > stop.coords[1] ? "swipeup" : "swipedown");
//              }
//            }
//            start = stop = undefined;
//          });
//      });
//    }
//  };
//  $.each({
//    swipedown: "swipeupdown",
//    swipeup: "swipeupdown"
//  }, function (event, sourceEvent) {
//    $.event.special[event] = {
//      setup: function () {
//        $(this).bind(sourceEvent, $.noop);
//      }
//    };
//  });
//})();

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;
var yDown = null;

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
};

var swipeleftevt = new CustomEvent('swipeleft', {
    detail: {},
    bubbles: true,
    cancelable: true
});
var swiperightevt = new CustomEvent('swiperight', {
    detail: {},
    bubbles: true,
    cancelable: true
});
var swipeupevt = new CustomEvent('swipeup', {
    detail: {},
    bubbles: true,
    cancelable: true
});
var swipedownevt = new CustomEvent('swipedown', {
    detail: {},
    bubbles: true,
    cancelable: true
});


function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
        if (xDiff > 0) {
            /* left swipe */
            //window.dispatchEvent(swipeleftevt);
            document.body.dispatchEvent(swipeleftevt);
        } else {
            /* right swipe */
            //window.dispatchEvent(swiperightevt);
            document.body.dispatchEvent(swiperightevt);
        }
    } else {
        if (yDiff > 0) {
            /* up swipe */
            //window.dispatchEvent(swipeupevt);
            document.body.dispatchEvent(swipeupevt);
        } else {
            /* down swipe */
            //window.dispatchEvent(swipedownevt);
            document.body.dispatchEvent(swipedownevt);
        }
    }
    /* reset values */
    xDown = null;
    yDown = null;
};
