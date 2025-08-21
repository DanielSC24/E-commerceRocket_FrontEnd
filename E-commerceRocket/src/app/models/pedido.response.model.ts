import { ClienteResponse } from "./cliente.response.model";
import { ProductoResponse } from "./producto.response.model";

export interface PedidoResponse{
  id: number,
  cliente: ClienteResponse,
  productos: ProductoResponse[],
  total: number,
  fechaCreacion: string,
  estado: string,
}
