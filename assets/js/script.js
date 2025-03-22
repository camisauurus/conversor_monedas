const montoInput = document.getElementById("amount");
const selectorMoneda = document.getElementById("selector-moneda");
const botonConvertir = document.getElementById("convertir");
const resultadoTexto = document.getElementById("resultado");
const graficoCanvas = document.getElementById("chart");
let instanciaGrafico = null;

async function cargarMonedas() {
    try {
        const respuesta = await fetch("https://mindicador.cl/api");
        const datos = await respuesta.json();
        const monedas = ["dolar", "euro", "uf", "utm"];

        const opcionPorDefecto = document.createElement("option");
        opcionPorDefecto.value = "";
        opcionPorDefecto.textContent = "Seleccione moneda";
        opcionPorDefecto.disabled = true;
        opcionPorDefecto.selected = true;
        selectorMoneda.appendChild(opcionPorDefecto);

        monedas.forEach(moneda => {
            const opcion = document.createElement("option");
            opcion.value = moneda;
            opcion.textContent = datos[moneda].nombre;
            selectorMoneda.appendChild(opcion);
        });
    } catch (error) {
        resultadoTexto.textContent = "Error al cargar las monedas.";
    }
}

async function convertirMoneda() {
    const monto = parseFloat(montoInput.value);
    const monedaSeleccionada = selectorMoneda.value;

    if (isNaN(monto) || monto <= 0) {
        resultadoTexto.textContent = "Ingrese un monto válido.";
        return;
    }

    try {
        const respuesta = await fetch(`https://mindicador.cl/api/${monedaSeleccionada}`);
        const datos = await respuesta.json();
        const tipoCambio = datos.serie[0].valor;

        const montoConvertido = (monto / tipoCambio).toFixed(2);
        resultadoTexto.innerHTML = `<span style="font-size: 24px; font-weight: bold; color: #333;">
        Resultado: ${montoConvertido} ${monedaSeleccionada.toUpperCase()}
        </span>`;


        dibujarGrafico(datos.serie.slice(0, 10)); 
    } catch (error) {
        resultadoTexto.textContent = "Error al convertir.";
    }
}

function dibujarGrafico(datos) {
    const etiquetas = datos.map(entrada => new Date(entrada.fecha).toLocaleDateString());
    const valores = datos.map(entrada => entrada.valor);

    if (instanciaGrafico) {
        instanciaGrafico.destroy(); 
    }

    const contexto = graficoCanvas.getContext("2d");

    instanciaGrafico = new Chart(contexto, {
        type: "line",
        data: {
            labels: etiquetas,
            datasets: [{
                label: "Valor en CLP",
                data: valores,
                borderColor: "blue",
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { 
                    ticks: { autoSkip: true, maxTicksLimit: 5 }
                },
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await cargarMonedas();
    botonConvertir.addEventListener("click", convertirMoneda);
});

