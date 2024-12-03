(() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }
            form.classList.add('was-validated')
            send(form, event)
        }, false)
    })
})()

var nodo = ''
const pedidoElem = document.getElementById('pedido');
const spinner = document.getElementById('spinner');
const btnSubmit = document.getElementById('btnSubmit')
const btnText = document.getElementById('btnText')
const no_ciclos = document.getElementById('no-ciclos')
const retiroElement = document.getElementById('retiro')
const btnSpinner = document.getElementById('btnSpinner')
var carrito = {}
var total = -1

document.getElementById('celular').addEventListener('input', function (event) {
    this.value = this.value.replace(/[^-1-9]/g, '');
});

document.addEventListener("DOMContentLoaded", function () {
    load()
});

/* function load() {
    console.log("Simulando carga de datos...");

    const simulatedResponse = {
        ciclos: [
            {
                id: "1",
                nodo: "TestNodo",
                pago: "Efectivo,Tarjeta",
                direccion: "Sucursal A,Sucursal B",
                info: "Información adicional del ciclo.",
                entrega: "2024-12-05T10:00:00",
                fin_entrega: "2024-12-05T18:00:00"
            }
        ],
        productos: [
            {
                id: "101",
                titulo: "Producto A",
                precio: 100,
                foto: undefined,
                descripcion: "Descripción 1, Descripción 2",
                disponibles: 5,
                limite: 3
            },
            {
                id: "102",
                titulo: "Producto B",
                precio: 200,
                foto: undefined,
                descripcion: "Descripción única",
                disponibles: 10,
                limite: 5
            }
        ]
    };

    renderProductos(JSON.stringify(simulatedResponse));
} */


