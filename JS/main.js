// VARIABLES
let productos = [];
let carrito = [];

const productosContainer = document.getElementById("productos-container");
const listaCarrito = document.querySelector("#lista-carrito tbody");
const vaciarCarritoBtn = document.getElementById("vaciar-carrito");
const finalizarCompraBtn = document.getElementById("finalizar-compra");
const contadorCarrito = document.getElementById("contador-carrito");
const totalCarrito = document.getElementById("total-carrito");

const checkout = document.getElementById("checkout");
const cerrarCheckout = document.getElementById("cerrar-checkout");
const formularioCompra = document.getElementById("formulario-compra");
const totalCheckout = document.getElementById("total-checkout");
const mensajeCompra = document.getElementById("mensaje-compra");

// INICIO
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  cargarCarrito();
  cargarEventos();
});

// FETCH
async function cargarProductos() {
  try {
    const respuesta = await fetch("./JSON/page.json");

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar los productos");
    }

    productos = await respuesta.json();

    mostrarProductos(productos);
  } catch (error) {
    productosContainer.innerHTML = `
      <div class="error">
        <p>No se pudieron cargar los productos.</p>
        <p>Intentá actualizar la página.</p>
      </div>
    `;
  }
}

// MOSTRAR PRODUCTOS
function mostrarProductos(productosMostrar) {
  productosContainer.innerHTML = "";

  productosMostrar.forEach((producto) => {
    const slide = document.createElement("div");

    slide.classList.add("swiper-slide");

    slide.innerHTML = `
      <div class="producto">

        <h3>${producto.nombre}</h3>

        <p class="precio">
          $${producto.precio}
        </p>

        <img
          src="${producto.imagen}"
          alt="Imagen de ${producto.nombre}"
        />

        <button
          class="agregar-carrito btn-2"
          data-id="${producto.id}"
        >
          Agregar al carrito
        </button>

      </div>
    `;

    productosContainer.appendChild(slide);
  });

  iniciarSwiper();
}

// SWIPER
function iniciarSwiper() {
  new Swiper(".mySwiper", {
    slidesPerView: 1,
    spaceBetween: 15,
    loop: true,

    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },

      1024: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
    },
  });
}

// EVENTOS
function cargarEventos() {
  productosContainer.addEventListener("click", agregarAlCarrito);

  listaCarrito.addEventListener("click", eliminarProducto);

  listaCarrito.addEventListener("click", cambiarCantidad);

  vaciarCarritoBtn.addEventListener("click", vaciarCarrito);

  finalizarCompraBtn.addEventListener("click", mostrarCheckout);

  cerrarCheckout.addEventListener("click", cerrarFormulario);

  formularioCompra.addEventListener("submit", finalizarCompra);
}

// AGREGAR AL CARRITO
function agregarAlCarrito(e) {
  if (!e.target.classList.contains("agregar-carrito")) {
    return;
  }

  const id = Number(e.target.getAttribute("data-id"));

  const productoSeleccionado = productos.find(
    (producto) => producto.id === id
  );

  if (!productoSeleccionado) {
    return;
  }

  const productoExiste = carrito.find(
    (producto) => producto.id === id
  );

  if (productoExiste) {
    productoExiste.cantidad++;
  } else {
    carrito.push({
      ...productoSeleccionado,
      cantidad: 1,
    });
  }

  guardarCarrito();

  mostrarCarrito();

  mostrarMensaje("Producto agregado al carrito 🐱");
}

// MOSTRAR CARRITO
function mostrarCarrito() {
  listaCarrito.innerHTML = "";

  carrito.forEach((producto) => {
    const row = document.createElement("tr");

    const subtotal = producto.precio * producto.cantidad;

    row.innerHTML = `
      <td>
        <img
          src="${producto.imagen}"
          width="60"
          alt="${producto.nombre}"
        />
        <span>${producto.nombre}</span>
      </td>

      <td>
        $${producto.precio}
      </td>

      <td>
        <div class="cantidad">
          <button
            class="cantidad-btn"
            data-id="${producto.id}"
            data-accion="restar"
          >
            -
          </button>

          <span>${producto.cantidad}</span>

          <button
            class="cantidad-btn"
            data-id="${producto.id}"
            data-accion="sumar"
          >
            +
          </button>
        </div>
      </td>

      <td>
        $${subtotal}
      </td>

      <td>
        <button
          class="borrar"
          data-id="${producto.id}"
        >
          X
        </button>
      </td>
    `;

    listaCarrito.appendChild(row);
  });

  actualizarTotal();
  actualizarContador();
}

