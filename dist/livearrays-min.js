/*
 * simpledatabinding - data binding ala carte, by Avram Lavinsky, copyright 2016-2017
 * @version v1.2.0
 * @link https://github.com/avramlavinsky/simple-data-binding#readme
 * @license MIT
 */
!function(){function n(t,a,i){var r=this;this.enhance=function(n){return n.update=r.update,r.addArrayCallBacks(n),n.set=function(t,a){n[t]=a,n.update()},n},this.update=function(){var n=this;return n.ownerInstance[i](n.id,n,n.placeHolderNode),n};var e=function(n){for(var t=["pop","push","reverse","shift","unshift","splice","sort","filter","forEach","reduce","reduceRight","copyWithin","fill"],a=0,i=t.length;a<i;a++)c(n,t[a],n.update);return n},c=function(n,t,a,i){function r(){var n;if(!0!==this.callingBack)return this.callingBack=!0,n=c.apply(i,e),a.apply(i,arguments),this.callingBack=!1,n}var e,c=n[t];return i=i||n,n[t]=function(){e=arguments,r()},n[t].apply=function(){e=arguments[1],r()},n[t]};this.addArrayCallBacks=e,this.addCallBack=c,window.LiveArrayFactory=n}var t,a=window.SimpleDataBinding;a&&(t=new n(a,"removeChild","updateChildArray"),a.prototype.arrayEnhancer=t),window.$bind=function(n,t,a,i){return a=a||{},a.updateInputObjects=!0,new SimpleDataBinding(n,t,a,i)}}();