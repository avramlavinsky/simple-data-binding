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
<em>Simple Data Binding offers two-way data-binding à la carte </em> but can still offers all the tools required to render the most complex dynamic pages:  templates, watches, attribute-based methods (directives), and much more.
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
Under the hood, SimpleDataBinding relies on the MutationObserver API (Supported in all major modern browsers and IE >= 11) combined with data attributes.  A new SimpleDataBinding instance receives a container and a data object as arguments. All prmimitives in the data object are treated as strings and stored in the dataset DomStringMap property of the container element, and the instance's data property is a pointer to that dataset.  Therefore any changes to the instance's data property automatically change the data attribute of the container, and these changes are captured by a MutationObserver.  In this way, any part of the DOM which references a data property via double curley braces or the supplied value of a "directive" (a method dictated by an expando attribute) can be synchronized when the value of the corresponding data property changes.
</p>

<p>
Nested objects in the supplied data argument to the binding instance will be matched to child elements of the container element with a databind property matching the property name of that nested object.  A child binding instance will be created.  It's container will be the corresponding child element, and all primitives within that nested data object will be placed in that instances data property, a pointer to the dataset DOMStringMap of the new container. 
</p>

<p>
Nested arrays in the supplied data argument passed to a binding instance will create an array of child bindings.  The property name of the array value will be matched to a databind property of an element within the parent binding's container.  That element will be duplicated for each member of the array, each becoming a new binding instance's container.  If the array contains objects, those objects will be the initial data argument for the new binding instance.  If the array contains primitives, they will be interpretted as objects with a single propery named "value", and the value of that property will be the string value of the primitive.  SimpleDataBinding requires no repeat directives because all repetition is dictated by the form of the data supplied.
</p>
