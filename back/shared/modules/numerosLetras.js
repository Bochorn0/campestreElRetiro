const PREFIJO_ERROR = "Error: "
const COMA = ","
const MENOS = "-"
const SEPARADOR_SEIS_CIFRAS = " "

// Listas -------------------------------------

const listaUnidades = [ // De 0 a 29
    "cero", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
    "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
    "veinte", "veintiún", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve",
]
const listaDecenas = [
    "", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa",
]
const listaCentenas = [
    "", "cien", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos",
]
const listaOrdenesMillonSingular = [
    "", "millón", "billón", "trillón", "cuatrillón", "quintillón",
    "sextillón", "septillón", "octillón", "nonillón", "decillón",
    "undecillón", "duodecillón", "tridecillón", "cuatridecillón", "quidecillón",
    "sexdecillón", "septidecillón", "octodecillón", "nonidecillón", "vigillón",
]
const listaOrdenesMillonPlural = [
    "", "millones", "billones", "trillones", "cuatrillones", "quintillones",
    "sextillones", "septillones", "octillones", "nonillones", "decillones",
    "undecillones", "duodecillones", "tridecillones", "cuatridecillones", "quidecillones",
    "sexdecillones", "septidecillones", "octodecillones", "nonidecillones", "vigillones",
]