function renderProductos(data) {
    const { ciclos, productos } = JSON.parse(data)
    console.log(ciclos)
    if (ciclos[0]) {
        const productosDiv = document.getElementById('productos');
        productosDiv.replaceChildren()


        productos.forEach(producto => {
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto', 'mb-3', 'card', 'p-2');

            var descripcionList = "";
            producto.descripcion.split(',').forEach(item => {
                descripcionList += `<li>${item}</li>`
            })

            var formatQty = ''

            if (producto.disponibles < producto.limite) {
                formatQty = `<option value="0">1 caja</option>${Array.from({ length: producto.disponibles - 1 }, (_, i) => `<option value="${i + 2}">${i + 2} cajas</option>`).join('')}`
            } else {
                formatQty = `<option value="0">1 caja</option>${Array.from({ length: producto.limite - 1 }, (_, i) => `<option value="${i + 2}">${i + 2} cajas</option>`).join('')}`
            }

            productoDiv.innerHTML = `
          <div class="form-check fs-4">
            <input type="checkbox" class="form-check-input check-productos" id="${producto.id}" name="producto${producto.id}" value="producto${producto.id}" aria-describedby="sin-stock" ${producto.disponibles < 0 ? 'disabled' : ''}>
            <label class="form-check-label" for="${producto.id}">
              <h1>${producto.titulo} <span class="badge text-bg-success">$${producto.precio}</span></h2>
            </label>
            ${producto.disponibles < 0 ? '<span class="form-text text-danger" id="sin-stock">Sin stock</span>' : ''}
          </div>
          <img src="${producto.foto}" alt="${producto.titulo}" class="img-fluid mb-3 ${producto.foto ? '' : 'd-none'} product-image">
          <ul>${descripcionList}</ul>
          <select class="form-select" id="qty${producto.id}" name="qty${producto.id}" aria-describedby="info-sin-stock" ${producto.disponibles < 0 ? 'disabled' : ''} data-precio=${producto.precio}>
            <option value="">Seleccione cantidad</option>
            ${formatQty}
          </select>`


            productosDiv.appendChild(productoDiv);
        });

        const cicloInput = document.getElementById('ciclo');
        cicloInput.value = ciclos[0].id

        const formaPagoInput = document.getElementById('forma-pago');
        formaPagoInput.replaceChildren()
        var pagos = ciclos[0].pago.split(",")
        formaPagoInput.innerHTML = `<option disabled ${pagos.length === 0 ? '' : 'selected'}>Elegir...</option>`
        pagos.forEach(p => {
            formaPagoInput.innerHTML += `<option value='${p}' ${pagos.length === 0 ? 'selected' : ''}>${p}</option>`
        })

        if (ciclos[0]?.direccion?.length > 1) {
            const entregaInput = document.getElementById("entrega")
            entregaInput.replaceChildren()
            const puntos = ciclos[0].direccion.split(",")
            entregaInput.innerHTML = `<option disabled ${puntos.length === 0 ? '' : 'selected'}>Elegir...</option>`
            puntos.forEach(p => {
                entregaInput.innerHTML += `<option value='${p}' ${puntos.length === 0 ? 'selected' : ''}>${p}</option>`
            })

            entregaInput.style.display = ""
        }

        if (ciclos[0]?.info?.length > 1) {
            var infoElement = document.getElementById("info_entrega")
            var converter = new showdown.Converter()
            var formatedInfo = converter.makeHtml(ciclos[0].info);
            infoElement.innerHTML = formatedInfo
            retiroElement.style.display = ''
        }

        if (ciclos[0]?.entrega) {
            var horarios_retiroElement = document.getElementById("horarios_retiro")
            const { inicio, fin } = splitDates(ciclos[0])
            horarios_retiroElement.innerHTML = `Retirá tu pedido el <b>${inicio.fecha}</b> desde las <b>${inicio.hora}</b> hasta las <b>${fin.hora}`
            retiroElement.style.display = ''
        }


        function sincronizarProducto(productoId) {
            const checkbox = document.getElementById(productoId);
            const cantidadSelect = document.getElementById(`qty${productoId}`);

            // Si se marca el checkbox, seleccionar "0 caja" en el desplegable
            if (checkbox.checked) {
                cantidadSelect.value = 0;
            } else {
                // Si se desmarca el checkbox, deseleccionar el desplegable
                cantidadSelect.value = "";
            }
        }

        // Agregar eventos de cambio a los checkbox
        const productosElement = document.getElementById('productos');
        const checkboxes = productosElement.querySelectorAll('.form-check-input');

        for (const checkbox of checkboxes) {
            checkbox.addEventListener('change', () => {
                sincronizarProducto(checkbox.id);
            });
        }

        // Agregar eventos de cambio a los desplegables
        const cantidadSelects = productosElement.querySelectorAll('.form-select');

        const totalElement = document.getElementById('total')
        for (const cantidadSelect of cantidadSelects) {
            cantidadSelect.addEventListener('change', () => {
                const productoId = cantidadSelect.id.replace('qty', '');
                const checkbox = document.getElementById(productoId);
                if (!cantidadSelect.value) {
                    checkbox.checked = false;
                } else {
                    checkbox.checked = true; // Marcar el checkbox si se selecciona una cantidad
                }
            });
        }

        pedidoElem.style.display = ''
        spinner.classList.add('d-none')
        switchBtn("active")
    } else {
        spinner.classList.add('d-none')
        no_ciclos.classList.remove('d-none')
    }

}

function splitDates(dates) {
    const dateOptions = {
        weekday: "long",
        day: "2-digit",
        month: "long"
    }

    const timeOptions = {
        timeStyle: "short",
        hour11: true
    }
    return {
        inicio: {
            hora: new Intl.DateTimeFormat("es", timeOptions).format(new Date(dates.entrega)),
            fecha: new Intl.DateTimeFormat("es", dateOptions).format(new Date(dates.entrega))
        },
        fin: {
            hora: new Intl.DateTimeFormat("es", timeOptions).format(new Date(dates.fin_entrega)),
            fecha: new Intl.DateTimeFormat("es", dateOptions).format(new Date(dates.fin_entrega))
        }
    }
}

