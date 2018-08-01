<?php

// error_log(print_r($_POST,true));
// error_log(print_r($_FILES,true));

header('Content-Type: application/json');

$fileName = null;
$content = null;

$mime_type = $_POST['mimeType'];
$ext = ".webm";
if($mime_type == "audio/mpeg"){
	$ext = ".mp3";
}

$uploadDir = getcwd() . "/uploads/";
$newFileName = date('Ymd-His') . "_" . rand(100,999) . $ext;
$url = "/jquery-av-recorder/examples/uploads/" . $newFileName;

if (isset($_FILES['mediaBlob'])){
	$fileName = $_POST['fileName'];
	//get the file contents
	$content = file_get_contents($_FILES['mediaBlob']['tmp_name']);
}else{
	echo json_encode(["returnCode"=>1,"returnCodeDescription"=>"No media found.","data"=>[]]);
}

// write the contents to the target dir
$fh = fopen($uploadDir . '/' . $newFileName, 'w') or die("can't open file");
fwrite($fh, $content);
fclose($fh);

echo json_encode(['data'=>['mediaBlob'=>base64_encode($content),'fileUrl'=>$url], 'returnCode'=>0,'returnCodeDescription'=>"Success!"]);

return;