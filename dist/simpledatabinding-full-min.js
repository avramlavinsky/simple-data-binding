!function(){function e(t,n,r,a,i){var o,c=this,d=document;this.set=function(e,t,n,r,a){var i,o=c;if(e=b(e),r=r||"data",i=c.data[e],a){for(;void 0===i&&n!==!1&&o.parent;)o=o.parent,i=o[r][e];void 0===i?c[r][e]=t:o[r][e]=t}else c[r][e]=t;return c[r][e]},this.get=function(e,t,n){var r,a=c;for(e=b(e),n=n||"data",r=c[n][e];void 0===r&&t!==!1&&a.parent;)a=a.parent,r=a[n][e];return r},this.update=function(e,t){var n,r;t||R();for(var a in e)e.hasOwnProperty(a)&&(n=e[a],"object"==typeof n?n instanceof Array?c.updateChildArray(a,n):c.createChild(a,I(a),n):(r=n,a=b(a),c.root.lastMutation={value:r,oldValue:c.get(a),prop:a},c.set(a,r),c.checkWatches(a)));return c.parseNode(c.container),c.checkWatches("*",!1),c.root.initialized&&_(),c.data},this.removeChild=function(e){return D(e),delete c.children[e.id],e.removed=!0,e};var u=function(e){function t(t,n){for(var r=0,a=e.$bindings.length;r<a;r++)e.$bindings[r]&&e.$bindings[r].set&&e.$bindings[r].set(t,n);return n}function n(t,n){Object.defineProperty(e,t,{enumerable:!1,configurable:!0,value:n})}return e&&(e.$bindings?e.$bindings.push(c):(n("$bindings",[c]),n("$set",t)),n("$binding",c)),e},l=function(e,t,n){var r,a=c.configs.modifyInputArrays===!0?t:[];if(a.idIndex=0,a.ownerInstance=c,a.id=e,r=n||I(e))return c.surroundByComments(a,"child array "+e,r),c.childArrays[e]=a,a},s=function(e,t,n,r){var a,i,o;for(a=0,i=r.priorState.length;a<i;a++)t.indexOf(r.priorState[a])===-1&&c.removeChild(r.priorState[a]);if(!document.body.contains(r.placeholderNode)){if(o=n||I(e),!o)return null;c.surroundByComments(r,"child array "+e,o)}r.ownerInstance=c};this.updateChildArray=function(e,t,n){var r=c.childArrays[e],a=document.createDocumentFragment();if(r?s(e,t,n,r):r=l(e,t,n),r){for(var i=0,o=t.length;i<o;i++)r[i]=c.createChildArrayMember(r,t[i],a);return r.priorState=r.slice(),x(r,a),c.arrayEnhancer&&!r.update&&c.arrayEnhancer.enhance(r),r}},this.createChildArrayMember=function(t,n,r){var a,i=c.cache.get(n);return n instanceof e?(i=n,O(i.container,r)):i&&i.removed?(c.createChild(i.id,i.container,n),O(i.container,r)):(a=O(E(t),r),i=c.createChild(p(t,n),a,n),i.containingArray=t),i};var p=function(e,t){var n=t.name||t.id||t.heading||t.value||t.label;return n&&!c.children[n]||(e.idIndex++,n=(n||e.id)+e.idIndex),n},f=function(){var e=a,t=(new Date).getTime().toString();return c.container&&(e||(e=c.container.getAttribute("databind")||c.container.id||c.container.name||"binding-"+c.container.tagName+"-"+t),c.container.setAttribute("databind",e)),e||t},h=Object.assign||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);return e};this.createChild=function(t,n,r){var a,i=null;return a=c.cache.get(r),a&&n&&a.removed?(a.container=n,a.update(r),a.removed=!1,i=a):i=new e(n,r,c.configs,t,c),c.children[t]=i,i};var m=function(e,t,n){var r,a=c.children,i=c.childArrays;if(n=n||(c.found=[])&&c,a[e]&&c.root.found.push(a[e]),i[e]&&c.root.found.push(i[e]),t||!c.root.length)for(r in a)a.hasOwnProperty(r)&&a[r].find(e,t,n);return t?c.root.found:c.root.found[0]};this.find=function(e){return m(e)},this.findAll=function(e){return m(e,!0)},this.getBindingFor=function(e){var t=C(e,"[databind]"),n=t&&t.getAttribute("databind"),r=c.root.findAll(n);return r.filter(function(e){return e.container===t})[0]},this.export=function(e){var t=h({},c.data);e&&(t=A(t));for(var n in c.children)c.children.hasOwnProperty(n)&&c.children[n]&&(t[n]=c.children[n].export());return t};var v=function(e){return e.replace(/-([a-z])/gi,function(e,t){return t.toUpperCase()})},g=function(e){return e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()},b=function(e){return c.nameSpace&&e&&e.substring(0,c.nameSpace.length)!==c.nameSpace&&(e=c.nameSpace+e.charAt(0).toUpperCase()+e.slice(1)),e},y=function(e){return(c.attrPrefix?g(c.attrPrefix)+"-":"")+e},N=function(e){return c.nameSpace?(e=e.substring(c.nameSpace.length),e.charAt(0).toLowerCase()+e.slice(1)):e},S=function(e){if(c.nameSpace)for(var t in e)t.substring(0,c.nameSpace.length)!==c.nameSpace&&(c.set(t,e[t]),delete e[t]);return e},A=function(e){if(c.nameSpace)for(var t in e)e.hasOwnProperty(t)&&(e[N(t)]=e[t],delete e[t]);return e},w=function(e,t){var n=!!e&&(e.matches||e.matchesSelector||e.msMatchesSelector||e.mozMatchesSelector||e.webkitMatchesSelector||e.oMatchesSelector);return n&&n.call(e,t)},C=function(e,t){for(;!w(e,t)&&e!==d.body;)e=e.parentElement;return e},O=function(e,t){return t&&t.appendChild(e)},E=function(e){return e.elementTemplate.cloneNode(!0)},x=function(e,t){var n=e.placeholderNode;return n.parentNode.insertBefore(t,n),n},k=function(e){var t;return"radio"===e.type?e.checked&&(t=e.value):"checkbox"===e.type?(t=c.get(e.name,!0),t=void 0!==t?t.split(c.checkboxDataDelimiter):[],e.checked?t.push(e.value):t.splice(t.indexOf(e.value),1),t=t.join(c.delimiter)):"OPTION"===e.tagName?(t=c.get(e.name,!0),t=void 0!==t?t.split(c.checkboxDataDelimiter):[],e.selected?t.push(e.value):t.splice(t.indexOf(e.value),1),t=t.join(c.delimiter)):t=e.value,t},B=function(e){if("undefined"!==e.name&&"radio"!==e.type&&"checkbox"!==e.type&&"OPTION"!==e.tagName){var t=e.getAttribute("value");if(t&&"{{"!==t.substr(0,2))return c.set(e.name,k(e))}},T=function(){var e,t="[name]";if("form"===c.container.tagName)for(var n in c.container.elements)c.container.elements.hasOwnProperty(n)&&B(c.container.elements[n]);else{e=Array.prototype.slice.call(c.container.querySelectorAll(t)),w(c.container,t)&&e.push(c.container);for(var r=0,a=e.length;r<a;r++)B(e[r])}return c.data},P=function(){var e=i&&i.container||d;return t&&(c.container=t.tagName?t:e.querySelector(t)),a&&!c.container&&(c.container=e.querySelector("["+y("databind")+'="'+a+'"]')),c.container||i||(c.container=d.querySelector("["+y("databind")+"]")||d.forms[0]||d.body),c.container},I=function(e){var t=c.container.querySelector("["+y("databind")+'="'+e+'"]');return t},M=function(){var e;return c.configs.useHiddenInput&&(e=d.createElement("input"),e.type="hidden",(c.container||d).appendChild(e)),e};this.surroundByComments=function(e,t,n,r){return e.placeholderNode&&document.body.contains(e.placeholderNode)||(e.elementTemplate=n,e.placeholderNode=d.createComment("end "+t),n.placeholderNode=e.placeholderNode,n.parentNode.insertBefore(d.createComment("start "+t),n),n.nextElementSibling?n.parentNode.insertBefore(e.placeholderNode,n.nextElementSibling):n.parentNode.appendChild(e.placeholderNode),r||n.parentNode.removeChild(n)),e.placeholderNode},this.removeCommentedElements=function(e,t){for(;e.previousSibling&&8!==e.previousSibling.nodeType;)1!==e.previousSibling.nodeType||t&&null===e.previousSibling.getAttribute(t)?e=e.previousSibling:e.parentNode.removeChild(e.previousSibling);return e};var D=function(e){var t=e.container;t&&t.parentNode&&t.parentNode.removeChild(t)};this.parseNode=function(e){var t;if(e.parsed)return!1;if(3===e.nodeType)L(e);else if(1===e.nodeType){for(t=0;t<e.attributes.length;t++)W(e.attributes[t]);for(t=0;t<e.childNodes.length;t++)e.childNodes[t].hasAttribute&&e.childNodes[t].hasAttribute("databind")||c.parseNode(e.childNodes[t]);e.getAttribute("databind")&&setTimeout(function(){e.classList.remove("unparsed"),e.classList.add("parsed")},0)}return e.parsed=!0,e};var W=function(e){if("data-"!==e.nodeName.substr(0,5))return V(e),$(e),e},V=function(e){var t;return void 0===e.rawName&&("__"===e.nodeName.substr(-2,2)?(e.rawName=e.nodeName.slice(2,-2),e.originalEl=e.ownerElement,e.prevAttrName=e.nodeName):e.rawName=null),null!==e.rawName&&(t=q(b(v(e.rawName)),e),t!==e.prevAttrName&&(t&&e.originalEl.setAttribute(t,e.nodeValue),e.prevAttrName&&e.originalEl.removeAttribute(e.prevAttrName),e.prevAttrName=t)),t},$=function(e){var t,n,r,a=e.nodeName,i=c.attrMethods[a],o=e.ownerElement;return L(e,e.nodeValue),n=e.value||o&&o[e.name],"value"!==a||"radio"!==o.type&&"checkbox"!==o.type&&"OPTION"!==o.tagName||(r=o&&o.name,!r&&"OPTION"===o.tagName&&o.parentNode&&(t=o.parentNode instanceof DocumentFragment?"SELECT"===c.parent.container.tagName?c.parent.container:c.parent.container.querySelector("select"):o.parentNode,r=t.name),H(o,q(r,e,!1),r,"name")),i&&i.apply(c,[o,q(e.nodeValue,e),e.nodeValue,e.nodeName]),e},L=function(e){if(!e)return"";var t=void 0===e.nodeTemplate,n=e.nodeValue;return t&&("string"==typeof n&&n.indexOf("{{")!==-1?e.nodeTemplate=n:e.nodeTemplate=null),e.nodeTemplate&&(e.nodeValue=e.nodeTemplate.replace(/{{(.*?)}}/g,function(t){return q(t.slice(2,-2),e)})),e.nodeValue},j=function(e,t,n){if("this."===e.substr(0,5)){var r,a,i,o,d=e.indexOf("("),u=d>0&&e.slice(d+1,-1).split(","),l=e.substr(0,d===-1?e.length:d),s=c;for(r=l.split("."),i=1,o=r.length;i<o;i++)s&&(s=s[r[i]]);return"function"==typeof s?(a=function(){var e=[];for(i=0,o=u.length;i<o;i++)e[i]=q(u[i].trim(),t);return s.apply(c,e)},n!==!1&&c.watch(u,a),a):s}return null},q=function(e,t,n){if(!e)return e;var r,a,i="'"===e.substr(0,1)&&e.slice(1,-1),o=Number(e);return i?i:isNaN(o)?(r=j(e,t,n),r?a="function"==typeof r?r():r:(a=c.get(e,!0),n!==!1&&c.watch(e,t)),t&&"name"===t.nodeName&&a&&n!==!1&&c.watch(a,t),a):o};this.templateMaster=function(e){return function(t,n){var r,a,i;return n&&(r=c.root.templates[n],i=r||d.getElementById(n),i&&("TEMPLATE"===i.tagName?(i=i.content||i.firstElementChild,i instanceof DocumentFragment&&(i=i.firstElementChild)):r||i.removeAttribute("id"),c.root.templates[n]=i,a=i.cloneNode(!0),t.placeholderNode?(c.removeCommentedElements(t.placeholderNode),t.placeholderNode.parentNode.insertBefore(a,t.placeholderNode)):(e(t,a),c.surroundByComments(t,"template "+n,a,!0)),c.parseNode(a))),t}};var z=c.templateMaster(function(e,t){return e.appendChild(t)}),F=function(e,t,n){return this.surroundByComments(e,"render if "+n,e,!0),t&&!e.parentElement?e.placeholderNode.parentNode.insertBefore(e,e.placeholderNode):!t&&e.parentElement&&e.parentElement.removeChild(e),e},H=function(e,t,n,r){return void 0!==t&&("radio"===e.type&&"name"===r?e.checked=t===e.value:"checkbox"===e.type&&"name"===r?e.checked=t.indexOf(e.value)!==-1:"SELECT"!==e.tagName||t?"OPTION"!==e.tagName||"value"!==r&&"name"!==r?e.value=t:e.selected=e.value&&t.indexOf(e.value)!==-1:setTimeout(function(){e.selectedIndex="-1"},0)),e},U=function(e){return c.container&&(o=new MutationObserver(Z),c.container.addEventListener("change",G),c.container.addEventListener("search",G),e!==!1&&c.container.addEventListener("keyup",G),c===c.root&&(c.turnOnAllBindings(),setTimeout(function(){c.turnOnAllBindings()}))),c},_=function(){return o&&o.observe(c.container,{attributes:!0,attributeOldValue:!0}),o};this.turnOnAllBindings=function(){_();for(var e in c.children)c.children.hasOwnProperty(e)&&c.children[e]&&c.children[e].turnOnAllBindings();return c};var R=function(){return o&&o.disconnect(),o},Z=function(e){return e.forEach(function(e){if(e.target===(c.boundHiddenInput||c.container)){var t,r="data-",a=e.target.getAttribute(e.attributeName);e.attributeName.substr(0,r.length)===r&&a!==e.oldValue&&(t=v(e.attributeName.substr(r.length)),c.root.lastMutation={prop:t,value:a,oldValue:e.oldValue},c.checkWatches(t),c.checkWatches("*"),c.configs.modifyInputObjects&&(n[t]=a))}}),e},G=function(e){var t=k(e.target),n=e.target.name;return e.stopPropagation(),!c.containingArray||void 0===c.parent.get(n)||"radio"!==e.target.type&&"checkbox"!==e.target.type?c.set(n,t,!0,"data",!0):c.parent.set(n,t,!0,"data",!0)};this.watch=function(e,t,n){var r,a,i=["*"];"string"==typeof e&&(e=[e]),e instanceof Array||(n=t,t=e,e=i),e=e||i,r=n?c.root:c,a=n?"globalScopeWatches":"watches";for(var o=0,d=e.length;o<d;o++)r[a][e[o]]=r[a][e[o]]||[],r[a][e[o]].indexOf(t)===-1&&r[a][e[o]].push(t);return r[n?"globalScopeWatches":"watches"]};var J=function(e,t){var n,r=t?c.root:c,a=t?"globalScopeWatches":"watches",i=r[a][e];if(i)for(var o=i.length-1;o>=0;o--)"function"==typeof i[o]?K(i[o]):(n=i[o],2===n.nodeType?W(n):L(n));return r};this.checkWatches=function(e,t){if(c.removed)return!1;if(c.watches[e]&&(J(e,!1),J("*",!1),c.root.globalScopeWatches[e]&&J(e,!0),c.root.globalScopeWatches["*"]&&J("*",!0)),t!==!1)for(var n in c.children)c.children.hasOwnProperty(n)&&c.children[n]&&c.children[n].checkWatches(e);return e};var K=function(e){var t=c.root.lastMutation,n=[t.value,t.oldValue,t.prop];if(void 0!==c.get(t.prop))return e.apply(c,n)},Q=function(){return c.configs=r||{},c.nameSpace="string"==typeof c.configs.nameSpace?c.configs.nameSpace:"",c.attrPrefix="string"==typeof c.configs.attrPrefix?c.configs.attrPrefix:"",c.container=P(),c.id=f(),c.boundHiddenInput=M(),c.watches=c.configs.watches||{},c.globalScopeWatches=c.configs.globalScopeWatches||{},c.checkboxDataDelimiter=c.configs.checkboxDataDelimiter||",",c.attrMethods=h({},c.configs.attrMethods||{}),c.attrMethods.name=H,c.attrMethods[y("renderif")]=F,c.attrMethods[y("childtemplate")]=z,c.templates=h({},c.configs.templates||{}),c.logic=h({},c.configs.logic||{}),c.cache=new WeakMap,c},X=function(){return c.parent=i,c.parent?(c.ancestors=c.parent.ancestors.slice(),c.ancestors.push(i)):c.ancestors=[],c.root=c.ancestors[0]||c,c.children={},c.childArrays={},c},Y=function(){var e=c.boundHiddenInput||c.container;return e&&(n&&c.parent&&c.parent.cache.set(n,c),c.data=S(e.dataset),c.update(c.data),T(),c.update(n||{}),u(n)),c};this.init=function(){return X(),Q(),Y(),U(this.configs.keyUp),c.initialized=!0,this},this.init()}window.SimpleDataBinding=e}(),function(){function e(t,n,r){var a=this;this.enhance=function(e){return e.update=a.update,a.addArrayCallBacks(e),e.set=function(t,n){e[t]=n,e.update()},e},this.update=function(){var e=this;return e.ownerInstance[r](e.id,e,e.placeHolderNode),e};var i=function(e){for(var t=["pop","push","reverse","shift","unshift","splice","sort","filter","forEach","reduce","reduceRight","copyWithin","fill"],n=0,r=t.length;n<r;n++)o(e,t[n],e.update);return e},o=function(e,t,n,r){function a(){var e;if(this.callingBack!==!0)return this.callingBack=!0,e=o.apply(r,i),n.apply(r,arguments),this.callingBack=!1,e}var i,o=e[t];return r=r||e,e[t]=function(){i=arguments,a()},e[t].apply=function(){i=arguments[1],a()},e[t]};this.addArrayCallBacks=i,this.addCallBack=o,window.LiveArrayFactory=e}var t,n=window.SimpleDataBinding;n&&(t=new e(n,"removeChild","updateChildArray"),n.prototype.arrayEnhancer=t),window.$bind=function(e,t,n,r){return n=n||{},n.updateInputObjects=!0,new SimpleDataBinding(e,t,n,r)}}();