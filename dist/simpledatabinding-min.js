!function(){function e(t,n,r,a,i){var o,c=this,d=document;this.set=function(e,t,n,r,a){var i,o=c;if(e=g(e),r=r||"data",i=c.data[e],a){for(;void 0===i&&n!==!1&&o.parent;)o=o.parent,i=o[r][e];void 0===i?c[r][e]=t:o[r][e]=t}else c[r][e]=t;return c[r][e]},this.get=function(e,t,n){var r,a=c;for(e=g(e),n=n||"data",r=c[n][e];void 0===r&&t!==!1&&a.parent;)a=a.parent,r=a[n][e];return r},this.update=function(e,t){var n,r;t||H();for(var a in e)e.hasOwnProperty(a)&&(n=e[a],"object"==typeof n?n instanceof Array?u(a,n):c.createChild(a,T(a),n):(r=n,a=g(a),c.root.lastMutation={value:r,oldValue:c.get(a),prop:a},c.set(a,r),c.checkWatches(a)));return c.parseNode(c.container),c.checkWatches("*",!1),c.root.initialized&&z(),c.data},this.removeChild=function(e){return e.container.parentNode.removeChild(e.container),delete c.children[e.id],e.removed=!0,e};var l=function(e){function t(t,n){for(var r=0,a=e.$bindings.length;r<a;r++)e.$bindings[r]&&e.$bindings[r].set&&e.$bindings[r].set(t,n);return n}function n(t,n){Object.defineProperty(e,t,{enumerable:!1,configurable:!0,value:n})}return e&&(e.$bindings?e.$bindings.push(c):(n("$bindings",[c]),n("$set",t)),n("$binding",c)),e},u=function(e,t,n){var r,a,i,o=c.childArrays[e];if(o){for(r=0,a=o.length;r<o.length;r++)c.removeChild(o[r]);if(o.length=0,!document.body.contains(o.placeholderNode)){if(i=n||T(e),!i)return null;c.surroundByComments(o,"child array "+e,i)}}else{if(o=c.configs.modifyInputArrays===!0?t:[],c.childArrays[e]=o,o.idIndex=0,o.ownerInstance=c,o.id=e,i=n||T(e),!i)return null;c.surroundByComments(o,"child array "+e,i)}for(r=0,a=t.length;r<a;r++)o[r]=c.createChildArrayMember(o,t[r]);return c.arrayEnhancer&&!o.update&&c.arrayEnhancer.enhance(o),o};this.createChildArrayMember=function(t,n,r){var a,i,o=c.cache.get(n);return r=r||t.placeholderNode,n instanceof e?n:(o?(r.parentNode.insertBefore(o.container,r),c.createChild(o.id,o.container,n)):(a=s(t,n),i=w(t.elementTemplate,r),o=c.createChild(a,i,n),o.containingArray=t),o)};var s=function(e,t){var n=t.name||t.id||t.heading||t.value||t.label;return n&&!c.children[n]||(e.idIndex++,n=(n||e.id)+e.idIndex),n},p=Object.assign||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);return e};this.createChild=function(t,n,r){var a,i=null;return a=c.cache.get(r),a&&n&&a.removed?(a.container=n,a.update(r),a.removed=!1,i=a):i=new e(n,r,c.configs,t,c),c.children[t]=i,i};var h=function(e,t,n){var r,a=c.children,i=c.childArrays;if(n=n||(c.found=[])&&c,a[e]&&c.root.found.push(a[e]),i[e]&&c.root.found.push(i[e]),t||!c.root.length)for(r in a)a.hasOwnProperty(r)&&a[r].find(e,t,n);return t?c.root.found:c.root.found[0]};this.find=function(e){return h(e)},this.findAll=function(e){return h(e,!0)},this.getBindingFor=function(e){var t=A(e,"[databind]"),n=t&&t.getAttribute("databind"),r=c.root.findAll(n);return r.filter(function(e){return e.container===t})[0]},this.export=function(e){var t=p({},c.data);e&&(t=y(t));for(var n in c.children)c.children.hasOwnProperty(n)&&c.children[n]&&(t[n]=c.children[n].export());return t};var f=function(e){return e.replace(/-([a-z])/gi,function(e,t){return t.toUpperCase()})},m=function(e){return e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()},g=function(e){return c.nameSpace&&e&&e.substring(0,c.nameSpace.length)!==c.nameSpace&&(e=c.nameSpace+e.charAt(0).toUpperCase()+e.slice(1)),e},v=function(e){return(c.attrPrefix?m(c.attrPrefix)+"-":"")+e},b=function(e){return c.nameSpace?(e=e.substring(c.nameSpace.length),e.charAt(0).toLowerCase()+e.slice(1)):e},N=function(e){if(c.nameSpace)for(var t in e)t.substring(0,c.nameSpace.length)!==c.nameSpace&&(c.set(t,e[t]),delete e[t]);return e},y=function(e){if(c.nameSpace)for(var t in e)e.hasOwnProperty(t)&&(e[b(t)]=e[t],delete e[t]);return e},S=function(e,t){var n=e.matches||e.matchesSelector||e.msMatchesSelector||e.mozMatchesSelector||e.webkitMatchesSelector||e.oMatchesSelector;return n&&n.call(e,t)},A=function(e,t){for(;!S(e,t)&&e!==d.body;)e=e.parentElement;return e},w=function(e,t){var n=e.cloneNode(!0);return t.parentNode.insertBefore(n,t),n},O=function(e){var t;return"radio"===e.type?e.checked&&(t=e.value):"checkbox"===e.type?(t=c.get(e.name,!0),t=void 0!==t?t.split(c.checkboxDataDelimiter):[],e.checked?t.push(e.value):t.splice(t.indexOf(e.value),1),t=t.join(c.delimiter)):"OPTION"===e.tagName?(t=c.get(e.name,!0),t=void 0!==t?t.split(c.checkboxDataDelimiter):[],e.selected?t.push(e.value):t.splice(t.indexOf(e.value),1),t=t.join(c.delimiter)):t=e.value,t},C=function(e){if("undefined"!==e.name&&"radio"!==e.type&&"checkbox"!==e.type&&"OPTION"!==e.tagName){var t=e.getAttribute("value");if(t&&"{{"!==t.substr(0,2))return c.set(e.name,O(e))}},x=function(){var e,t="[name]";if("form"===c.container.tagName)for(var n in c.container.elements)c.container.elements.hasOwnProperty(n)&&C(c.container.elements[n]);else{e=Array.prototype.slice.call(c.container.querySelectorAll(t)),S(c.container,t)&&e.push(c.container);for(var r=0,a=e.length;r<a;r++)C(e[r])}return c.data},E=function(){var e=i&&i.container||d;return t&&(c.container=t.tagName?t:e.querySelector(t)),a&&!c.container&&(c.container=e.querySelector("["+v("databind")+'="'+a+'"]')),c.container||i||(c.container=d.querySelector("["+v("databind")+"]")||d.forms[0]||d.body),c.container},T=function(e){var t=c.container.querySelector("["+v("databind")+'="'+e+'"]');return t},k=function(){var e=a,t=(new Date).getTime().toString();return c.container&&(e||(e=c.container.getAttribute("databind")||c.container.id||c.container.name||"binding-"+c.container.tagName+"-"+t),c.container.setAttribute("databind",e)),e||t},P=function(){var e;return c.configs.useHiddenInput&&(e=d.createElement("input"),e.type="hidden",(c.container||d).appendChild(e)),e};this.surroundByComments=function(e,t,n,r){return e.placeholderNode&&document.body.contains(e.placeholderNode)||(e.elementTemplate=n,e.placeholderNode=d.createComment("end "+t),n.placeholderNode=e.placeholderNode,n.parentNode.insertBefore(d.createComment("start "+t),n),n.nextElementSibling?n.parentNode.insertBefore(e.placeholderNode,n.nextElementSibling):n.parentNode.appendChild(e.placeholderNode),r||n.parentNode.removeChild(n)),e.placeholderNode},this.removeCommentedElements=function(e,t){for(;e.previousSibling&&8!==e.previousSibling.nodeType;)1!==e.previousSibling.nodeType||t&&null===e.previousSibling.getAttribute(t)?e=e.previousSibling:e.parentNode.removeChild(e.previousSibling);return e},this.parseNode=function(e){var t;if(e.parsed)return!1;if(3===e.nodeType)W(e);else if(1===e.nodeType){for(t=0;t<e.attributes.length;t++)M(e.attributes[t]);for(t=0;t<e.childNodes.length;t++)e.childNodes[t].hasAttribute&&e.childNodes[t].hasAttribute("databind")||c.parseNode(e.childNodes[t]);e.getAttribute("databind")&&setTimeout(function(){e.classList.remove("unparsed"),e.classList.add("parsed")},0)}return e.parsed=!0,e};var M=function(e){if("data-"!==e.nodeName.substr(0,5))return B(e),I(e),e},B=function(e){var t;return void 0===e.rawName&&("__"===e.nodeName.substr(-2,2)?(e.rawName=e.nodeName.slice(2,-2),e.originalEl=e.ownerElement,e.prevAttrName=e.nodeName):e.rawName=null),null!==e.rawName&&(t=D(g(f(e.rawName)),e),t!==e.prevAttrName&&(t&&e.originalEl.setAttribute(t,e.nodeValue),e.prevAttrName&&e.originalEl.removeAttribute(e.prevAttrName),e.prevAttrName=t)),t},I=function(e){var t,n,r=e.nodeName,a=c.attrMethods[r],i=e.ownerElement;return W(e,e.nodeValue),t=e.value||i&&i[e.name],"value"!==r||"radio"!==i.type&&"checkbox"!==i.type&&"OPTION"!==i.tagName||(n=i&&i.name,n||"OPTION"!==i.tagName||(n=i.parentNode.name),j(i,D(n,e,!1),n,"name")),a&&a.apply(c,[i,D(e.nodeValue,e),e.nodeValue,e.nodeName]),e},W=function(e){if(!e)return"";var t=void 0===e.nodeTemplate,n=e.nodeValue;return t&&("string"==typeof n&&n.indexOf("{{")!==-1?e.nodeTemplate=n:e.nodeTemplate=null),e.nodeTemplate&&(e.nodeValue=e.nodeTemplate.replace(/{{(.*?)}}/g,function(t){return D(t.slice(2,-2),e)})),e.nodeValue},V=function(e,t,n){if("this."===e.substr(0,5)){var r,a,i,o,d=e.indexOf("("),l=d>0&&e.slice(d+1,-1).split(","),u=e.substr(0,d===-1?e.length:d),s=c;for(r=u.split("."),i=1,o=r.length;i<o;i++)s&&(s=s[r[i]]);return"function"==typeof s?(a=function(){var e=[];for(i=0,o=l.length;i<o;i++)e[i]=D(l[i].trim(),t);return s.apply(c,e)},n!==!1&&c.watch(l,a),a):s}return null},D=function(e,t,n){if(!e)return e;var r,a,i="'"===e.substr(0,1)&&e.slice(1,-1),o=Number(e);return i?i:isNaN(o)?(r=V(e,t,n),r?a="function"==typeof r?r():r:(a=c.get(e,!0),n!==!1&&c.watch(e,t)),t&&"name"===t.nodeName&&a&&n!==!1&&c.watch(a,t),a):o};this.templateMaster=function(e){return function(t,n){var r,a,i;return n&&(r=c.root.templates[n],i=r||d.getElementById(n),i&&("TEMPLATE"===i.tagName?(i=i.content||i.firstElementChild,i instanceof DocumentFragment&&(i=i.firstElementChild)):r||i.removeAttribute("id"),c.root.templates[n]=i,a=i.cloneNode(!0),t.placeholderNode?(c.removeCommentedElements(t.placeholderNode),t.placeholderNode.parentNode.insertBefore(a,t.placeholderNode)):(e(t,a),c.surroundByComments(t,"template "+n,a,!0)),c.parseNode(a))),t}};var $=c.templateMaster(function(e,t){return e.appendChild(t)}),L=function(e,t,n){return this.surroundByComments(e,"render if "+n,e,!0),t&&!e.parentElement?e.placeholderNode.parentNode.insertBefore(e,e.placeholderNode):!t&&e.parentElement&&e.parentElement.removeChild(e),e},j=function(e,t,n,r){return void 0!==t&&("radio"===e.type&&"name"===r?e.checked=t===e.value:"checkbox"===e.type&&"name"===r?e.checked=t.indexOf(e.value)!==-1:"SELECT"!==e.tagName||t?"OPTION"!==e.tagName||"value"!==r&&"name"!==r?e.value=t:e.selected=e.value&&t.indexOf(e.value)!==-1:setTimeout(function(){e.selectedIndex="-1"},0)),e},q=function(e){return c.container&&(o=new MutationObserver(U),c.container.addEventListener("change",F),c.container.addEventListener("search",F),e!==!1&&c.container.addEventListener("keyup",F),c===c.root&&(c.turnOnAllBindings(),setTimeout(function(){c.turnOnAllBindings()}))),c},z=function(){return o&&o.observe(c.container,{attributes:!0,attributeOldValue:!0}),o};this.turnOnAllBindings=function(){z();for(var e in c.children)c.children.hasOwnProperty(e)&&c.children[e]&&c.children[e].turnOnAllBindings();return c};var H=function(){return o&&o.disconnect(),o},U=function(e){return e.forEach(function(e){if(e.target===(c.boundHiddenInput||c.container)){var t,r="data-",a=e.target.getAttribute(e.attributeName);e.attributeName.substr(0,r.length)===r&&a!==e.oldValue&&(t=f(e.attributeName.substr(r.length)),c.root.lastMutation={prop:t,value:a,oldValue:e.oldValue},c.checkWatches(t),c.checkWatches("*"),c.configs.modifyInputObjects&&(n[t]=a))}}),e},F=function(e){var t=O(e.target),n=e.target.name;return e.stopPropagation(),!c.containingArray||void 0===c.parent.get(n)||"radio"!==e.target.type&&"checkbox"!==e.target.type?c.set(n,t,!0,"data",!0):c.parent.set(n,t,!0,"data",!0)};this.watch=function(e,t,n){var r,a,i=["*"];"string"==typeof e&&(e=[e]),e instanceof Array||(n=t,t=e,e=i),e=e||i,r=n?c.root:c,a=n?"globalScopeWatches":"watches";for(var o=0,d=e.length;o<d;o++)r[a][e[o]]=r[a][e[o]]||[],r[a][e[o]].indexOf(t)===-1&&r[a][e[o]].push(t);return r[n?"globalScopeWatches":"watches"]};var _=function(e,t){var n,r=t?c.root:c,a=t?"globalScopeWatches":"watches",i=r[a][e];if(i)for(var o=i.length-1;o>=0;o--)"function"==typeof i[o]?Z(i[o]):(n=i[o],2===n.nodeType?M(n):W(n));return r};this.checkWatches=function(e,t){if(c.removed)return!1;if(c.watches[e]&&(_(e,!1),_("*",!1),c.root.globalScopeWatches[e]&&_(e,!0),c.root.globalScopeWatches["*"]&&_("*",!0)),t!==!1)for(var n in c.children)c.children.hasOwnProperty(n)&&c.children[n]&&c.children[n].checkWatches(e);return e};var Z=function(e){var t=c.root.lastMutation,n=[t.value,t.oldValue,t.prop];if(void 0!==c.get(t.prop))return e.apply(c,n)},G=function(){return c.configs=r||{},c.nameSpace="string"==typeof c.configs.nameSpace?c.configs.nameSpace:"",c.attrPrefix="string"==typeof c.configs.attrPrefix?c.configs.attrPrefix:"",c.container=E(),c.id=k(),c.boundHiddenInput=P(),c.watches=c.configs.watches||{},c.globalScopeWatches=c.configs.globalScopeWatches||{},c.checkboxDataDelimiter=c.configs.checkboxDataDelimiter||",",c.attrMethods=p({},c.configs.attrMethods||{}),c.attrMethods.name=j,c.attrMethods[v("renderif")]=L,c.attrMethods[v("childtemplate")]=$,c.templates=p({},c.configs.templates||{}),c.logic=p({},c.configs.logic||{}),c.cache=new WeakMap,c},J=function(){return c.parent=i,c.parent?(c.ancestors=c.parent.ancestors.slice(),c.ancestors.push(i)):c.ancestors=[],c.root=c.ancestors[0]||c,c.children={},c.childArrays={},c},K=function(){var e=c.boundHiddenInput||c.container;return e&&(n&&c.parent&&c.parent.cache.set(n,c),c.data=N(e.dataset),c.update(c.data),x(),c.update(n||{}),l(n)),c};this.init=function(){return J(),G(),K(),q(this.configs.keyUp),c.initialized=!0,this},this.init()}window.SimpleDataBinding=e}();