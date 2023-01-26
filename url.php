<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
$method = $_SERVER['REQUEST_METHOD'];
$valid_methods = ["GET", "POST"];
if (!in_array($method, $valid_methods)) {
  header($_SERVER["SERVER_PROTOCOL"]." 405 Method Not Allowed", true, 405);
  exit;
}
$connection = mysqli_connect("localhost", "root", "", "baza");
if ($method == "POST") {
  $statment = $connection->prepare("INSERT INTO links (generated_link, original_link) VALUES (?, ?)");
  $body = file_get_contents('php://input');
  $original_link = json_decode($body, true)["original_link"];
  $generated_link = substr(md5(uniqid(rand(), true)),0,6);
  $statment->bind_param("ss", $generated_link, $original_link);
  $statment->execute();
  $statment->close();
  $raw_array = array('generated_link' => $generated_link ? $generated_link : null);
  echo json_encode($raw_array);
} elseif ($method == "GET") {
  $generated_link = $_GET["url"];
  $statment = $connection->prepare("SELECT original_link FROM links WHERE generated_link = ?;");
  $statment->bind_param("s", $generated_link);
  $statment->execute();
  try {
    $result = $statment->get_result();
    $row = $result->fetch_assoc();
    $statment->close();
    $raw_array = array('original_link' => $row ? $row["original_link"] : null);
    echo json_encode($raw_array);
    exit;
  } catch (Exception $error) {
    header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found", true, 404);
    exit;
  } 
}