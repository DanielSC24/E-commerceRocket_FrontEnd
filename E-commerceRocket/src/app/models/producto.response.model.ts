export interface ProductoResponse {
    id: number,
    nombre: string,
    descripcion: string,
    precio: number,
    stock: number,
}

export interface ProductoResponse {
  id: number;
  nombre: string;
  precio: number;
  // other properties
  cantidad?: number; // Add this line to allow quantity tracking
}