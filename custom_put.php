<?php
require_once dirname(__FILE__) . '/custom.inc.php';

$file = getRequestFileName();
putUserFileContents($file, @$_POST['c']);
echo $file;
