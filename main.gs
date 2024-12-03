var SS = SpreadsheetApp.openById("1omxJQRixvMsfaz6BKWmEce_6HqyxhQfISCH6vhRTTjg")

function getSheetById(id, ss) {
  return ss.getSheets().filter(
    function(s) {return s.getSheetId() === id;}
  )[0];
}

function getConfig(nodo, name) {
  var nodos = getSheetById(396661121,SS)
  var current = nodos.getDataRange().getValues().filter(curr => curr[0] === nodo)
  var currentNodo = SpreadsheetApp.openById(current[0][2])
  var sheetData = currentNodo.getSheetByName(name)

  return sheetData
}

function getProductos(nodo) {
  const fotosProductos = getProductPhotos()
  const productosData = getConfig(nodo, "productos")
  var productos = productosData.getDataRange().getValues().map(producto => {
    return {
      titulo: producto[0],
      descripcion: producto[1],
      precio: producto[2],
      limite: producto[3],
      id: producto[4],
      id_titulo: producto[5],
      stock: producto[6],
      disponibles: producto[7],
      activo: producto[8],
      foto: fotosProductos[producto[4]] ? `https://drive.google.com/thumbnail?id=${fotosProductos[producto[4]]}` : undefined  
    }
  })
  productos.shift()
  console.log(productos)
  return productos.filter(producto => producto.activo === true)

}

function getCiclos(nodo) {
  const ciclosData = getConfig(nodo, "ciclos")
  var ciclos = ciclosData.getDataRange().getValues().map(ciclo => {
    return {
      id: ciclo[0],
      nombre: ciclo[1],
      inicio: ciclo[2],
      fin: ciclo[3],
      entrega: ciclo[4],
      fin_entrega: ciclo[5],
      direccion: ciclo[6],
      pago: ciclo[7],
      info: ciclo[8]
    }
  })
  ciclos.shift()
  return ciclos.filter(ciclo => ciclo.fin.getTime() > Date.now() && ciclo.inicio.getTime() < Date.now())
}

function getData(nodo) {
  const ciclos = getCiclos(nodo)
  const productos = getProductos(nodo)
  const data = {ciclos, productos}
  return JSON.stringify(data)
}

function doGet() {
  const template = HtmlService.createTemplateFromFile('index')
  const output = template.evaluate()
  output.addMetaTag('viewport', 'width=device-width, initial-scale=1')
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
  return output
}

function newRecord(data, nodo) {
  const records = getConfig(nodo, 'pedidos')
  const productos = getConfig(nodo, 'productos')
  
  const recordsData = records.getDataRange().getValues().filter(row => row[10] == data[0].ciclo && row[1] == data[0].dni)
  const productosData = productos.getDataRange().getValues()
  const resumen = {}
  productosData.shift()
  productosData.forEach(prod => {
    if(prod[4]+'' !== '') {
      resumen[prod[4]+''] = {qty: prod[7]}
    }
  })

  console.log(resumen)

  if(recordsData.length === 0) {
    var id = String(Date.now())
    var status = "success"
    var msg = "Tu pedido fue registrado correctamente!"
    data.forEach(row => {
      var producto_id = row.producto.replace('producto','')
      if(resumen[producto_id].qty >= row.cantidad) {
        records.appendRow([
          id,
          row.dni,
          row.nombre,
          row.apellido,
          row.celular.replace(" ","").replace("-","").replace("+",""),
          row.email,
          producto_id,
          row.cantidad,
          row.pago,
          row.nodo,
          row.ciclo,
          row.entrega
        ])
        resumen[producto_id]["status"] = "success"
      } else {
        status = "danger"
        msg = "Algún producto se quedó sin stock antes de registrar tu pedido"
        resumen[producto_id]["status"] = "danger"
      }
    })
    return {status, resumen: JSON.stringify(resumen), msg}
  } else {
    return {status: "danger", msg: "Ya hay un pedido registrado con ese DNI"}
  }
}

function uploadPhoto(fileBlob, fileName) {
  const folderId = '1slN4SKo4G9gtH34SOLuBzJmPmLAkpB2c'; // ID de la carpeta en Drive
  const folder = DriveApp.getFolderById(folderId);

  const file = folder.createFile(fileBlob).setName(fileName);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return file.getUrl(); // Devuelve el enlace compartido
}

function getProductPhotos() {
  const folderId = '1slN4SKo4G9gtH34SOLuBzJmPmLAkpB2c';
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  
  const productPhotos = {};
  
  while (files.hasNext()) {
    const file = files.next();
    const productId = file.getName().split('.')[0]; // Asume que el nombre del archivo coincide con el ID del producto
    productPhotos[productId] = file.getId();
  }
  
  return productPhotos;
}


