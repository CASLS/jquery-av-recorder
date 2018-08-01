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
		<div id="avRecorder" class=""></div>
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

			var browserUserAgent = navigator.userAgent;
			if(browserUserAgent.includes("Safari") == true && browserUserAgent.includes("Chrome") == false){
				$("#audioVideoControl option")[1].remove();
			}else if(browserUserAgent.includes("Edge") == true || browserUserAgent.includes("MSIE ") == true || browserUserAgent.includes("Trident") == true){
				$("#audioVideoControl option")[1].remove();
			}
			
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
	        	server_upload_endpoint: "/jquery-av-recorder/examples/demoRecordFile.php" //Will be appended to the window.orign that the request is coming from.
	        });
		};
		
	</script>
</body>

</html>