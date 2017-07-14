/*
 * simpledatabinding - data binding ala carte, by Avram Lavinsky, copyright 2016-2017
 * @version v1.2.0
 * @link https://github.com/avramlavinsky/simple-data-binding#readme
 * @license MIT
 */
!function(){function SimpleDataBinding(container,startData,configs,id,parentInstance){var self=this,doc=document,observer,toCamelCase=function(e){return e.replace(/-([a-z])/gi,function(e,t){return t.toUpperCase()})},toHyphenated=function(e){return e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()},toPrefixedCamel=function(e){return self.nameSpace&&e&&e.substring(0,self.nameSpace.length)!==self.nameSpace&&(e=self.nameSpace+e.charAt(0).toUpperCase()+e.slice(1)),e},toPrefixedHyphenated=function(e){return(self.attrPrefix?toHyphenated(self.attrPrefix)+"-":"")+e},toUnprefixedCamel=function(e){return self.nameSpace?(e=e.substring(self.nameSpace.length),e.charAt(0).toLowerCase()+e.slice(1)):e},prefixData=function(e){if(self.nameSpace)for(var t in e)t.substring(0,self.nameSpace.length)!==self.nameSpace&&(self.set(t,e[t]),delete e[t]);return e},unprefixData=function(e){if(self.nameSpace)for(var t in e)e.hasOwnProperty(t)&&(e[toUnprefixedCamel(t)]=e[t],delete e[t]);return e};this.set=function(e,t,r,n,a){var i,s=self;if(e=toPrefixedCamel(e),n=n||"data",i=self.data[e],t=self.normalize(t),a){for(;void 0===i&&!1!==r&&s.parent;)s=s.parent,i=s[n][e];void 0===i?self[n][e]=t:s[n][e]=t}else self[n][e]="data"===n?t||"":t;return self[n][e]},this.get=function(e,t,r){var n,a=self;for(e=toPrefixedCamel(e),r=r||"data",n=self[r][e];void 0===n&&!1!==t&&a.parent;)a=a.parent,n=a[r][e];return n},this.dataBindFromAttr=function(e){var t=e.getAttribute(toPrefixedHyphenated("databind")),r=self.get(t,!0,"startData");r instanceof Array?e.parsed||(e.parsed=!0,self.updateChildArray(t,r,e)):self.createChild(t,e,r)},this.update=function(e,t,r,n){var a,i;t||turnOffBindings();for(var s in e)e.hasOwnProperty(s)&&(a=e[s],"object"==typeof a?!1!==n&&(a instanceof Array?self.updateChildArray(s,a):self.createChild(s,getContainer(s),a)):(i=a,s=toPrefixedCamel(s),self.root.lastMutation={value:i,oldValue:self.get(s),prop:s},self.set(s,i),self.checkWatches(s)));return!1!==r&&self.parseNode(self.container),self.checkWatches("*",!1),self.root.initialized&&turnOnBindings(),self.data},this.removeChild=function(e){return removeChildContainer(e),delete self.children[e.id],e.removed=!0,self.removedChildren[e.id]=e,e};var wireData=function(e){function t(t){for(var r=0,n=e.$bindings.length;r<n;r++)e.$bindings[r].update(t||e)}function r(t,r){for(var n=0,a=e.$bindings.length;n<a;n++)e.$bindings[n]&&e.$bindings[n].set&&e.$bindings[n].set(t,r);return r}function n(t,r){Object.defineProperty(e,t,{enumerable:!1,configurable:!0,value:r})}return e&&(e.$bindings?e.$bindings.push(self):(n("$bindings",[self]),n("$set",r)),n("$binding",self),n("$update",t)),e},createChildArray=function(e,t,r){var n,a=!0===self.configs.modifyInputArrays?t:[];if(a.idIndex=0,a.ownerInstance=self,a.id=e,self.childArrayNameIndices[e]=self.childArrayNameIndices[e]||0,self.childArrays[e]&&(self.childArrayNameIndices[e]++,a.id+=self.childArrayNameIndices[e]||""),n=r||getContainer(e))return self.surroundByComments(a,"child array "+e,n),self.childArrays[a.id]=a,a},resetChildArray=function(e,t,r,n){var a,i,s;for(a=0,i=n.priorState.length;a<i;a++)-1===t.indexOf(n.priorState[a])&&self.removeChild(n.priorState[a]);if(!document.body.contains(n.placeholderNode)){if(!(s=r||getContainer(e)))return null;self.surroundByComments(n,"child array "+e,s)}n.ownerInstance=self};this.updateChildArray=function(e,t,r){var n=self.childArrays[e],a=document.createDocumentFragment();if(n&&n.placeHolderNode===r?resetChildArray(e,t,r,n):n=createChildArray(e,t,r),n){for(var i=0,s=t.length;i<s;i++)n[i]=self.createChildArrayMember(n,t[i],a);return n.priorState=n.slice(),renderChildArray(n,a),self.arrayEnhancer&&!n.update&&self.arrayEnhancer.enhance(n),n}},this.createChildArrayMember=function(e,t,r){"object"!=typeof t&&(t={value:t});var n,a;return t instanceof SimpleDataBinding?(n=t,placeChildArrayEl(n.container,r)):(a=placeChildArrayEl(createChildArrayEl(e),r),n=self.createChild(generateChildArrayMemberId(e,t),a,t),n.containingArray=e),n};var generateChildArrayMemberId=function(e,t){var r=t.name;return r?(self.childNameIndices[r]=self.childNameIndices[r]||0,self.children[r]&&self.childNameIndices[r]++,r+=self.childNameIndices[r]||""):r=e.id+"_"+e.idIndex,e.idIndex++,r},setId=function(){var e=id,t=(new Date).getTime().toString();return self.container&&(e||(e=self.container.getAttribute(toPrefixedHyphenated("databind"))||self.container.id||self.container.name||"binding-"+self.container.tagName+"-"+t),self.container.getAttribute(toPrefixedHyphenated("databind"))||self.container.setAttribute(toPrefixedHyphenated("databind"),e)),e||t},assign=Object.assign||function(e,t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r]);return e};this.createChild=function(e,t,r){var n,a=null;return n=self.removedChildren[e],n&&t&&n.removed?(n.container=t,n.update(r,!1,!0,!1),n.removed=!1,delete self.removedChildren[e],a=n):(self.children[e]&&!self.children[e].containingArray&&(self.childNameIndices[e]=self.childNameIndices[e]||0,self.childNameIndices[e]++,e+=self.childNameIndices[e]||""),a=new SimpleDataBinding(t,r,self.configs,e,self)),self.children[e]=a,a};var find=function(e,t,r){var n,a=self.children,i=self.childArrays;if(r=r||(self.found=[])&&self,a[e]&&r.found.push(a[e]),i[e]&&r.found.push(i[e]),t||!r.found.length)for(n in a)a.hasOwnProperty(n)&&a[n].find(e,t,r);return t?r.found:r.found[0]};this.find=function(e){return find(e)},this.findAll=function(e){return find(e,!0)},this.getBindingFor=function(e){var t=closest(e,"[databind]"),r=t&&t.getAttribute(toPrefixedHyphenated("databind"));return self.root.findAll(r).filter(function(e){return e.container===t})[0]},this.export=function(e){var t=assign({},self.data);e&&(t=unprefixData(t));for(var r in self.children)self.children.hasOwnProperty(r)&&self.children[r]&&(t[r]=self.children[r].export(e));return t};var is=function(e,t){var r=!!e&&(e.matches||e.matchesSelector||e.msMatchesSelector||e.mozMatchesSelector||e.webkitMatchesSelector||e.oMatchesSelector);return r&&r.call(e,t)},closest=function(e,t){for(;!is(e,t)&&e!==doc.body;)e=e.parentElement;return e},placeChildArrayEl=function(e,t){return t&&t.appendChild(e)},createChildArrayEl=function(e){return e.elementTemplate.cloneNode(!0)},renderChildArray=function(e,t){var r=e.placeholderNode;return r.parentNode.insertBefore(t,r),r},getNodeValue=function(e){var t,r;return"radio"===e.type?e.checked&&(t=e.value):"checkbox"===e.type?(t=self.get(e.name,!0),t=t?t.split(self.checkboxDataDelimiter):[],r=t.indexOf(e.value),e.checked?-1===r&&t.push(e.value):-1!==r&&t.splice(r,1),t=t.join(self.checkboxDataDelimiter)):"OPTION"===e.tagName?(t=self.get(e.name,!0),t=void 0!==t?t.split(self.checkboxDataDelimiter):[],e.selected?t.push(e.value):t.splice(t.indexOf(e.value),1),t=t.join(self.checkboxDataDelimiter)):t=e.value,t},getControlValue=function(e){if("undefined"!==e.name&&"radio"!==e.type&&"checkbox"!==e.type&&"OPTION"!==e.tagName){var t=e.getAttribute("value");if(t&&"{{"!==t.substr(0,2))return self.set(e.name,getNodeValue(e))}},getInitialNodeValues=function(){var e;if("form"===self.container.tagName)for(var t in self.container.elements)self.container.elements.hasOwnProperty(t)&&getControlValue(self.container.elements[t]);else{e=Array.prototype.slice.call(self.container.querySelectorAll("[name]")),is(self.container,"[name]")&&e.push(self.container);for(var r=0,n=e.length;r<n;r++)getControlValue(e[r])}return self.data},setContainer=function(){var e=parentInstance&&parentInstance.container||doc;return container&&(self.container=container.tagName?container:e.querySelector(container)),id&&!self.container&&(self.container=e.querySelector("["+toPrefixedHyphenated("databind")+'="'+id+'"]')),self.container||parentInstance||(self.container=doc.querySelector("["+toPrefixedHyphenated("databind")+"]")||doc.forms[0]||doc.body),self.container},getContainer=function(e){return self.container.querySelector("["+toPrefixedHyphenated("databind")+'="'+e+'"]')},setHiddenInput=function(){var e;return self.configs.useHiddenInput&&(e=doc.createElement("input"),e.type="hidden",(self.container||doc).appendChild(e)),e};this.surroundByComments=function(e,t,r,n){return e.placeholderNode&&document.body.contains(e.placeholderNode)||!r||!r.parentNode||(e.elementTemplate=r,e.placeholderNode=doc.createComment("end "+t),r.placeholderNode=e.placeholderNode,r.parentNode.insertBefore(doc.createComment("start "+t),r),r.nextElementSibling?r.parentNode.insertBefore(e.placeholderNode,r.nextElementSibling):r.parentNode.appendChild(e.placeholderNode),n||r.parentNode.removeChild(r)),e.placeholderNode},this.removeCommentedElements=function(e,t){for(;e.previousSibling&&8!==e.previousSibling.nodeType;)1!==e.previousSibling.nodeType||t&&null===e.previousSibling.getAttribute(t)?e=e.previousSibling:e.parentNode.removeChild(e.previousSibling);return e};var removeChildContainer=function(e){var t=e.container;t&&t.parentNode&&t.parentNode.removeChild(t)};this.parseNode=function(e){var t;if(e.parsed||"TEMPLATE"===e.tagName)return!1;if(3===e.nodeType)resolveDoubleCurlyBraces(e);else if(1===e.nodeType){for(t=0;t<e.attributes.length;t++)resolveAttrNode(e.attributes[t]);for(t=0;t<e.childNodes.length;t++)e.childNodes[t].hasAttribute&&e.childNodes[t].hasAttribute("databind")?self.dataBindFromAttr(e.childNodes[t]):self.parseNode(e.childNodes[t]);e.classList&&e.getAttribute(toPrefixedHyphenated("databind"))&&setTimeout(function(){e.classList.remove("unparsed"),e.classList.add("parsed")},0)}return e.parsed=!0,e};var resolveAttrNode=function(e,t){if("data-"!==e.nodeName.substr(0,5))return resolveAttrNodeName(e),resolveAttrNodeValue(e,t),e;resolveDoubleCurlyBraces(e,e.nodeValue)},resolveAttrNodeName=function(e){var t;return void 0===e.rawName&&("__"===e.nodeName.substr(-2,2)?(e.rawName=e.nodeName.slice(2,-2),e.originalEl=e.ownerElement,e.prevAttrName=e.nodeName):e.rawName=null),null!==e.rawName&&(t=parseExpression(toPrefixedCamel(toCamelCase(e.rawName)),e))!==e.prevAttrName&&(t&&e.originalEl.setAttribute(t,e.nodeValue),e.prevAttrName&&e.originalEl.removeAttribute(e.prevAttrName),e.prevAttrName=t),t},resolveAttrNodeValue=function(e,t){var r,n,a="name"===e.nodeName?e.nodeName:toPrefixedCamel(toCamelCase(e.nodeName)),i=self.attrMethods[a],s=e.ownerElement;return resolveDoubleCurlyBraces(e,e.nodeValue),e.value||s&&s[e.name],"value"!==e.nodeName||"radio"!==s.type&&"checkbox"!==s.type&&"OPTION"!==s.tagName||(n=s&&s.name,!n&&"OPTION"===s.tagName&&s.parentNode&&(r=s.parentNode instanceof DocumentFragment?"SELECT"===self.parent.container.tagName?self.parent.container:self.parent.container.querySelector("select"):s.parentNode,n=r.name),self.setNodeValue(s,parseExpression(n,e,!1),n,"name")),i&&i.apply(self,[s,parseExpression(e.nodeValue,e),e.nodeValue,a,e,!t]),e},resolveDoubleCurlyBraces=function(e){if(!e)return"";var t=void 0===e.nodeTemplate,r=e.nodeValue;return t&&("string"==typeof r&&-1!==r.indexOf("{{")?e.nodeTemplate=r:e.nodeTemplate=null),e.nodeTemplate&&(e.nodeValue=e.nodeTemplate.replace(/{{(.*?)}}/g,function(t){return parseExpression(t.slice(2,-2),e)||""})),e.nodeValue},parsePointer=function(e){var t=e.split("."),r="this"===t[0]?self:null;if(r){for(var n=1,a=t.length;n<a;n++)r=r?r[t[n]]:null;r instanceof Function&&(r=r.bind(self))}return r},parseUntrusted=function(e,t,r){var n=e.match(/^'(.*)'$/);return e=e.trim(),n?n[1]:0===e||e&&!isNaN(e)?Number(e):parsePointer(e)||(e&&!1!==r&&self.watch(e,t),self.get(e,!0)||"")},parseExpression=function(str,node,addWatches){for(var whiteList=/(?:===)|(?:==)|(?:!==)|(?:!=)|(?:>=)|(?:<=)|(?:\+)|(?:\-)|(?:\*)|(?:\/)|(?:\()|(?:\))|(?:\,)|(?:\&\&)|(?:\&)|(?:\|\|)|(?:\|)|(?:\!)/g,trusted=str.match(whiteList)||[],untrusted=str.split(whiteList)||[],rawResultArray=[],trustedCounter=0,untrustedCounter=0,i=0,nextTrusted,nextUntrusted,rawResult,result;i<str.length;)if(nextTrusted=trusted[trustedCounter],nextUntrusted=untrusted[untrustedCounter],void 0!==nextTrusted&&str.substr(i,nextTrusted.length)===nextTrusted)rawResultArray.push(nextTrusted),i+=nextTrusted.length,trustedCounter++;else{if(str.substr(i,nextUntrusted.length)!==nextUntrusted)return console.log("Error: Possible infinite loop in parseExpression at iteration "+i,str),i=1e4,"";""!==nextUntrusted.trim()&&(rawResultArray.push("untrusted["+untrustedCounter+"]"),untrusted[untrustedCounter]=parseUntrusted(nextUntrusted,node,addWatches)),i+=nextUntrusted.length,untrustedCounter++}rawResult=rawResultArray.join("");try{return result=eval(rawResult),node&&"name"===node.nodeName&&result&&!1!==addWatches&&self.watch(result,node),result}catch(e){return console.log(e,untrusted),e}},setListeners=function(e){return self.container&&(observer=new MutationObserver(mutationHandler),self.container.addEventListener("change",changeHandler),self.container.addEventListener("search",changeHandler),!1!==e&&self.container.addEventListener("keyup",changeHandler),self===self.root&&(self.turnOnAllBindings(),setTimeout(function(){self.turnOnAllBindings()}))),self},turnOnBindings=function(){return observer&&observer.observe(self.container,{attributes:!0,attributeOldValue:!0}),observer};this.turnOnAllBindings=function(){turnOnBindings();for(var e in self.children)self.children.hasOwnProperty(e)&&self.children[e]&&self.children[e].turnOnAllBindings();return self};var turnOffBindings=function(){return observer&&observer.disconnect(),observer},mutationHandler=function(e){return e.forEach(function(e){if(e.target===(self.boundHiddenInput||self.container)){var t,r=e.target.getAttribute(e.attributeName);"data-"===e.attributeName.substr(0,"data-".length)&&r!==e.oldValue&&(t=toCamelCase(e.attributeName.substr("data-".length)),self.root.lastMutation={prop:t,value:r,oldValue:e.oldValue},self.checkWatches(t),self.checkWatches("*"),self.configs.modifyInputObjects&&(startData[t]=r))}}),e},changeHandler=function(e){var t=getNodeValue(e.target),r=e.target.name;return!self.containingArray||void 0===self.parent.get(r)||"radio"!==e.target.type&&"checkbox"!==e.target.type?self.set(r,t,!0,"data",!0):self.parent.set(r,t,!0,"data",!0)};this.watch=function(e,t,r){var n,a,i=["*"];"string"==typeof e&&(e=[e]),e instanceof Array||(r=t,t=e,e=i),e=e||i,n=r?self.root:self,a=r?"globalScopeWatches":"watches";for(var s=0,o=e.length;s<o;s++)n[a][e[s]]=n[a][e[s]]||[],-1===n[a][e[s]].indexOf(t)&&n[a][e[s]].push(t);return n[r?"globalScopeWatches":"watches"]};var iterateWatchArray=function(e,t){var r,n=t?self.root:self,a=t?"globalScopeWatches":"watches",i=n[a][e];if(i)for(var s=i.length-1;s>=0;s--)"function"==typeof i[s]?executeWatchFn(i[s]):(r=i[s],2===r.nodeType?resolveAttrNode(r,!0):resolveDoubleCurlyBraces(r));return n};this.checkWatches=function(e,t){if(self.removed)return!1;if(self.watches[e]&&(iterateWatchArray(e,!1),iterateWatchArray("*",!1),self.root.globalScopeWatches[e]&&iterateWatchArray(e,!0),self.root.globalScopeWatches["*"]&&iterateWatchArray("*",!0)),!1!==t)for(var r in self.children)self.children.hasOwnProperty(r)&&self.children[r]&&self.children[r].checkWatches(e);return e};var executeWatchFn=function(e){var t=self.root.lastMutation,r=[t.value,t.oldValue,t.prop];if(void 0!==self.get(t.prop))return e.apply(self,r)},initProps=function(){return self.configs=configs||{},self.nameSpace="string"==typeof self.configs.nameSpace?self.configs.nameSpace:"",self.attrPrefix="string"==typeof self.configs.attrPrefix?self.configs.attrPrefix:"",self.container=setContainer(),self.id=setId(),self.boundHiddenInput=setHiddenInput(),self.watches=self.configs.watches||{},self.globalScopeWatches=self.configs.globalScopeWatches||{},self.checkboxDataDelimiter=self.configs.checkboxDataDelimiter||",",self.attrMethods=self.nameSpaceAttrMethods(toPrefixedHyphenated),self.attrMethods=assign(self.attrMethods,self.configs.attrMethods||{}),self.templates=assign({},self.configs.templates||{}),self.logic=assign({},self.configs.logic||{}),self.removedChildren={},self.childNameIndices={},self.childArrayNameIndices={},self},initFamilyTree=function(){return self.parent=parentInstance,self.parent?(self.ancestors=self.parent.ancestors.slice(),self.ancestors.push(parentInstance)):self.ancestors=[],self.root=self.ancestors[0]||self,self.children={},self.childArrays={},self},initData=function(){var e=self.boundHiddenInput||self.container;return e&&("object"!=typeof startData&&(startData={value:startData}),self.startData=startData,self.data=prefixData(e.dataset||{}),self.update(self.data,!1,!1,!1),getInitialNodeValues(),self.update(startData||{},!1,!0,!1),wireData(startData)),self};this.init=function(){return initFamilyTree(),initProps(),initData(),setListeners(this.configs.keyUp),self.initialized=!0,this},this.init()}var attrMethods={},proto;proto=SimpleDataBinding.prototype,proto.templateMaster=function(e){return function(t,r,n,a,i){var s,o,l;return r&&(s=this.root.templates[r],(l=s||document.getElementById(r))&&("TEMPLATE"===l.tagName?(l=l.content||l.firstElementChild)instanceof DocumentFragment&&(l=l.firstElementChild||l.querySelector("*")):s||l.removeAttribute("id"),this.root.templates[r]=l,o=l.cloneNode(!0),i.placeholderNode&&(this.removeCommentedElements(i.placeholderNode),i.placeholderNode.parentNode.removeChild(i.placeholderNode)),e.apply(this,[t,o]),this.surroundByComments(i,"template "+r,o,!0),this.parseNode(o))),t}},proto.nameSpaceAttrMethods=function(e){var t;if(this.attrPrefix){t={name:this.attrMethods.name};for(var r in this.attrMethods)this.attrMethods.hasOwnProperty(r)&&"name"!==r&&(t[e(r)]=this.attrMethods[r])}else t=this.attrMethods;return t},proto.normalize=function(e,t){return 0===e&&(e="0"),!t||"false"!==e&&"undefined"!==e||(e=""),e},attrMethods.replacementtemplate=proto.templateMaster(function(e,t){if(e.parentNode.insertBefore(t,e),e===this.container){for(var r in e.dataset)e.dataset.hasOwnProperty[r]&&(t.dataset[r]=e.dataset[r]);this.container=t}return setTimeout(function(){e.parentNode&&e.parentNode.removeChild(e)}),t}),attrMethods.childtemplate=proto.templateMaster(function(e,t){return e.appendChild(t)}),attrMethods.renderif=function(e,t,r,n,a){return t=this.normalize(t,!0),this.surroundByComments(e,n+" "+r,e,!0),t&&!e.parentElement?e.placeholderNode.parentNode.insertBefore(e,e.placeholderNode):!t&&e.parentElement&&e.parentElement.removeChild(e),e},attrMethods.renderifnot=function(e,t,r,n,a){attrMethods.renderif.apply(this,[e,!this.normalize(t,!0),r,n,a])},attrMethods.click=function(e,t){var r=this;e.addEventListener("click",function(n){e.hasAttribute("disabled")||"true"===e.getAttribute("aria-disabled")||t.apply(r,[n,e])})},attrMethods.clickon=function(e,t,r){var n=this;attrMethods.click(e,function(){n.set(r,"true",!0,null,!0)})},attrMethods.clickoff=function(e,t,r){var n=this;attrMethods.click(e,function(){n.set(r,"",!0,null,!0)})},attrMethods.name=function(e,t,r,n){return void 0!==t&&("radio"===e.type&&"name"===n?e.checked=t===e.value:"checkbox"===e.type&&"name"===n?e.checked=-1!==t.split(this.checkboxDataDelimiter).indexOf(e.value):"SELECT"!==e.tagName||t?"OPTION"!==e.tagName||"value"!==n&&"name"!==n?e.value=t:e.selected=e.value&&-1!==t.split(this.checkboxDataDelimiter).indexOf(e.value):setTimeout(function(){e.selectedIndex="-1"},0)),e},proto.attrMethods=attrMethods,proto.setNodeValue=attrMethods.name,window.SimpleDataBinding=SimpleDataBinding}(),function(){function e(t,r,n){var a=this;this.enhance=function(e){return e.update=a.update,a.addArrayCallBacks(e),e.set=function(t,r){e[t]=r,e.update()},e},this.update=function(){var e=this;return e.ownerInstance[n](e.id,e,e.placeHolderNode),e};var i=function(e){for(var t=["pop","push","reverse","shift","unshift","splice","sort","filter","forEach","reduce","reduceRight","copyWithin","fill"],r=0,n=t.length;r<n;r++)s(e,t[r],e.update);return e},s=function(e,t,r,n){function a(){var e;if(!0!==this.callingBack)return this.callingBack=!0,e=s.apply(n,i),r.apply(n,arguments),this.callingBack=!1,e}var i,s=e[t];return n=n||e,e[t]=function(){i=arguments,a()},e[t].apply=function(){i=arguments[1],a()},e[t]};this.addArrayCallBacks=i,this.addCallBack=s,window.LiveArrayFactory=e}var t,r=window.SimpleDataBinding;r&&(t=new e(r,"removeChild","updateChildArray"),r.prototype.arrayEnhancer=t),window.$bind=function(e,t,r,n){return r=r||{},r.updateInputObjects=!0,new SimpleDataBinding(e,t,r,n)}}();