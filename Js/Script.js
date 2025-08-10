// Rangos para clasificar desempeño según el promedio
const rango = [0, 2.9, 3.9, 4.5, 5.0];
const escala = ["", "Bajo", "Básico", "Alto", "Superior"];

// FormData para envíos (se puede usar en AJAX si se desea por separado)
const formData = new FormData();
formData.append("curso", "210A"); // Curso fijo

// DOCUMENT READY
$(function () {
  // Inicializa componentes UI
  $("#fecha").datepicker({ dateFormat: "yy-mm-dd" });
  $("input[type=button]").button();
  $("#mensaje").dialog({
    autoOpen: false,
    buttons: {
      Ok: function () {
        $(this).dialog("close");
      },
    },
  });

  // Construye columnas dinámicas de Nota 3 a cantidadNotas
  for (let i = 3; i <= cantidadNotas; i++) {
    const letra = String.fromCharCode(64 + i);
    $("#header_notas").find("th").eq(-2).before(`<th> Nota ${i} </th>`);
    $("#tabla1 tr").each(function (index) {
      if (index === 0) return;
      const codalu = $(this).find("td:first").text().trim();
      const idInput = letra + codalu;
      const valor = Notas[codalu][i] || "";
      const input = `<input type="text" id="${idInput}" value="${valor}" size="3" class="entrada">`;
      $(this).find("td").eq(-2).before(`<td>${input}</td>`);
    });
  }

  // Construcción completa de tabla desde cero
  let html = '<table id="tabla1" border="1" align="center">';
  html += "<tr id='header_notas'><th>CODIGO</th><th>ALUMNO</th>";
  for (let i = 1; i <= cantidadNotas; i++) {
    html += `<th>Nota ${i}</th>`;
  }
  html += "<th>Promedio</th><th>Desempeño</th></tr>";

  $.each(CodsAlum, function (idalu, codalu) {
    let promedio = Notas[codalu][0];
    html += `<tr><td align="center">${codalu}</td><td>${Alumnos[codalu]}</td>`;

    for (let i = 1; i <= cantidadNotas; i++) {
      const letra = String.fromCharCode(64 + i);
      const valor = Notas[codalu][i] || "";
      html += `<td><input type="text" id="${
        letra + codalu
      }" value="${valor}" size="3" class="entrada"></td>`;
    }

    html += `<td align="center"><input type="text" id="X${codalu}" value="${promedio}" size="3" class="salida" readonly></td>`;
    html += `<td><div id="W${codalu}">${Desempeno(promedio)}</div></td></tr>`;
  });

  html += "</table>";
  $("#contenedor").html(html);

  // Reasignar eventos
  $(document).on("change", ".entrada", function () {
    const id = $(this).attr("id");
    const val = parseFloat($(this).val());
    if (isNaN(val) || val < 1.0 || val > 5.0) {
      $(this).val("");
      alert("La nota debe estar entre 1.0 y 5.0");
      return;
    }
    CambiarColor(id, val);
    RecalcularPromedio(id.substr(1));
  });

  $("#masCol").click(AdicionarColumna);
  $("#grabar").click(GrabarNotas);
});

// ==========================
// FUNCIONES
// ==========================

// Cambia color según el valor de la nota
function CambiarColor(id, nota) {
  if (nota >= 1.0 && nota <= 5.0) {
    formData.append(id, nota);
    const color =
      nota <= rango[1]
        ? "red"
        : nota <= rango[2]
        ? "orange"
        : nota <= rango[3]
        ? "green"
        : "blue";
    $("#" + id).css("color", color);
  } else {
    $("#" + id).val("");
  }
}

// Nos da un rango entre "Bajo", "Básico", "Alto", "Superior" segun el promedio
function Desempeno(nota) {
  if (nota === "" || isNaN(nota)) return "";
  nota = parseFloat(nota);
  if (nota <= 2.9) return "Bajo";
  else if (nota <= 3.9) return "Básico";
  else if (nota <= 4.5) return "Alto";
  else if (nota <= 5.0) return "Superior";
  return "";
}

