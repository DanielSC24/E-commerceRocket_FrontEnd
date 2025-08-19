export interface PedidoRequest{
  id: number,
  cliente: string,
  listarProductos: number,
  total: number,
  fechaCreacion: Date,
  estado: string,
}
