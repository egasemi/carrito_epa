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
            send(form)
        }, false)
    })
})()
document.getElementById('celular').addEventListener('input', function (event) {
    this.value = this.value.replace(/[^0-9]/g, '');
});

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

// Llama a ajustarAltura después de que el contenido esté listo

var nodo = ''
const pedidoElem = document.getElementById('pedido');
const spinner = document.getElementById('spinner');
const btnSubmit = document.getElementById('btnSubmit');
const btnText = document.getElementById('btnText');
const no_ciclos = document.getElementById('no-ciclos');
const retiroElement = document.getElementById('retiro');
var carrito = {}
var total = 0
const variantProductos = []

function load() {
    updateTotal()
    fetch("https://script.google.com/macros/s/AKfycbyWidO-mbdC060FypfS1KOMT6-pG9KBpDZb4pNQbaWLQekOrkCbyxAnDYL2tfZm0i67/exec")
        .then(response => response.json())
        .then(res => {
            renderProductos(res.data)
            ajustarAltura()
        })
}

load()

function renderProductos(data) {
    const { ciclos, productos } = data
    if (ciclos[0]) {
        const productosDiv = document.getElementById('productos');
        productosDiv.replaceChildren()

        const grupos = {}; // Objeto para agrupar variantes por su grupo

        productos.forEach(producto => {
            if (!grupos[producto.id_titulo]) {
                grupos[producto.id_titulo] = [];
            }
            grupos[producto.id_titulo].push(producto);
        });

        Object.keys(grupos).forEach(grupoId => {
            const variantes = grupos[grupoId];
            const producto = variantes.find(variant => variant.selected) || variantes[0];
            const productoDiv = document.createElement('div');
            productoDiv.classList.add('producto', 'card', 'p-2', 'mb-2');
            productoDiv.id = grupoId

            // Crear lista de opciones para las variantes

            let variantesSelect = ''

            if (variantes.length > 1) {
                const variantesOptions = variantes.map(variant => `
          <option value="${variant.id}" 
                  ${variant.selected ? 'selected' : ''}
                  data-precio="${variant.precio}" 
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

            if (producto.foto) {
                fotoDiv = `
                <div class="col-12 col-md-6">
                    <img src="${producto.foto}" alt="${producto.titulo}" class="img-fluid mb-2 product-image">
                </div>`
            }
            productoDiv.innerHTML = `
          <div class="form-check fs-3">
            <input type="checkbox" data-grupo-checkbox="${grupoId}" class="form-check-input check-productos" id="${producto.id}" value="producto${producto.id}" aria-describedby="sin-stock" ${producto.disponibles < 1 ? 'disabled' : ''}>
            <label class="form-check-label" for="${producto.id}">
            <div class="row">
              <h2 id="titulo-${grupoId}" class="col-auto">${producto.titulo}</h2>
              <span class="badge text-bg-success col-auto" id="precio-${grupoId}">$${producto.precio}</span>
            </div>
            </label>
            ${producto.disponibles < 1 ? '<span class="form-text text-danger" id="sin-stock">Sin stock</span>' : ''}
          </div>
          <div class="row">
            ${fotoDiv}
            <div class="col-12 col-md-6">
              <ul id="descripcion-${grupoId}">${descripcionList}</ul>
            </div>
          </div>
          <div class="row">
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
        const formaPagoInput = document.getElementById('forma-pago');
        formaPagoInput.replaceChildren()
        var pagos = ciclos[0].pago.split(",")
        formaPagoInput.innerHTML = `<option disabled ${pagos.length === 1 ? '' : 'selected'}>Elegir...</option>`
        pagos.forEach(p => {
            formaPagoInput.innerHTML += `<option value='${p}' ${pagos.length === 1 ? 'selected' : ''}>${p}</option>`
        })

        if (ciclos[0]?.direccion?.length > 1) {
            const entregaInput = document.getElementById("entrega")
            entregaInput.replaceChildren()
            const puntos = ciclos[0].direccion.split(",")
            entregaInput.innerHTML = `<option disabled ${puntos.length === 1 ? '' : 'selected'}>Elegir...</option>`
            puntos.forEach(p => {
                entregaInput.innerHTML += `<option value='${p}' ${puntos.length === 1 ? 'selected' : ''}>${p}</option>`
            })

            entregaInput.style.display = ""
        }

        if (ciclos[0]?.horarios?.length > 1) {
            const horariosInput = document.getElementById("horarios")
            horariosInput.replaceChildren()
            const puntos = ciclos[0].horarios.split(",")
            horariosInput.innerHTML = `<option disabled ${puntos.length === 1 ? '' : 'selected'}>Elegir...</option>`
            puntos.forEach(p => {
                horariosInput.innerHTML += `<option value='${p}' ${puntos.length === 1 ? 'selected' : ''}>${p}</option>`
            })

            horariosInput.style.display = ""
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

        // Agregar eventos de cambio a los checkbox
        const productosElement = document.getElementById('productos');
        const checkboxes = productosElement.querySelectorAll('.form-check-input');

        for (const checkbox of checkboxes) {
            checkbox.addEventListener('change', () => {
                sincronizarProducto(checkbox.id);
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
            targetQty.dataset.precio = selectedOption.dataset.precio
            targetQty.id = `qty${selectedOption.value}`
            targetQty.name = `qty${selectedOption.value}`
            document.getElementById(`precio-${grupoId}`).innerText = `$${selectedOption.dataset.precio}`;
            document.getElementById(`descripcion-${grupoId}`).innerHTML = descripcionList;
            updateTotal()
        });
    });

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

function updateTotal() {
    const checkboxes = document.querySelectorAll('.check-productos:checked');
    let total = 0;

    checkboxes.forEach(checkbox => {
        const productoId = checkbox.id;
        const cantidadSelect = document.getElementById(`qty${productoId}`);
        const cantidad = parseInt(cantidadSelect.value) || 0;
        const precio = parseFloat(cantidadSelect.dataset.precio) || 0;

        total += cantidad * precio; // Suma el costo total de los productos seleccionados
    });

    // Actualiza el total en el HTML
    const totalElement = document.getElementById('total');
    totalElement.textContent = `Total: $${total.toFixed(2)}`; // Formateado a dos decimales
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

function send(form) {
    switchBtn("loading")
    if (form.checkValidity()) {
        event.preventDefault();

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
            procedencia: info.procedencia
        }

        var checked_inputs = document.querySelectorAll('.check-productos:checked')

        checked_inputs.forEach(input => {
            var qty = document.getElementById("qty" + input.id)
            const nombre = document.getElementById(`titulo-${input.dataset.grupoCheckbox}`).innerHTML
            var subtotal = parseInt(qty.dataset.precio) * parseInt(qty.value)
            data.pedido.push({ producto: input.value, cantidad: qty.value, subtotal, nombre })
            data.total += subtotal
        })

        if (data.pedido.length > 0) {
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
                    successHandler(res)
                    form.reset()
                })
                .catch((error) => console.error(error));

        } else {
            var check = document.querySelector(".check-productos")
            check.classList.add("is-invalid")
            switchBtn("active")
        }

        form.classList.remove("was-validated")
    } else {
        switchBtn("active")
    }
}

