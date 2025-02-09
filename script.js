/* (() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
    const checkboxes = document.querySelectorAll('check-products')
    console.log(checkboxes)
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }
            form.classList.add('was-validated')
            send(form)
        }, false)
    })
})() */

(() => {
    const form = document.getElementById('pedido')

    form.addEventListener('submit', event => {
        event.preventDefault();
        const checked_inputs = document.querySelectorAll('.check-productos:checked')

        if (!form.checkValidity() || checked_inputs.length === 0) {
            if (checked_inputs.length === 0) {
                showAlert('Seleccioná por lo menos un producto', 'danger')
            } else if (!form.checkValidity()) {
                showAlert('Completá todos los datos para que podamos registrar el pedido', 'danger')
            }
            event.stopPropagation();
        } else {
            send(form)
        }
        form.classList.add('was-validated')
    })
})()

document.getElementById('celular').addEventListener('keyup', function (event) {
    this.value = this.value.replace(/[^0-9]/g, '');
});

function esperarImagenes() {
    const images = document.querySelectorAll("img");
    const totalImágenes = images.length;

    if (totalImágenes === 0) {
        ajustarAltura(); // Si no hay imágenes, ajusta la altura inmediatamente
        return;
    }

    let cargadas = 0;

    images.forEach(img => {
        if (img.complete) {
            cargadas++; // Imagen ya está cargada
        } else {
            img.addEventListener("load", () => {
                cargadas++;
                if (cargadas === totalImágenes) {
                    ajustarAltura(); // Todas las imágenes han cargado
                }
            });
            img.addEventListener("error", () => {
                cargadas++; // Contar las imágenes que fallan al cargar
                if (cargadas === totalImágenes) {
                    ajustarAltura(); // Ajustar altura incluso si alguna imagen falló
                }
            });
        }
    });

    // Si todas las imágenes están cargadas al iniciar
    if (cargadas === totalImágenes) {
        ajustarAltura();
    }
}

function ajustarAltura() {
    const body = document.body;
    const html = document.documentElement;

    // Calcular la altura total incluyendo márgenes
    const alturaTotal = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
    );

    // Enviar la altura ajustada al iframe padre
    parent.postMessage({ tipo: "ajustarAltura", altura: alturaTotal }, "*");
}


window.addEventListener("resize", ajustarAltura);
document.addEventListener("resize", ajustarAltura)

// Llama a ajustarAltura después de que el contenido esté listo

var nodo = ''
const pedidoElem = document.getElementById('pedido');
const spinner = document.getElementById('spinner');
const btnSubmit = document.getElementById('btnSubmit');
const btnText = document.getElementById('btnText');
const no_ciclos = document.getElementById('no-ciclos');
const retiroElement = document.getElementById('retiro');
const direccion = document.getElementById('direccion')
const entrega = document.getElementById('entrega')
const btnSpinner = document.getElementById('btnSpinner')
const horariosDiv = document.getElementById('horariosDiv')
const pagoDiv = document.getElementById('pagoDiv')
const horariosInput = document.getElementById('horarios')
const pagoInput = document.getElementById('pago')
var grupos = {}
var total = 0
var pedido = []
var infoCiclo

const variantProductos = []

function load() {
    updateTotal()
    fetch("https://script.google.com/macros/s/AKfycbyWidO-mbdC060FypfS1KOMT6-pG9KBpDZb4pNQbaWLQekOrkCbyxAnDYL2tfZm0i67/exec")
        .then(response => response.json())
        .then(res => {
            renderProductos(res.data)
            esperarImagenes()
            ajustarAltura()
        })
}

load()

