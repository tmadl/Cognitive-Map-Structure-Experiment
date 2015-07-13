<?php

header('Access-Control-Allow-Origin: *');

$id = 0;
if (isset($_REQUEST["id"]) && $_REQUEST["id"] >= 0) {
	$id = $_REQUEST["id"];
}
else {
	die("");
}

$filename = "log_".$id.".txt";
$size = filesize($filename);

if ($size && $size > 8000) {
	echo substr(md5("Cogmapbatch_recall"), 0, 10); //survey code, for Amazon Mechanical Turk
}
else {
	die("");
}

?>