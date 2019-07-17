import { firebaseConfig } from "./variables.js";


// let script = document.createElement("script");
// script.setAttribute("src","https://www.gstatic.com/firebasejs/6.3.0/firebase-app.js");
// document.querySelector("body").prepend(script);

window.onload = () => {




    // Iniciando la configuración de firebase con nuestra aplicación
    firebase.initializeApp(firebaseConfig);

    if (location.href.indexOf("index") >= 0) {
        // estamos en index.html
        $.notify("estamos en index.html", "info");

        let iniciarSesionFacebook = (e)=>{
            e.preventDefault();
            var provider = new firebase.auth.FacebookAuthProvider();
            provider.addScope('user_birthday');
            firebase.auth().signInWithPopup(provider).then(function(result) {
                // This gives you a Facebook Access Token. You can use it to access the Facebook API.
                var token = result.credential.accessToken;
                // The signed-in user info.
                var user = result.user;
                // ...
              }).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
                // ...
                console.log(error);
                
              });
        }

        let iniciarSesionGoogle = (e)=>{
            e.preventDefault();
            var provider = new firebase.auth.GoogleAuthProvider();

            firebase.auth().signInWithPopup(provider).then(function(result) {
                // This gives you a Google Access Token. You can use it to access the Google API.
                var token = result.credential.accessToken;
                // The signed-in user info.
                var user = result.user;
                // ...
              }).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
                console.log(error.message);
                
              });

        }
        
        let cerrarSesion = (e)=>{
            e.preventDefault();
            firebase.auth().signOut().then(()=>{
                $.notify("Cerró Sesion =)","success");
            })
        }

        let escucharCambioSesion = ()=>{
            firebase.auth().onAuthStateChanged(function (user) {
                if (user) {
                    // User is signed in.
                    var displayName = user.displayName;
                    var email = user.email;
                    var emailVerified = user.emailVerified;
                    var photoURL = user.photoURL;
                    var isAnonymous = user.isAnonymous;
                    var uid = user.uid;
                    var providerData = user.providerData;
                    console.log(uid);
                    console.log(user);
                    
                    $("#btnCerrarSesion").removeAttr("hidden");
                    $("#btnIniciarSesion").attr("hidden",true);
                    
                } else {
                    // User is signed out.
                    // ...
                    console.log("No hay sesion iniciada");
                    $("#btnIniciarSesion").removeAttr("hidden");
                    $("#btnCerrarSesion").attr("hidden",true);
                    
                    
                }
            });
        }
        
        let iniciarSesion = (e) => {
            e.preventDefault();
            firebase.auth().signInWithEmailAndPassword($("#inputEmail").val().trim(), $("#inputPassword").val().trim()).catch(function (error) {
                console.log(error);
            });
        }
        
        $("#btnIniciarSesion").click(iniciarSesion);
        $("#btnCerrarSesion").click(cerrarSesion);
        $("#btnIniciarSesionGoogle").click(iniciarSesionGoogle);
        $("#btnIniciarSesionFacebook").click(iniciarSesionFacebook);

        escucharCambioSesion();
        
    }
    if (location.href.indexOf("platos") >= 0) {
        $('input[type="range"]').rangeslider({

            // Feature detection the default is `true`.
            // Set this to `false` if you want to use
            // the polyfill also in Browsers which support
            // the native <input type="range"> element.
            polyfill: true,

            // Default CSS classes
            rangeClass: 'rangeslider',
            disabledClass: 'rangeslider--disabled',
            horizontalClass: 'rangeslider--horizontal',
            verticalClass: 'rangeslider--vertical',
            fillClass: 'rangeslider__fill',
            handleClass: 'rangeslider__handle',

            // Callback function
            onInit: function () { },

            // Callback function
            onSlide: function (position, value) { },

            // Callback function
            onSlideEnd: function (position, value) { }
        });
        // Creando una referencia inicial al nodo "platos"
        let refPlatos = firebase.database().ref("platos");
        /**
         * Funcion para crear un registro en la DB de firebase
         */
        let createPlato = () => {

            /**
             * 1. obtener una nueva clave o primary para el 
             * registro que se va a insertar
             */
            let key = refPlatos.push().key;
            /**
             * 2. Referenciar al nodo que lleva por nombre
             * la clave generada en el paso 1
             */
            let referenciaKey = refPlatos.child(key);
            /**
             * 3. Asignar atributos al nodo referenciado en 
             * el paso [2] a partir del metodo "set()"
             */
            referenciaKey.set({
                nombre: $("#inputNombre").val().trim(),
                calorias: $("#inputCalorias").val(),
                origen: $("#inputOrigen").val(),
                descripcion: $("#inputDescripcion").val()
            }).then(() => {
                $.notify("Plato creado correctamente", "success");
                $("#modalCrearPlato").modal("hide");
            }).catch(error => {
                $.notify("Error al crear el plato", "danger");
                console.log(error);
            });

        }

        // configurando click al boton de agregar plato
        // para aparecer modal
        $("#btnCrearPlato").click(() => {
            $("#modalCrearPlato").modal("show")
        });

        // asignando evento click al boton para crear un registro en firebase
        $("#btnGuardarPlato").click(createPlato);

        // estamos en platos.html
        $.notify("estamos en platos.html", "info");

        let renderizarPlatos = (dataSnapshot) => {
            /**
             * 1. limpiar el conteneder de cards (main)
             */
            $("main").html("");
            /**
             * 2. crear una variable string que guardara
             * la estructura del contenido de main (cards)
             */
            let contenido = "";
            contenido += `<div class="card-columns">`;
            dataSnapshot.forEach(plato => {
                contenido += `<div class="card">
                                <div class="card-body">
                                <h5 class="card-title">${plato.val().nombre}</h5>
                                <p class="card-text">${plato.val().descripcion}</p>
                                </div>
                            </div>`;
            });
            contenido += `</div>`;
            $("main").html(contenido);
        }

        let getPlatos = () => {
            $("main").html(`<div class="text-center">
                                <div class="spinner-border" role="status">
                                <span class="sr-only">Loading...</span>
                                </div>
                            </div>`);
            // Inicializar la base de datos en tiempo real
            // creando una referencia al nodo principal
            // database() => funcion disponible con el script de database firebase
            refPlatos.on("value", dataSnapshot => {
                // FORMA 1 PARA CONSUMIR LOS DATOS de dataSnapshot
                // let data = dataSnapshot.val();
                // for (const clave in data) {
                //     console.log(clave);
                //     console.log(data[clave].calorias);
                //     console.log(data[clave].origen);
                // }
                // FORMA 2 PARA CONSUMIR LOS DATOS de dataSnapshot
                // dataSnapshot.forEach(plato => {
                //     console.log(plato.key);
                //     console.log(plato.val().calorias);
                //     console.log(plato.val().origen);
                // });
                renderizarPlatos(dataSnapshot);
            });

        }

        getPlatos();

    }
}










