# Tournament.js
Javascript library to generate canvas tournament brackets easily with automatic bracket fit

<h1> Welcome to Tournament.js </h1>

<p>This library wants to develop a simply solution for web projects that need Tournaments diagrams deploying it in a few lines, but with the flexibility of customize the visualization and design</p>

<p>Based on HTML5 canvas to generate Graphics and Text. It allows to customize the size and style of each element,implements animations and fit automatically with the brackets.</p>

<p>For the moment the library has only the direct-elimination tournament with 2 ways of visualization:</p>

<ul>
  <li>Normal: Tournament  generates itself from left to right </li>
  <li>Divided: Tournament generates itself from left to a center point (Math.log2(number of participants)) and from right to the same center point.</li>
</ul>

<p>And two types of animation:</p>

<ul>
  <li>FadeOut: A participant appears in the next round from transparency 0 to 1</li>
  <li>ByLetter: A participant appears in the next round letter by letter until its entire name is displayed</li>
</ul>

<p>You can find practical examples and images in "examples" folder with all types of visualization.</p>

<p>Feel free to fork the repository and add new funcionalities to help grow up the library! :) </p>


