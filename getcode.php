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

if ($size && $size > 30000) {
	echo md5("cogmapbatch1");
}
else {
	die("");
}

?>