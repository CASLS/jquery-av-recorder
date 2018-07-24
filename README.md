Initial README file.

## Config
```JSON
{
	constraints: {
		audio: true,
		video: true,
		video_resolution: "320"
	},
	file: null,
	time_limit: "1800",
	chunk_audio_blob: false, //ONLY Available for Firefox MediaRecorderAPI
	server_upload_endpoint: "/media/record-file" //Will be appended to the window.orign that the request is coming from.
}
```

| config | required | type | example | description |
| --- | --- | --- | --- | --- |
| `constraints` | yes | array |  | An array containing the settings to pass into getUserMedia() as constraints. | 
| `file` | no | string | '/downloads/example.mp3' | A string of the path to an existing file. | 
| `time_limit` | yes | string | '1800' | A string representing the max amount of time for a recording in seconds. |  
| `chunk_audio_blob` | no | boolean | false | A boolean for whether or not to use Firefox blob chunking or not. This is a FIREFOX ONLY feature. |
| `server_upload_endpoint` | yes | string | '/media/record-file' | A string of the server endpoint that will be appended to the request's origin. | 

## Dependencies
* [jQuery](https://jquery.com)
* [RecorderJS](https://github.com/mattdiamond/Recorderjs)
* [Twitter Bootstrap](https://getbootstrap.com/docs/3.3/getting-started/)


## Credit
[Drupal Media Recorder Plugin](https://www.drupal.org/project/media_recorder) developed by the [Yamada Language Center](https://www.drupal.org/yamada-language-center)