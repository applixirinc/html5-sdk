function loadApplixir(){function u(a){"undefined"!=typeof a.userId&&(g=a.userId),"undefined"!=typeof a.maxRetryCount&&(j=a.maxRetryCount),"undefined"!=typeof a.reportStateEnabled&&(m=a.reportStateEnabled),"undefined"!=typeof a.zoneId&&(p=a.zoneId,l=p),"undefined"!=typeof a.fallbackZoneId&&(o=a.fallbackZoneId)}function v(){h||(google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED),e=document.getElementById("contentElement"),x(),h=!0)}function w(){r.style.display="block",document.getElementById("label").innerHTML=1*parseInt("0")+"%",q.style.width=parseInt("0")+"%";var a=new google.ima.AdsRequest;a.adTagUrl="https://ssd.appprizes.com/foobar/foobar/foobar/foobar/fc.php?script=apVideo:vast2&foo="+l,a.linearAdSlotWidth=640,a.linearAdSlotHeight=400,a.nonLinearAdSlotWidth=640,a.nonLinearAdSlotHeight=150,b.requestAds(a)}function x(){y(),b=new google.ima.AdsLoader(c),b.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,A,!1),b.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR,K,!1)}function y(){c=new google.ima.AdDisplayContainer(document.getElementById("adContainer"),e)}function z(){c.initialize();try{a.init(640,360,google.ima.ViewMode.NORMAL),a.start()}catch(a){K(a)}}function A(b){var c=new google.ima.AdsRenderingSettings;a=b.getAdsManager(e,c),a.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR,K),a.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,L),a.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,M),a.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED,F),a.addEventListener(google.ima.AdEvent.Type.SKIPPED,F),a.addEventListener(google.ima.AdEvent.Type.LOADED,F),a.addEventListener(google.ima.AdEvent.Type.STARTED,F),a.addEventListener(google.ima.AdEvent.Type.COMPLETE,F),z()}function F(b){switch(f=b.getAd(),b.type){case google.ima.AdEvent.Type.LOADED:i=0,k=!1,l=p;break;case google.ima.AdEvent.Type.STARTED:G("s"),s.style.display="block",B=a.getRemainingTime(),null!==d&&(clearInterval(d),d=null),d=setInterval(function(){C=a.getRemainingTime(),I()},300),setTimeout(function(){a.getRemainingTime()==B&&(null!==d&&(clearInterval(d),d=null),D=15,B=15,E=2,d=setInterval(function(){E++,C=B-E,I()},1e3))},2e3);break;case google.ima.AdEvent.Type.SKIPPED:G("i"),parent.postMessage("didVideoCompleteFalse","*"),H();break;case google.ima.AdEvent.Type.COMPLETE:k||(G("c"),parent.postMessage("didVideoCompleteTrue","*"),k=!0),H()}}function G(a){if(m){var b=document.createElement("img");b.setAttribute("src","//developer.applixir.com/postback.php?e="+a+"&u="+g+"&z="+p),b.setAttribute("alt","na"),b.setAttribute("height","1px"),b.setAttribute("width","1px"),document.body.appendChild(b)}}function I(){var a=B-C,b=a/B*100;q.style.width=parseInt(b)+"%",document.getElementById("label").innerHTML=1*parseInt(b)+"%"}function J(){null!==o&&(l=l===p?o:p)}function K(a){++i<=j?(J(),console&&console.log&&console.log("retrying with zone:"+l+" retryCount:"+i),window.setTimeout(w,400)):(i=0,G("e"),parent.postMessage("didVideoCompleteFalse","*"),parent.postMessage("videoLoadError","*"),parent.postMessage("closeApplixirPlayer","*"),r.style.display="none")}function L(){}function M(){}var a,b,c,d,e,f,g=0,h=!1,i=0,j=3,k=!1,l=null,m=!1,n={},o=null,p=null,q=document.getElementById("myBar"),r=document.getElementById("myProgress"),s=document.getElementById("appprizes-close");s.addEventListener("click",function(){k=!0,G("i"),parent.postMessage("didVideoCompleteFalse","*"),parent.postMessage("closeApplixirPlayer","*"),a.stop(),H()});var t=function(a){if(void 0!==a.data.message)switch(a.data.message){case"setOptions":n=a.data.value,u(n),w();break;case"setUserId":g=a.data.value;break;case"enableReportState":m=!0;break;case"disableReportState":m=!1;break;case"displayApplixirAd":w()}};window.addEventListener("message",t,!1);var B=null,C=0,D=30,E=0,H=function(){null!==d&&(r.style.display="none",clearInterval(d),parent.postMessage("closeApplixirPlayer","*"),d=null)};v()}var callback=loadApplixir;!function(){var a="//imasdk.googleapis.com/js/sdkloader/ima3.js",b=document.createElement("script");b.type="text/javascript",b.src=a,b.async=!1,b.onreadystatechange=b.onload=function(){var a=b.readyState;callback.done||a&&!/loaded|complete/.test(a)||(callback.done=!0,callback())},(document.body||document.head).appendChild(b)}();