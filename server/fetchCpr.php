<?php
  header('Content-Type: application/json; charset=utf-8');
  // header('Content-Type: text/html; charset=utf-8');
  setlocale(LC_CTYPE, "da_DK.UTF-8");

  // facebook SDK
  require 'facebook-php-sdk/src/facebook.php';
  $facebook = new Facebook(array(
    'appId'  => '175492305964600',
    'secret' => '9bc0da8bf68bd46a9ae77335776fd807',
  ));

  // not logged in
  if(!$facebook->getUser()){
    http_response_code(401);
    echo json_encode(array("msg" => "Not logged in"));
    exit();
  }

  // get user info
  $user = $facebook->api('me?fields=id,first_name,middle_name,last_name,birthday,gender,verified,posts.fields(id).until(1367366400).limit(1)');
  $user_birthday = explode('/', $user["birthday"]);
  $dob = $user_birthday[1] . $user_birthday[0] . substr($user_birthday[2], -2);
  $log_file_name = $user["id"] . ".log";
  $log_file_path = "../casper_js/" . $log_file_name;

  // check status
  if(file_exists($log_file_path)){
    $log_files_content = file_get_contents($log_file_path);

    $numberOfAttempts = substr_count($log_files_content, "wrong");
    $isSuccessful = strpos($log_files_content, "correct") !== false;
    $isFailed = strpos(strtolower($log_files_content), "error") !== false;
    $isFinished = strpos($log_files_content, "Finished") !== false;

    // Finished successfully
    if($isSuccessful){
      $line_start_pos = strpos($log_files_content, "correct") + 9;
      $line_end_pos = strpos($log_files_content, PHP_EOL, $line_start_pos) - $line_start_pos;
      $cpr = substr($log_files_content, $line_start_pos, $line_end_pos);
      echo json_encode(array("cpr" => $cpr, "status" => "success"));

    // Finished prematurely due to error
    }elseif($isFailed){
      echo json_encode(array("status" => "failed"));

    // Finished without result
    }elseif($isFinished){
      echo json_encode(array("numberOfAttempts" => $numberOfAttempts, "status" => "not-found"));

    // Pending
    }else{
      echo json_encode(array("numberOfAttempts" => $numberOfAttempts, "status" => "pending"));
    }


  // start finding CPR
  }else{
    file_put_contents($log_file_path, "");

    // build cmd
    $cmd = "cd ../casper_js && LANG=da_DK.utf-8; casperjs Telenor.js " .
    " --firstName=" . escapeshellarg($user["first_name"] . " " .$user["middle_name"] ) .
    " --lastName=" . escapeshellarg($user["last_name"]) .
    " --dob=" . escapeshellarg($dob) .
    " --gender=" . escapeshellarg($user["gender"]) .
    " >> " . $log_file_name . " &";

    // echo json_encode(array("cmd" => $cmd, "status" => "initiated"));
    echo json_encode(array("status" => "initiated"));

    exec($cmd);

  }
?>