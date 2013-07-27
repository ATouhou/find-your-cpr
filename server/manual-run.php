<?php
  putenv("PHANTOMJS_EXECUTABLE=/usr/local/bin/phantomjs");
  $firstName = "Tomas Alan";
  $lastName = "Lieberkind";
  $dob = "220389";
  $gender = "male";

  // build cmd
  $cmd = "cd ../casper_js && LANG=da_DK.utf-8; casperjs OK.js " .
  " --firstName=" . escapeshellarg(urlencode($firstName)) .
  " --lastName=" . escapeshellarg(urlencode($lastName)) .
  " --dob=" . escapeshellarg($dob) .
  " --gender=" . escapeshellarg($gender);


  // output to screen
  if(isset($_GET["passthru"])){
    passthru($cmd);

  // run as background job and output to file
  }else{
    echo $cmd;
    $cmd .= " >> manual-run.log &";
    exec($cmd);
  }

?>