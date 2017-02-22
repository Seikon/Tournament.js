# Tournament.js
Librería de javascript para generar cuadros de torneo en canvas, con ajuste de diagramas automático.

Documentación en español para mejorar su difusión.

<h1>Bienvenido a Tournament.js </h1>

<p>Esta libreria pretende desarrollar una solución simple para las aplicaciones web que necesiten desplegar diagramas de torneo en unas pocas lineas, pero con la flexibilidad de personalizar la visualización y el contenido del mismo</p>

<p>Basada en canvas e HTML5 para generar graficos y texto, permite personalizar el estilo de cada elemento (altura y anchura de las celdas, estilo de bordes, fondo...) y acoplarlo todo con un ajuste automático con las ramas de cada ronda</p>

<p>Por el momento la libreria implementa solo la eliminación directa(Play-off) con 2 tipos de visualización:</p>

<ul>
  <li>Normal: El torneo se genera empezando por la izquierda del canvas hasta la derecha</li>
  <li>Divided: El torneo se genera desde la izquierda hasta el punto central de la ronda (Math.log2(numero de participantes)) y desde la derecha hasta el mismo punto central</li>
</ul>

<p>y Dos tipos de animación:</p>

<ul>
  <li>FadeOut: Un participante pasa de ronda de manera que va apareciendo en la casilla de una transparencía de cero a uno </li>
  <li>ByLetter: Un participante pasa de ronda de manera que cada una de sus letras van apareciendo poco a poco</li>
</ul>

<p>Callbacks personalizados para cuando un participante gana el toreno.</p>

<p>Puedes encontrar ejemplos practios e imagenes en la carpeta "examples" con todos los tipos de visualización</p>

<p>Sientete libre de pinchar el repositorio y añadir nuevas funcionalidades para ayudar a crecer la libreria :)</p>
