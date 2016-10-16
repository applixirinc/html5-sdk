# html5-sdk

```
<html>
  <head>
    <title>IMA HTML5 Simple Demo</title>
    <script type="text/javascript" src="applixir-richmedia-min.js"></script>
  </head>

  <body style="background-color: #efe4b0">


  <h1>Demo Page</h1>

  <div id="applixir_vanishing_div" style="position:absolute; top: 1%; left: 1%; margin: -250px -316px;">
    <iframe width="8px" height="8px" name="applixir_iframe" id="applixir_vanishing_frame" src="iframe.html" frameborder=0 ALLOWTRANSPARENCY="true"></iframe>
  </div>


  <script type="application/javascript">
    var cb = function(watched) {
      if (watched) {
        console.log('ad was played');
      } else {
        console.log('ad wasn\'t fully watched.');
      }
    };
    var options = {
        userId: 100,
        maxRetryCount: 5,
        reportStateEnabled: false,
        zoneId: 1158,
        fallbackZoneId: null
    };
    setTimeout( function(){
        invokeApplixirVideoUnit(options, cb);
    }, 3000 );

    /**
     * this demo loads a video ad 3 seconds after page is loaded. you can remove the timeout and just invoke the function when you need to load the ads
     */

  </script>

  </body>
</html>
```
