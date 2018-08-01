/**
 * @file
 * Provides an interface for the MediaRecorder API.
 */

(function ($) {
  'use strict';

  $.fn.AvRecorderMoz = function (id, conf) {
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
    var format = null;
    var mimetype = null;
    var analyser = null;
    var microphone = null;
    var blobs = [];
    var blobCount = 0;
    var statusInterval = null;
    var constraints = {};

    // Initial state.
    $recordButton[0].disabled = false;
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

    // Set constraints.
    constraints.audio = true;
    constraints.video = {};
    if (settings.constraints.video) {
      switch (settings.constraints.video_resolution) {
        case '640':
          constraints.video = {
            width: 640,
            height: 480
          };
          break;
        case '480':
          constraints.video = {
            width: 480,
            height: 360
          };
          break;
        case '320':
          constraints.video = {
            width: 320,
            height: 240
          };
          break;
        case '240':
          constraints.video = {
            width: 240,
            height: 180
          };
          break;
        case '180':
          constraints.video = {
            width: 180,
            height: 135
          };
          break;
      }
      constraints.video.frameRate = {
        min: 30,
        ideal: 30,
        max: 30
      };
    }

    // Show file preview if file exists.
    if (conf.file) {
      var file = conf.file;
      switch (file.type) {
        case 'video':
          $previewWrapper.show();
          $video.show();
          $audio.hide();
          $video[0].src = file.url;
          $video[0].muted = '';
          $video[0].controls = 'controls';
          $video[0].load();
          break;
        case 'audio':
          $previewWrapper.show();
          $audio.show();
          $video.hide();
          $audio[0].src = file.url;
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
      meterProcessor = audioContext.createScriptProcessor(1024, 1, 1);
      microphone.connect(analyser);
      analyser.connect(meterProcessor);
      meterProcessor.connect(audioContext.destination);
      meterProcessor.onaudioprocess = function () {
        freqData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqData);
        volume = getVolume();
        level = Math.max.apply(Math, freqData);

        if (volume === 0) {
          $meter.addClass('muted');
        }
        else {
          $meter.removeClass('muted');
        }
        
        if(canvasContext != null){
        	canvasContext.clearRect(0, 0, $meter[0].width, $meter[0].height);
            canvasContext.fillStyle = '#00ff00';
            canvasContext.fillRect(0, 0, $meter[0].width * (level / 255), $meter[0].height);
        }
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

      visualizerProcessor.onaudioprocess = function () {
        freqData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqData);
        volume = getVolume();
        barWidth = Math.ceil($meter[0].width / (analyser.frequencyBinCount * 0.5));

        if (volume === 0) {
          $meter.addClass('muted');
        }
        else {
          $meter.removeClass('muted');
        }

        if(canvasContext != null){
        	canvasContext.clearRect(0, 0, $meter[0].width, $meter[0].height);
	    	for (var i = 0; i < analyser.frequencyBinCount; i++) {
	    		canvasContext.fillStyle = 'hsl(' + i / analyser.frequencyBinCount * 360 + ', 100%, 50%)';
				if ((barWidth * i) + barWidth < $meter[0].width) {
					canvasContext.fillRect(barWidth * i, $meter[0].height, barWidth - 1, -(Math.floor((freqData[i] / 255) * $meter[0].height)));
				}
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
        $meter.height(20);
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
        $video[0].srcObject = null;
        $video[0].src = playbackURL;
        $video[0].muted = '';
        $video[0].controls = 'controls';
        $video[0].load();
      }
      else {
        playbackURL = URL.createObjectURL(new Blob(blobs, {type: mimetype}));
        $audio.show();
        $audio[0].src = playbackURL;
        $audio[0].load();
      }
    }

    /**
     * Stop user media stream.
     */
    function stopStream() {
      analyser.disconnect();
      microphone.disconnect();
      if(visualizerProcessor != null){
    	  visualizerProcessor.disconnect();
      }
      if(meterProcessor != null){
    	  meterProcessor.disconnect();
      }
      localStream.getTracks().forEach(track => track.stop());
//      localStream.stop();
//      $previewWrapper.hide();
//      $startButton.show();
//      $recordButton.hide();
//      $stopButton.hide();
//      $videoButton.hide();
//      $audioButton.hide();
//      setStatus('Click \'Start\' to enable your mic & camera.');
    }

    /**
     * Start user media stream.
     */
    function startStream(callback = null) {
      if (localStream) {
        stopStream();
      }
      navigator.mediaDevices.getUserMedia(constraints)
      .then(function(stream) {
    	  localStream = stream;
//          recordURL = URL.createObjectURL(localStream);
          format = constraints.video ? 'webm' : 'ogg';
          mimetype = constraints.video ? 'video/webm' : 'audio/ogg';
//          var options = {mimeType: mimetype};
//          recorder = new MediaRecorder(localStream, options);
          recorder = new MediaRecorder(localStream);
          recorder.onerror = function(event) {
        	    let error = event.error;
        	    console.log(error);
          };
          // Send blob chunk to server when ondataavailable is triggered.
          recorder.ondataavailable = function (e) {
	  			//Save audio blob to the blobs queue
	  			blobs = [];
	  			var blob = new Blob([e.data], {type: mimetype});
	  			blobs.push(blob);
	  			
	  			sendBlob(blob);
          };
          
          audioContext = new AudioContext();
          analyser = audioContext.createAnalyser();
          analyser.smoothingTimeConstant = 0.75;
          analyser.fftSize = 512;
          microphone = audioContext.createMediaStreamSource(stream);

          $previewWrapper.show();
          $meter.show();
          $startButton.hide();
          $videoButton.hide();
          $audioButton.hide();
          $recordButton.show();
          $stopButton.hide();
          recordingPreview();

          setStatus('Press record to start recording.');
          if(callback != null){
        	  callback();
          }
      })
      .catch(function(err) {
//    	  	stopStream();
//        alert("There was a problem accessing your camera or mic. Please click 'Allow' at the top of the page.");
    	  console.log(err);
    	  setStatus(err.message);
      });
    }

    /**
     * Enable mic or camera.
     */
    function start() {
      if (settings.constraints.audio && !settings.constraints.video) {
        constraints = {
          audio: true,
          video: false
        };
        startStream();
      }
      else if (!settings.constraints.audio && settings.constraints.video) {
        startStream();
      }
      else {
        $startButton.hide();
//        $videoButton.show();
//        $audioButton.show();
        constraints = {
            audio: true,
            video: true
          };
        startStream();
//        setStatus('Record with audio or video?');
      }
    }

    /**
     * Stop recording and trigger stopped event.
     */
    function stop() {
      recorder.stop();
      $element.trigger('recordStop');
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
      
      stopStream();
    }
    
    function sendBlob(blob){
    	//send audioBlob to server
        var formData = new FormData();
        formData.append("mediaBlob", blob, "blob");
      	formData.append("fileName",'mediaBlob.webm');
        formData.append("mimeType",mimetype);
        if (navigator.userAgent.indexOf("Firefox")  > -1){
        	formData.append("isFirefox",true);
        }else{
        	formData.append("isFirefox",false);
        }
        
        
        var request = new XMLHttpRequest();
        request.open('POST', settings.server_upload_endpoint, true);
        $(".loader").show();
        var height = $(".av-recorder-preview").css("height");
        $video.hide();
        $(".av-recorder-preview").css("height",height);
        request.onload = function (evt) {
            var jsonObj = JSON.parse(request.response);
            $element.trigger('refreshData', jsonObj.data.mediaBlob);
            $element.trigger('uploadFinished', jsonObj.data);
            $(".loader").hide();
            $(".av-recorder-preview").css("height", "auto");
//            $video.show();
            
        };
        request.onerror = function (evt) {
        	console.log(Error("Error fetching data."));
        };
        request.send(formData);
    }

    /**
     * Start recording and trigger recording event.
     */
    function record() {
		if (constraints.video) {
			createVolumeMeter();
	    }
	    else {
	    	createAudioVisualizer();
	    }
		if(localStream.active == false){
			startStream(function(){
				$recordButton.hide();
		        $stopButton.show();
				record();
			});
		}else{
			recorder.start();
			$element.trigger('recordStart');
		}
    }

    /**
     * Initialize all control buttons.
     */
    function initializeButtons() {

      // Click handler for enable audio button.
      $startButton.bind('click', function (event) {
        event.preventDefault();
        start();
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

      // Click handler for to change to video.
      $videoButton.bind('click', function (event) {
        event.preventDefault();
        setStatus('Allow access at top of page.');
        startStream();
      });

      // Click handler for to change to audio.
      $audioButton.bind('click', function (event) {
        event.preventDefault();
        constraints = {
          audio: true,
          video: false
        };
        setStatus('Allow access at top of page.');
        startStream();
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
        clearInterval(statusInterval);
        $progressWrapper.hide();
        setStatus('Please wait while the recording finishes uploading...');
      });

      // Append file object data.
      $element.bind('refreshData', function (event, data) {
        recording = false;
        $inputFid.val(data.fid);
        $recordButton[0].disabled = false;
//        playbackPreview();
        setStatus('Press record to start recording.');
      });
      $element.bind('uploadFinished', function (event, data) {
//          $inputFid.val(data.fid);
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
