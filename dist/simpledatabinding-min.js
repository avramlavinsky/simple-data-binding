!function(){function e(t,n,r,a,o){var i=this;this.set=function(e,t,n,r){var a,o=i;for(e=s(e),r=r||"data",a=i.data[e];void 0===a&&n!==!1&&o.parent;)o=o.parent,a=o[r][e];return void 0===a?i[r][s(e)]=t:o[r][s(e)]=t,i[r][e]},this.get=function(e,t,n){var r,a=i;for(e=s(e),n=n||"data",r=i[n][e];void 0===r&&t!==!1&&a.parent;)a=a.parent,r=a[n][e];return r},this.update=function(e,t){var n,r;t||k();for(var a in e)e.hasOwnProperty(a)&&(n=e[a],"object"==typeof n?n instanceof Array?i.createChildArray(a,n):i.createChild(a,S(a),n):(r=n,a=s(a),i.root.lastMutation={value:r,oldValue:i.get(a),prop:a},i.set(a,r),i.checkWatches(a)));return i.parseNode(i.container),i.checkWatches("*",!1),i.root.initialized&&T(),i.data};this.createChildArrayMember=function(t,n,r){if(n instanceof e)return n;var a=c(t,n),o=g(t.elementTemplate,r||t.placeholder),d=i.createChild(a,o,n);return d.containingArray=t,d};var c=function(e,t){var n=t.name||t.id||t.value;return n&&!i.children[n]||(e.idIndex++,n=(n||e.key)+e.idIndex),n},d=Object.assign||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);return e};this.createChild=function(t,n,r){var a=new e(n,r,i.configs,t,i);return i.children[t]=a,a},this.export=function(e){var t=d({},i.data);e&&(t=f(t));for(var n in i.children)i.children.hasOwnProperty(n)&&(t[n]=i.children[n].export());return t};var u=function(e){return e.replace(/-([a-z])/gi,function(e,t){return t.toUpperCase()})},l=function(e){return e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()},s=function(e){return i.nameSpace&&e&&e.substring(0,i.nameSpace.length)!==i.nameSpace&&(e=i.nameSpace+e.charAt(0).toUpperCase()+e.slice(1)),e},p=function(e){return(i.attrPrefix?l(i.attrPrefix)+"-":"")+e},h=function(e){return i.nameSpace?(e=e.substring(i.nameSpace.length),e.charAt(0).toLowerCase()+e.slice(1)):e},m=function(e){if(i.nameSpace)for(var t in e)t.substring(0,i.nameSpace.length)!==i.nameSpace&&(i.set(t,e[t]),delete e[t]);return e},f=function(e){if(i.nameSpace)for(var t in e)e.hasOwnProperty(t)&&(e[h(t)]=e[t],delete e[t]);return e},v=function(e,t){var n=e.matches||e.matchesSelector||e.msMatchesSelector||e.mozMatchesSelector||e.webkitMatchesSelector||e.oMatchesSelector;return n&&n.call(e,t)},g=function(e,t){var n=e.cloneNode(!0);return t.parentNode.insertBefore(n,t),n},b=function(e){var t;return"radio"===e.type?e.checked&&(t=e.value):"checkbox"===e.type?(t=i.get(e.name,!0),t=void 0!==t?t.split(i.checkboxDataDelimiter):[],e.checked?t.push(e.value):t.splice(t.indexOf(e.value),1),t=t.join(i.delimiter)):"OPTION"===e.tagName?(t=i.get(e.name,!0),t=void 0!==t?t.split(i.checkboxDataDelimiter):[],e.selected?t.push(e.value):t.splice(t.indexOf(e.value),1),t=t.join(i.delimiter)):t=e.value,t},y=function(){function e(e){if("undefined"!==e.name&&"radio"!==e.type&&"checkbox"!==e.type&&"OPTION"!==e.tagName){var t=e.getAttribute("value");t&&"{{"!==t.substr(0,2)&&i.set(e.name,b(e))}}var t,n="[name]";if("form"===i.container.tagName)for(var r in i.container.elements)i.container.elements.hasOwnProperty(r)&&e(i.container.elements[r]);else{t=Array.prototype.slice.call(i.container.querySelectorAll(n)),v(i.container,n)&&t.push(i.container);for(var a=0,o=t.length;a<o;a++)e(t[a])}return i.data},N=function(){return i.container=t&&t.tagName?t:document.querySelector(t||"["+p("databind")+"]")||document.forms[0]||document.body,i.configs.containInHiddenInput&&(i.boundHiddenInput=document.createElement("input"),i.boundHiddenInput.type="hidden",i.container.appendChild(i.boundHiddenInput)),i.container.getAttribute("databind")||i.container.setAttribute("databind",""),i.container},S=function(e){var t=i.container.querySelector("["+p("databind")+'="'+e+'"]');return t};this.surroundByComments=function(e,t,n,r){return e.placeholder||(e.elementTemplate=n,e.placeholder=document.createComment("end "+t),n.placeholder=e.placeholder,n.parentNode.insertBefore(document.createComment("start "+t),n),n.nextElementSibling?n.parentNode.insertBefore(e.placeholder,n.nextElementSibling):n.parentNode.appendChild(e.placeholder),r||n.parentNode.removeChild(n)),e.placeholder},this.removeCommentedElements=function(e,t,n){for(;e.previousSibling&&8!==e.previousSibling.nodeType;)1===e.previousSibling.nodeType&&e.previousSibling.getAttribute(t)===n?e.parentNode.removeChild(e.previousSibling):e=e.previousSibling;return e},this.parseNode=function(e){var t;if(e.parsed)return!1;if(3===e.nodeType)E(e);else if(1===e.nodeType){for(t=0;t<e.attributes.length;t++)A(e.attributes[t]);for(t=0;t<e.childNodes.length;t++)e.childNodes[t].hasAttribute&&e.childNodes[t].hasAttribute("databind")||i.parseNode(e.childNodes[t])}return e.parsed=!0,e};var A=function(e){if("data-"!==e.nodeName.substr(0,5))return w(e),x(e),e},w=function(e){var t,n;return void 0===e.boundAttrNameProp&&("__"===e.nodeName.substr(-2,2)?(t=s(e.nodeName.slice(2,-2)),t&&(e.boundAttrNameProp=t,i.addWatch(e.boundAttrNameProp,e))):e.boundAttrNameProp=null),e.boundAttrNameProp&&(n=i.get(e.boundAttrNameProp,!0),n?(e.boundAttrName=n,setTimeout(function(){e.ownerElement.setAttribute(n,e.nodeValue)})):e.boundAttrName&&e.ownerElement.removeAttribute(e.boundAttrName)),e},x=function(e){var t,n,r=e.nodeName,a=i.attrMethods[r];return E(e,e.nodeValue),t=e.value||e.ownerElement[e.name],n=t||"*","value"!==r||"radio"!==e.ownerElement.type&&"checkbox"!==e.ownerElement.type&&"OPTION"!==e.ownerElement.tagName||i.setNodeValue(e.ownerElement,e.ownerElement.getAttribute("name"),"name"),a&&(i.addWatch(s(n),e),a.apply(i,[e.ownerElement,e.nodeValue,e.nodeName,i.get(e.nodeValue)])),e},E=function(e,t){if(!e)return"";var n=void 0===e.nodeTemplate;return n&&(t=t||e.nodeValue,"string"==typeof t&&t.indexOf("{{")!==-1?e.nodeTemplate=t:e.nodeTemplate=null),e.nodeTemplate&&(e.nodeValue=e.nodeTemplate.replace(/{{(.*?)}}/g,function(t){var r=s(t.slice(2,-2)),a=i.get(r,!0)||"";return n&&i.addWatch(r,e),"name"===e.nodeName&&a&&i.addWatch(a,e),a})),e.nodeValue};this.childTemplate=function(e,t,n,r){var a;return r&&(i.templates[r]=i.templates[r]||document.getElementById(r),i.templates[r]&&(a=i.templates[r].cloneNode(!0),a.removeAttribute("id"),e.appendChild(a),this.parseNode(a),this.childFromTemplate=a)),e},this.renderIf=function(e,t,n,r){return this.surroundByComments(e,"render if "+t,e,!0),r&&!e.parentElement?e.placeholder.parentNode.insertBefore(e,e.placeholder):!r&&e.parentElement&&e.parentElement.removeChild(e),e},this.setNodeValue=function(e,t,n){var r=i.get(t,!0);return void 0!==r&&("radio"===e.type&&"name"===n?e.checked=r===e.value:"checkbox"===e.type&&"name"===n?e.checked=r.indexOf(e.value)!==-1:"SELECT"!==e.tagName||r?"OPTION"===e.tagName&&"value"===n?e.selected=(i.get(e.parentElement.name)||"").indexOf(e.value)!==-1:e.value=r:setTimeout(function(){e.selectedIndex="-1"},0)),e};var O=function(e){return i.observer=new MutationObserver(P),i.container.addEventListener("change",W),e!==!1&&i.container.addEventListener("keyup",C),i},T=function(){return i.observer&&i.observer.observe(i.container,{attributes:!0,attributeOldValue:!0}),i.observer};this.turnOnAllBindings=function(){T();for(var e in i.children)i.children.hasOwnProperty(e)&&i.children[e].turnOnAllBindings();return i};var k=function(){return i.observer&&i.observer.disconnect(),i.observer},P=function(e){return e.forEach(function(e){if(e.target===(i.boundHiddenInput||i.container)){var t,n="data-",r=e.target.getAttribute(e.attributeName);e.attributeName.substr(0,n.length)===n&&r!==e.oldValue&&(t=u(e.attributeName.substr(n.length)),i.root.lastMutation={prop:t,value:r,oldValue:e.oldValue},i.checkWatches(t),i.checkWatches("*"))}}),e},C=function(e){var t=document.createEvent("HTMLEvents");return t.initEvent("change",!0,!1),e.target.dispatchEvent(t),t},W=function(e){var t=b(e.target),n=e.target.name;return e.stopPropagation(),!i.containingArray||void 0===i.parent.get(n)||"radio"!==e.target.type&&"checkbox"!==e.target.type?i.set(n,t):i.parent.set(n,t)};this.watch=function(e,t,n){var r,a=["*"];"function"==typeof e?(n=t,t=e,e=a):"string"==typeof e&&(e=[e]),e=e||a,r=n?i.root:i;for(var o=0,c=e.length;o<c;o++)r.addWatch(e[o],{fn:t,props:e},n);return r[n?"globalScopeWatches":"watches"]},this.addWatch=function(e,t,n){var r=n?"globalScopeWatches":"watches",a=n?i.root:i;return a[r][e]=a[r][e]||[],a[r][e].indexOf(t)===-1&&a[r][e].push(t),t},this.checkWatches=function(e,t){function n(e,t){var n,r=t?i.root:i,a=t?"globalScopeWatches":"watches",o=r[a][e];if(o)for(var c=o.length-1;c>=0;c--)o[c].fn?I(o[c],e):(n=o[c],2===n.nodeType?A(n):E(n))}if(i.watches[e]&&(n(e,!1),n("*",!1),i.root.globalScopeWatches[e]&&n(e,!0),i.root.globalScopeWatches["*"]&&n("*",!0)),t!==!1)for(var r in i.children)i.children.hasOwnProperty(r)&&i.children[r].checkWatches(e);return e};var I=function(e){var t=i.root.lastMutation,n=[t.value,t.oldValue,t.prop],r={};if(void 0!==i.get(t.prop)||!e.recursive){if("*"!==e.props[0]){for(var a=0,o=e.props.length;a<o;a++)r[e.props[a]]=i.get(e.props[a]);n.push(r)}return e.fn.apply(i,n)}},M=function(){return i.configs=r||{},i.nameSpace="string"==typeof i.configs.nameSpace?i.configs.nameSpace:"",i.attrPrefix="string"==typeof i.configs.attrPrefix?i.configs.attrPrefix:"",i.container=N(),i.id=a||i.container.id||i.container.name||"binding-"+(new Date).getTime(),i.watches=i.configs.watches||{},i.globalScopeWatches=i.configs.globalScopeWatches||{},i.checkboxDataDelimiter=i.configs.checkboxDataDelimiter||",",i.attrMethods=d({},i.configs.attrMethods||{}),i.attrMethods.name=i.setNodeValue,i.attrMethods[p("renderif")]=i.renderIf,i.attrMethods[p("childtemplate")]=i.childTemplate,i.templates=d({},i.configs.templates||{}),i},V=function(){return i.parent=o,i.parent?(i.ancestors=i.parent.ancestors.slice(),i.ancestors.push(o)):i.ancestors=[],i.root=i.ancestors[0]||i,i.children={},i.childArrays={},i},B=function(){return i.data=m((i.boundHiddenInput||i.container).dataset),i.update(i.data),y(),i.update(n||{}),i};this.init=function(){return V(),M(),B(),O(this.configs.keyUp),this===this.root&&this.turnOnAllBindings(),i.initialized=!0,this},this.init()}window.SimpleDataBinding=e}();