// CAMBIAR CANTIDAD
function cambiarCantidad(e) {
  if (!e.target.classList.contains("cantidad-btn")) {
    return;
  }

  const id = Number(e.target.getAttribute("data-id"));

  const accion = e.target.getAttribute("data-accion");

  const producto = carrito.find(
    (producto) => producto.id === id
  );

  if (!producto) {
    return;
  }

  if (accion === "sumar") {
    producto.cantidad++;
  }

  if (accion === "restar") {
    producto.cantidad--;

    if (producto.cantidad === 0) {
      carrito = carrito.filter(
        (producto) => producto.id !== id
      );
    }
  }

  guardarCarrito();

  mostrarCarrito();
}

// ELIMINAR PRODUCTO
function eliminarProducto(e) {
  if (!e.target.classList.contains("borrar")) {
    return;
  }

  const id = Number(e.target.getAttribute("data-id"));

  carrito = carrito.filter(
    (producto) => producto.id !== id
  );

  guardarCarrito();

  mostrarCarrito();
}

// TOTAL
function actualizarTotal() {
  const total = carrito.reduce(
    (acumulador, producto) => {
      return acumulador + producto.precio * producto.cantidad;
    },
    0
  );

  totalCarrito.textContent = `$${total}`;

  totalCheckout.textContent = `$${total}`;
}

// CONTADOR
function actualizarContador() {
  const cantidad = carrito.reduce(
    (acumulador, producto) => {
      return acumulador + producto.cantidad;
    },
    0
  );

  contadorCarrito.textContent = cantidad;
}

// VACIAR CARRITO
function vaciarCarrito() {
  carrito = [];

  guardarCarrito();

  mostrarCarrito();

  mostrarMensaje("El carrito fue vaciado.");
}

// LOCAL STORAGE
function guardarCarrito() {
  localStorage.setItem(
    "carrito",
    JSON.stringify(carrito)
  );
}


function cargarCarrito() {
  const carritoGuardado =
    localStorage.getItem("carrito");

  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
  }

  mostrarCarrito();
}

// CHECKOUT
function mostrarCheckout() {
  if (carrito.length === 0) {
    mostrarMensaje(
      "Agregá al menos un producto antes de finalizar la compra."
    );

    return;
  }

  checkout.classList.add("activo");

  actualizarTotal();
}


function cerrarFormulario() {
  checkout.classList.remove("activo");

  formularioCompra.reset();

  mensajeCompra.innerHTML = "";
}

// FINALIZAR COMPRA
function finalizarCompra(e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;

  const total = carrito.reduce(
    (acumulador, producto) => {
      return acumulador + producto.precio * producto.cantidad;
    },
    0
  );

  mensajeCompra.innerHTML = `
    <div class="compra-exitosa">
      <h3>¡Compra realizada con éxito! 🐱🎉</h3>

      <p>
        Gracias por tu compra, ${nombre}.
      </p>

      <p>
        Total abonado: <strong>$${total}</strong>
      </p>

      <p>
        Recibirás la información de tu pedido por email.
      </p>
    </div>
  `;

  carrito = [];

  guardarCarrito();

  mostrarCarrito();

  formularioCompra.reset();
}

// MENSAJES
function mostrarMensaje(mensaje) {
  const mensajeExistente =
    document.querySelector(".mensaje-carrito");

  if (mensajeExistente) {
    mensajeExistente.remove();
  }

  const mensajeDiv =
    document.createElement("div");

  mensajeDiv.classList.add("mensaje-carrito");

  mensajeDiv.textContent = mensaje;

  document.body.appendChild(mensajeDiv);

  setTimeout(() => {
    mensajeDiv.remove();
  }, 2500);
}