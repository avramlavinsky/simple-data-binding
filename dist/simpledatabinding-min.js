!function(){function e(t,n,r,a){var o=this;this.set=function(e,t,n,r){var a,i=o;for(e=toPrefixedCamel(e),r=r||"data",a=o.data[e];void 0===a&&n!==!1&&i.parent;)i=i.parent,a=i[r][e];return void 0===a?o[r][toPrefixedCamel(e)]=t:i[r][toPrefixedCamel(e)]=t,o[r][e]},this.get=function(e,t,n){var r,a=o;for(e=toPrefixedCamel(e),n=n||"data",r=o[n][e];void 0===r&&t!==!1&&a.parent;)a=a.parent,r=a[n][e];return r},this.update=function(e,t,n){var r,a;t||y();for(var i in e)"object"==typeof e[i]?(r=o.childArrays[i]&&o.childArrays[i].elementTemplate||o.container.querySelector("["+toPrefixedHyphenated("databind")+'="'+i+'"]'),e[i]instanceof Array&&r?o.updateChildArray(i,r,e,n):o.createChild(i,r,e[i])):(a=e[i],i=toPrefixedCamel(i),o.root.lastMutation={value:a,oldValue:o.get(i),prop:i},o.set(i,a),o.checkWatches(i));return o.parseNode(o.container),o.checkWatches("*",!1),o.root.initialized&&g(),o.data};this.createChildArrayMember=function(e,t,n,r){var a=i(e,t),d=l(n||e.elementTemplate,r||e.placeholder),c=o.createChild(a,d,t);return c.containingArray=e,c};var i=function(e,t){var n=t.name||t.id||t.value;return n&&!o.children[n]||(n=(n||e.key)+e.idIndex,e.idIndex++),n},d=Object.assign||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);return e};this.createChild=function(t,n,r){return o.children[t]=new e(n,r,o.configs,o),o.children[t]},this.export=function(e){var t=d({},o.data);e&&(t=unprefixData(t));for(var n in o.children)o.hasOwnProperty(n)&&(t[n]=o.children[n].export());return t};var c=function(e,t){var n=e.matches||e.matchesSelector||e.msMatchesSelector||e.mozMatchesSelector||e.webkitMatchesSelector||e.oMatchesSelector;if(n)return n.call(e,t);for(var r=e.parentNode.querySelectorAll(t),a=r.length;a--;)if(r[a]===e)return!0;return!1},l=function(e,t){var n=e.cloneNode(!0);return t.parentNode.insertBefore(n,t),n},u=function(e){var t;return"radio"===e.type?e.checked&&(t=e.value):"checkbox"===e.type?(t=o.get(e.name,!0),t=void 0!==t?t.split(o.checkboxDataDelimiter):[],e.checked?t.push(e.value):t.splice(t.indexOf(e.value),1),t=t.join(o.delimiter)):"OPTION"===e.tagName?(t=o.get(e.name,!0),t=void 0!==t?t.split(o.checkboxDataDelimiter):[],e.selected?t.push(e.value):t.splice(t.indexOf(e.value),1),t=t.join(o.delimiter)):t=e.value,t},s=function(){function e(e){if("undefined"!==e.name&&"radio"!==e.type&&"checkbox"!==e.type&&"OPTION"!==e.tagName){var t=e.getAttribute("value");t&&"{{"!==t.substr(0,2)&&o.set(e.name,u(e))}}var t,n="[name]";if("form"===o.container.tagName)for(var r in o.container.elements)o.container.elements.hasOwnProperty(r)&&e(o.container.elements[r]);else{t=Array.prototype.slice.call(o.container.querySelectorAll(n)),c(o.container,n)&&t.push(o.container);for(var a=0,i=t.length;a<i;a++)e(t[a])}return o.data};this.surroundByComments=function(e,t,n,r){return e.placeholder||(e.elementTemplate=n,e.placeholder=document.createComment("end "+t),n.placeholder=e.placeholder,n.parentNode.insertBefore(document.createComment("start "+t),n),n.nextElementSibling?n.parentNode.insertBefore(e.placeholder,n.nextElementSibling):n.parentNode.appendChild(e.placeholder),r||n.parentNode.removeChild(n)),e.placeholder},this.removeCommentedElements=function(e,t,n){for(;e.previousSibling&&8!==e.previousSibling.nodeType;)1===e.previousSibling.nodeType&&e.previousSibling.getAttribute(t)===n?e.parentNode.removeChild(e.previousSibling):e=e.previousSibling;return e},this.parseNode=function(e){var t;if(e.parsed)return!1;if(3===e.nodeType)f(e);else if(1===e.nodeType){for(t=0;t<e.attributes.length;t++)p(e.attributes[t]);for(t=0;t<e.childNodes.length;t++)e.childNodes[t].hasAttribute&&e.childNodes[t].hasAttribute("databind")||o.parseNode(e.childNodes[t])}return e.parsed=!0,e};var p=function(e){if("data-"!==e.nodeName.substr(0,5))return h(e),m(e),e},h=function(e){var t,n;return void 0===e.boundAttrNameProp&&("__"===e.nodeName.substr(-2,2)?(t=toPrefixedCamel(e.nodeName.slice(2,-2)),t&&(e.boundAttrNameProp=t,o.addWatch(e.boundAttrNameProp,e))):e.boundAttrNameProp=null),e.boundAttrNameProp&&(n=o.get(e.boundAttrNameProp,!0),n?(e.boundAttrName=n,setTimeout(function(){e.ownerElement.setAttribute(n,e.nodeValue)})):e.boundAttrName&&e.ownerElement.removeAttribute(e.boundAttrName)),e},m=function(e){var t,n,r=e.nodeName,a=o.attrMethods[r];return f(e,e.nodeValue),t=e.value||e.ownerElement[e.name],n=t||"*","value"!==r||"radio"!==e.ownerElement.type&&"checkbox"!==e.ownerElement.type&&"OPTION"!==e.ownerElement.tagName||o.setNodeValue(e.ownerElement,e.ownerElement.getAttribute("name"),"name"),a&&(o.addWatch(toPrefixedCamel(n),e),a.apply(o,[e.ownerElement,e.nodeValue,e.nodeName,o.get(e.nodeValue)])),e},f=function(e,t){if(!e)return"";var n=void 0===e.nodeTemplate;return n&&(t=t||e.nodeValue,"string"==typeof t&&t.indexOf("{{")!==-1?e.nodeTemplate=t:e.nodeTemplate=null),e.nodeTemplate&&(e.nodeValue=e.nodeTemplate.replace(/{{(.*?)}}/g,function(t){var r=toPrefixedCamel(t.slice(2,-2)),a=o.get(r,!0)||"";return n&&o.addWatch(r,e),"name"===e.nodeName&&a&&o.addWatch(a,e),a})),e.nodeValue};this.childTemplate=function(e,t,n,r){var a;return r&&(o.templates[r]=o.templates[r]||document.getElementById(r),o.templates[r]&&(a=o.templates[r].cloneNode(!0),a.removeAttribute("id"),e.appendChild(a),this.parseNode(a),this.childFromTemplate=a)),e},this.renderIf=function(e,t,n,r){return this.surroundByComments(e,"render if "+t,e,!0),r&&!e.parentElement?e.placeholder.parentNode.insertBefore(e,e.placeholder):!r&&e.parentElement&&e.parentElement.removeChild(e),e},this.setNodeValue=function(e,t,n){var r=o.get(t,!0);return void 0!==r&&("radio"===e.type&&"name"===n?e.checked=r===e.value:"checkbox"===e.type&&"name"===n?e.checked=r.indexOf(e.value)!==-1:"SELECT"!==e.tagName||r?"OPTION"===e.tagName&&"value"===n?e.selected=(o.get(e.parentElement.name)||"").indexOf(e.value)!==-1:e.value=r:setTimeout(function(){e.selectedIndex="-1"},0)),e};var v=function(e){return o.observer=new MutationObserver(N),o.container.addEventListener("change",A),e!==!1&&o.container.addEventListener("keyup",x),o},g=function(){return o.observer&&o.observer.observe(o.container,{attributes:!0,attributeOldValue:!0}),o.observer},b=function(){g();for(var e in o.children)o.children.hasOwnProperty(e)&&o.children[e].turnOnAllBindings();return o},y=function(){return o.observer&&o.observer.disconnect(),o.observer},N=function(e){return e.forEach(function(e){if(e.target===(o.boundHiddenInput||o.container)){var t,n="data-",r=e.target.getAttribute(e.attributeName);e.attributeName.substr(0,n.length)===n&&r!==e.oldValue&&(t=toCamelCase(e.attributeName.substr(n.length)),o.root.lastMutation={prop:t,value:r,oldValue:e.oldValue},o.checkWatches(t),o.checkWatches("*"))}}),e},x=function(e){var t=document.createEvent("HTMLEvents");return t.initEvent("change",!0,!1),e.target.dispatchEvent(t),t},A=function(e){var t=u(e.target),n=e.target.name;return e.stopPropagation(),!o.containingArray||void 0===o.parent.get(n)||"radio"!==e.target.type&&"checkbox"!==e.target.type?o.set(n,t):o.parent.set(n,t)};this.watch=function(e,t,n){var r,a=["*"];"function"==typeof e?(n=t,t=e,e=a):"string"==typeof e&&(e=[e]),e=e||a,r=n?o.root:o;for(var i=0,d=e.length;i<d;i++)r.addWatch(e[i],{fn:t,props:e},n);return r[n?"globalScopeWatches":"watches"]},this.addWatch=function(e,t,n){var r=n?"globalScopeWatches":"watches",a=n?o.root:o;return a[r][e]=a[r][e]||[],a[r][e].indexOf(t)===-1&&a[r][e].push(t),t},this.checkWatches=function(e,t){function n(e,t){var n,r=t?o.root:o,a=t?"globalScopeWatches":"watches",i=r[a][e];if(i)for(var d=i.length-1;d>=0;d--)i[d].fn?P(i[d],e):(n=i[d],2===n.nodeType?p(n):f(n))}if(o.watches[e]&&(n(e,!1),n("*",!1),o.root.globalScopeWatches[e]&&n(e,!0),o.root.globalScopeWatches["*"]&&n("*",!0)),t!==!1)for(var r in o.children)o.children.hasOwnProperty(r)&&o.children[r].checkWatches(e);return e};var P=function(e){var t=o.root.lastMutation,n=[t.value,t.oldValue,t.prop],r={};if(void 0!==o.get(t.prop)||!e.recursive){if("*"!==e.props[0]){for(var a=0,i=e.props.length;a<i;a++)r[e.props[a]]=o.get(e.props[a]);n.push(r)}return e.fn.apply(o,n)}},S=function(){return o.configs=r||{},o.nameSpace="string"==typeof o.configs.nameSpace?o.configs.nameSpace:"",o.attrPrefix="string"==typeof o.configs.attrPrefix?o.configs.attrPrefix:"",o.container=t&&t.tagName?t:document.querySelector(t||"["+toPrefixedHyphenated("databind")+"]")||document.forms[0]||document.body,o.configs.containInHiddenInput&&(o.boundHiddenInput=document.createElement("input"),o.boundHiddenInput.type="hidden",o.container.appendChild(o.boundHiddenInput)),o.container.getAttribute("databind")||o.container.setAttribute("databind",""),o.watches=o.configs.watches||{},o.globalScopeWatches=o.configs.globalScopeWatches||{},o.checkboxDataDelimiter=o.configs.checkboxDataDelimiter||",",o.attrMethods=d({},o.configs.attrMethods||{}),o.attrMethods.name=o.setNodeValue,o.attrMethods[toPrefixedHyphenated("renderif")]=o.renderIf,o.attrMethods[toPrefixedHyphenated("childtemplate")]=o.childTemplate,o.templates=d({},o.configs.templates||{}),o},C=function(){return o.parent=a,o.parent?(o.ancestors=o.parent.ancestors.slice(),o.ancestors.push(a)):o.ancestors=[],o.root=o.ancestors[0]||o,o.children={},o.childArrays={},o},E=function(){return o.data=prefixData((o.boundHiddenInput||o.container).dataset),o.update(o.data),s(),o.update(n||{}),o};this.init=function(){return C(),S(),E(),v(this.configs.keyUp),this===this.root&&b(),o.initialized=!0,this},this.init()}window.SimpleDataBinding=e}();