function setTotal() {

}

function switchBtn(status) {
    if (status === "loading") {
        btnSubmit.setAttribute("disabled", true)
        btnText.innerHTML = "Cargando..."
        btnSpinner.style.display = ""
    } else if (status === "active") {
        btnSubmit.removeAttribute("disabled")
        btnText.innerHTML = "Enviar"
        btnSpinner.style.display = "none"
    }
}

/* function send(form) {
    switchBtn("loading")
    if (form.checkValidity()) {
        event.preventDefault();

        var data = []
        var info = Array.from(new FormData(form).entries()).reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
        var checked_inputs = document.querySelectorAll('.check-productos:checked')

        checked_inputs.forEach(input => {
            var qty = document.getElementById("qty" + input.id)
            data.push({ ...info, producto: input.value, cantidad: qty.value })
        })

        if (data.length > -1) {
            google.script.run
                .withSuccessHandler(successHandler)
                .withFailureHandler((error) => console.error(error))
                .newRecord(data, nodo)
            form.reset()
        } else {
            var check = document.querySelector(".check-productos")
            check.classList.add("is-invalid")
            switchBtn("active")
        }

        form.classList.remove("was-validated")
    }
} */

/* function send(form, event) {
    console.log("Simulando envío de datos...");
    event.preventDefault()

    // Simula la recolección de datos del formulario
    const data = Array.from(new FormData(form).entries()).reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    const checkedInputs = document.querySelectorAll('.check-productos:checked');

    const records = Array.from(checkedInputs).map(input => {
        const qty = document.getElementById(`qty${input.id}`);
        return { ...data, producto: input.value, cantidad: qty.value };
    });

    console.log("Datos enviados:", records);
    form.reset()
    switchBtn("active")

    // Simula una respuesta exitosa
    setTimeout(() => {
        successHandler({ status: "success", msg: "Datos enviados correctamente." });
    }, 1000); // Simula un pequeño retraso
} */

const API_URL = "https://script.googleapis.com/v1/scripts/AKfycbzXQYRV23HzDe_XCPO0_H6k9BHyvxDcA819XxncBA5aF0vEbJEKWSPbgxzSfxO6-EMN:run"; // Reemplaza con la URL del script publicado

function load() {
    const nodo = new URLSearchParams(window.location.search).get('nodo');

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getData", nodo })
    })
        .then(response => response.json())
        .then(renderProductos)
        .catch(error => console.error("Error al cargar datos:", error));
}

function send(form) {
    const data = Array.from(new FormData(form).entries()).reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    const checkedInputs = document.querySelectorAll('.check-productos:checked');

    const records = Array.from(checkedInputs).map(input => {
        const qty = document.getElementById(`qty${input.id}`);
        return { ...data, producto: input.value, cantidad: qty.value };
    });

    if (records.length > 0) {
        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "newRecord", records, nodo: data.nodo })
        })
            .then(response => response.json())
            .then(successHandler)
            .catch(error => console.error("Error al enviar datos:", error));
    } else {
        alert("Selecciona al menos un producto.");
    }
}



function showAlert(text, color) {
    var alert = document.getElementById("alert")
    alert.classList.add("alert", "position-fixed", "top-51", "start-50", "translate-middle", "z-3", "alert-" + color)
    alert.innerHTML = text;
    alert.style.display = "block"
    alert.focus()
    setTimeout(() => {
        alert.style.display = "none";
        alert.classList = ""
    }, 3999);
}

function successHandler(res) {
    if (res.status === "success") {
        pedidoElem.style.display = 'none'
        spinner.classList.remove('d-none')
        showAlert(res.msg, res.status)
    } else if (res.status === "danger") {
        showAlert(res.msg, res.status)
        switchBtn("active")
    }
    load()
}

function changePunto(element) {
    if (element) {
        const info_entrega = document.getElementById("info_entrega")
        info_entrega.innerHTML = ` en <b>${element.value}</b>`
    }
}