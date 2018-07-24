/**
 * @file
 * Provides an interface for the Recorder.js library.
 */

(function ($) {
  'use strict';

  $.fn.AvRecorderHTML5 = function (id, conf) {
//	 console.log($(this));
//	 console.log($(this).attr('id'));
//	 console.log(id);
    var settings = conf;
    var origin = window.location.origin || window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    
    var $element = $(this);// $('#' + id);
    var $inputFid = $('#' + $(this).attr('id') + '-fid');//$('#' + id + '-fid');
    var $statusWrapper = $element.find('.av-recorder-status');
    var $previewWrapper = $element.find('.av-recorder-preview');
    var $progressWrapper = $element.find('.av-recorder-progress');
    var $video = $element.find('.av-recorder-video');
    var $audio = $element.find('.av-recorder-audio');
    var $meter = $element.find('.av-recorder-meter');
    var $startButton = $element.find('.av-recorder-enable');
    var $recordButton = $element.find('.av-recorder-record');
    var $stopButton = $element.find('.av-recorder-stop');
    var $playButton = $element.find('.av-recorder-play');
    var $settingsButton = $element.find('.av-recorder-settings');
    var $videoButton = $element.find('.av-recorder-enable-video');
    var $audioButton = $element.find('.av-recorder-enable-audio');

    var recording = false;
    var audioContext = null;
    var canvasContext = null;
    var visualizerProcessor = null;
    var freqData = null;
    var volume = 0;
    var barWidth = 0;
    var level = 0;
    var meterProcessor = null;
    var localStream = null;
    var recorder = null;
    var recordURL = null;
    var playbackURL = null;
    var mimetype = null;
    var analyser = null;
    var microphone = null;
    var blobs = [];
    var statusInterval = null;
    var constraints = {};

    // Initial state.
    $recordButton.hide();
    $stopButton.hide();
    $playButton.hide();
    $settingsButton.hide();
    $video.hide();
    $audio.hide();
    $meter.hide();
    $videoButton.hide();
    $audioButton.hide();
    $previewWrapper.hide();
    $progressWrapper.hide();

    // Show file preview if file exists.
//    if (conf.file) {
//      var file = conf.file;
//      switch (file.type) {
//        case 'video':
//          $previewWrapper.show();
//          $video.show();
//          $audio.hide();
//          $video[0].src = file.url;
//          $video[0].muted = '';
//          $video[0].controls = 'controls';
//          $video[0].load();
//          break;
//        case 'audio':
//          $previewWrapper.show();
//          $audio.show();
//          $video.hide();
//          $audio[0].src = file.url;
//          $audio[0].muted = '';
//          $audio[0].controls = 'controls';
//          $audio[0].load();
//          break;
//      }
//    }

    initializeButtons();
    initializeEvents();
    if(settings.constraints.video == true){
    	setStatus('Click \'Start\' to enable your mic and camera.');
    }else{
    	setStatus('Click \'Start\' to enable your mic.');
    }

    /**
     * Set status message.
     */
    function setStatus(message) {
      $element.trigger('status', message);
    }

    /**
     * Create volume meter canvas element that uses getUserMedia stream.
     */
    function createVolumeMeter() {
      canvasContext = $meter[0].getContext("2d");
      meterProcessor = audioContext.createScriptProcessor(1024, 1, 1);
      microphone.connect(analyser);
      analyser.connect(meterProcessor);
      meterProcessor.connect(audioContext.destination);
      meterProcessor.onaudioprocess = function () {
        freqData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqData);
        level = Math.max.apply(Math, freqData);
        canvasContext.clearRect(0, 0, $meter[0].width, $meter[0].height);
        canvasContext.fillStyle = '#00ff00';
        canvasContext.fillRect(0, 0, $meter[0].width * (level / 255), $meter[0].height);
      };
    }

    /**
     * Create audio visualizer canvas element that uses getUserMedia stream.
     */
    function createAudioVisualizer() {

      // Private function for determining current volume.
      function getVolume() {
        var values = 0;
        var length = freqData.length;

        for (var i = 0; i < length; i++) {
          values += freqData[i];
        }

        return values / length;
      }

      canvasContext = $meter[0].getContext("2d");

      visualizerProcessor = audioContext.createScriptProcessor(1024, 1, 1);
      microphone.connect(analyser);
      analyser.connect(visualizerProcessor);
      visualizerProcessor.connect(audioContext.destination);

      visualizerProcessor.onaudioprocess = function (audioProcessingEvent) {
        freqData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqData);
        volume = getVolume();

        if (volume === 0) {
          $meter.addClass('muted');
        }
        else {
          $meter.removeClass('muted');
        }

        barWidth = Math.ceil($meter[0].width / (analyser.frequencyBinCount * 0.5));
        canvasContext.clearRect(0, 0, $meter[0].width, $meter[0].height);
        for (var i = 0; i < analyser.frequencyBinCount; i++) {
          canvasContext.fillStyle = 'hsl(' + i / analyser.frequencyBinCount * 360 + ', 100%, 50%)';
          if ((barWidth * i) + barWidth < $meter[0].width) {
            canvasContext.fillRect(barWidth * i, $meter[0].height, barWidth - 1, -(Math.floor((freqData[i] / 255) * $meter[0].height)));
          }
        }
      };
    }

    /**
     * Toggle to recording preview.
     */
    function recordingPreview() {
      if (constraints.video) {
        $video.show();
        $audio.hide();
//        $video[0].src = recordURL;
        $video[0].srcObject = localStream;
        $video[0].muted = 'muted';
        $video[0].controls = '';
        $video[0].load();
        $video[0].play();
        $meter.height(10);
      }
      else {
        $video.hide();
        $audio.hide();
        $meter.height($meter.width() / 2);
      }
    }

    /**
     * Toggle to recording preview.
     */
    function playbackPreview() {
      if (blobs.length === 0) {
        return;
      }
      if (constraints.video) {
        playbackURL = URL.createObjectURL(new Blob(blobs, {type: mimetype}));
        $video.show();
        $audio.hide();
        $video[0].src = playbackURL;
//        $video[0].srcObject = blobs[0];
        $video[0].muted = '';
        $video[0].controls = 'controls';
        $video[0].load();
      }
      else {
//        playbackURL = URL.createObjectURL(new Blob(blobs, {type: mimetype}));
        $audio.show();
        $audio[0].src = playbackURL;
        $audio[0].load();
      }
    }

    /**
     * Send a blob as form data to the server. Requires jQuery 1.5+.
     */
    function sendBlob(blob, count) {

      // Create formData object.
      var formData = new FormData();
      var request = new XMLHttpRequest();
      blobs = [blob];
      formData.append("mediaBlob", blob);
      formData.append("mediaRecorderUploadLocation", conf.upload_location);
	  formData.append("fileName",'mediaBlob.webm');
	  formData.append("mimeType",mimetype);
	  
      // Send file.
      request.addEventListener("load", transferComplete, false);
      request.open('POST', settings.server_upload_endpoint, true);
      request.send(formData);
      $(".loader").show();
      var height = $(".av-recorder-preview").css("height");
      $video.hide();
      $(".av-recorder-preview").css("height",height);
      function transferComplete(evt) {
//    	console.log(request.response);
        var jsonObj = JSON.parse(request.response);
    	//Pass the audio blob to the uploadFinished function.
        playbackURL = jsonObj.data.fileUrl;
        $element.trigger('uploadFinished', jsonObj.data);
        $(".loader").hide();
        $(".av-recorder-preview").css("height", "auto");
      }
    }

    /**
     * Stop user media stream.
     */
    function stopStream() {
      analyser.disconnect();
      microphone.disconnect();
      localStream.stop();
      $previewWrapper.hide();
      $startButton.show();
      $recordButton.hide();
      $stopButton.hide();
    }

    /**
     * Start user media stream.
     */
    function startStream() {
      if (localStream) {
        stopStream();
      }
      
      navigator.mediaDevices.getUserMedia(constraints)
      .then(function(stream) {
        /* use the stream */
    	localStream = stream;
//		recordURL = URL.createObjectURL(localStream);
		mimetype = settings.constraints.video ? 'video/webm' : 'audio/ogg';
		audioContext = new AudioContext();
		analyser = audioContext.createAnalyser();
		analyser.smoothingTimeConstant = 0.75;
		analyser.fftSize = 512;
		microphone = audioContext.createMediaStreamSource(stream);
		recorder = new Recorder(microphone, {workerPath: '/recorderWorker.js'});
		
		$previewWrapper.show();
		$meter.show();
		$startButton.hide();
		$recordButton.show();
		$stopButton.hide();
		recordingPreview();
		
//		if (constraints.video) {
//			createVolumeMeter();
//		}
//		else {
//			createAudioVisualizer();
//		}
		
		setStatus('Press record to start recording.');
      })
      .catch(function(err) {
        /* handle the error */
    	  	console.log(err);
//    	  	stopStream();
//        alert("There was a problem accessing your camera or mic. Please click 'Allow' at the top of the page.");
    	  setStatus(err.message);
      });
      
//      navigator.getUserMedia(
//        constraints,
//        function (stream) {
//          localStream = stream;
//          recordURL = URL.createObjectURL(localStream);
//          mimetype = settings.constraints.video ? 'video/webm' : 'audio/ogg';
//          audioContext = new AudioContext();
//          analyser = audioContext.createAnalyser();
//          analyser.smoothingTimeConstant = 0.75;
//          analyser.fftSize = 512;
//          microphone = audioContext.createMediaStreamSource(stream);
//          recorder = new Recorder(microphone, {workerPath: '/recorderWorker.js'});
//
//          $previewWrapper.show();
//          $meter.show();
//          $startButton.hide();
//          $recordButton.show();
//          $stopButton.hide();
//          recordingPreview();
//
//          if (constraints.video) {
//            createVolumeMeter();
//          }
//          else {
//            createAudioVisualizer();
//          }
//
//          setStatus('Press record to start recording.');
//        },
//        function (error) {
//          stopStream();
//          alert("There was a problem accessing your camera or mic. Please click 'Allow' at the top of the page.");
//        }
//      );
    }

    /**
     * Stop recording and trigger stopped event.
     */
    function start() {
      constraints = {
        audio: true,
        video: false
      };

      startStream();
    }

    /**
     * Stop recording and trigger stopped event.
     */
    function stop() {
      recorder.stop();
      recorder.exportWAV(function (blob) {
        sendBlob(blob);
      });
      recorder.clear();
      $element.trigger('recordStop');
      //Clear the audio visualizers.
      if(visualizerProcessor != null){
    	  visualizerProcessor.disconnect(audioContext.destination);
      }
      if(meterProcessor != null){
    	  meterProcessor.disconnect(audioContext.destination);
      }
      if(canvasContext != null){
    	  canvasContext.clearRect(0, 0, $meter[0].width, $meter[0].height);
    	  canvasContext.fillStyle = "#000";
    	  canvasContext.fillRect(0, 0, $meter[0].width, $meter[0].height);
    	  canvasContext = null;
      }
    }

    /**
     * Start recording and trigger recording event.
     */
    function record() {
      recorder.record();
      $element.trigger('recordStart');
      if (constraints.video) {
        createVolumeMeter();
      }
      else {
        createAudioVisualizer();
      }
    }

    /**
     * Initialize all control buttons.
     */
    function initializeButtons() {

      // Click handler for enable audio button.
      $startButton.bind('click', function (event) {
        event.preventDefault();
        $startButton[0].disabled = true;
        start();
        setStatus('Allow access at top of page.');
      });

      // Click handler for record button.
      $recordButton.bind('click', function (event) {
        event.preventDefault();
        $recordButton[0].disabled = true;
        $recordButton.hide();
        $stopButton.show();
        record();
      });

      // Click handler for stop button.
      $stopButton.bind('click', function (event) {
        event.preventDefault();
        $stopButton.hide();
        $recordButton.show();
        stop();
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

      // Listen for the record event.
      $element.bind('recordStart', function (event, data) {
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

        recording = true;
        recordingPreview();
        setStatus('Recording 00:00 (Time Limit: ' + timeLimitFormatted + ')');

        $progressWrapper.show();
        var $progress = $progressWrapper.children('.progress-bar');
        $progress.css({
          width: '0%'
        });

        currentSeconds = 0;
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

      // Listen for the stop event.
      $element.bind('recordStop', function (event) {
        $progressWrapper.hide();
        clearInterval(statusInterval);
        setStatus('Uploading, please wait...');
      });

      $element.bind('uploadFinished', function (event, data) {
        recording = false;
//        $inputFid.val(data.fid);
        $recordButton[0].disabled = false;
        playbackPreview();
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
