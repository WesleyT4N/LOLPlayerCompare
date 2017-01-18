<?php
  header('Content-Type: application/json');
  $API_KEY = 'RGAPI-217a0491-95a0-4107-9d45-93ac21a49b94';
  $url = $_POST['url'];
  $url = $url.$API_KEY;

  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  $json = curl_exec($ch);
  $statuscode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  echo $json;
?>
