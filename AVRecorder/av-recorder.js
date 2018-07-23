/**
 * @file
 * Provides JavaScript additions to the media recorder element.
 *
 * This file loads the correct media recorder javascript based on detected
 * features, such as the MediaRecorder API and Web Audio API. 
 * 
 */

(function ($) {
	'use strict';
  
	$.fn.AvRecorder = function (id, conf) {
		// Normalize features.
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
		window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
		window.URL = window.URL || window.webkitURL;
		
		// Feature detection.
		var getUserMediaCheck = typeof (navigator.getUserMedia) === 'function';
		var mediaRecorderCheck = typeof (window.MediaRecorder) === 'function';
		var webAudioCheck = typeof (window.AudioContext) === 'function';
	
		// Set recorder type.
		var recorderType = false;
		if (getUserMediaCheck && webAudioCheck && mediaRecorderCheck) {
			//Use browser based MediaRecorder API 
			recorderType = 'AvRecorder';  
		}
		else if (getUserMediaCheck && webAudioCheck && !mediaRecorderCheck) {
			//Fallback to use RecorderJS
			recorderType = 'AvRecorderHTML5';
		}
		
		console.log("Recording type = " + recorderType);
	
        var $avRecorder = $('#' + id);
        var $avRecorderFallback =  $('#' + id + '-fallback-ajax-wrapper');
        switch (recorderType) {
          case 'AvRecorder':
            $avRecorder.show();
            $avRecorderFallback.hide();
            new $('#' + id).AvRecorderMoz(id, conf);
            break;
          case 'AvRecorderHTML5':
            $avRecorder.show();
            $avRecorderFallback.hide();
            new $('#' + id).AvRecorderHTML5(id, conf);
            break;
          default:
            $avRecorder.hide();
        }
	}
})(jQuery);
