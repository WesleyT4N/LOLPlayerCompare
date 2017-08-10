<?php
  header('Content-Type: application/json');
  $API_KEY = 'RGAPI-95c1ead7-4c6c-4a57-b559-42e5d44e61c5';
  $url = $_POST['url'];
  $url = $url.$API_KEY;

  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $json = curl_exec($ch);
  $statuscode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  echo $json;
?>
