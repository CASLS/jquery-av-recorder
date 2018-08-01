<?php 
	$recorderType = $_GET["recorderType"];
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Demo of jQuery AV Recorder</title>
</head>

<!-- jQuery 3.3.1 -->
<script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>

<!-- Twitter Bootstrap v3.3.7 -->
<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
<!-- Optional theme -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
<!-- Latest compiled and minified JavaScript -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>

<!-- AV Recorder CSS -->
<link href="../AVRecorder/av-recorder.css" rel="stylesheet">
<!-- Progress Loader CSS -->
<link href="../AVRecorder/loader.css" rel="stylesheet">

<!-- RecorderJS library Jul 20, 2016 release -->
<script src="../recorderJs/recorder.js"></script>

<!-- jQuery AV Recorder JS -->
<!-- <script src="./AVRecorder/media-recorder-flash.js"></script>  DROPPING FLASH SUPPORT -->
<script src="../AVRecorder/av-recorder-api.js"></script>
<script src="../AVRecorder/av-recorder-html5.js"></script>
<script src="../AVRecorder/av-recorder.js"></script>
	
<body>
	<div class="col-xs-12 col-md-6 col-md-offset-3">
		<br/><br/>
		<select id="audioVideoControl" class="form-control">
			<option value="1">Audio Only</option>
			<option value="2" <?= ($recorderType == "video") ? "selected" : ""; ?>>Audio & Video</option>
		</select>
		<br/>
		<div id="avRecorder-fallback-ajax-wrapper"></div>
		<div id="avRecorder" class="">
			<div class="av-recorder panel panel-primary">
				<div class="panel-heading">
					<h3 class="av-recorder-status panel-title">Click 'Start' to
						enable your mic.</h3>
				</div>
				<div class="av-recorder-preview panel-body" style="display: none;">
					<div class="loader" style="display: none;"></div>
					<canvas class="av-recorder-meter" style="display: none;"></canvas>
					<video class="av-recorder-video" style="display: none;"></video>
					<audio class="av-recorder-audio" controls="" style="display: none;"></audio>
				</div>
				<div class="av-recorder-progress progress" style="display: none;">
					<div class="progress-bar" role="progressbar"></div>
				</div>
				<div class="panel-footer">
					<div class="av-recorder-controls">
						<button
							class="btn btn-primary btn-lg btn-block av-recorder-enable"
							title="Click to enable your mic.">Start</button>
						<button
							class="btn btn-danger btn-lg btn-block av-recorder-record"
							title="Click to start recording." style="display: none;">
							<span class="glyphicon glyphicon-record"></span> Record
						</button>

						<button
							class="btn btn-success btn-lg btn-block av-recorder-play"
							title="Click to play recording." style="display: none;">
							<span class="glyphicon glyphicon-play"></span> Play
						</button>
						<button
							class="btn btn-warning btn-lg btn-block av-recorder-stop"
							title="Click to stop recording." style="display: none;">
							<span class="glyphicon glyphicon-stop"></span> Stop
						</button>
						<button
							class="btn btn-primary btn-lg btn-block av-recorder-settings"
							title="Click to access settings.">
							<span class="glyphicon glyphicon-cog"></span> Settings
						</button>
						<button
							class="btn btn-primary btn-lg btn-block av-recorder-enable-audio"
							title="Click to enable your mic." style="display: none;">
							<span class="glyphicon glyphicon-headphones"></span> Audio
						</button>
						<button
							class="btn btn-success btn-lg btn-block av-recorder-enable-video"
							title="Click to enable your camera." style="display: none;">
							<span class="glyphicon glyphicon-facetime-video"></span> Video
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<script type="text/javascript">
		<?php if($recorderType == "video"){ ?>
		var audio = true;
		var video = true;
		<?php }else{ ?>
		var audio = true;
		var video = false;
		<?php } ?>
		$(document).ready(function(){
			createRecorder();
			
			$("#audioVideoControl").change(function(){
				if($(this).val() == 1){
					audio = true;
					video = false;
					window.location = "/jquery-av-recorder/examples/demo.php?recorderType=audio";
				}else if($(this).val() == 2){
					audio = true;
					video = true;
					window.location = "/jquery-av-recorder/examples/demo.php?recorderType=video";
				}
			});
			
			$("#avRecorder").bind('uploadFinished', function (event, data) {
				console.log("uploadFinished");
				console.log(data);
			});
		});
	
		function createRecorder(){
			$("#avRecorder").AvRecorder('avRecorder',{
	        	constraints: {
	        		audio: audio,
	            	video: video,
	            	video_resolution: "320"
	        	},
	        	file: null,
	        	time_limit: "1800",
	        	chunk_audio_blob: false, //ONLY Available for Firefox MediaRecorderAPI
	        	server_upload_endpoint: "/jquery-av-recorder/examples/demoRecordFile.php" //Will be appended to the window.orign that the request is coming from.
	        });
		};
		
	</script>
</body>

</html>