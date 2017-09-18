!function(){function SimpleDataBinding(container,startData,configs,id,parentInstance){var self=this,doc=document,observer,toCamelCase=function(e){return e.replace(/-([a-z])/gi,function(e,t){return t.toUpperCase()})},toHyphenated=function(e){return e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()},toPrefixedCamel=function(e){return self.nameSpace&&e&&e.substring(0,self.nameSpace.length)!==self.nameSpace&&(e=self.nameSpace+e.charAt(0).toUpperCase()+e.slice(1)),e},toPrefixedHyphenated=function(e){return(self.attrPrefix?toHyphenated(self.attrPrefix)+"-":"")+e},toUnprefixedCamel=function(e){return self.nameSpace?(e=e.substring(self.nameSpace.length),e.charAt(0).toLowerCase()+e.slice(1)):e},prefixData=function(e){if(self.nameSpace)for(var t in e)t.substring(0,self.nameSpace.length)!==self.nameSpace&&(self.set(t,e[t]),delete e[t]);return e},unprefixData=function(e){if(self.nameSpace)for(var t in e)e.hasOwnProperty(t)&&(e[toUnprefixedCamel(t)]=e[t],delete e[t]);return e};this.set=function(e,t,n,r,a){var i,s=self;if(e=toPrefixedCamel(e),r=r||"data",i=self.data[e],t=self.normalize(t),a){for(;void 0===i&&!1!==n&&s.parent;)s=s.parent,i=s[r][e];void 0===i?self[r][e]=t:s[r][e]=t}else self[r][e]="data"===r?t||"":t;return self[r][e]},this.get=function(e,t,n){var r,a=self;for(e=toPrefixedCamel(e),n=n||"data",r=self[n][e];void 0===r&&!1!==t&&a.parent;)a=a.parent,r=a[n][e];return r},this.dataBindFromAttr=function(e){var t=e.getAttribute(toPrefixedHyphenated("databind")),n=self.get(t,!0,"startData");n instanceof Array?e.parsed||(e.parsed=!0,self.updateChildArray(t,n,e)):self.createChild(t,e,n)},this.update=function(e,t,n,r){var a,i;t||turnOffBindings();for(var s in e)e.hasOwnProperty(s)&&(a=e[s],"object"==typeof a?!1!==r&&(a instanceof Array?self.updateChildArray(s,a):self.createChild(s,getContainer(s),a)):(i=a,s=toPrefixedCamel(s),self.root.lastMutation={value:i,oldValue:self.get(s),prop:s},self.set(s,i),self.checkWatches(s)));return!1!==n&&self.parseNode(self.container),self.checkWatches("*",!1),self.root.initialized&&turnOnBindings(),self.data},this.removeChild=function(e){return removeChildContainer(e),delete self.children[e.id],e.removed=!0,self.removedChildren[e.id]=e,e};var wireData=function(e){function t(t){for(var n=0,r=e.$bindings.length;n<r;n++)e.$bindings[n].update(t||e)}function n(t,n){for(var r=0,a=e.$bindings.length;r<a;r++)e.$bindings[r]&&e.$bindings[r].set&&e.$bindings[r].set(t,n);return n}function r(t,n){Object.defineProperty(e,t,{enumerable:!1,configurable:!0,value:n})}return e&&(e.$bindings?e.$bindings.push(self):(r("$bindings",[self]),r("$set",n)),r("$binding",self),r("$update",t)),e},createChildArray=function(e,t,n){var r,a=!0===self.configs.modifyInputArrays?t:[];if(a.idIndex=0,a.ownerInstance=self,a.id=e,self.childArrayNameIndices[e]=self.childArrayNameIndices[e]||0,self.childArrays[e]&&(self.childArrayNameIndices[e]++,a.id+=self.childArrayNameIndices[e]||""),r=n||getContainer(e))return self.surroundByComments(a,"child array "+e,r),self.childArrays[a.id]=a,a},resetChildArray=function(e,t,n,r){var a,i,s;for(a=0,i=r.priorState.length;a<i;a++)-1===t.indexOf(r.priorState[a])&&self.removeChild(r.priorState[a]);if(!document.body.contains(r.placeholderNode)){if(!(s=n||getContainer(e)))return null;self.surroundByComments(r,"child array "+e,s)}r.ownerInstance=self};this.updateChildArray=function(e,t,n){var r=self.childArrays[e],a=document.createDocumentFragment();if(r&&r.placeHolderNode===n?resetChildArray(e,t,n,r):r=createChildArray(e,t,n),r){for(var i=0,s=t.length;i<s;i++)r[i]=self.createChildArrayMember(r,t[i],a);return r.priorState=r.slice(),renderChildArray(r,a),self.arrayEnhancer&&!r.update&&self.arrayEnhancer.enhance(r),r}},this.createChildArrayMember=function(e,t,n){"object"!=typeof t&&(t={value:t});var r,a;return t instanceof SimpleDataBinding?(r=t,placeChildArrayEl(r.container,n)):(a=placeChildArrayEl(createChildArrayEl(e),n),r=self.createChild(generateChildArrayMemberId(e,t),a,t),r.containingArray=e),r};var generateChildArrayMemberId=function(e,t){var n=t.name;return n?(self.childNameIndices[n]=self.childNameIndices[n]||0,self.children[n]&&self.childNameIndices[n]++,n+=self.childNameIndices[n]||""):n=e.id+"_"+e.idIndex,e.idIndex++,n},setId=function(){var e=id,t=(new Date).getTime().toString();return self.container&&(e||(e=self.container.getAttribute(toPrefixedHyphenated("databind"))||self.container.id||self.container.name||"binding-"+self.container.tagName+"-"+t),self.container.getAttribute(toPrefixedHyphenated("databind"))||self.container.setAttribute(toPrefixedHyphenated("databind"),e)),e||t},assign=Object.assign||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);return e};this.createChild=function(e,t,n){var r,a=null;return r=self.removedChildren[e],r&&t&&r.removed?(r.container=t,r.update(n,!1,!0,!1),r.removed=!1,delete self.removedChildren[e],a=r):(self.children[e]&&!self.children[e].containingArray&&(self.childNameIndices[e]=self.childNameIndices[e]||0,self.childNameIndices[e]++,e+=self.childNameIndices[e]||""),a=new SimpleDataBinding(t,n,self.configs,e,self)),self.children[e]=a,a};var find=function(e,t,n){var r,a=self.children,i=self.childArrays;if(n=n||(self.found=[])&&self,a[e]&&n.found.push(a[e]),i[e]&&n.found.push(i[e]),t||!n.found.length)for(r in a)a.hasOwnProperty(r)&&a[r].find(e,t,n);return t?n.found:n.found[0]};this.find=function(e){return find(e)},this.findAll=function(e){return find(e,!0)},this.getBindingFor=function(e){var t=closest(e,"[databind]"),n=t&&t.getAttribute(toPrefixedHyphenated("databind"));return self.root.findAll(n).filter(function(e){return e.container===t})[0]},this.export=function(e){var t=assign({},self.data);e&&(t=unprefixData(t));for(var n in self.children)self.children.hasOwnProperty(n)&&self.children[n]&&(t[n]=self.children[n].export(e));return t};var is=function(e,t){var n=!!e&&(e.matches||e.matchesSelector||e.msMatchesSelector||e.mozMatchesSelector||e.webkitMatchesSelector||e.oMatchesSelector);return n&&n.call(e,t)},closest=function(e,t){for(;!is(e,t)&&e!==doc.body;)e=e.parentElement;return e},placeChildArrayEl=function(e,t){return t&&t.appendChild(e)},createChildArrayEl=function(e){return e.elementTemplate.cloneNode(!0)},renderChildArray=function(e,t){var n=e.placeholderNode;return n.parentNode.insertBefore(t,n),n},getNodeValue=function(e){var t,n;return"radio"===e.type?e.checked&&(t=e.value):"checkbox"===e.type?(t=self.get(e.name,!0),t=t?t.split(self.checkboxDataDelimiter):[],n=t.indexOf(e.value),e.checked?-1===n&&t.push(e.value):-1!==n&&t.splice(n,1),t=t.join(self.checkboxDataDelimiter)):"OPTION"===e.tagName?(t=self.get(e.name,!0),t=void 0!==t?t.split(self.checkboxDataDelimiter):[],e.selected?t.push(e.value):t.splice(t.indexOf(e.value),1),t=t.join(self.checkboxDataDelimiter)):t=e.value,t},getControlValue=function(e){if("undefined"!==e.name&&"radio"!==e.type&&"checkbox"!==e.type&&"OPTION"!==e.tagName){var t=e.getAttribute("value");if(t&&"{{"!==t.substr(0,2))return self.set(e.name,getNodeValue(e))}},getInitialNodeValues=function(){var e;if("form"===self.container.tagName)for(var t in self.container.elements)self.container.elements.hasOwnProperty(t)&&getControlValue(self.container.elements[t]);else{e=Array.prototype.slice.call(self.container.querySelectorAll("[name]")),is(self.container,"[name]")&&e.push(self.container);for(var n=0,r=e.length;n<r;n++)getControlValue(e[n])}return self.data},setContainer=function(){var e=parentInstance&&parentInstance.container||doc;return container&&(self.container=container.tagName?container:e.querySelector(container)),id&&!self.container&&(self.container=e.querySelector("["+toPrefixedHyphenated("databind")+'="'+id+'"]')),self.container||parentInstance||(self.container=doc.querySelector("["+toPrefixedHyphenated("databind")+"]")||doc.forms[0]||doc.body),self.container},getContainer=function(e){return self.container.querySelector("["+toPrefixedHyphenated("databind")+'="'+e+'"]')},setHiddenInput=function(){var e;return self.configs.useHiddenInput&&(e=doc.createElement("input"),e.type="hidden",(self.container||doc).appendChild(e)),e};this.surroundByComments=function(e,t,n,r){return e.placeholderNode&&document.body.contains(e.placeholderNode)||!n||!n.parentNode||(e.elementTemplate=n,e.placeholderNode=doc.createComment("end "+t),n.placeholderNode=e.placeholderNode,n.parentNode.insertBefore(doc.createComment("start "+t),n),n.nextElementSibling?n.parentNode.insertBefore(e.placeholderNode,n.nextElementSibling):n.parentNode.appendChild(e.placeholderNode),r||n.parentNode.removeChild(n)),e.placeholderNode},this.removeCommentedElements=function(e,t){for(;e.previousSibling&&8!==e.previousSibling.nodeType;)1!==e.previousSibling.nodeType||t&&null===e.previousSibling.getAttribute(t)?e=e.previousSibling:e.parentNode.removeChild(e.previousSibling);return e};var removeChildContainer=function(e){var t=e.container;t&&t.parentNode&&t.parentNode.removeChild(t)};this.parseNode=function(e){var t;if(e.parsed||"TEMPLATE"===e.tagName)return!1;if(3===e.nodeType)resolveDoubleCurlyBraces(e);else if(1===e.nodeType){for(t=0;t<e.attributes.length;t++)self.resolveAttrNode(e.attributes[t]);for(t=0;t<e.childNodes.length;t++)e.childNodes[t].hasAttribute&&e.childNodes[t].hasAttribute("databind")?self.dataBindFromAttr(e.childNodes[t]):self.parseNode(e.childNodes[t]);e.classList&&e.getAttribute(toPrefixedHyphenated("databind"))&&setTimeout(function(){e.classList.remove("unparsed"),e.classList.add("parsed")},0)}return e.parsed=!0,e},this.resolveAttrNode=function(e,t){if("data-"!==e.nodeName.substr(0,5))return resolveAttrNodeName(e),resolveAttrNodeValue(e,t),"name"!==e.nodeName&&"value"!==e.nodeName||setTimeout(function(){self.setNodeValue(e.ownerElement,self.get(e.nodeValue,!0),e.nodeValue,e.nodeName)}),e;resolveDoubleCurlyBraces(e,e.nodeValue)};var resolveAttrNodeName=function(e){var t;return void 0===e.rawName&&("__"===e.nodeName.substr(-2,2)?(e.rawName=e.nodeName.slice(2,-2),e.originalEl=e.ownerElement,e.prevAttrName=e.nodeName):e.rawName=null),null!==e.rawName&&(t=parseExpression(toPrefixedCamel(toCamelCase(e.rawName)),e))!==e.prevAttrName&&(t&&e.originalEl.setAttribute(t,e.nodeValue),e.prevAttrName&&e.originalEl.removeAttribute(e.prevAttrName),e.prevAttrName=t),t},resolveAttrNodeValue=function(e,t){var n,r,a="name"===e.nodeName?e.nodeName:toPrefixedCamel(toCamelCase(e.nodeName)),i=self.attrMethods[a],s=e.ownerElement;return resolveDoubleCurlyBraces(e,e.nodeValue),e.value||s&&s[e.name],"value"!==e.nodeName||"radio"!==s.type&&"checkbox"!==s.type&&"OPTION"!==s.tagName||(r=s&&s.name,!r&&"OPTION"===s.tagName&&s.parentNode&&(n=s.parentNode instanceof DocumentFragment?"SELECT"===self.parent.container.tagName?self.parent.container:self.parent.container.querySelector("select"):s.parentNode,r=n.name),self.setNodeValue(s,parseExpression(r,e,!1),r,"name")),i&&i.apply(self,[s,parseExpression(e.nodeValue,e),e.nodeValue,a,e,!t]),e},resolveDoubleCurlyBraces=function(e){if(!e)return"";var t=void 0===e.nodeTemplate,n=e.nodeValue;return t&&("string"==typeof n&&-1!==n.indexOf("{{")?e.nodeTemplate=n:e.nodeTemplate=null),e.nodeTemplate&&(e.nodeValue=e.nodeTemplate.replace(/{{(.*?)}}/g,function(t){return parseExpression(t.slice(2,-2),e)||""})),e.nodeValue},parsePointer=function(e){var t=e.split("."),n="this"===t[0]?self:null;if(n){for(var r=1,a=t.length;r<a;r++)n=n?n[t[r]]:null;n instanceof Function&&(n=n.bind(self))}return n},parseUntrusted=function(e,t,n){var r=e.match(/^'(.*)'$/);return e=e.trim(),r?r[1]:0===e||e&&!isNaN(e)?Number(e):parsePointer(e)||(e&&!1!==n&&self.watch(e,t),self.get(e,!0)||"")},parseExpression=function(str,node,addWatches){for(var whiteList=/(?:===)|(?:==)|(?:!==)|(?:!=)|(?:>=)|(?:<=)|(?:\+)|(?:\-)|(?:\*)|(?:\/)|(?:\()|(?:\))|(?:\,)|(?:\&\&)|(?:\&)|(?:\|\|)|(?:\|)|(?:\!)/g,trusted=str.match(whiteList)||[],untrusted=str.split(whiteList)||[],rawResultArray=[],trustedCounter=0,untrustedCounter=0,i=0,nextTrusted,nextUntrusted,rawResult,result;i<str.length;)if(nextTrusted=trusted[trustedCounter],nextUntrusted=untrusted[untrustedCounter],void 0!==nextTrusted&&str.substr(i,nextTrusted.length)===nextTrusted)rawResultArray.push(nextTrusted),i+=nextTrusted.length,trustedCounter++;else{if(str.substr(i,nextUntrusted.length)!==nextUntrusted)return console.log("Error: Possible infinite loop in parseExpression at iteration "+i,str),i=1e4,"";""!==nextUntrusted.trim()&&(rawResultArray.push("untrusted["+untrustedCounter+"]"),untrusted[untrustedCounter]=parseUntrusted(nextUntrusted,node,addWatches)),i+=nextUntrusted.length,untrustedCounter++}rawResult=rawResultArray.join("");try{return result=eval(rawResult),node&&"name"===node.nodeName&&result&&!1!==addWatches&&self.watch(result,node),result}catch(e){return console.log(e,untrusted),e}},setListeners=function(e){return self.container&&(observer=new MutationObserver(mutationHandler),self.container.addEventListener("change",changeHandler),self.container.addEventListener("search",changeHandler),!1!==e&&self.container.addEventListener("keyup",changeHandler),self===self.root&&(self.turnOnAllBindings(),setTimeout(function(){self.turnOnAllBindings()}))),self},turnOnBindings=function(){return observer&&observer.observe(self.container,{attributes:!0,attributeOldValue:!0}),observer};this.turnOnAllBindings=function(){turnOnBindings();for(var e in self.children)self.children.hasOwnProperty(e)&&self.children[e]&&self.children[e].turnOnAllBindings();return self};var turnOffBindings=function(){return observer&&observer.disconnect(),observer},mutationHandler=function(e){return e.forEach(function(e){if(e.target===(self.boundHiddenInput||self.container)){var t,n=e.target.getAttribute(e.attributeName);"data-"===e.attributeName.substr(0,"data-".length)&&n!==e.oldValue&&(t=toCamelCase(e.attributeName.substr("data-".length)),self.root.lastMutation={prop:t,value:n,oldValue:e.oldValue},self.checkWatches(t),self.checkWatches("*"),self.configs.modifyInputObjects&&(startData[t]=n))}}),e},changeHandler=function(e){var t=getNodeValue(e.target),n=e.target.name;return!self.containingArray||void 0===self.parent.get(n)||"radio"!==e.target.type&&"checkbox"!==e.target.type?self.set(n,t,!0,"data",!0):self.parent.set(n,t,!0,"data",!0)};this.watch=function(e,t,n){var r,a,i=["*"];"string"==typeof e&&(e=[e]),e instanceof Array||(n=t,t=e,e=i),e=e||i,r=n?self.root:self,a=n?"globalScopeWatches":"watches";for(var s=0,o=e.length;s<o;s++)r[a][e[s]]=r[a][e[s]]||[],-1===r[a][e[s]].indexOf(t)&&r[a][e[s]].push(t);return r[n?"globalScopeWatches":"watches"]};var iterateWatchArray=function(e,t){var n,r=t?self.root:self,a=t?"globalScopeWatches":"watches",i=r[a][e];if(i)for(var s=i.length-1;s>=0;s--)"function"==typeof i[s]?executeWatchFn(i[s]):(n=i[s],2===n.nodeType?self.resolveAttrNode(n,!0):resolveDoubleCurlyBraces(n));return r};this.checkWatches=function(e,t){if(self.removed)return!1;if(self.watches[e]&&(iterateWatchArray(e,!1),iterateWatchArray("*",!1),self.root.globalScopeWatches[e]&&iterateWatchArray(e,!0),self.root.globalScopeWatches["*"]&&iterateWatchArray("*",!0)),!1!==t)for(var n in self.children)self.children.hasOwnProperty(n)&&self.children[n]&&self.children[n].checkWatches(e);return e};var executeWatchFn=function(e){var t=self.root.lastMutation,n=[t.value,t.oldValue,t.prop];if(void 0!==self.get(t.prop))return e.apply(self,n)},initProps=function(){return self.configs=configs||{},self.nameSpace="string"==typeof self.configs.nameSpace?self.configs.nameSpace:"",self.attrPrefix="string"==typeof self.configs.attrPrefix?self.configs.attrPrefix:"",self.container=setContainer(),self.id=setId(),self.boundHiddenInput=setHiddenInput(),self.watches=self.configs.watches||{},self.globalScopeWatches=self.configs.globalScopeWatches||{},self.checkboxDataDelimiter=self.configs.checkboxDataDelimiter||",",self.attrMethods=self.nameSpaceAttrMethods(toPrefixedHyphenated),self.attrMethods=assign(self.attrMethods,self.configs.attrMethods||{}),self.templates=assign({},self.configs.templates||{}),self.logic=assign(proto.logic,self.configs.logic||{}),self.removedChildren={},self.childNameIndices={},self.childArrayNameIndices={},self},initFamilyTree=function(){return self.parent=parentInstance,self.parent?(self.ancestors=self.parent.ancestors.slice(),self.ancestors.push(parentInstance)):self.ancestors=[],self.root=self.ancestors[0]||self,self.children={},self.childArrays={},self},initData=function(){var e=self.boundHiddenInput||self.container;return e&&("object"!=typeof startData&&(startData={value:startData}),self.startData=startData,self.data=prefixData(e.dataset||{}),self.update(self.data,!1,!1,!1),getInitialNodeValues(),self.update(startData||{},!1,!0,!1),wireData(startData)),self};this.init=function(){return initFamilyTree(),initProps(),initData(),setListeners(this.configs.keyUp),self.initialized=!0,this},this.init()}var attrMethods={},proto;proto=SimpleDataBinding.prototype,proto.templateMaster=function(e){return function(t,n,r,a,i){var s,o,l;return n&&(s=this.root.templates[n],(l=s||document.getElementById(n))&&("TEMPLATE"===l.tagName?(l=l.content||l.firstElementChild)instanceof DocumentFragment&&(l=l.firstElementChild||l.querySelector("*")):s||l.removeAttribute("id"),this.root.templates[n]=l,o=l.cloneNode(!0),i.placeholderNode&&(this.removeCommentedElements(i.placeholderNode),i.placeholderNode.parentNode.removeChild(i.placeholderNode)),e.apply(this,[t,o]),this.surroundByComments(i,"template "+n,o,!0),this.parseNode(o))),t}},proto.nameSpaceAttrMethods=function(e){var t;if(this.attrPrefix){t={name:this.attrMethods.name};for(var n in this.attrMethods)this.attrMethods.hasOwnProperty(n)&&"name"!==n&&(t[e(n)]=this.attrMethods[n])}else t=this.attrMethods;return t},proto.normalize=function(e,t){return 0===e&&(e="0"),!t||"false"!==e&&"undefined"!==e||(e=""),e},attrMethods.replacementtemplate=proto.templateMaster(function(e,t){if(e.parentNode.insertBefore(t,e),e===this.container){for(var n in e.dataset)e.dataset.hasOwnProperty[n]&&(t.dataset[n]=e.dataset[n]);this.container=t}return setTimeout(function(){e.parentNode&&e.parentNode.removeChild(e)}),t}),attrMethods.childtemplate=proto.templateMaster(function(e,t){return e.appendChild(t)}),attrMethods.renderif=function(e,t,n,r,a){return t=this.normalize(t,!0),this.surroundByComments(e,r+" "+n,e,!0),t&&!e.parentElement?e.placeholderNode.parentNode.insertBefore(e,e.placeholderNode):!t&&e.parentElement&&e.parentElement.removeChild(e),e},attrMethods.renderifnot=function(e,t,n,r,a){attrMethods.renderif.apply(this,[e,!this.normalize(t,!0),n,r,a])},attrMethods.click=function(e,t){var n=this;e.addEventListener("click",function(r){e.hasAttribute("disabled")||"true"===e.getAttribute("aria-disabled")||t.apply(n,[r,e])})},attrMethods.clickon=function(e,t,n){var r=this;attrMethods.click(e,function(){r.set(n,"true",!0,null,!0)})},attrMethods.clickoff=function(e,t,n){var r=this;attrMethods.click(e,function(){r.set(n,"",!0,null,!0)})},attrMethods.name=function(e,t,n,r){var a,i;return void 0!==t&&("radio"===e.type&&"name"===r?e.checked=t===e.value:"checkbox"===e.type&&"name"===r?e.checked=-1!==t.split(this.checkboxDataDelimiter).indexOf(e.value):"SELECT"!==e.tagName||t?"OPTION"!==e.tagName||"value"!==r&&"name"!==r?(a=e.selectionStart,i=e.selectionEnd,e.value=t,void 0!==a&&e.setSelectionRange(a,i)):e.selected=e.value&&-1!==t.split(this.checkboxDataDelimiter).indexOf(e.value):setTimeout(function(){e.selectedIndex="-1"},0)),e},proto.attrMethods=attrMethods,proto.setNodeValue=attrMethods.name,proto.logic={},window.SimpleDataBinding=SimpleDataBinding}();