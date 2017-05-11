!function(){function e(t,n,r,a,i){var o,c=this,d=(this.rawAttrMethods.name,document),l=function(e){return e.replace(/-([a-z])/gi,function(e,t){return t.toUpperCase()})},u=function(e){return e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()},s=function(e){return c.nameSpace&&e&&e.substring(0,c.nameSpace.length)!==c.nameSpace&&(e=c.nameSpace+e.charAt(0).toUpperCase()+e.slice(1)),e},h=function(e){return(c.attrPrefix?u(c.attrPrefix)+"-":"")+e},p=function(e){return c.nameSpace?(e=e.substring(c.nameSpace.length),e.charAt(0).toLowerCase()+e.slice(1)):e},f=function(e){if(c.nameSpace)for(var t in e)t.substring(0,c.nameSpace.length)!==c.nameSpace&&(c.set(t,e[t]),delete e[t]);return e},m=function(e){if(c.nameSpace)for(var t in e)e.hasOwnProperty(t)&&(e[p(t)]=e[t],delete e[t]);return e};this.set=function(e,t,n,r,a){var i,o=c;if(e=s(e),r=r||"data",i=c.data[e],t=c.normalize(t),a){for(;void 0===i&&n!==!1&&o.parent;)o=o.parent,i=o[r][e];void 0===i?c[r][e]=t:o[r][e]=t}else c[r][e]="data"===r?t||"":t;return c[r][e]},this.get=function(e,t,n){var r,a=c;for(e=s(e),n=n||"data",r=c[n][e];void 0===r&&t!==!1&&a.parent;)a=a.parent,r=a[n][e];return r},this.dataBindFromAttr=function(e){var t=e.getAttribute(h("databind")),n=c.get(t,!0,"startData");n instanceof Array?e.parsed||(e.parsed=!0,c.updateChildArray(t,n,e)):c.createChild(t,e,n)},this.update=function(e,t,n,r){var a,i;t||H();for(var o in e)e.hasOwnProperty(o)&&(a=e[o],"object"==typeof a?r!==!1&&(a instanceof Array?c.updateChildArray(o,a):c.createChild(o,B(o),a)):(i=a,o=s(o),c.root.lastMutation={value:i,oldValue:c.get(o),prop:o},c.set(o,i),c.checkWatches(o)));return n!==!1&&c.parseNode(c.container),c.checkWatches("*",!1),c.root.initialized&&q(),c.data},this.removeChild=function(e){return D(e),delete c.children[e.id],e.removed=!0,e};var v=function(e){function t(t){for(var n=0,r=e.$bindings.length;n<r;n++)e.$bindings[n].update(t||e)}function n(t,n){for(var r=0,a=e.$bindings.length;r<a;r++)e.$bindings[r]&&e.$bindings[r].set&&e.$bindings[r].set(t,n);return n}function r(t,n){Object.defineProperty(e,t,{enumerable:!1,configurable:!0,value:n})}return e&&(e.$bindings?e.$bindings.push(c):(r("$bindings",[c]),r("$set",n)),r("$binding",c),r("$update",t)),e},g=function(e,t,n){var r,a=c.configs.modifyInputArrays===!0?t:[];if(a.idIndex=0,a.ownerInstance=c,a.id=e,c.childArrayNameIndices[e]=c.childArrayNameIndices[e]||0,c.childArrays[e]&&(c.childArrayNameIndices[e]++,a.id+=c.childArrayNameIndices[e]||""),r=n||B(e))return c.surroundByComments(a,"child array "+e,r),c.childArrays[a.id]=a,a},b=function(e,t,n,r){var a,i,o;for(a=0,i=r.priorState.length;a<i;a++)t.indexOf(r.priorState[a])===-1&&c.removeChild(r.priorState[a]);if(!document.body.contains(r.placeholderNode)){if(o=n||B(e),!o)return null;c.surroundByComments(r,"child array "+e,o)}r.ownerInstance=c};this.updateChildArray=function(e,t,n){var r=c.childArrays[e],a=document.createDocumentFragment();if(r&&r.placeHolderNode===n?b(e,t,n,r):r=g(e,t,n),r){for(var i=0,o=t.length;i<o;i++)r[i]=c.createChildArrayMember(r,t[i],a);return r.priorState=r.slice(),x(r,a),c.arrayEnhancer&&!r.update&&c.arrayEnhancer.enhance(r),r}},this.createChildArrayMember=function(t,n,r){"object"!=typeof n&&(n={value:n});var a,i=c.cache.get(n);return n instanceof e?(i=n,O(i.container,r)):i&&i.removed?(c.createChild(i.id,i.container,n),O(i.container,r)):(a=O(k(t),r),i=c.createChild(y(t,n),a,n),i.containingArray=t),i};var y=function(e,t){var n=t.name;return n?(c.childNameIndices[n]=c.childNameIndices[n]||0,c.children[n]&&c.childNameIndices[n]++,n+=c.childNameIndices[n]||""):n=e.id+"_"+e.idIndex,e.idIndex++,n},N=function(){var e=a,t=(new Date).getTime().toString();return c.container&&(e||(e=c.container.getAttribute(h("databind"))||c.container.id||c.container.name||"binding-"+c.container.tagName+"-"+t),c.container.getAttribute(h("databind"))||c.container.setAttribute(h("databind"),e)),e||t},A=Object.assign||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);return e};this.createChild=function(t,n,r){var a,i=null;return a=c.cache.get(r),a&&n&&a.removed?(a.container=n,a.update(r,!1,!0,!1),a.removed=!1,i=a):(c.children[t]&&!c.children[t].containingArray&&(c.childNameIndices[t]=c.childNameIndices[t]||0,c.childNameIndices[t]++,t+=c.childNameIndices[t]||""),i=new e(n,r,c.configs,t,c)),c.children[t]=i,i};var w=function(e,t,n){var r,a=c.children,i=c.childArrays;if(n=n||(c.found=[])&&c,a[e]&&n.found.push(a[e]),i[e]&&n.found.push(i[e]),t||!n.found.length)for(r in a)a.hasOwnProperty(r)&&a[r].find(e,t,n);return t?n.found:n.found[0]};this.find=function(e){return w(e)},this.findAll=function(e){return w(e,!0)},this.getBindingFor=function(e){var t=C(e,"[databind]"),n=t&&t.getAttribute(h("databind")),r=c.root.findAll(n);return r.filter(function(e){return e.container===t})[0]},this.export=function(e){var t=A({},c.data);e&&(t=m(t));for(var n in c.children)c.children.hasOwnProperty(n)&&c.children[n]&&(t[n]=c.children[n].export(e));return t};var S=function(e,t){var n=!!e&&(e.matches||e.matchesSelector||e.msMatchesSelector||e.mozMatchesSelector||e.webkitMatchesSelector||e.oMatchesSelector);return n&&n.call(e,t)},C=function(e,t){for(;!S(e,t)&&e!==d.body;)e=e.parentElement;return e},O=function(e,t){return t&&t.appendChild(e)},k=function(e){return e.elementTemplate.cloneNode(!0)},x=function(e,t){var n=e.placeholderNode;return n.parentNode.insertBefore(t,n),n},E=function(e){var t;return"radio"===e.type?e.checked&&(t=e.value):"checkbox"===e.type?(t=c.get(e.name,!0),t=t?t.split(c.checkboxDataDelimiter):[],e.checked?t.indexOf(e.value)===-1&&t.push(e.value):t.splice(t.indexOf(e.value),1),t=t.join(c.checkboxDataDelimiter)):"OPTION"===e.tagName?(t=c.get(e.name,!0),t=void 0!==t?t.split(c.checkboxDataDelimiter):[],e.selected?t.push(e.value):t.splice(t.indexOf(e.value),1),t=t.join(c.checkboxDataDelimiter)):t=e.value,t},I=function(e){if("undefined"!==e.name&&"radio"!==e.type&&"checkbox"!==e.type&&"OPTION"!==e.tagName){var t=e.getAttribute("value");if(t&&"{{"!==t.substr(0,2))return c.set(e.name,E(e))}},M=function(){var e,t="[name]";if("form"===c.container.tagName)for(var n in c.container.elements)c.container.elements.hasOwnProperty(n)&&I(c.container.elements[n]);else{e=Array.prototype.slice.call(c.container.querySelectorAll(t)),S(c.container,t)&&e.push(c.container);for(var r=0,a=e.length;r<a;r++)I(e[r])}return c.data},T=function(){var e=i&&i.container||d;return t&&(c.container=t.tagName?t:e.querySelector(t)),a&&!c.container&&(c.container=e.querySelector("["+h("databind")+'="'+a+'"]')),c.container||i||(c.container=d.querySelector("["+h("databind")+"]")||d.forms[0]||d.body),c.container},B=function(e){var t=c.container.querySelector("["+h("databind")+'="'+e+'"]');return t},P=function(){var e;return c.configs.useHiddenInput&&(e=d.createElement("input"),e.type="hidden",(c.container||d).appendChild(e)),e};this.surroundByComments=function(e,t,n,r){return e.placeholderNode&&document.body.contains(e.placeholderNode)||!n||!n.parentNode||(e.elementTemplate=n,e.placeholderNode=d.createComment("end "+t),n.placeholderNode=e.placeholderNode,n.parentNode.insertBefore(d.createComment("start "+t),n),n.nextElementSibling?n.parentNode.insertBefore(e.placeholderNode,n.nextElementSibling):n.parentNode.appendChild(e.placeholderNode),r||n.parentNode.removeChild(n)),e.placeholderNode},this.removeCommentedElements=function(e,t){for(;e.previousSibling&&8!==e.previousSibling.nodeType;)1!==e.previousSibling.nodeType||t&&null===e.previousSibling.getAttribute(t)?e=e.previousSibling:e.parentNode.removeChild(e.previousSibling);return e};var D=function(e){var t=e.container;t&&t.parentNode&&t.parentNode.removeChild(t)};this.parseNode=function(e){var t;if(e.parsed||"TEMPLATE"===e.tagName)return!1;if(3===e.nodeType)L(e);else if(1===e.nodeType){for(t=0;t<e.attributes.length;t++)V(e.attributes[t]);for(t=0;t<e.childNodes.length;t++)e.childNodes[t].hasAttribute&&e.childNodes[t].hasAttribute("databind")?c.dataBindFromAttr(e.childNodes[t]):c.parseNode(e.childNodes[t]);e.classList&&e.getAttribute(h("databind"))&&setTimeout(function(){e.classList.remove("unparsed"),e.classList.add("parsed")},0)}return e.parsed=!0,e};var V=function(e,t){return"data-"!==e.nodeName.substr(0,5)?(W(e),$(e,t),e):void L(e,e.nodeValue)},W=function(e){var t;return void 0===e.rawName&&("__"===e.nodeName.substr(-2,2)?(e.rawName=e.nodeName.slice(2,-2),e.originalEl=e.ownerElement,e.prevAttrName=e.nodeName):e.rawName=null),null!==e.rawName&&(t=z(s(l(e.rawName)),e),t!==e.prevAttrName&&(t&&e.originalEl.setAttribute(t,e.nodeValue),e.prevAttrName&&e.originalEl.removeAttribute(e.prevAttrName),e.prevAttrName=t)),t},$=function(e,t){var n,r,a,i="name"===e.nodeName?e.nodeName:s(l(e.nodeName)),o=c.attrMethods[i],d=e.ownerElement;return L(e,e.nodeValue),r=e.value||d&&d[e.name],"value"!==e.nodeName||"radio"!==d.type&&"checkbox"!==d.type&&"OPTION"!==d.tagName||(a=d&&d.name,!a&&"OPTION"===d.tagName&&d.parentNode&&(n=d.parentNode instanceof DocumentFragment?"SELECT"===c.parent.container.tagName?c.parent.container:c.parent.container.querySelector("select"):d.parentNode,a=n.name),c.setNodeValue(d,z(a,e,!1),a,"name")),o&&o.apply(c,[d,z(e.nodeValue,e),e.nodeValue,i,e,!t]),e},L=function(e){if(!e)return"";var t=void 0===e.nodeTemplate,n=e.nodeValue;return t&&("string"==typeof n&&n.indexOf("{{")!==-1?e.nodeTemplate=n:e.nodeTemplate=null),e.nodeTemplate&&(e.nodeValue=e.nodeTemplate.replace(/{{(.*?)}}/g,function(t){return z(t.slice(2,-2),e)||""})),e.nodeValue},j=function(e,t,n){if(e.indexOf(".")>0){var r,a,i,o,d,l=e.indexOf("("),u=l>0&&e.slice(l+1,-1).split(","),s=e.substr(0,l===-1?e.length:l);if(a=s.split("."),r="this"===a[0]?c:window[a[0]],!r)return null;for(o=1,d=a.length;o<d;o++)r&&(r=r[a[o]]);return"function"==typeof r?(i=function(){var e=[];for(o=0,d=u.length;o<d;o++)e[o]=z(u[o].trim(),t);return e.push.apply(e,arguments),r.apply(c,e)},n!==!1&&c.watch(u,i),i):r}return null},z=function(e,t,n){if(!e)return e;var r,a,i="'"===e.substr(0,1)&&e.slice(1,-1),o=Number(e);return i?i:isNaN(o)?(r=j(e,t,n),r?a="function"==typeof r&&e.indexOf("(")>0?r():r:(a=c.get(e,!0)||"",n!==!1&&c.watch(e,t)),t&&"name"===t.nodeName&&a&&n!==!1&&c.watch(a,t),a):o},F=function(e){return c.container&&(o=new MutationObserver(U),c.container.addEventListener("change",_),c.container.addEventListener("search",_),e!==!1&&c.container.addEventListener("keyup",_),c===c.root&&(c.turnOnAllBindings(),setTimeout(function(){c.turnOnAllBindings()}))),c},q=function(){return o&&o.observe(c.container,{attributes:!0,attributeOldValue:!0}),o};this.turnOnAllBindings=function(){q();for(var e in c.children)c.children.hasOwnProperty(e)&&c.children[e]&&c.children[e].turnOnAllBindings();return c};var H=function(){return o&&o.disconnect(),o},U=function(e){return e.forEach(function(e){if(e.target===(c.boundHiddenInput||c.container)){var t,r="data-",a=e.target.getAttribute(e.attributeName);e.attributeName.substr(0,r.length)===r&&a!==e.oldValue&&(t=l(e.attributeName.substr(r.length)),c.root.lastMutation={prop:t,value:a,oldValue:e.oldValue},c.checkWatches(t),c.checkWatches("*"),c.configs.modifyInputObjects&&(n[t]=a))}}),e},_=function(e){var t=E(e.target),n=e.target.name;return!c.containingArray||void 0===c.parent.get(n)||"radio"!==e.target.type&&"checkbox"!==e.target.type?c.set(n,t,!0,"data",!0):c.parent.set(n,t,!0,"data",!0)};this.watch=function(e,t,n){var r,a,i=["*"];"string"==typeof e&&(e=[e]),e instanceof Array||(n=t,t=e,e=i),e=e||i,r=n?c.root:c,a=n?"globalScopeWatches":"watches";for(var o=0,d=e.length;o<d;o++)r[a][e[o]]=r[a][e[o]]||[],r[a][e[o]].indexOf(t)===-1&&r[a][e[o]].push(t);return r[n?"globalScopeWatches":"watches"]};var R=function(e,t){var n,r=t?c.root:c,a=t?"globalScopeWatches":"watches",i=r[a][e];if(i)for(var o=i.length-1;o>=0;o--)"function"==typeof i[o]?Z(i[o]):(n=i[o],2===n.nodeType?V(n,!0):L(n));return r};this.checkWatches=function(e,t){if(c.removed)return!1;if(c.watches[e]&&(R(e,!1),R("*",!1),c.root.globalScopeWatches[e]&&R(e,!0),c.root.globalScopeWatches["*"]&&R("*",!0)),t!==!1)for(var n in c.children)c.children.hasOwnProperty(n)&&c.children[n]&&c.children[n].checkWatches(e);return e};var Z=function(e){var t=c.root.lastMutation,n=[t.value,t.oldValue,t.prop];if(void 0!==c.get(t.prop))return e.apply(c,n)},G=function(){return c.configs=r||{},c.nameSpace="string"==typeof c.configs.nameSpace?c.configs.nameSpace:"",c.attrPrefix="string"==typeof c.configs.attrPrefix?c.configs.attrPrefix:"",c.container=T(),c.id=N(),c.boundHiddenInput=P(),c.watches=c.configs.watches||{},c.globalScopeWatches=c.configs.globalScopeWatches||{},c.checkboxDataDelimiter=c.configs.checkboxDataDelimiter||",",c.attrMethods=c.nameSpaceAttrMethods(h),c.attrMethods=A(c.attrMethods,c.configs.attrMethods||{}),c.templates=A({},c.configs.templates||{}),c.logic=A({},c.configs.logic||{}),c.cache=new WeakMap,c.childNameIndices={},c.childArrayNameIndices={},c},J=function(){return c.parent=i,c.parent?(c.ancestors=c.parent.ancestors.slice(),c.ancestors.push(i)):c.ancestors=[],c.root=c.ancestors[0]||c,c.children={},c.childArrays={},c},K=function(){var e=c.boundHiddenInput||c.container;return e&&("object"!=typeof n&&(n={value:n}),c.startData=n,n&&c.parent&&c.parent.cache.set(n,c),c.data=f(e.dataset||{}),c.update(c.data,!1,!1,!1),M(),c.update(n||{},!1,!0,!1),v(n)),c};this.init=function(){return J(),G(),K(),F(this.configs.keyUp),c.initialized=!0,this},this.init()}var t,n={};t=e.prototype,t.templateMaster=function(e){return function(t,n,r,a,i){var o,c,d;return n&&(o=this.root.templates[n],d=o||document.getElementById(n),d&&("TEMPLATE"===d.tagName?(d=d.content||d.firstElementChild,d instanceof DocumentFragment&&(d=d.firstElementChild)):o||d.removeAttribute("id"),this.root.templates[n]=d,c=d.cloneNode(!0),i.placeholderNode&&(this.removeCommentedElements(i.placeholderNode),i.placeholderNode.parentNode.removeChild(i.placeholderNode)),e.apply(this,[t,c]),this.surroundByComments(i,"template "+n,c,!0),this.parseNode(c))),t}},t.nameSpaceAttrMethods=function(e){var t={};for(var n in this.rawAttrMethods)this.rawAttrMethods.hasOwnProperty(n)&&"name"!==n&&(t[e(n)]=this.rawAttrMethods[n]);return t.name=this.rawAttrMethods.name,t},t.normalize=function(e,t){return 0===e&&(e="0"),!t||"false"!==e&&"undefined"!==e||(e=""),e},n.replacementtemplate=t.templateMaster(function(e,t){if(e.parentNode.insertBefore(t,e),e===this.container){for(var n in e.dataset)e.dataset.hasOwnProperty[n]&&(t.dataset[n]=e.dataset[n]);this.container=t}return setTimeout(function(){e.parentNode&&e.parentNode.removeChild(e)}),t}),n.childtemplate=t.templateMaster(function(e,t){return e.appendChild(t)}),n.renderif=function(e,t,n,r,a){return t=this.normalize(t,!0),this.surroundByComments(e,r+" "+n,e,!0),t&&!e.parentElement?e.placeholderNode.parentNode.insertBefore(e,e.placeholderNode):!t&&e.parentElement&&e.parentElement.removeChild(e),e},n.renderifnot=function(e,t,r,a,i){n.renderif.apply(this,[e,!this.normalize(t,!0),r,a,i])},n.click=function(e,t){var n=this;e.addEventListener("click",function(r){e.hasAttribute("disabled")||"true"===e.getAttribute("aria-disabled")||t.apply(n,[r,e])})},n.clickon=function(e,t,r){var a=this;n.click(e,function(){a.set(r,"true",!0,null,!0)})},n.clickoff=function(e,t,r){var a=this;n.click(e,function(){a.set(r,"",!0,null,!0)})},n.name=function(e,t,n,r){return void 0!==t&&("radio"===e.type&&"name"===r?e.checked=t===e.value:"checkbox"===e.type&&"name"===r?e.checked=t.indexOf(e.value)!==-1:"SELECT"!==e.tagName||t?"OPTION"!==e.tagName||"value"!==r&&"name"!==r?e.value=t:e.selected=e.value&&t.indexOf(e.value)!==-1:setTimeout(function(){e.selectedIndex="-1"},0)),e},t.rawAttrMethods=n,t.setNodeValue=n.name,window.SimpleDataBinding=e}(),function(){function e(t,n,r){var a=this;this.enhance=function(e){return e.update=a.update,a.addArrayCallBacks(e),e.set=function(t,n){e[t]=n,e.update()},e},this.update=function(){var e=this;return e.ownerInstance[r](e.id,e,e.placeHolderNode),e};var i=function(e){for(var t=["pop","push","reverse","shift","unshift","splice","sort","filter","forEach","reduce","reduceRight","copyWithin","fill"],n=0,r=t.length;n<r;n++)o(e,t[n],e.update);return e},o=function(e,t,n,r){function a(){var e;if(this.callingBack!==!0)return this.callingBack=!0,e=o.apply(r,i),n.apply(r,arguments),this.callingBack=!1,e}var i,o=e[t];return r=r||e,e[t]=function(){i=arguments,a()},e[t].apply=function(){i=arguments[1],a()},e[t]};this.addArrayCallBacks=i,this.addCallBack=o,window.LiveArrayFactory=e}var t,n=window.SimpleDataBinding;n&&(t=new e(n,"removeChild","updateChildArray"),n.prototype.arrayEnhancer=t),window.$bind=function(e,t,n,r){return n=n||{},n.updateInputObjects=!0,new SimpleDataBinding(e,t,n,r)}}();