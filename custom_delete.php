<?php
require_once dirname(__FILE__) . '/custom.inc.php';

echo (int) deleteUserFile(getRequestFileName());
