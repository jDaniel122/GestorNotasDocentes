<?php
	include "BD/BD.php"; //Se realiza conexion a bd
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Examen de Prueba</title>
		<link rel="stylesheet" href="Css/Style.css?v=<?= time(); ?>">
		<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
		<script src="https://code.jquery.com/jquery-1.12.4.js"></script>
		<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
		<?php
		$Frases=array('Esperamos que pueda suceder cualquier cosa, y nunca estamos prevenidos para nada. Sophie Soynonov',
		'El pasado es como una lámpara colocada a la entrada del porvenir. Félicité Robert de Lamennais',
		'Valor es lo que se necesita para levantarse y hablar, pero también es lo que se requiere para sentarse y escuchar.',
		'Si no sueltas el pasado, ¿con qué mano agarras el futuro?');
		//Variables de configuracion
		$curso="210A";
		$codcol="00026011";
		$alucur="alucura25";
		$archnotas='notasa25';
		//Consulta para mostrar todas las columnas de la tabla 'notasa25', pero solamente del curso "210A"
		$consulta = "SELECT * FROM $archnotas WHERE curso='$curso'";
		$result = mysqli_query($link, $consulta) or die ("* ERROR EN $archnotas *". mysqli_error($link));
		$Alumnos=array();
		$Notas = array();
		//Ciclo de datos(notas) por cada alumno
		while ($registro = mysqli_fetch_array($result)) {
			$codal = $registro['codigo'];
			$suma = 0;
			$cantidad = 0;
			//Este ciclo nos sirve para contar cuantas columnas(nota3 a nota7) de la tabla 'notasa25' son mayores a 0 o por lo menos tienen un dato
			for ($i = 1; $i <= 7; $i++) {
				$notaKey = "nota$i";
				$valor = isset($registro[$notaKey]) ? floatval($registro[$notaKey]) : 0;
				$Notas[$codal][$i] = $valor;
				if ($valor > 0) {
					$suma += $valor;
					$cantidad++;
				};
			};
			//Calculamos el promedio si hay almenos una nota valida
			$promedio = ($cantidad > 0) ? round($suma / $cantidad, 1) : 0;
			$Notas[$codal][0] = $promedio; // índice 0 = promedio
		};

		// Detectar cuantas notas mostrar (hasta nota7 como máximo)
		$cantidadNotas = 2; // Mínimo 2 notas(Debido al codigo dado)
		foreach ($Notas as $codalu => $notas) {
			for ($i = 3; $i <= 7; $i++) {
				if (isset($notas[$i]) && $notas[$i] > 0) {
					$cantidadNotas = max($cantidadNotas, $i);
				};
			};
		};
		//Consulta para traer nombres completos de los estudiatnes
		$consulta = "SELECT C.codigo,A.apellidos,A.nombres FROM $alucur C,alumnos A ";
		$consulta.= " WHERE C.curso='$curso' AND C.codigo=A.codigo ORDER BY A.apellidos ASC ";
		$result = mysqli_query($link, $consulta) or die ("* ERROR EN ALUMNOS *". mysqli_error($link));
		
		while ($registro = mysqli_fetch_array($result)) {
			$codal=$registro['codigo'];
			//Guardar nombre completo codificado en UTF-8
			$Alumnos[$codal]=utf8_encode($registro['apellidos'].' '.$registro['nombres']);
		};
		$n = rand(0,3); // Frase aletaoria del arreglo $Frases
		$CodsAlum=array_keys($Alumnos); // Guarda el codigo del alumno
		mysqli_close($link);
		?>
	</head>

	<body>
		<center>
		<div id="principal">
		<br />
		<h1>COLEGIO DE PRUEBA SYSCOLEGIOS </h1>
		<marquee>
		<?php echo $Frases[$n].date('Y-m-d'); ?>
		</marquee>
		<h2>PLANILLA DE INGRESO DE CALIFICACIONES</h2>
		<p>Fecha de Ingreso: 
		<input type="text" id="fecha" readonly="readonly" size="8" class="fecha" /></p>
		<hr />
		<div class="contenedor-boton">
			<p>Agregar columna de notas</p>
  			<img src="Img/SignoMas.jpg" id="masCol" width="50" height="50" title="Adicionar Columna" />
		</div>
		<form id="Form1">
		<div id="contenedor"></div>
		</form>
		<div id="mensaje" title="Mensaje syscolegios"></div>
		<hr />
		<input type="button" id="grabar" value="Grabar">
		<input type="button" id="regresar" value="Regresar" onclick="window.history.go(-1);">
		<hr />
		</div>
		</center>
	</body>
	<!-- Variables a pasar a Js -->
	<script>Alumnos=<?PHP echo json_encode($Alumnos);?></script> <!-- Lista de alumnos -->
	<script>CodsAlum=<?PHP echo json_encode($CodsAlum);?></script> <!-- Guarda el codigo del alumno -->
	<?php
		foreach ($Alumnos as $codal => $nombre) {
  			if (!isset($Notas[$codal])) {
				// Agregamos el valor 0 para las columnas que esten en NULL
    			$Notas[$codal] = array_fill(0, 8, 0); // indice inicial, cantidad a crear, valor asignado	
  			};
		}
	?>
	<script>Notas=<?PHP echo json_encode($Notas);?></script> <!-- Promedio y notas-->
	<script>let cantidadNotas = <?= $cantidadNotas ?>;</script> <!-- Cantidad visible de notas -->
	<script src="Js/Script.js"></script>
</html>