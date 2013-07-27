<?php
	putenv("PHANTOMJS_EXECUTABLE=/usr/local/bin/phantomjs");
  header('Content-Type: application/json; charset=utf-8');
  //header('Content-Type: text/html; charset=utf-8');
  setlocale(LC_CTYPE, "da_DK.utf8");

  // facebook SDK
  require 'facebook-php-sdk/src/facebook.php';
  $facebook = new Facebook(array(
    'appId'  => '175492305964600',
    'secret' => '9bc0da8bf68bd46a9ae77335776fd807',
  ));

  // not logged in
  if(!$facebook->getUser()){
    //http_response_code(401);
    header("HTTP/1.0 401 Unauthorized");
    echo json_encode(array("msg" => "Could not get Facebook user - logged in?"));
    exit();
  }

  // get user info
  $user = $facebook->api('me?fields=id,first_name,middle_name,last_name,birthday,gender,verified,posts.fields(id).until(1367366400).limit(1)');

  // user not verified
  if(!$user["verified"]){
    //http_response_code(401);
    header("HTTP/1.0 401 Unauthorized");
    echo json_encode(array("msg" => "Facebook user not verified."));
    exit();
  }

  // set log file
  $log_file_name = $user["id"] . ".log";
  $log_file_path = "../casper_js/" . $log_file_name;

  // check pending status
  if(file_exists($log_file_path)){
    $log_file_content = file_get_contents($log_file_path);
    $log_file_lines = array_filter(explode("\n", $log_file_content));
    $number_of_lines = count($log_file_lines);

    if($number_of_lines > 1){
      $last_line = $log_file_lines[$number_of_lines - 1];
    }elseif($number_of_lines === 1){
      $last_line = $log_file_lines[$number_of_lines];
    }else{
      $last_line = "";
    }

    $numberOfAttempts = substr_count($log_file_content, "wrong");
    $isSuccessful = strpos($log_file_content, "correct") !== false;
    $isFailed = strpos($last_line, "Error at index:") !== false;
    $isFinished = strpos($log_file_content, "Finished") !== false;

    // Finished successfully
    if($isSuccessful){
      preg_match('/correct: ([\d-]+)/', $log_file_content, $matches);
      $cpr = $matches[1];
      echo json_encode(array("cpr" => $cpr, "status" => "success"));

    // Finished prematurely due to error
    }elseif($isFailed){
      preg_match('/^Error at index: (\d+)/', $last_line, $matches);
      $start_from = $matches[1];
      $cmd = get_shell_command($user, $log_file_name, $start_from);
      echo json_encode(array("numberOfAttempts" => $start_from, "status" => "restarting"));
      exec($cmd);

    // Finished without result
    }elseif($isFinished){
      echo json_encode(array("numberOfAttempts" => $numberOfAttempts, "status" => "not-found"));

    // Pending
    }else{
      echo json_encode(array("numberOfAttempts" => $numberOfAttempts, "status" => "pending"));
    }

  // start finding CPR
  }else{
    // create file
    file_put_contents($log_file_path, "");

    // execute command
    $cmd = get_shell_command($user, $log_file_name);
    echo json_encode(array("status" => "initiated"));
    // echo $cmd;
    exec($cmd);
  }

function get_shell_command($user, $log_file_name, $start_from = 0){
  // get middle name
  $middle_name = isset($_GET["middle_name"]) && $_GET["middle_name"] !== "" ? " ". trim($_GET["middle_name"]) : "";

  // get birthday
  $user_birthday = explode('/', $user["birthday"]);
  $dob = $user_birthday[1] . $user_birthday[0] . substr($user_birthday[2], -2);

  // build command
  $cmd = "cd ../casper_js && LANG=da_DK.utf-8; casperjs OK.js " .
  " --firstName=" . escapeshellarg(urlencode($user["first_name"] . $middle_name)) .
  " --lastName=" . escapeshellarg(urlencode($user["last_name"])) .
  " --dob=" . escapeshellarg($dob) .
  " --gender=" . escapeshellarg($user["gender"]) .
  " --startFrom=" . escapeshellarg($start_from) .
  " >> " . $log_file_name . " &";

  return $cmd;
}
?>
