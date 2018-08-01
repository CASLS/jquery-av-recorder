jQuery AV Recorder
========================
This project contains a jQuery plugin that that renders an audio and/or video recorder using HTML5 standards.  It uses the WebRTC MediaDevices.getUserMedia() standard as well as [Recorder.js](https://github.com/mattdiamond/Recorderjs) to record audio and video directly through the web browser (without the need for Flash).  This project also uses [Twitter Bootstrap 3.3+](https://getbootstrap.com/docs/3.3/getting-started/) for the UI components.

## Browser Support
| Browser | Version | Audio | Video |
| --- | --- | --- | --- |
| Safari | 11+ | Yes | No |
| Chrome | 53+ | Yes | Yes |
| Firefox | 36+ | Yes | Yes |
| Edge | 12+ | Yes | No |

For additional details on browser capabilities: 
* [MDN getUserMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#Browser_compatibility)
* [caniuse.com getUserMedia()](https://caniuse.com/#search=getUserMedia)
* [MDN MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/MediaRecorder#Browser_compatibility)
* [caniuse.com MediaRecorder API](https://caniuse.com/#search=MediaRecorder)

## Usage

You MUST include the needed dependencies in the `<head>` section. See [examples/demo.php](examples/demo.php) for examples.

```Html
<!-- Don't forget the dependencies. -->
<div id="avRecorder" class=""></div>

<script type="text/javascript">
	$(document).ready(function(){
		$("#avRecorder").AvRecorder('avRecorder',{
			constraints: {
				audio: true,
				video: true,
				video_resolution: "320"
			},
			file: null,
			time_limit: "1800",
			server_upload_endpoint: "/jquery-av-recorder/examples/demoRecordFile.php" //Will be appended to the window.orign that the request is coming from.
		});
	});
</script>

```

## Config Options
```Javascript
{
	constraints: {
		audio: true,
		video: true,
		video_resolution: "320"
	},
	file: null,
	time_limit: "1800",
	server_upload_endpoint: "/media/record-file" //Will be appended to the window.orign that the request is coming from.
}
```

| config | required | type | example | description |
| --- | --- | --- | --- | --- |
| `constraints` | yes | array | <pre>{<br/>audio: true,<br/>video: true,<br/>video_resolution: "320"<br/>}</pre> | An array containing the settings to pass into getUserMedia() as constraints. | 
| `file` | no | string | '/downloads/example.mp3' | A string of the path to an existing file. | 
| `time_limit` | yes | string | '1800' | A string representing the max amount of time for a recording in seconds. |  
| `server_upload_endpoint` | yes | string | '/media/record-file' | A string of the server endpoint that will be appended to the request's origin. | 

## Dependencies
* [jQuery](https://jquery.com)
* [Recorder.js](https://github.com/mattdiamond/Recorderjs)
* [Twitter Bootstrap](https://getbootstrap.com/docs/3.3/getting-started/)


## Credit
[Drupal Media Recorder Plugin](https://www.drupal.org/project/media_recorder) developed by the [Yamada Language Center](https://www.drupal.org/yamada-language-center)