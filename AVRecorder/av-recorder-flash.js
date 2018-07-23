/**
 * @file
 * Provides an interface for the FWRecorder library.
 */

(function ($) {
  'use strict';

  $.fn.MediaRecorderFlash = function (id, conf) {
    var settings = conf;
    var origin = window.location.origin || window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

    var $element = $(this);// $('#' + id);
    var $inputFid = $('#' + $(this).attr('id') + '-fid');//$('#' + id + '-fid');
    var $statusWrapper = $element.find('.media-recorder-status');
    var $previewWrapper = $element.find('.media-recorder-preview');
    var $progressWrapper = $element.find('.media-recorder-progress');
    var $video = $element.find('.media-recorder-video');
    var $audio = $element.find('.media-recorder-audio');
    var $meter = $element.find('.media-recorder-meter');
    var $startButton = $element.find('.media-recorder-enable');
    var $recordButton = $element.find('.media-recorder-record');
    var $stopButton = $element.find('.media-recorder-stop');
    var $playButton = $element.find('.media-recorder-play');
    var $settingsButton = $element.find('.media-recorder-settings');
    var $videoButton = $element.find('.media-recorder-enable-video');
    var $audioButton = $element.find('.media-recorder-enable-audio');
    var statusInterval = null;
    var recordingName = id + '-audio';
    var recording = false;

    // Initialize flash recorder.
    if (!$('#flash-wrapper').length) {
      $element.append('<div id="flash-wrapper"><div id="flashcontent"><p>Your browser must have JavaScript enabled and the Adobe Flash Player installed.</p></div></div>');

      window.fwr_event_handler = function fwr_event_handler(eventName) {
//    	  console.log(eventName);
    	  $element.trigger(eventName, arguments);
//    	  $('#lfoMediaRecorder').forEach(function (info) {
//    		  console.log(info);
//          $('#' + info.id).trigger(eventName, arguments);
//        });
      };

      swfobject.embedSWF(
       '/common/js/FlashWavRecorder/recorder.swf?id=' + id,
        'flashcontent',
        1,
        1,
        '11.0.0',
        '',
        {},
        {},
        {'id': 'flashRecorder', 'name': 'flashRecorder'}
      );
    }

    // Initial state.
    $recordButton.hide();
    $recordButton.hide();
    $stopButton.hide();
    $playButton.hide();
    $stopButton.before($playButton);
    $previewWrapper.hide();
    $video.hide();
    $audio.hide();
    $meter.hide();
    $videoButton.hide();
    $audioButton.hide();
    $progressWrapper.hide();
    
    // Show file preview if file exists.
    if ($('#lfoMediaRecorder').file) {
      var file = $('#lfoMediaRecorder').file;
      switch (file.type) {
        case 'video':
          $previewWrapper.show();
          $video.show();
          $audio.hide();
          $video[0].src = $('#lfoMediaRecorder').file.url;
          $video[0].muted = '';
          $video[0].controls = 'controls';
          $video[0].load();
          break;
        case 'audio':
          $previewWrapper.show();
          $audio.show();
          $video.hide();
          $audio[0].src = $('#lfoMediaRecorder').file.url;
          $audio[0].muted = '';
          $audio[0].controls = 'controls';
          $audio[0].load();
          break;
      }
    }

    initializeButtons();
    initializeEvents();
    if(settings.constraints.video == true){
    	setStatus('Click \'Start\' to enable your mic and camera.');
    }else{
    	setStatus('Click \'Start\' to enable your mic.');
    }
    console.log(FWRecorder);

    /**
     * Set status message.
     */
    function setStatus(message) {
      $element.trigger('status', message);
    }

    /**
     * Toggle to recording preview.
     */
    function showSettings() {
      FWRecorder.showPermissionWindow({permanent: true});
    }

    /**
     * Send a blob as form data to the server. Requires jQuery 1.5+.
     */
    function sendBlob(blob) {
      setStatus('Uploading, please wait...');

      // Create formData object.
      var formData = new FormData();
      var req = new XMLHttpRequest();
      formData.append("mediaBlob", blob);
      formData.append("mediaRecorderUploadLocation", conf.upload_location);
      formData.append("fileName",'mediaBlob.wav');
      formData.append("mimeType","audio/wav");

      // Send file.
      req.addEventListener("load", transferComplete, false);
      req.open('POST', origin + '/media/record-file', true);
      req.send(formData);
      function transferComplete(evt) {
    	var jsonObj = JSON.parse(req.response);
        $element.trigger('uploadFinished', jsonObj.data);
      }
    }

    /**
     * Stop recording and trigger stopped event.
     */
    function start() {
      showSettings('asdf');
    }

    /**
     * Stop recording and trigger stopped event.
     */
    function stop() {
      FWRecorder.stopPlayBack();
      FWRecorder.stopRecording();
    }

    /**
     * Start recording and trigger recording event.
     */
    function record() {
      FWRecorder.record(recordingName);
    }

    /**
     * Initialize all control buttons.
     */
    function initializeButtons() {

      // Click handler for enable button.
      $startButton.bind('click', function (event) {
        event.preventDefault();
        $startButton[0].disabled = true;
        start();
        setStatus('Allow access to your mic in the settings panel.');
      });

      // Click handler for record button.
      $recordButton.bind('click', function (event) {
        event.preventDefault();
        $recordButton[0].disabled = true;
        $recordButton.hide();
        $playButton.hide();
        $stopButton.show();
        record();
      });

      // Click handler for stop button.
      $stopButton.bind('click', function (event) {
        event.preventDefault();
        $stopButton.hide();
        $recordButton.show();
        $playButton.show();
        stop();
      });

      // Click handler for play button.
      $playButton.bind('click', function (event) {
        event.preventDefault();
        $playButton.hide();
        $stopButton.show();
        FWRecorder.playBack(recordingName);
      });

      // Click handler for settings button.
      $settingsButton.bind('click', function (event) {
        event.preventDefault();
        showSettings();
      });
    }

    /**
     * Initialize recorder.
     */
    function initializeEvents() {

      // Stop page unload if there is a recording in process.
      window.onbeforeunload = function () {
        if (recording) {
          return 'You are still in the process of recording, are you sure you want to leave this page?';
        }
        else {
          return null;
        }
      };

      // FWRecorder ready event.
      $element.bind('ready', function (event) {

        // Fix for weird FWRecorder use of window instead of document.
        window['flashRecorder'] = document['flashRecorder'];
        
//        console.log(document['flashRecorder']);
//        console.log(window['flashRecorder']);
        
        FWRecorder.connect('flashRecorder', 0);
        FWRecorder.recorderOriginalWidth = 1;
        FWRecorder.recorderOriginalHeight = 1;
        
//        console.log('heyeyeyeye');
//        console.log(FWRecorder);

        if (!FWRecorder.isMicrophoneAccessible()) {
          $startButton.show();
        }
      });

      // FWRecorder microphone_connected event.
      $element.bind('microphone_user_request', function (event) {
        FWRecorder.showPermissionWindow();
      });

      // FWRecorder microphone_connected event.
      $element.bind('microphone_connected', function (event) {
        FWRecorder.configure(22, 50, 0, 4000);
        $startButton.hide();
        $recordButton.show();
        setStatus('Press record to start recording.');
        FWRecorder.observeLevel();
      });

      // FWRecorder microphone_not_connected event.
      $element.bind('microphone_not_connected', function (event) {
        $startButton.show();
        $startButton[0].disabled = false;
        $recordButton.hide();
        setStatus('Click \'Start\' to enable your mic & camera.');
      });

      // FWRecorder no_microphone_found event.
      $element.bind('no_microphone_found', function (event, name, data) {
        $startButton.show();
        $startButton[0].disabled = false;
        $recordButton.hide();
        setStatus('No mic found. Click \'Start\' to enable your mic & camera.');
      });

      // FWRecorder permission_panel_closed event.
      $element.bind('permission_panel_closed', function (event) {
        FWRecorder.defaultSize();
      });

      // FWRecorder observing_level event.
      $element.bind('observing_level', function (event, name, data) {
        $meter.show();
        $meter.height(20);
      });

      // FWRecorder observing_level_stopped event.
      $element.bind('observing_level_stopped', function (event, name, data) {
        $meter.hide();
      });

      // FWRecorder microphone_level event.
      $element.bind('microphone_level', function (event, name, data) {
        var level = data * 100;
        $meter.width(level + '%');
        if (data * 100 <= 70) {
          $meter.css({
            'background': 'green'
          });
        }
        else if (level > 70 && level < 85) {
          $meter.css({
            'background': 'yellow'
          });
        }
        else if (level >= 85) {
          $meter.css({
            'background': 'red'
          });
        }
      });

      // FWRecorder recording event.
      $element.bind('recording', function (event, data) {
		  if (constraints.video) {
	    		if($video[0].src != ""){
	    			$video[0].pause();
	    		}
	    	}else{
	    		if($audio[0].src != ""){
	    			$audio[0].pause();
	    		}
	    	}
        var currentSeconds = 0;
        var timeLimitFormatted = millisecondsToTime(new Date(parseInt(settings.time_limit, 10) * 1000));

        $progressWrapper.show();
        var $progress = $progressWrapper.children('.progress-bar');
        $progress.css({
          width: '0%'
        });

        recording = true;
        setStatus('Recording 00:00 (Time Limit: ' + timeLimitFormatted + ')');

        statusInterval = setInterval(function () {
          currentSeconds = currentSeconds + 1;
          var currentMilliSeconds = new Date(currentSeconds * 1000);
          var time = millisecondsToTime(currentMilliSeconds);
          var timePercentage = currentSeconds / settings.time_limit * 100;

          $progress.css({
            width: timePercentage + '%'
          });

          setStatus('Recording ' + time + ' (Time Limit: ' + timeLimitFormatted + ')');

          if (currentSeconds >= settings.time_limit) {
            stop();
          }
        }, 1000);
      });

      // FWRecorder recording_stopped event.
      $element.bind('recording_stopped', function (event) {
        var blob = FWRecorder.getBlob(recordingName);
		$progressWrapper.hide();
        clearInterval(statusInterval);
        sendBlob(blob);
      });

      // FWRecorder recording_stopped event.
      $element.bind('stopped', function (event) {
        $playButton.show();
        $stopButton.hide();
      });

      $element.bind('uploadFinished', function (event, data) {
	      recording = false;
//        $inputFid.val(data.fid);
        $recordButton[0].disabled = false;
        setStatus('Press record again to start over with your recording.');
      });

      $element.bind('status', function (event, msg) {
        $statusWrapper.text(msg);
      });
    }

    /**
     * Convert milliseconds to time format.
     */
    function millisecondsToTime(milliSeconds) {
      var milliSecondsDate = new Date(milliSeconds);
      var mm = milliSecondsDate.getMinutes();
      var ss = milliSecondsDate.getSeconds();
      if (mm < 10) {
        mm = "0" + mm;
      }
      if (ss < 10) {
        ss = "0" + ss;
      }
      return mm + ':' + ss;
    }

  };
})(jQuery);
