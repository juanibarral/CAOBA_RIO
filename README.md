# CAOBA_RIO Wiki
## Prerequisitos ##
* [NodeJS](https://nodejs.org)
* [PostgreSQL](https://www.postgresql.org/)
* [PostGIS Extension](http://postgis.net/)

## Instalación ##
Ingrese a la carpeta src del proyecto
```
> cd src
```
Lance el script de instalación `install.bat` o `install.sh` según su sistema operativo
```
> install.bat
```
Si es necesario, cambie los permisos de ejecución del script
```
> chmod +X install.sh
> ./install.sh
```
Lance el script de gulp para crear la carpeta `dev` del proyecto
```
> gulp generate_dev
```
Instale las librerías en modo producción para hacer las pruebas. Para ello, vaya a la carpeta `dev` anteriormente creada y corra el script `install.bat` o `install.sh` dependiendo de su sistema operativo. (Recuerde cambiar los permisos de ejecución de ser necesario)
```
> cd ../dev
> install.bat
```

Este proceso instalará todas las librerías tanto para el proceso de desarrollo como para el deployment de prueba.

Para correr el proyecto, dentro de la carpeta dev lance el script `run.bat` o `run.sh` según sea el caso (Recuerde cambiar los permisos de ejecución de ser necesario). Abra un explorador e ingrese a la dirección: [http://localhost:3000](http://localhost:3000). Aparecerá una ventana de autenticación donde debe utilizar las credenciales test, test para ingresar a la aplicación.