function renderProductos(data) {
    const { ciclos, productos } = data
    if (ciclos[0]) {
        infoCiclo = ciclos[0]
        const productosDiv = document.getElementById('productos');
        productosDiv.replaceChildren()

        productos.sort((a, b) => a.orden - b.orden)

        grupos = {}; // Objeto para agrupar variantes por su grupo

        productos.forEach(producto => {
            if (!grupos[producto.id_titulo]) {
                grupos[producto.id_titulo] = [];
            }
            grupos[producto.id_titulo].push(producto);
        });

        Object.keys(grupos).forEach(grupoId => {
            const variantes = grupos[grupoId];
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto', 'card', 'p-3', 'mb-2');
            productoDiv.id = grupoId

            const variantesDisponibles = variantes.filter(variant => variant.disponibles > 0);

            const producto = variantesDisponibles.find(variant => variant.selected) || variantesDisponibles[0];

            if (variantesDisponibles.length === 0) {
                return; // Salta al siguiente grupoId
            }

            // Crear lista de opciones para las variantes

            let variantesSelect = ''

            if (variantesDisponibles.length > 1) {
                const variantesOptions = variantesDisponibles.map(variant => `
                <option value="${variant.id}" 
                        ${variant.selected ? 'selected' : ''}
                        data-precio="${variant.precio}"
                        data-disponibles="${variant.disponibles}"
                        data-limite="${variant.limite}"
                        data-descripcion="${variant.descripcion}">
                    ${variant.variante || 'Variante'}
                    </option>
                `).join('')
                variantesSelect = `
            <div class="col">
              <div class="form-floating">
                <select class="form-select select-variantes" data-grupo="${grupoId}" id="variante-${grupoId}">
                  ${variantesOptions}
                </select>
                <label for="variante-${grupoId}">Variante</label>
              </div>
            </div>`
            }

            var descripcionList = "";
            producto.descripcion.split(',').forEach(item => {
                descripcionList += `<li>${item}</li>`
            })

            var formatQty = ''
            var fotoDiv = ''

            if (producto.disponibles < producto.limite) {
                formatQty = `<option value="1">1</option>${Array.from({ length: producto.disponibles - 1 }, (_, i) => `<option value="${i + 2}">${i + 2}</option>`).join('')}`
            } else {
                formatQty = `<option value="1">1</option>${Array.from({ length: producto.limite - 1 }, (_, i) => `<option value="${i + 2}">${i + 2}</option>`).join('')}`
            }

            productoDiv.innerHTML = `
          <div class="form-check fs-3">
            <input type="checkbox" data-grupo-checkbox="${grupoId}" class="form-check-input check-productos" id="${producto.id}" value="producto${producto.id}" aria-describedby="sin-stock" ${producto.disponibles < 1 ? 'disabled' : ''}>
            <label class="form-check-label" for="${producto.id}">
              <h2 id="titulo-${grupoId}" class="col-auto" data-titulo="${producto.titulo}">${producto.titulo}
                <span class="badge text-bg-success col-auto fs-4" id="precio-${grupoId}">$${producto.precio}</span>
            </h2>
            </label>
            ${producto.disponibles < 1 ? '<span class="form-text text-danger" id="sin-stock">Sin stock</span>' : ''}
          </div>
          <div class="row">
            <div class="img-container mb-3">
                <img src="/img/fotos_productos/${producto.id_titulo}.webp" 
                    alt="${producto.titulo}" 
                    class="img-fluid rounded-3"
                    onerror="this.parentNode.style.display='none';">
                </div>
            <div class="col-12 col-md-6">
              <ul id="descripcion-${grupoId}">${descripcionList}</ul>
            </div>
          </div>
          <div class="row mt-3">
            <div class="col">
              <div class="form-floating">
              <select class="form-select select-prod" id="qty${producto.id}" aria-describedby="info-sin-stock" ${producto.disponibles < 1 ? 'disabled' : ''} data-precio=${producto.precio} data-grupo-qty="${grupoId}">
                <option value=""></option>
                  ${formatQty}
                </select>
                <label for="qty${producto.id}">Cantidad</label>
              </div>
            </div>
            ${variantesSelect}
          </div>`

            productosDiv.appendChild(productoDiv);


        })

        const cicloInput = document.getElementById('ciclo');
        cicloInput.value = ciclos[0].id

        const puntos = ciclos[0].puntos
        entrega.innerHTML = `<option disabled ${puntos.length === 1 ? '' : 'selected'}>Elegir...</option>`
        puntos.forEach(p => {
            entrega.innerHTML += `<option data-horarios='${p.horarios}' data-pago='${p.pago}' value='${p.nombre}' ${puntos.length === 1 ? 'selected' : ''}>${p.nombre}</option>`
        })

        entrega.style.display = ""

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

        // Agregar eventos de cambio a los checkbox
        const productosElement = document.getElementById('productos');
        const checkboxes = productosElement.querySelectorAll('.form-check-input');

        for (const checkbox of checkboxes) {
            checkbox.addEventListener('change', () => {
                sincronizarProducto(checkbox.id);
                updateCart()
            });
        }

        // Agregar eventos de cambio a los desplegables
        const cantidadSelects = productosElement.querySelectorAll('.select-prod');

        for (const cantidadSelect of cantidadSelects) {
            cantidadSelect.addEventListener('change', () => {
                const productoId = cantidadSelect.id.replace('qty', '');
                const checkbox = document.getElementById(productoId);
                if (!cantidadSelect.value) {
                    checkbox.checked = false;
                } else {
                    checkbox.checked = true; // Marcar el checkbox si se selecciona una cantidad
                }
                updateTotal()
                updateCart()
            });
        }

        pedidoElem.style.display = ''
        spinner.classList.add('d-none');
        switchBtn("active")
    } else {
        spinner.classList.add('d-none')
        no_ciclos.classList.remove('d-none')
    }

    document.querySelectorAll('.select-variantes').forEach(select => {
        select.addEventListener('change', event => {
            var descripcionList = "";
            const grupoId = event.target.dataset.grupo;
            const selectedOption = event.target.selectedOptions[0];
            selectedOption.dataset.descripcion.split(',').forEach(item => {
                descripcionList += `<li>${item}</li>`
            })
            const targetCheckbox = document.querySelector(`[data-grupo-checkbox="${grupoId}"]`)
            const targetQty = document.querySelector(`[data-grupo-qty="${grupoId}"]`)
            targetCheckbox.id = selectedOption.value
            targetCheckbox.value = `producto${selectedOption.value}`
            targetCheckbox.name = `producto${selectedOption.value}`
            targetCheckbox.checked = true
            targetQty.dataset.precio = selectedOption.dataset.precio
            targetQty.id = `qty${selectedOption.value}`
            targetQty.name = `qty${selectedOption.value}`
            document.getElementById(`precio-${grupoId}`).innerText = `$${selectedOption.dataset.precio}`;
            document.getElementById(`descripcion-${grupoId}`).innerHTML = descripcionList;
            var formatQty = ''
            var disponibles = parseInt(selectedOption.dataset.disponibles)
            var limite = parseInt(selectedOption.dataset.limite)
            if (disponibles < limite) {
                formatQty = `<option value="1">1</option>${Array.from({ length: disponibles - 1 }, (_, i) => `<option value="${i + 2}">${i + 2}</option>`).join('')}`
            } else {
                formatQty = `<option value="1">1</option>${Array.from({ length: limite - 1 }, (_, i) => `<option value="${i + 2}">${i + 2}</option>`).join('')}`
            }
            targetQty.innerHTML = `<option value=""></option>${formatQty}`
            updateTotal()
            sincronizarProducto(selectedOption.value)
            updateCart()
        });
    });

}

