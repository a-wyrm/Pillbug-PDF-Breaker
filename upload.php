<?php
if (isset($_POST['submit'])) {
    $file = $_FILES['file'];

    // file properties
    $fileName = $_FILES['file']['name'];
    $fileTmpName = $_FILES['file']['tmp_name'];
    $fileSize = $_FILES['file']['size'];
    $fileError = $_FILES['file']['error'];
    $fileName = $_FILES['file']['name'];
    $fileType = $_FILES['file']['type'];

    $fileExt = explode('.', $fileName);
    $fileActualExt = strtolower(end($fileExt));

    $allowed = array('pdf');

    if (in_array($fileActualExt, $allowed)){
        if ($fileError == 0){
            $fileNameNew = uniqid('', true).".".$fileActualExt;
            $fileDestination = '/pdfs/'.$fileNameNew;
            move_uploaded_file($fileTmpName, $fileDestination);
            header("Location: index.php?uploadsuccess");
        }
        else{
            echo "There was an error. Please try again.";
        }
    }
    else{
        echo "Not a PDF, please upload a PDF!";
    }


}