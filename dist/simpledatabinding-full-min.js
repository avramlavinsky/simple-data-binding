!function(){function e(t,n,r,a,i){var o=this,c=document;this.set=function(e,t,r,a,i){var c,l=o;if(e=m(e),a=a||"data",c=o.data[e],i){for(;void 0===c&&r!==!1&&l.parent;)l=l.parent,c=l[a][e];void 0===c?o[a][e]=t:l[a][e]=t}else o[a][e]=t;return o.configs.modifyInputObjects&&"data"===a&&(n[e]=t),o[a][e]},this.get=function(e,t,n){var r,a=o;for(e=m(e),n=n||"data",r=o[n][e];void 0===r&&t!==!1&&a.parent;)a=a.parent,r=a[n][e];return r},this.update=function(e,t){var n,r;t||q();for(var a in e)e.hasOwnProperty(a)&&(n=e[a],"object"==typeof n?n instanceof Array?d(a,n):o.createChild(a,C(a),n):(r=n,a=m(a),o.root.lastMutation={value:r,oldValue:o.get(a),prop:a},o.set(a,r),o.checkWatches(a)));return o.parseNode(o.container),o.checkWatches("*",!1),o.root.initialized&&j(),o.data},this.removeChild=function(e){return e.container.parentNode.removeChild(e.container),delete o.children[e.id],e.removed=!0,e};var l=function(e){function t(t,n){for(var r=0,a=e.$bindings.length;r<a;r++)e.$bindings[r]&&e.$bindings[r].set&&e.$bindings[r].set(t,n);return n}function n(t,n){Object.defineProperty(e,t,{enumerable:!1,configurable:!0,value:n})}return e&&(e.$bindings?e.$bindings.push(o):(n("$bindings",[o]),n("$set",t)),n("$binding",o)),e},d=function(e,t,n){var r,a,i,c,l,d,u,s=!1;if(o.childArrays[e]){for(i=o.childArrays[e],r=0,a=i.length;r<i.length;r++)o.removeChild(i[r]);i.length=0}else{if(c=n||C(e),!c)return null;i=o.configs.modifyInputArrays===!0?t:[],o.childArrays[e]=i,i.idIndex=0,i.ownerInstance=o,i.id=e,o.surroundByComments(i,"child array "+e,c)}for(s&&(l=o.childArrays[e].placeholderNode.parentNode,d=l.nextElementSibling,u=l.parentElement,u.removeChild(l)),r=0,a=t.length;r<a;r++)i[r]=o.createChildArrayMember(i,t[r]);return s&&(d?d.parentNode.insertBefore(l,d):u.appendChild(l)),o.arrayEnhancer&&!i.update&&o.arrayEnhancer.enhance(i),i};this.createChildArrayMember=function(t,n,r){if(n instanceof e)return n;var a=u(t,n),i=A(t.elementTemplate,r||t.placeholderNode),c=o.createChild(a,i,n);return c.containingArray=t,c};var u=function(e,t){var n=t.name||t.id||t.heading||t.label;return n&&!o.children[n]||(e.idIndex++,n=(n||e.id)+e.idIndex),n},s=Object.assign||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);return e};this.createChild=function(t,n,r){var a,i=null;return a=o.cache.get(r),a&&n&&a.removed?(a.container=n,a.parseNode(n),a.update(r),i=a):i=new e(n,r,o.configs,t,o),o.children[t]=i,i};var p=function(e,t,n){var r,a=o.children,i=o.childArrays;if(n=n||(o.found=[])&&o,a[e]&&o.root.found.push(a[e]),i[e]&&o.root.found.push(i[e]),t||!o.root.length)for(r in a)a.hasOwnProperty(r)&&a[r].find(e,t,n);return t?o.root.found:o.root.found[0]};this.find=function(e){return p(e)},this.findAll=function(e){return p(e,!0)},this.export=function(e){var t=s({},o.data);e&&(t=b(t));for(var n in o.children)o.children.hasOwnProperty(n)&&o.children[n]&&(t[n]=o.children[n].export());return t};var h=function(e){return e.replace(/-([a-z])/gi,function(e,t){return t.toUpperCase()})},f=function(e){return e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()},m=function(e){return o.nameSpace&&e&&e.substring(0,o.nameSpace.length)!==o.nameSpace&&(e=o.nameSpace+e.charAt(0).toUpperCase()+e.slice(1)),e},v=function(e){return(o.attrPrefix?f(o.attrPrefix)+"-":"")+e},g=function(e){return o.nameSpace?(e=e.substring(o.nameSpace.length),e.charAt(0).toLowerCase()+e.slice(1)):e},y=function(e){if(o.nameSpace)for(var t in e)t.substring(0,o.nameSpace.length)!==o.nameSpace&&(o.set(t,e[t]),delete e[t]);return e},b=function(e){if(o.nameSpace)for(var t in e)e.hasOwnProperty(t)&&(e[g(t)]=e[t],delete e[t]);return e},N=function(e,t){var n=e.matches||e.matchesSelector||e.msMatchesSelector||e.mozMatchesSelector||e.webkitMatchesSelector||e.oMatchesSelector;return n&&n.call(e,t)},A=function(e,t){var n=e.cloneNode(!0);return t.parentNode.insertBefore(n,t),n},S=function(e){var t;return"radio"===e.type?e.checked&&(t=e.value):"checkbox"===e.type?(t=o.get(e.name,!0),t=void 0!==t?t.split(o.checkboxDataDelimiter):[],e.checked?t.push(e.value):t.splice(t.indexOf(e.value),1),t=t.join(o.delimiter)):"OPTION"===e.tagName?(t=o.get(e.name,!0),t=void 0!==t?t.split(o.checkboxDataDelimiter):[],e.selected?t.push(e.value):t.splice(t.indexOf(e.value),1),t=t.join(o.delimiter)):t=e.value,t},w=function(){function e(e){if("undefined"!==e.name&&"radio"!==e.type&&"checkbox"!==e.type&&"OPTION"!==e.tagName){var t=e.getAttribute("value");t&&"{{"!==t.substr(0,2)&&o.set(e.name,S(e))}}var t,n="[name]";if("form"===o.container.tagName)for(var r in o.container.elements)o.container.elements.hasOwnProperty(r)&&e(o.container.elements[r]);else{t=Array.prototype.slice.call(o.container.querySelectorAll(n)),N(o.container,n)&&t.push(o.container);for(var a=0,i=t.length;a<i;a++)e(t[a])}return o.data},O=function(){var e=i&&i.container||c;return t&&(o.container=t.tagName?t:e.querySelector(t)),a&&!o.container&&(o.container=e.querySelector("["+v("databind")+'="'+a+'"]')),o.container||i||(o.container=c.querySelector("["+v("databind")+"]")||c.forms[0]||c.body),o.container},C=function(e){var t=o.container.querySelector("["+v("databind")+'="'+e+'"]');return t},x=function(){var e=a,t=(new Date).getTime().toString();return o.container&&(e||(e=o.container.getAttribute("databind")||o.container.id||o.container.name||"binding-"+o.container.tagName+"-"+t),o.container.setAttribute("databind",e)),e||t},E=function(){var e;return o.configs.useHiddenInput&&(e=c.createElement("input"),e.type="hidden",(o.container||c).appendChild(e)),e};this.surroundByComments=function(e,t,n,r){return e.placeholderNode||(e.elementTemplate=n,e.placeholderNode=c.createComment("end "+t),n.placeholderNode=e.placeholderNode,n.parentNode.insertBefore(c.createComment("start "+t),n),n.nextElementSibling?n.parentNode.insertBefore(e.placeholderNode,n.nextElementSibling):n.parentNode.appendChild(e.placeholderNode),r||n.parentNode.removeChild(n)),e.placeholderNode},this.removeCommentedElements=function(e,t){for(;e.previousSibling&&8!==e.previousSibling.nodeType;)1!==e.previousSibling.nodeType||t&&null===e.previousSibling.getAttribute(t)?e=e.previousSibling:e.parentNode.removeChild(e.previousSibling);return e},this.parseNode=function(e){var t;if(e.parsed)return!1;if(3===e.nodeType)T(e);else if(1===e.nodeType){for(t=0;t<e.attributes.length;t++)k(e.attributes[t]);for(t=0;t<e.childNodes.length;t++)e.childNodes[t].hasAttribute&&e.childNodes[t].hasAttribute("databind")||o.parseNode(e.childNodes[t]);e.getAttribute("databind")&&setTimeout(function(){e.classList.remove("unparsed"),e.classList.add("parsed")},0)}return e.parsed=!0,e};var k=function(e){if("data-"!==e.nodeName.substr(0,5))return M(e),B(e),e},M=function(e){var t;return void 0===e.rawName&&("__"===e.nodeName.substr(-2,2)?(e.rawName=e.nodeName.slice(2,-2),e.originalEl=e.ownerElement,e.prevAttrName=e.nodeName):e.rawName=null),null!==e.rawName&&(t=P(m(h(e.rawName)),e),t!==e.prevAttrName&&(t&&e.originalEl.setAttribute(t,e.nodeValue),e.prevAttrName&&e.originalEl.removeAttribute(e.prevAttrName),e.prevAttrName=t)),t},B=function(e){var t,n,r=e.nodeName,a=o.attrMethods[r],i=e.ownerElement;return T(e,e.nodeValue),t=e.value||i&&i[e.name],"value"!==r||"radio"!==i.type&&"checkbox"!==i.type&&"OPTION"!==i.tagName||(n=i&&i.name,n||"OPTION"!==i.tagName||(n=i.parentNode.name),$(i,P(n,e,!1),n,"name")),a&&a.apply(o,[i,P(e.nodeValue,e),e.nodeValue,e.nodeName]),e},T=function(e){if(!e)return"";var t=void 0===e.nodeTemplate,n=e.nodeValue;return t&&("string"==typeof n&&n.indexOf("{{")!==-1?e.nodeTemplate=n:e.nodeTemplate=null),e.nodeTemplate&&(e.nodeValue=e.nodeTemplate.replace(/{{(.*?)}}/g,function(t){return P(t.slice(2,-2),e)})),e.nodeValue},I=function(e,t,n){if("this."===e.substr(0,5)){var r,a,i,c,l=e.indexOf("("),d=l>0&&e.slice(l+1,-1).split(","),u=e.substr(0,l===-1?e.length:l),s=o;for(r=u.split("."),i=1,c=r.length;i<c;i++)s&&(s=s[r[i]]);return"function"==typeof s?(a=function(){var e=[];for(i=0,c=d.length;i<c;i++)e[i]=P(d[i].trim(),t);return s.apply(o,e)},n!==!1&&o.watch(d,a),a):s}return null},P=function(e,t,n){if(!e)return e;var r,a,i="'"===e.substr(0,1)&&e.slice(1,-1),c=Number(e);return i?i:isNaN(c)?(r=I(e,t,n),r?a="function"==typeof r?r():r:(a=o.get(e,!0),n!==!1&&o.watch(e,t)),t&&"name"===t.nodeName&&a&&n!==!1&&o.watch(a,t),a):c};this.templateMaster=function(e){return function(t,n){var r;return n&&(o.templates[n]=o.templates[n]||c.getElementById(n),o.templates[n]&&(r=o.templates[n].cloneNode(!0),r.removeAttribute("id"),t.placeholderNode?(o.removeCommentedElements(t.placeholderNode),t.placeholderNode.parentNode.insertBefore(r,t.placeholderNode)):(e(t,r),o.surroundByComments(t,"template "+n,r,!0)),o.parseNode(r))),t}};var L,W=o.templateMaster(function(e,t){e.appendChild(t)}),V=function(e,t,n){return this.surroundByComments(e,"render if "+n,e,!0),t&&!e.parentElement?e.placeholderNode.parentNode.insertBefore(e,e.placeholderNode):!t&&e.parentElement&&e.parentElement.removeChild(e),e},$=function(e,t,n,r){return void 0!==t&&("radio"===e.type&&"name"===r?e.checked=t===e.value:"checkbox"===e.type&&"name"===r?e.checked=t.indexOf(e.value)!==-1:"SELECT"!==e.tagName||t?"OPTION"!==e.tagName||"value"!==r&&"name"!==r?e.value=t:e.selected=e.value&&t.indexOf(e.value)!==-1:setTimeout(function(){e.selectedIndex="-1"},0)),e},D=function(e){return o.container&&(L=new MutationObserver(z),o.container.addEventListener("change",U),e!==!1&&o.container.addEventListener("keyup",H),o===o.root&&(o.turnOnAllBindings(),setTimeout(function(){o.turnOnAllBindings()}))),o},j=function(){return L&&L.observe(o.container,{attributes:!0,attributeOldValue:!0}),L};this.turnOnAllBindings=function(){j();for(var e in o.children)o.children.hasOwnProperty(e)&&o.children[e]&&o.children[e].turnOnAllBindings();return o};var q=function(){return L&&L.disconnect(),L},z=function(e){return e.forEach(function(e){if(e.target===(o.boundHiddenInput||o.container)){var t,n="data-",r=e.target.getAttribute(e.attributeName);e.attributeName.substr(0,n.length)===n&&r!==e.oldValue&&(t=h(e.attributeName.substr(n.length)),o.root.lastMutation={prop:t,value:r,oldValue:e.oldValue},o.checkWatches(t),o.checkWatches("*"))}}),e},H=function(e){var t=c.createEvent("HTMLEvents");return t.initEvent("change",!0,!1),e.target.dispatchEvent(t),t},U=function(e){var t=S(e.target),n=e.target.name;return e.stopPropagation(),!o.containingArray||void 0===o.parent.get(n)||"radio"!==e.target.type&&"checkbox"!==e.target.type?o.set(n,t,!0,"data",!0):o.parent.set(n,t,!0,"data",!0)};this.watch=function(e,t,n){var r,a,i=["*"];"string"==typeof e&&(e=[e]),e instanceof Array||(n=t,t=e,e=i),e=e||i,r=n?o.root:o,a=n?"globalScopeWatches":"watches";for(var c=0,l=e.length;c<l;c++)r[a][e[c]]=r[a][e[c]]||[],r[a][e[c]].indexOf(t)===-1&&r[a][e[c]].push(t);return r[n?"globalScopeWatches":"watches"]},this.checkWatches=function(e,t){function n(e,t){var n,r=t?o.root:o,a=t?"globalScopeWatches":"watches",i=r[a][e];if(i)for(var c=i.length-1;c>=0;c--)"function"==typeof i[c]?_(i[c]):(n=i[c],2===n.nodeType?k(n):T(n))}if(o.watches[e]&&(n(e,!1),n("*",!1),o.root.globalScopeWatches[e]&&n(e,!0),o.root.globalScopeWatches["*"]&&n("*",!0)),t!==!1)for(var r in o.children)o.children.hasOwnProperty(r)&&o.children[r]&&o.children[r].checkWatches(e);return e};var _=function(e){var t=o.root.lastMutation,n=[t.value,t.oldValue,t.prop];if(void 0!==o.get(t.prop))return e.apply(o,n)},F=function(){return t&&"object"==typeof t&&!t.tagName&&(i=a,a=r,r=n,n=t,t=null),n},R=function(){return o.configs=r||{},o.nameSpace="string"==typeof o.configs.nameSpace?o.configs.nameSpace:"",o.attrPrefix="string"==typeof o.configs.attrPrefix?o.configs.attrPrefix:"",o.container=O(),o.id=x(),o.boundHiddenInput=E(),o.watches=o.configs.watches||{},o.globalScopeWatches=o.configs.globalScopeWatches||{},o.checkboxDataDelimiter=o.configs.checkboxDataDelimiter||",",o.attrMethods=s({},o.configs.attrMethods||{}),o.attrMethods.name=$,o.attrMethods[v("renderif")]=V,o.attrMethods[v("childtemplate")]=W,o.templates=s({},o.configs.templates||{}),o.logic=s({},o.configs.logic||{}),o.cache=new WeakMap,o},Z=function(){return o.parent=i,o.parent?(o.ancestors=o.parent.ancestors.slice(),o.ancestors.push(i)):o.ancestors=[],o.root=o.ancestors[0]||o,o.children={},o.childArrays={},o},G=function(){var e=o.boundHiddenInput||o.container;return e&&(n&&o.parent&&o.parent.cache.set(n,o),o.data=y(e.dataset),o.update(o.data),w(),o.update(n||{}),l(n)),o};this.init=function(){return F(),Z(),R(),G(),D(this.configs.keyUp),o.initialized=!0,this},this.init()}window.SimpleDataBinding=e,window.$bind=function(t,n,r,a){return r=r||{},r.updateInputArrays=!0,r.updateInputObjects=!0,new e(t,n,r,a)}}(),function(){function e(t,n,r,a){var i=this;this.enhance=function(e){return e.update=i.update,i.addArrayCallBacks(e),e.set=function(t,n){e[t]=n,e.update()},e},this.update=function(){var e,i,o,c,l=this,d=Array.prototype.slice.call(arguments);if(a&&l.priorState)for(o=0,c=l.priorState.length;o<c;o++)e=l.priorState[o],e instanceof t&&l.indexOf(e)===-1&&(i=d.slice(),i.unshift(o),i.unshift(l),e[a].apply(e,i));for(o=0,c=l.length;o<c;o++)i=d.slice(),e=l[o],l.priorState&&e===l.priorState[o]&&e&&l.priorState[o]||(e instanceof t?r&&l.priorState&&(i.unshift(o),i.unshift(l),e[r].apply(e,i)):void 0!==e&&(n?(i.unshift.apply(i,[e,l,o]),l[o]=t.prototype[n].apply(l,i)):l[o]=new t(e,l,o,i[0],i[1],i[2],i[3],i[4])));return l.priorState=l.slice(),l};var o=function(e){for(var t=["pop","push","reverse","shift","unshift","splice","sort","filter","forEach","reduce","reduceRight","copyWithin","fill"],n=0,r=t.length;n<r;n++)c(e,t[n],e.update);return e},c=function(e,t,n,r){function a(){var e;if(this.callingBack!==!0)return this.callingBack=!0,e=o.apply(r,i),n.apply(r,arguments),this.callingBack=!1,e}var i,o=e[t];return r=r||e,e[t]=function(){i=arguments,a()},e[t].apply=function(){i=arguments[1],a()},e[t]};this.addArrayCallBacks=o,this.addCallBack=c,window.LiveArrayFactory=e}var t,n=window.SimpleDataBinding;n&&(n.prototype.createLiveArrayMember=function(e,t,n){var r=t[n+1]&&t[n+1].container||t.placeholderNode;return t.ownerInstance.createChildArrayMember(t,e,r)},n.prototype.moveLiveArrayMember=function(e,t){var n=e[t+1]&&e[t+1].container||e.placeholderNode;return this.container.parentElement.insertBefore(this.container,n),this},n.prototype.removeLiveArrayMember=function(){this.parent.removeChild(this)},t=new e(n,"createLiveArrayMember","moveLiveArrayMember","removeLiveArrayMember"),n.prototype.arrayEnhancer=t)}();