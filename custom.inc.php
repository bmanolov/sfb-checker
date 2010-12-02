<?php
function getCustomPageContents($contents)
{
	return preg_replace(
		'!(<textarea id="input"[^>]*>).*(<\/textarea>)!U',
		'$1' . htmlspecialchars($contents) . '$2',
		getBasePageContents());
}


function getBasePageContents()
{
	return file_get_contents(dirname(__FILE__) . '/index.html');
}


function getRequestFileName()
{
	if ( empty($_REQUEST['f']) ) {
		return false;
	}

	$f = ltrim(preg_replace('![/\\\\:]!', '', $_REQUEST['f']), '.');
	$f = strtr($f, array(
		' ' => '_',
	));

	return $f;
}

function getRequestFileContents()
{
	$file = getUserFileName(getRequestFileName());
	if ( file_exists($file) && is_readable($file) ) {
		return file_get_contents($file);
	}

	return false;
}

function getUserFileName($file)
{
	if ( empty($file) ) {
		return false;
	}

	return dirname(__FILE__) . '/user_files/'. $file;
}

function putUserFileContents($file, $contents)
{
	$file = getUserFileName($file);
	if ($file) {
		file_put_contents($file, $contents);
	}
}

function deleteUserFile($file)
{
	return unlink(getUserFileName($file));
}
