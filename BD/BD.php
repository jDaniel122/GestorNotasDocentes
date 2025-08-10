<?php
$link = mysqli_connect("localhost", "root", "", "examen25");
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}
mysqli_select_db($link, "examen25");
?>