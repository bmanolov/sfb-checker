<?php
require_once dirname(__FILE__) . '/custom.inc.php';

echo getCustomPageContents(getRequestFileContents());

// sfb-check/custom?f=FILE
// sfb-check/custom.put?f=FILE&c=CONTENTS