// Agrega una nueva columna de nota a la tabla
function AdicionarColumna() {
  cantidadNotas++;
  const letra = String.fromCharCode(64 + cantidadNotas);

  $("#header_notas")
    .find("th")
    .eq(-2)
    .before(`<th> Nota ${cantidadNotas} </th>`);

  $("#tabla1 tr").each(function (index) {
    if (index === 0) return;
    const codalu = $(this).find("td:first").text().trim();
    const idInput = letra + codalu;
    const input = `<input type="text" id="${idInput}" size="3" class="entrada">`;
    $(this).find("td").eq(-2).before(`<td>${input}</td>`);
  });

  if (cantidadNotas === 7) {
    $("#masCol")
      .off("click")
      .css({ opacity: 0.5, cursor: "not-allowed" })
      .attr("title", "Ya no se pueden agregar más notas");
  }
}

// Guarda las notas en la base de datos vía AJAX
function GrabarNotas() {
  const fecha = $("#fecha").val();
  if (!fecha) return alert("Por favor seleccione una fecha antes de guardar");

  const hora = new Date().toTimeString().slice(0, 8);
  const fechaHora = `${fecha} ${hora}`;
  const datosEnviar = [];
  let notasInvalidas = false;

  $("#tabla1 tr").each(function (index) {
    if (index === 0) return;
    const tds = $(this).find("td");
    const codigo = tds.eq(0).text().trim();

    const registro = { codigo, curso: "210A", fecha: fechaHora, notas: [] };

    for (let i = 1; i <= cantidadNotas; i++) {
      const letra = String.fromCharCode(64 + i);
      const val = parseFloat(
        $("#" + letra + codigo)
          .val()
          .replace(",", ".")
      );
      if (isNaN(val) || val < 1.0 || val > 5.0) {
        alert(`Nota inválida para estudiante ${codigo} en ${letra}`);
        notasInvalidas = true;
        return false;
      }
      registro.notas.push(val);
    }
    datosEnviar.push(registro);
  });

  if (notasInvalidas) return;

  $.ajax({
    url: "GuardarNotas.php",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(datosEnviar),
    success: function (resp) {
      console.log("Respuesta del servidor:", resp);
      alert("Notas guardadas correctamente");
    },
    error: function (xhr, status, error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar las notas");
    },
  });
}

// promedio y desempeño de un estudiante
function RecalcularPromedio(codalu) {
  let suma = 0,
    cantidad = 0;

  for (let i = 1; i <= cantidadNotas; i++) {
    const letra = String.fromCharCode(64 + i);
    const val = parseFloat(
      $("#" + letra + codalu)
        .val()
        .replace(",", ".")
    );
    if (!isNaN(val) && val >= 1.0 && val <= 5.0) {
      suma += val;
      cantidad++;
    }
  }

  const promedio = cantidad ? parseFloat((suma / cantidad).toFixed(1)) : "";
  $("#X" + codalu).val(promedio);
  $("#W" + codalu).html(Desempeno(promedio));
}

// Al cargar la página, asigna color a las notas existentes
$(document).ready(function () {
  $("input.entrada").each(function () {
    const id = $(this).attr("id");
    const nota = parseFloat($(this).val().replace(",", "."));
    if (!isNaN(nota)) CambiarColor(id, nota);
  });
});

// Navegación con teclas (enter, flechas)
$(document).on("keydown", "input.entrada", function (e) {
  const currentInput = $(this);
  const id = currentInput.attr("id");
  const letra = id.charAt(0);
  const codigo = id.slice(1);
  const tr = currentInput.closest("tr");

  let nextInputId;

  switch (e.key) {
    case "ArrowDown":
    case "Enter":
      const nextTr = tr.next("tr");
      if (nextTr.length)
        nextInputId = `#${letra}${nextTr.find("td").first().text().trim()}`;
      break;
    case "ArrowUp":
      const prevTr = tr.prev("tr");
      if (prevTr.length && prevTr.index() > 0)
        nextInputId = `#${letra}${prevTr.find("td").first().text().trim()}`;
      break;
    case "ArrowRight":
      nextInputId = `#${String.fromCharCode(letra.charCodeAt(0) + 1)}${codigo}`;
      break;
    case "ArrowLeft":
      nextInputId = `#${String.fromCharCode(letra.charCodeAt(0) - 1)}${codigo}`;
      break;
  }

  if (nextInputId && $(nextInputId).length) {
    e.preventDefault();
    $(nextInputId).focus().select();
  }
});