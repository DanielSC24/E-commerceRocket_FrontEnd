import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoResponse } from '../../models/producto.response.model';
import { ProductosService } from '../../service/productos.service';
import { ProductoRequest } from '../../models/producto.request.model';
import { AuthService } from '../../service/auth.service';
import Swal from 'sweetalert2';
import { Roles } from '../../models/roles.model';

@Component({
  selector: 'app-productos',
  standalone: false,
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {

  productos: ProductoResponse[] = [];
  showForm: boolean = false;
  productoForm: FormGroup;
  textoModal: string = 'Nuevo Producto';
  selectedProducto: ProductoResponse | null = null;
  isEditMode: boolean = false;
  muestraAcciones: boolean = false;

  // 🔹 inyectamos AuthService
  constructor(
    private productosService: ProductosService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.productoForm = this.formBuilder.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.maxLength(30)]],
      descripcion: ['', [Validators.required, Validators.maxLength(150)]],
      precio: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.listarProductos();

    if (this.authService.hasRole(Roles.ADMIN)) {
      this.muestraAcciones = true;
    }
  }

  listarProductos(): void {
    this.productosService.getProductos().subscribe({
      next: resp => {
        this.productos = resp;
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.textoModal = 'Nuevo Producto';
    this.isEditMode = false;
    this.productoForm.reset();
    this.selectedProducto = null;
  }

  resetForm(): void {
    this.productoForm.reset();
    this.showForm = false;
    this.textoModal = 'Nuevo Producto';
    this.isEditMode = false;
    this.selectedProducto = null;
  }

  onSubmit(): void {
    if (this.productoForm.valid) {
      const productoData: ProductoRequest = this.productoForm.value;
      if (this.isEditMode) {
        this.productosService.putProducto(productoData, productoData.id).subscribe({
          next: updatedProducto => {
            const index = this.productos.findIndex(p => p.id === updatedProducto.id);
            if (index !== -1) this.productos[index] = updatedProducto;

            Swal.fire({
              title: 'Producto actualizado',
              text: 'El producto fue actualizado correctamente.',
              icon: 'success'
            });
            this.resetForm();
          }
        });
      } else {
        this.productosService.postProducto(productoData).subscribe({
          next: newProducto => {
            this.productos.push(newProducto);
            Swal.fire({
              title: 'Producto registrado',
              text: 'El producto fue registrado correctamente.',
              icon: 'success'
            });
            this.resetForm();
          }
        });
      }
    }
  }

  editProducto(producto: ProductoResponse): void {
    this.showForm = true;
    this.textoModal = 'Editando Producto ' + producto.nombre;
    this.isEditMode = true;
    this.selectedProducto = producto;
    this.productoForm.patchValue({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock
    });
  }
  cambiarCantidad(delta: number) {
  const control = this.productoForm.get('cantidad');
  let value = control?.value || 1;
  value = Math.max(1, value + delta);
  control?.setValue(value);
}

  deleteProducto(idProducto: number): void {
    Swal.fire({
      title: '¿Estás seguro que deseas eliminar el producto?',
      text: 'Eliminar producto',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    }).then(resp => {
      if (resp.isConfirmed) {
        this.productosService.deleteProducto(idProducto).subscribe({
          next: deletedProducto => {
            this.productos = this.productos.filter(p => p.id !== idProducto);
            Swal.fire({
              title: 'Producto ' + deletedProducto.nombre + ' eliminado.',
              text: 'El producto fue eliminado correctamente.',
              icon: 'success'
            });
          }
        });
      }
    });
  }
}