module.exports = class cifrasEnLetra {



    // Principales --------------------------------
    /*
      Convierte a letras los números entre 0 y 29.
      Ejemplo: CifrasEnLetras.convertirUnidades(21,"femenino") --> "veintiuna"
    */
    convertirUnidades (unidades, genero) {
        // with (cifrasEnLetras) {
            if (unidades == 1) {
                if (genero == "masculino") return "uno";
                else if (genero == "femenino") return "una";
            }
            else if (unidades == 21) {
                if (genero == "masculino") return "veintiuno";
                else if (genero == "femenino") return "veintiuna";
            }
            return listaUnidades[unidades];
        // }
    }

    /*
      Convierte a letras las centenas
      Ejemplo: CifrasEnLetras.convertirCentenas(2,"femenino") --> "doscientas"
    */
    convertirCentenas (centenas, genero) {
        // with (cifrasEnLetras) {
            let resultado = listaCentenas[centenas];
            if (genero == "femenino") {
                resultado = this.reemplazar(resultado, "iento", "ienta");
            }
            return resultado;
        // }
    }

    /*
      Primer centenar: del cero al noventa y nueve.
      Ejemplos: CifrasEnLetras.convertirDosCifras(22, "neutro") --> "veintidós"
    */
    convertirDosCifras (cifras, genero) {
        // with (cifrasEnLetras) {
            let unidad = cifras % 10;
            let decena = Math.floor(cifras / 10);
            if (cifras < 30) {
                return this.convertirUnidades(cifras, genero);
            }
            else if (unidad == 0) {
                return listaDecenas[decena];
            }
            else {
                return listaDecenas[decena] + " y " + this.convertirUnidades(unidad, genero);
            }
        // }
    }

    /*
      Primer millar: del cero al novecientos noventa y nueve.
      Ejemplos: ifrasEnLetras.convertirTresCifras(222, "neutro") --> "doscientos veintidós"
    */
    convertirTresCifras (cifras, genero) {
        // with (cifrasEnLetras) {
            let decenas_y_unidades = cifras % 100;
            let centenas = Math.floor(cifras / 100);
            if (cifras < 100) {
                return this.convertirDosCifras(cifras, genero);
            }
            else if (decenas_y_unidades == 0) {
                return this.convertirCentenas(centenas, genero);
            }
            else if (centenas == 1) {
                return "ciento " + this.convertirDosCifras(decenas_y_unidades, genero);
            }
            else {
                return this.convertirCentenas(centenas, genero) + " " +
                this.convertirDosCifras(decenas_y_unidades, genero);
            }
        // }
    }

    /*
      Primer millón: del cero al novecientos noventa y nueve mil novecientos noventa y nueve.
      Ejemplo: CifrasEnLetras.convertirSeisCifras(222222, "neutro") --> "doscientos veintidós mil doscientos veintidós"
     */
    convertirSeisCifras (cifras, genero) {
        // with (cifrasEnLetras) {
            let primerMillar = cifras % 1000;
            let grupoMiles = Math.floor(cifras / 1000);
            let generoMiles = genero == "masculino" ? "neutro" : genero;
            if (grupoMiles == 0) {
                return this.convertirTresCifras(primerMillar, genero);
            }
            else if (grupoMiles == 1) {
                if (primerMillar == 0) return "mil";
                else return "mil " + this.convertirTresCifras(primerMillar, genero);
            }
            else if (primerMillar == 0) {
                return this.convertirTresCifras(grupoMiles, generoMiles) + " mil";
            }
            else {
                return this.convertirTresCifras(grupoMiles, generoMiles) + " mil " +
                this.convertirTresCifras(primerMillar, genero);
            }
        // }
    }

    /*
      Números enteros entre el cero y el novecientos noventa y nueve mil novecientos noventa y nueve vigillones... etc, etc.
      Es decir entre el 0 y el (10^126)-1 o bien números entre 1 y 126 cifras.
      Las cifras por debajo del millón pueden ir en masculino o en femenino.
      Ejemplos:
        CifrasEnLetras.convertirCifrasEnLetras("22222222") --> "veintidós millones doscientos veintidós mil doscientos veintidós"
        CifrasEnLetras.convertirCifrasEnLetras("") --> "No hay ningún número"
        CifrasEnLetras.convertirCifrasEnLetras(CifrasEnLetras.repetir('9',127)) --> "El número es demasiado grande ya que tiene más de 126 cifras"
        CifrasEnLetras.convertirCifrasEnLetras("0x") --> "Uno de los caracteres no es una cifra decimal"
        CifrasEnLetras.convertirCifrasEnLetras(CifrasEnLetras.repetir('9',126)) --> "novecientos noventa y nueve mil novecientos noventa y nueve vigillones..."
        CifrasEnLetras.convertirCifrasEnLetras(10^6) --> "un millón"
        CifrasEnLetras.convertirCifrasEnLetras(10^12) --> "un billón"
        CifrasEnLetras.convertirCifrasEnLetras(10200050) --> "diez millones doscientos mil cincuenta"
        CifrasEnLetras.convertirCifrasEnLetras(10001000) --> "diez millones mil"
        CifrasEnLetras.convertirCifrasEnLetras("1" + CifrasEnLetras.repetir('0',120)) --> "un vigillón"
        CifrasEnLetras.convertirCifrasEnLetras("2" + CifrasEnLetras.repetir('0',18)) --> "dos trillones"
        CifrasEnLetras.convertirCifrasEnLetras("4792347927489", "\n") --> "..."
        CifrasEnLetras.convertirCifrasEnLetrasFemeninas("501") --> "quinientas una"
        CifrasEnLetras.convertirCifrasEnLetrasFemeninas("240021") --> "doscientas cuarenta mil veintiuna"
    */
    convertirCifrasEnLetras (cifras, genero, separadorGruposSeisCifras) {
        // with (cifrasEnLetras) {

            // Predeterminado
            cifras = isNaN(cifras) ? cifras : this.reemplazar(cifras + "", ".", COMA);
            genero = genero || "neutro";
            separadorGruposSeisCifras = separadorGruposSeisCifras || SEPARADOR_SEIS_CIFRAS;

            // Inicialización
            cifras = this.recortar(cifras);
            let numeroCifras = cifras.length;

            // Comprobación
            if (numeroCifras == 0) {
                return PREFIJO_ERROR + "No hay ningún número";
            }
            for (let indiceCifra = 0; indiceCifra < numeroCifras; ++indiceCifra) {
                let cifra = cifras.charAt(indiceCifra);
                let esDecimal = "0123456789".indexOf(cifra) >= 0;
                if (!esDecimal) {
                    return PREFIJO_ERROR + "Uno de los caracteres no es una cifra decimal";
                }
            }
            if (numeroCifras > 126) {
                return PREFIJO_ERROR + "El número es demasiado grande ya que tiene más de 126 cifras";
            }

            // Preparación
            let numeroGruposSeisCifras = Math.floor(numeroCifras / 6) + this.signo(numeroCifras);
            let cerosIzquierda = this.repetir('0', numeroGruposSeisCifras * 6 - numeroCifras);
            cifras = cerosIzquierda + cifras;
            let ordenMillon = numeroGruposSeisCifras - 1;

            // Procesamiento
            let resultado = [];
            for (let indiceGrupo = 0; indiceGrupo < numeroGruposSeisCifras * 6; indiceGrupo += 6) {
                let seisCifras = parseInt(cifras.substring(indiceGrupo, indiceGrupo + 6), 10);
                if (seisCifras != 0) {
                    if (resultado.length > 0) {
                        resultado.push(separadorGruposSeisCifras);
                    }

                    if (ordenMillon == 0) {
                        resultado.push(this.convertirSeisCifras(seisCifras, genero));
                    }
                    else if (seisCifras == 1) {
                        resultado.push("un " + listaOrdenesMillonSingular[ordenMillon]);
                    }
                    else {
                        resultado.push(this.convertirSeisCifras(seisCifras, "neutro") +
                            " " + listaOrdenesMillonPlural[ordenMillon]);
                    }
                }
                ordenMillon--;
            }

            // Finalización
            if (resultado.length == 0) {
                resultado.push(listaUnidades[0]);
            }
            return resultado.join("");
        // }
    }

    convertirCifrasEnLetrasMasculinas (cifras) {
        return this.convertirCifrasEnLetras(cifras, "masculino");
    }

    convertirCifrasEnLetrasFemeninas (cifras) {
        return this.convertirCifrasEnLetras(cifras, "femenino");
    }

    /*
      Expresa un número con decimales y signo en letras
      acompañado del tipo de medida para la parte entera y la parte decimal.
  
      - Los caracteres no numéricos son ignorados.
      - Los múltiplos de millón tienen la preposición "de" antes de la palabra.
      - El género masculino o femenino sólo puede influir en las cifras inferiores al millón
  
      Ejemplos:
        CifrasEnLetras.convertirNumeroEnLetras("-123,45",2) --> "menos ciento veintitrés con cuarenta y cinco"
        CifrasEnLetras.convertirNumeroEnLetras("2.000,25", 3, "kilo",null,null, "gramo") --> "dos mil kilos con doscientos cincuenta gramos"
        CifrasEnLetras.convertirNumeroEnLetras("43,005", 3, "kilómetro",null,null, "metro") --> "cuarenta y tres kilómetros con cinco metros"
        CifrasEnLetras.convertirNumeroEnLetras("1.270,23", 2, "euro",null,null, "céntimo") --> "mil doscientos setenta euros con veintitrés céntimos"
        CifrasEnLetras.convertirNumeroEnLetras("1", 2, "euro",null,null, "céntimo") --> "un euro con cero céntimos"
        CifrasEnLetras.convertirNumeroEnLetras("0,678", 2, "euro", null, null, "céntimo") --> "cero euros con sesenta y siete céntimos"
        CifrasEnLetras.convertirNumeroEnLetras("22.000,55", 0, "euro") --> "veintidós mil euros"
        CifrasEnLetras.convertirNumeroEnLetras("-,889") --> "menos cero con ochocientos ochenta y nueve"
        CifrasEnLetras.convertirNumeroEnLetras("200", 0, "manzana",null,true) --> "doscientas manzanas"
        CifrasEnLetras.convertirNumeroEnLetras("1,5", 2, "peseta",null,true, "céntimo",null,false) --> "una peseta con cincuenta céntimos"
        CifrasEnLetras.convertirNumeroEnLetras("300,56", 3, "segundo",null,false, "milésima",null,true) --> "trescientos segundos con quinientas sesenta milésimas"
        CifrasEnLetras.convertirNumeroEnLetras("21,21",2,"niño",null,false, "niña",null,true) --> "veintiún niños con veintiuna niñas"
        CifrasEnLetras.convertirNumeroEnLetras("1000000", null, "euro") --> "un millón de euros"
        CifrasEnLetras.convertirNumeroEnLetras("200.200.200", null, "persona",null,true) --> "doscientos millones doscientas mil doscientas personas"
        CifrasEnLetras.convertirNumeroEnLetras("221.221.221") --> "doscientos veintiún millones doscientos veintiún mil doscientos veintiuno"
    */
    convertirNumeroEnLetras (cifras, numeroDecimales,
        palabraEntera, palabraEnteraPlural, esFemeninaPalabraEntera,
        palabraDecimal, palabraDecimalPlural, esFemeninaPalabraDecimal) {
        // with (cifrasEnLetras) {
            // Argumentos predeterminados
            cifras = isNaN(cifras) ? cifras : this.reemplazar(cifras + "", ".", COMA);
            numeroDecimales = numeroDecimales === 0 ? 0 : numeroDecimales || -1;
            palabraEntera = palabraEntera || "";
            palabraEnteraPlural = palabraEnteraPlural || palabraEntera + "s";
            esFemeninaPalabraEntera = esFemeninaPalabraEntera || false;
            palabraDecimal = palabraDecimal || "";
            palabraDecimalPlural = palabraDecimalPlural || palabraDecimal + "s";
            esFemeninaPalabraDecimal = esFemeninaPalabraDecimal || false;

            // Limpieza
            cifras = this.dejarSoloCaracteresDeseados(cifras, "0123456789" + COMA + MENOS);

            // Comprobaciones
            let repeticionesMenos = this.numeroRepeticiones(cifras, MENOS);
            let repeticionesComa = this.numeroRepeticiones(cifras, COMA);
            if (repeticionesMenos > 1 || (repeticionesMenos == 1 && !this.empiezaPor(cifras, MENOS))) {
                return PREFIJO_ERROR + "Símbolo negativo incorrecto o demasiados símbolos negativos";
            }
            else if (repeticionesComa > 1) {
                return PREFIJO_ERROR + "Demasiadas comas decimales";
            }

            // Negatividad
            let esNegativo = this.empiezaPor(cifras, MENOS);
            if (esNegativo) cifras = cifras.substring(1);

            // Preparación
            let posicionComa = cifras.indexOf(COMA);
            if (posicionComa == -1) posicionComa = cifras.length;

            let cifrasEntera = cifras.substring(0, posicionComa);
            if (cifrasEntera == "" || cifrasEntera == MENOS) cifrasEntera = "0";
            let cifrasDecimal = cifras.substring(Math.min(posicionComa + 1, cifras.length));

            let esAutomaticoNumeroDecimales = numeroDecimales < 0;
            if (esAutomaticoNumeroDecimales) {
                numeroDecimales = cifrasDecimal.length;
            }
            else {
                cifrasDecimal = cifrasDecimal.substring(0, Math.min(numeroDecimales, cifrasDecimal.length));
                let cerosDerecha = repetir('0', numeroDecimales - cifrasDecimal.length);
                cifrasDecimal = cifrasDecimal + cerosDerecha;
            }

            // Cero
            let esCero = this.dejarSoloCaracteresDeseados(cifrasEntera, "123456789") == "" &&
            this.dejarSoloCaracteresDeseados(cifrasDecimal, "123456789") == "";

            // Procesar
            let resultado = [];

            if (esNegativo && !esCero) resultado.push("menos ");

            let parteEntera = this.procesarEnLetras(cifrasEntera,
                palabraEntera, palabraEnteraPlural, esFemeninaPalabraEntera);
            if (this.empiezaPor(parteEntera, PREFIJO_ERROR)) return parteEntera;
            resultado.push(parteEntera);

            if (cifrasDecimal != "") {
                let parteDecimal = this.procesarEnLetras(cifrasDecimal,
                    palabraDecimal, palabraDecimalPlural, esFemeninaPalabraDecimal);
                if (this.empiezaPor(parteDecimal, PREFIJO_ERROR)) return parteDecimal;
                resultado.push(" con ");
                resultado.push(parteDecimal);
            }

            return resultado.join("");
        // }
    }

    convertirNumeroConParametrosEnLetras (cifras, parametros) {
        parametros = parametros || {};
        return this.convertirNumeroEnLetras(
            cifras,
            parametros.numeroDecimales || -1,

            parametros.palabraEntera || "",
            parametros.palabraEnteraPlural || "",
            parametros.esFemeninaPalabraEntera || false,

            parametros.palabraDecimal || "",
            parametros.palabraDecimalPlural || "",
            parametros.esFemeninaPalabraDecimal || false
        );
    }

    /*
      Convertir euros en letras
  
      Ejemplos:
        CifrasEnLetras.convertirEurosEnLetras("44276598801,2",2) --> "cuatrocientos noventa y ocho mil un euros con veinte céntimos"
        CifrasEnLetras.convertirEurosEnLetras(85009) --> "ochenta y cinco mil nueve euros"
        CifrasEnLetras.convertirEurosEnLetras(10200.35) --> "diez mil doscientos euros con treinta y cinco céntimos"
     */
    convertirEurosEnLetras (cifras, numeroDecimales) {
        numeroDecimales = numeroDecimales === 0 ? 0 : numeroDecimales || 2;
        return this.convertirNumeroEnLetras(cifras, numeroDecimales,
            "euro", "euros", false, "céntimo", "céntimos", false);
    }

    /*
      Separa las cifras en grupos de 6 con subrayados y los grupos de 6 en grupos de 2 con punto
      Ejemplo: CifrasEnLetras.formatearCifras("-4739249,2") --> "-4_739.249,2"
    */
    formatearCifras (cifras, formato) {
        // with (cifrasEnLetras) {
            cifras = cifras + "";
            formato = formato || "";

            cifras = this.dejarSoloCaracteresDeseados(cifras, "0123456789" + COMA + MENOS);
            if (cifras.length == 0) return cifras;

            let esNegativo = this.empiezaPor(cifras, MENOS);
            if (esNegativo) cifras = cifras.substring(1);

            let posicionComa = cifras.indexOf(COMA);
            let esDecimal = posicionComa >= 0;

            if (!esDecimal) posicionComa = cifras.length;
            let cifrasEntera = cifras.substring(0, posicionComa);
            let cifrasDecimal = "";

            if (esDecimal) cifrasDecimal = cifras.substring(Math.min(posicionComa + 1, cifras.length));
            if (cifrasEntera == "") cifrasEntera = "0";

            let resultado = [];
            let numeroCifras = cifrasEntera.length;
            let par = true;
            let contador = 1;

            for (let indice = 0; indice < numeroCifras; indice += 3) {
                let indiceGrupo = numeroCifras - indice;
                let tresCifras = cifras.substring(Math.max(indiceGrupo - 3, 0), indiceGrupo);
                if (indice > 0) {
                    switch (formato) {
                        case 'html': resultado.unshift(par ? "." : '<sub>' + (contador++) + '</sub>'); break;
                        default: resultado.unshift(par ? '.' : '_');
                    }
                    par = !par;
                }
                resultado.unshift(tresCifras);
            }
            if (esNegativo) resultado.unshift(MENOS);
            if (esDecimal) resultado.push(COMA + cifrasDecimal);

            return resultado.join("");
        // }
    }

    //---------------------------------------------
    // FUNCIONES AUXILIARES
    //---------------------------------------------

    /*
      Borra todos los caracteres del texto que no sea alguno de los caracteres deseados.
      Ejemplos:
        CifrasEnLetras.dejarSoloCaracteresDeseados("89.500.400","0123456789") --> "89500400"
        CifrasEnLetras.dejarSoloCaracteresDeseados("ABC-000-123-X-456","0123456789") --> "000123456"
    */
    dejarSoloCaracteresDeseados (texto, caracteresDeseados) {
        let indice = 0;
        let resultado = [];
        for (let indice = 0; indice < texto.length; ++indice) {
            let caracter = texto.charAt(indice);
            if (caracteresDeseados.indexOf(caracter) >= 0) resultado.push(caracter);
        }
        return resultado.join("");
    }

    /*
     Cuenta el número de repeticiones en el texto de los caracteres indicados
     Ejemplo: CifrasEnLetras.numeroRepeticiones("89.500.400","0") --> 4
    */
    numeroRepeticiones (texto, caracteres) {
        let resultado = 0;
        for (let indice = 0; indice < texto.length; ++indice) {
            let caracter = texto.charAt(indice);
            if (caracteres.indexOf(caracter) >= 0) resultado++;
        }
        return resultado;
    }

    /*
      Función auxiliar de "convertirNumeroEnLetras"
      para procesar por separado la parte entera y la parte decimal
    */
    procesarEnLetras (cifras, palabraSingular, palabraPlural, esFemenina) {
        // with (cifrasEnLetras) {
            // Género
            let genero = "neutro";
            if (esFemenina) genero = "femenino";
            else if (palabraSingular == "") genero = "masculino";

            // Letras
            let letras = this.convertirCifrasEnLetras(cifras, genero);
            if (empiezaPor(letras, PREFIJO_ERROR)) return letras;

            // Propiedades
            let esCero = letras == this.convertirUnidades(0, genero) || letras == "";
            let esUno = letras == this.convertirUnidades(1, genero);
            let esMultiploMillon = !esCero && this.acabaPor(cifras, "000000");

            // Palabra
            let palabra = "";
            if (!palabraSingular == "") {
                if (esUno || palabraPlural == "")
                    palabra = palabraSingular;
                else
                    palabra = palabraPlural;
            }

            // Resultado
            let resultado = [];
            resultado.push(letras);
            if (palabra != "") {
                resultado.push(esMultiploMillon ? " de " : " ");
                resultado.push(palabra);
            }
            return resultado.join("");
        // }
    }

    reemplazar (texto, buscado, reemplazo) {
        return texto.split(buscado).join(reemplazo);
        //return texto.replace(new RegExp(buscado, "g"), reemplazo);
    }

    recortar (texto) {
        return texto.toString().replace(/^\s*|\s*$/g, "");
    }

    signo (numero) {
        if (numero > 0) return 1;
        else if (numero < 0) return -1;
        else return 0;
    }

    repetir (texto, veces) {
        return new Array(isNaN(veces) ? 1 : veces + 1).join(texto);
    }

    empiezaPor (texto, prefijo) {
        //return texto.match("^"+prefijo) == prefijo;
        return texto.substr(0, prefijo.length) == prefijo;
    }

    acabaPor (texto, sufijo) {
        //return texto.match(sufijo+"$") == sufijo;
        return texto.substr(texto.length - sufijo.length) == sufijo;
    }

}; // CifrasEnLetras

