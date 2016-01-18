var xTuilesElement = {
    content: function () {/*
        <style>
            .counter-container {
                position: relative;
                height: 25px;
                margin: 5px;
            }
            .sample {
                position: relative;
                width: 60%;
                height: 16px;
                border: 1px solid black;
                border-radius: 5px;
                float: left;
            }
            .counter {
                position: relative;
                width: 25%;
                height: 20px;
                float: right;
            }
            .carre {
                transform-origin: 50% 50%;
                transform: rotate(45deg);
            }
            .container-echantillon:hover, .selected {
                background-color: white;
            }
            .echantillon {
                position: absolute;
                top: 3px;
                left: 5px;
                bottom: 3px;
                right: 5px;
            }
            .compteur {
                text-align: center;
                height: 30px; 
                padding: 5px;
            }
            #canvas {
                position:relative;
                width: 100%;
                height: calc(100% - 60px);
            }
            #header {
                position: relative;
                height: 30px;
                background-color: grey;
            }
            #footer {
                position: relative;
                height: 30px;
                background-color: grey;
            }
            #conteneur-menu {
                position: absolute;
                left: 5px;
                top: 5px;
                bottom: 0px;
                width: 30px;
            }
            #hauteur, #largeur {
                width: 30px;
                border-radius: 5px;
            }
            #conteneur-export {
                position: absolute;
                right: 5px;
                top: 8px;
                width: 30px;
            }
            #conteneur-final {
                position: absolute;
                right: 35px;
                top: 8px;
                width: 30px;
            }
            #conteneur-pdf {
                position: absolute;
                right: 65px;
                top: 6px;
                width: 30px;
            }
            #conteneur-import {
                position: absolute;
                right: 95px;
                top: 6px;
                width: 30px;
            }
            .fa-bars, .fa-arrows-v, .fa-arrows-h, .fa-download, .fa-upload, .fa-check, .fa-file-pdf-o {
              color: white;
            }
            #popup-menu {
                position: absolute;
                top: 0px;
                left: 0px;
                width: 100px;
                height: 100px;
            }
            #conteneur {
                position: absolute;
                left: 0px;
                top: 0px;
                bottom: 0px;
                right: 0px;
                transition: left 1s ease;
            }
            #menu {
                position: absolute;
                left: -150px;
                top: 0px;
                bottom: 0px;
                width: 0px;
                background-color: grey;
                overflow: auto;
                transition: left 1s ease;
            }
            .dropdown {
                position: relative;
                display: block;
                color: white;
                background: #2980B9;
                -moz-box-shadow: 0 1px 0 #409ad5 inset, 0 -1px 0 #20638f inset;
                -webkit-box-shadow: 0 1px 0 #409ad5 inset, 0 -1px 0 #20638f inset;
                box-shadow: 0 1px 0 #409ad5 inset, 0 -1px 0 #20638f inset;
                text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.3);
                padding: 10px;
            }
            .dropdown [data-toggle="dropdown"]:hover {
                  background: #2c89c6;
            }
            ul {
                padding: 0px;
                margin: 0px;
                list-style-type: none;
            }
        </style>
        <div id="menu">
            <ul>
                <li class="dropdown">
                    <div style="width: 20px; margin: 0 auto;"><i class="fa fa-paint-brush"></i></div>
                    <ul id="counter-container" class="dropdown-menu"></ul>
                </li>
                <li class="dropdown">
                    <div style="width: 20px; margin: 0 auto;"><i class="fa fa-arrows-alt"></i></div>
                    <ul id="counter-container" class="dropdown-menu">
                        <li style="height: 25px; padding: 5px;">
                            <label for="hauteur"><i class="fa fa-lg fa-arrows-v"></i></label>
                            <input type="number" id="hauteur" value="2">
                        </li> 
                        <li style="height: 25px; padding: 5px;">
                            <label for="largeur"><i class="fa fa-lg fa-arrows-h"></i></label>
                            <input type="number" id="largeur" value="13">
                        </li> 
                    </ul>
                </li>
                <li class="dropdown">
                    <div style="width: 20px; margin: 0 auto;"><i class="fa fa-floppy-o"></i></div>
                    <ul id="counter-container" class="dropdown-menu"></ul>
                </li>
            </ul>
        </div>
        <div id="conteneur">
            <div id="header">
                <div id="conteneur-menu"><i id="bouton-menu" class="fa fa-lg fa-bars"></i></div>
                <div id="conteneur-import"><i id="import" class="fa fa-lg fa-upload"></i></div>
                <div id="conteneur-pdf"><i id="pdf" class="fa fa-lg fa-file-pdf-o"></i></div>
                <div id="conteneur-final"><i id="final" class="fa fa-lg fa-check"></i></div>
                <div id="conteneur-export"><i id="export" class="fa fa-lg fa-download"></i></div>
            </div>
            <div id="canvas"></div>
            <div id="footer"></div>
        </div>
    */
    }
};
