<?php

header('Access-Control-Allow-Origin: *');

$filecount = 0;
$directory = "./";
if (glob($directory . "*.txt") != false)
{
	$filecount = count(glob($directory . "*.txt"));
}

$id = 0;
if (isset($_REQUEST["id"]) && $_REQUEST["id"] >= 0) {
	$id = $_REQUEST["id"];
} 
else {
	$id = $filecount;	
}

echo $id;

$filename = "lognew_".$id.".txt";

$log = $_REQUEST["log"];

if ($log) 
{
	$fh = fopen($filename, 'w') or die ("can't open file");
	fwrite($fh, $log);
	fclose($fh);
}

?>