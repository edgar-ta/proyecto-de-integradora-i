# proyecto-de-integradora-i

Este es un proyecto elaborado para la clase de Integradora I de la Universidad Tecnológica de San Juan del Río.

En los archivos de este repositorio se encuentra una aplicación web que simula un sitio que promueve el reciclado de plástico, por medio de, entre otras cosas, una plataforma de compra-venta de máquinas de fibra de plástico, un feed con contenido relacionado al cuidado del medio ambiente y un apartado de inicio de sesión.

## Ejecución

La página se corre con el siguiente comando:

```
nodemon --signal SIGINT app.js
```

Para generar el CSS con Tailwind se corre este comando:

```
npx tailwindcss -i ./css/input.css -o ./css/output.css --watch
```
