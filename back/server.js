var express = require('express');
var app = express()
const api_catalogos = require('./api/api_catalogos/app');
const api_gastos = require('./api/api_gastos/app');
const api_usuarios = require('./api/api_usuarios/app');
const api_reportes =  require('./api/api_reportes/app');
const api_ventas = require('./api/api_ventas/app');
var cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./shared/config/config.json');


app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use('/catalogos', api_catalogos);
app.use('/gastos', api_gastos);
app.use('/usuarios', api_usuarios);
app.use('/reportes', api_reportes);
app.use('/ingresos', api_ventas);
/* Error routes invalid */
/*app.get('/', function (req, res) {
    res.send('Hello World')
  })*/
app.get('*', (req, res) => {
    reference = req.url;
    metodo = req.method + ': ';
    res.status(404).send({ "error": metodo + reference, errorMessage: 'No se encontró la ruta solicitada' });
});

app.post('*', (req, res) => {
    reference = req.url;
    metodo = req.method + ': ';
    res.status(404).send({ "error": metodo + reference, errorMessage: 'No se encontró la ruta solicitada' });
    res.end();
});
app.listen(config.PORT);
console.log('Corriendo en el puerto: ', config.PORT);
