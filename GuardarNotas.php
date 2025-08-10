<?php
include("BD/BD.php");

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo "No se recibieron datos válidos.";
    exit;
}

foreach ($data as $registro) {
    $codigo = mysqli_real_escape_string($link, $registro["codigo"]);
    $curso = mysqli_real_escape_string($link, $registro["curso"]);
    $notas = $registro["notas"];
    $fecha = mysqli_real_escape_string($link, $registro["fecha"]);

    // Rellenamos con ceros si faltan notas
    $notasCompletas = array_pad($notas, 7, 0);

    $sql = "REPLACE INTO notasa25 
        (codigo, curso, nota1, nota2, nota3, nota4, nota5, nota6, nota7, fecha_ingreso) 
        VALUES (
            '$codigo', '$curso',
            {$notasCompletas[0]}, {$notasCompletas[1]}, {$notasCompletas[2]},
            {$notasCompletas[3]}, {$notasCompletas[4]}, {$notasCompletas[5]},
            {$notasCompletas[6]}, '$fecha'
        )";

    if (!mysqli_query($link, $sql)) {
        echo "Error al guardar estudiante $codigo: " . mysqli_error($link);
    }
}

echo "Notas guardadas exitosamente";
?>