<?php

  $firstName = "Tammes Alexander Thomsen";
  $lastName = "Bernstein";
  $dob = "221189";
  $gender = "male";

  // build cmd
  $cmd = "cd ../casper_js && LANG=da_DK.utf-8; casperjs Telenor.js " .
  " --firstName=" . escapeshellarg(urlencode($firstName)) .
  " --lastName=" . escapeshellarg(urlencode($lastName)) .
  " --dob=" . escapeshellarg($dob) .
  " --gender=" . escapeshellarg($gender) .
  " >> manual-run.log &";

  echo $cmd;

  exec($cmd);

?>