export interface PedidoRequest{
  id?: number,
  clienteId: number,
  productosIds: number[],
  total: number,
  fechaCreacion: string,
  estado: string,
}
