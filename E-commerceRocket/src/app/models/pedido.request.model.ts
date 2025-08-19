export interface PedidoRequest{
  id: number,
  idCliente: number,
  listaProductos: number,
  total: number,
  fechaCreacion: Date,
  estado: string,
}
