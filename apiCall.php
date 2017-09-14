<?php
  header('Content-Type: application/json');
  $API_KEY = 'RGAPI-d51c2b90-57fb-4bc5-b1eb-a59f2a112679';
  $url = $_POST['url'];
  $url = $url.$API_KEY;

  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $json = curl_exec($ch);
  $statuscode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  echo $json;
?>
