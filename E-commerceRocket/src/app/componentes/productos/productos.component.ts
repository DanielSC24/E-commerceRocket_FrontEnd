import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoResponse } from '../../models/producto.response.model';
import { ProductosService } from '../../service/productos.service';
import { ProductoRequest } from '../../models/producto.request.model';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-productos',
  standalone: false,
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent {

  productos: ProductoResponse[] = [];
  showForm: boolean = false;
  productoForm: FormGroup;
  textoModal: string = 'Nuevo Producto';
  selectedProducto: ProductoResponse | null = null;
  isEditMode: boolean = false;
  muestraAcciones: boolean = false;

  constructor(private productosService: ProductosService, private formBuilder: FormBuilder){
    this.productoForm = this.formBuilder.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.maxLength(30)] ],
      descripcion: ['', [Validators.required, Validators.maxLength(150)] ],
      precio: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.listarProductos();
    // this.listarProveedores();
    // this.listarCategorias();
    // if (this.authService.hasRole(Roles.ADMIN)) {
    //   this.muestraAcciones = true;
    // }
  }

   listarProductos(): void {
     this.productosService.getProductos().subscribe({
      next: resp => {
         this.productos = resp;
      }
     });
    }

  // listarProveedores(): void {
  //   this.proveedoresService.getProveedores().subscribe({
  //     next: resp => {
  //       this.proveedores = resp;
  //     }
  //   });
  // }

  // listarCategorias(): void {
  //   this.categoriaService.getCategorias().subscribe({
  //     next: resp => {
  //       this.categorias = resp;
  //     }
  //   });
  // }

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
      // productoData.idCategoria = this.productoForm.value.categoria;
      // productoData.idProveedores = this.productoForm.value.proveedores;
      console.log(productoData);
      if (this.isEditMode) {
        this.productosService.putProducto(productoData, productoData.id).subscribe({
          next: updatedProducto => {
            const index = this.productos.findIndex(p => p.id === updatedProducto.id);
            if (index !== -1) {
              this.productos[index] = updatedProducto;
            }
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
      //categoria: this.categorias.find(c => c.nombre === producto.categoria)?.id,
      //proveedores: this.proveedores
        //.filter(p => producto.proveedores.includes(p.nombre))
      //  .map(p => p.id)
    });
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
