<html>
	<head>
		<title>php test page</title>
	</head>
	<body>
<?php

$dirRoot = "..";

if ($handle = opendir($dirRoot)) {
    $blacklist = array('.', '..'); // TODO: patterns, not just filenames
    while (false !== ($file = readdir($handle))) {
        if (!in_array($file, $blacklist)) {
            $url = urlencode($file);
            echo "<a href='?$url'>$file</a><br/>\n";
        }
    }
    closedir($handle);
}
?>
	</body>
</html>
