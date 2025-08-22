export interface PedidoRequest {
  id?: number;
  clienteId: number;
  productos: number[];
  total: number;
  fechaCreacion: string;
  estado: string;
}