function sincronizarProducto(productoId) {
    const checkbox = document.getElementById(productoId);
    const cantidadSelect = document.getElementById(`qty${productoId}`);

    // Si se marca el checkbox, seleccionar "1 caja" en el desplegable
    if (checkbox.checked) {
        cantidadSelect.value = 1;
    } else {
        // Si se desmarca el checkbox, deseleccionar el desplegable
        cantidadSelect.value = "";
    }
    updateTotal()
}

function splitDates(dates) {
    const dateOptions = {
        weekday: "long",
        day: "2-digit",
        month: "long"
    }

    const timeOptions = {
        timeStyle: "short",
        hour12: true
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



function switchBtn(status) {
    if (status === "loading") {
        btnSubmit.setAttribute("disabled", true)
        btnText.innerHTML = "Confirmando..."
        btnSpinner.style.display = ""
    } else if (status === "active") {
        btnSubmit.removeAttribute("disabled")
        btnText.innerHTML = "Confirmar pedido"
        btnSpinner.style.display = "none"
    }
}

function updateTotal() {
    const checkboxes = document.querySelectorAll('.check-productos:checked');
    total = 0;

    checkboxes.forEach(checkbox => {
        const productoId = checkbox.id;
        const cantidadSelect = document.getElementById(`qty${productoId}`);
        const cantidad = parseInt(cantidadSelect.value) || 0;
        const precio = parseFloat(cantidadSelect.dataset.precio) || 0;

        total += cantidad * precio; // Suma el costo total de los productos seleccionados
    });
}

function successHandler(resString, form) {
    const res = JSON.parse(resString)
    if (res.status === "success") {
        pedidoElem.style.display = 'none'
        spinner.classList.remove('d-none')
        horariosDiv.classList.add('d-none')
        pagoDiv.classList.add('d-none')
        pedido.total = 0
        pedido = []
        showAlert(res.msg, res.status)
        form.classList.remove('was-validated')
        form.reset()
        updateCart()
    } else if (res.status === "danger") {
        showAlert(res.msg, res.status)
        switchBtn("active")
    }
    load()
}

function showAlert(text, color) {
    var alert = document.getElementById("alert")
    alert.classList.add("alert", "ms-3", "p-2", "position-absolute", "start-0", "text-center", "w-50", "alert-" + color)
    alert.innerHTML = text;
    alert.classList.remove('d-none')
    alert.focus()
    setTimeout(() => {
        alert.classList.add('d-none');
    }, 4000);
}


function send(form) {
    switchBtn("loading")
    let data = {
        pedido: [],
        total: 0,
        info: {}
    }

    var info = Array.from(new FormData(form).entries()).reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    data.info = {
        dni: info.dni,
        nombre: info.nombre,
        apellido: info.apellido,
        celular: info.celular,
        entrega: info.entrega,
        ciclo: info.ciclo,
        horarios: info.horarios,
        nodo: info.nodo,
        pago: info.pago,
        procedencia: info.procedencia,
        direccion: info.direccion
    }

    var checked_inputs = document.querySelectorAll('.check-productos:checked')

    checked_inputs.forEach(input => {
        var qty = document.getElementById("qty" + input.id)
        const nombre = document.getElementById(`titulo-${input.dataset.grupoCheckbox}`).dataset.titulo
        var subtotal = parseInt(qty.dataset.precio) * parseInt(qty.value)
        data.pedido.push({ producto: input.value, cantidad: qty.value, subtotal, nombre })
        data.total += subtotal
    })

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "text/plain");

    const raw = JSON.stringify(data);

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch("https://script.google.com/macros/s/AKfycbyWidO-mbdC060FypfS1KOMT6-pG9KBpDZb4pNQbaWLQekOrkCbyxAnDYL2tfZm0i67/exec", requestOptions)
        .then((response) => response.text())
        .then((res) => {
            const form = document.getElementById('pedido')
            successHandler(res, form)
        })
        .catch((error) => console.error(error, "error en fetch"));
}

function updateCart() {
    pedido = []
    var checked_inputs = document.querySelectorAll('.check-productos:checked')
    const carrito = document.getElementById('carrito')

    checked_inputs.forEach(input => {
        var qty = document.getElementById("qty" + input.id)
        const nombre = document.getElementById(`titulo-${input.dataset.grupoCheckbox}`).dataset.titulo
        var subtotal = parseInt(qty.dataset.precio) * parseInt(qty.value)
        pedido.push({ producto: input.value, cantidad: qty.value, subtotal, nombre })
    })
    if (pedido.length > 0) {
        carrito.classList.remove("d-none")
        const pedidoText = pedido.map(item => `<li class="list-group-item">${item.cantidad} - ${item.nombre} : $${item.subtotal.toFixed(2)}`)
        carrito.innerHTML = `<div class="card-body">
            <h4>Tu pedido:</h4>
            <ul class="list-group list-group-flush">
                ${pedidoText}
                <li class="list-group-item">
                <h4 id="total" class="text-success">Total: $${total.toFixed(2)}</h4>
                </li>
            </ul></div>`
    } else {
        carrito.classList.add('d-none')
        carrito.innerHTML = ""
    }
    ajustarAltura()
}

entrega.addEventListener('change', (el) => {

    const selectedOption = el.target.selectedOptions[0]
    horariosInput.replaceChildren()
    pagoInput.replaceChildren()
    if (selectedOption) {
        selectedOption.dataset.horarios.split(",").forEach(horario => {
            horariosInput.innerHTML += `<option value='${horario}'>${horario}</option>`
        })
        horariosDiv.classList.remove('d-none')
        horariosInput.removeAttribute('disabled')

        selectedOption.dataset.pago.split(',').forEach(pago => {
            pagoInput.innerHTML += `<option value='${pago}'>${pago}</option>`
        })
        pagoDiv.classList.remove('d-none')
        pagoInput.removeAttribute('disabled')
        ajustarAltura()
    } else {
        horariosDiv.classList.add('d-none')
        pagoDiv.classList.add('d-none')
    }
})

