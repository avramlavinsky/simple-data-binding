!function(){function e(r,t,i,n){var a=this;this.enhance=function(e){return e.update=a.update,a.addArrayCallBacks(e),e.set=function(r,t){e[r]=t,e.update()},e},this.update=function(){var e,a,o,c,p=this,l=Array.prototype.slice.call(arguments);if(n&&p.priorState)for(o=0,c=p.priorState.length;o<c;o++)e=p.priorState[o],e instanceof r&&p.indexOf(e)===-1&&(a=l.slice(),a.unshift(o),a.unshift(p),e[n].apply(e,a));for(o=0,c=p.length;o<c;o++)a=l.slice(),e=p[o],p.priorState&&e===p.priorState[o]&&e&&p.priorState[o]||(e instanceof r?i&&p.priorState&&(a.unshift(o),a.unshift(p),e[i].apply(e,a)):void 0!==e&&(t?(a.unshift.apply(a,[e,p,o]),p[o]=r.prototype[t].apply(p,a)):p[o]=new r(e,p,o,a[0],a[1],a[2],a[3],a[4])));return p.priorState=p.slice(),p};var o=function(e){for(var r=["pop","push","reverse","shift","unshift","splice","sort","filter","forEach","reduce","reduceRight","copyWithin","fill"],t=0,i=r.length;t<i;t++)c(e,r[t],e.update);return e},c=function(e,r,t,i){function n(){var e;if(this.callingBack!==!0)return this.callingBack=!0,e=o.apply(i,a),t.apply(i,arguments),this.callingBack=!1,e}var a,o=e[r];return i=i||e,e[r]=function(){a=arguments,n()},e[r].apply=function(){a=arguments[1],n()},e[r]};this.addArrayCallBacks=o,this.addCallBack=c,window.LiveArrayFactory=e}var r,t=window.SimpleDataBinding;t&&(t.prototype.createLiveArrayMember=function(e,r,t){var i=r[t+1]&&r[t+1].container||r.placeholderNode;return r.ownerInstance.createChildArrayMember(r,e,i)},t.prototype.moveLiveArrayMember=function(e,r){var t=e[r+1]&&e[r+1].container||e.placeholderNode;return this.container.parentElement.insertBefore(this.container,t),this},t.prototype.removeLiveArrayMember=function(){return this.container.parentElement.removeChild(this.container),this},r=new e(t,"createLiveArrayMember","moveLiveArrayMember","removeLiveArrayMember"),t.prototype.arrayEnhancer=r)}();