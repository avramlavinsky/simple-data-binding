# simple-data-binding
<strong>Light-weight, stand-alone, incredibly simple utility for two-way data binding.</strong>

<em>Frameworks are fine, but sometimes when you have a nail to drive in, you just want a hammer, not an aircraft carrier.</em>
<p>
Two-way data-binding is a powerful tool.  Ideally, it can eliminate direct DOM references entirely, leading to script which is concise, well organized, and in sync with server-side code.
</p>
<p>
Two-way data-binding has been a key selling point for many JavaScript frameworks, but it shouldn't be sole justification for adopting a framework. Frameworks have their costs.  They are increasingly complex, short-lived, and weighty.
</p>
<p>
<em>Simple Data Binding offers two-way data-binding à la carte </em> but still offers all the tools required to render complex dynamic pages:  templates, watches, attribute-based methods (directives), and much more.
</p>
<p>
<strong>Check out the <a href="https://avramlavinsky.github.io/simple-data-binding/examples/examples.html">CODEPEN examples</a> and <a href="https://avramlavinsky.github.io/simple-data-binding/docs/guide.html">user's guide</a>.</strong>
</p>

<h2>Objectives:</h2>

<ul>
  <li>
  <strong>Dependency-free</strong> – Built in vanilla JavaScript. 
  </li>
  <li>
  <strong>Straightforward timing mechanisms</strong> – No polling, no intervals. 
  </li>
  <li>
  <strong>Light-weight</strong> – Currently weighing in at 11.4kb (3.8kb zipped) for the full version with live arrays.
  </li>
  <li>
  <strong>Jargon-free</strong> – Simple, meaningful method and property names that don't feel like learning a foreign language. 
  </li>
  <li>
  <strong>Intuitive</strong> – Geared towards rapid time to market.  A learning curve that feels comfortable in minutes, not months. 
  </li>
  <li>
  <strong>Powerful</strong> – Geared towards advanced form field operations like dynamic options and question branching.
  </li>
  <li>
  <strong>Scaleable</strong> – Performant under conditions that exceed the upper limits of reasonable DOM size and complexity.
  </li>
  <li>
  <strong>Extensible</strong> – Create your own templates, watches and attribute based methods easily for unique data-binding needs and beyond.
  </li>
</ul>


<h2>How it Works</h2>

<p>
Under the hood, SimpleDataBinding relies on the MutationObserver API (Supported in all major modern browsers and IE >= 11) combined with data attributes.  A new SimpleDataBinding instance receives a container and a data object as arguments. All prmimitives in the data object are treated as strings and stored in the dataset DomStringMap property of the container element, and the instance's data property is a pointer to that dataset.  Therefore any changes to the instance's data property automatically change the data attribute of the container, and these changes are captured by a MutationObserver.  In this way, any part of the DOM which references a data property via double curley braces or the supplied value of a "directive" (a method dictated by an expando attribute) can be synchronized when the value of the corresponding data property changes.  Delegated listeners capture changes to control values within the container and update data to complete two way binding.
</p>


<h2>Key Concepts</h2>

<ul>
  <li>The most important properties of a binding instance are its <a href="https://avramlavinsky.github.io/simple-data-binding/docs/guide.html#Properties-container">container</a> and its <a href="https://avramlavinsky.github.io/simple-data-binding/docs/guide.html#Properties-data">data</a>.</li>
  <li><code>myBinding.container</code>is a DOM element which will be parsed and synchronized with data.</li>
  <li><code>myBinding.data</code>is a DOMStringMap with values to synchronize to.  It is flat, and all properties are strings.</li>
  <li>Controls within a container are <a href="https://avramlavinsky.github.io/simple-data-binding/examples/examples.html"> automatically synchronized with data properties corresponding to their name attributres</a>, and their initial values are captured in data.</li>
  <li>If the initial data argument supplied to a binding instance contains nested objects, <a href="https://avramlavinsky.github.io/simple-data-binding/examples/examples.html?page=2">they spawn new bindings</a>.</li>
  <li>If the initial data argument supplied to a binding instance contains nested arrays, <a href="https://avramlavinsky.github.io/simple-data-binding/examples/examples.html?page=3">they spawn arrays of new bindings</a>.</li>
  <li>SimpleDataBinding requires no repeat methods, because repeition is dictated by arrays in the initial data argument.</li>
  <li>SimpleDataBinding requires no specific methods to dynamically control CSS because all data values are accessible in CSS as data attributes.</li>
</ul>
