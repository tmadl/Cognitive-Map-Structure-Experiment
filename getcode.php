<?php

header('Access-Control-Allow-Origin: *');

$id = 0;
if (isset($_REQUEST["id"]) && $_REQUEST["id"] >= 0) {
	$id = $_REQUEST["id"];
}
else {
	die("");
}

$filename = "lognew_".$id.".txt";
$size = filesize($filename);

if ($size && $size > 6000) {
	echo substr(md5("cogmapbatch1"), 0, 10);
}
else {
	die("");
}

?>