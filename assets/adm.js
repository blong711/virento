 

// check purchase code
if(Shopify.designMode){

  /**
  * If it's a global variable then window[variableName] or in your case window["onlyVideo"] should do the trick.
  * https://stackoverflow.com/questions/5613834/convert-string-to-variable-name-in-javascript
  */
  function isStorageSupported(type) {
    // Return false if we are in an iframe without access to sessionStorage
    // window.self !== window.top

    var storage = (type === 'session') ? window.sessionStorage : window.localStorage;

    try {
      storage.setItem('t4s', 'test');
      storage.removeItem('t4s');
      return true;
    } catch (error) {
      return false;
    }
  };

  var ThemeCode    = atob(window[atob('Y0hWeVkyaGg=')]),
      ThemeName_base64 = window[atob('VkdobGJXVk9ZVzFsVkRR')],
      ThemeName            = atob(ThemeName_base64),
      CookieName           = 'SXNBY3RpdmVUaGVtZQ=='+ThemeName_base64,
      ShopEmail            = atob(window[atob('VTJodmNFMWxiMVEw')]),
      isTrueSet            = (sessionStorage.getItem(CookieName) === 'true' ),
      str_temp_active      = atob('I3Q0cy10ZW1wLWtleS1hY3RpdmU='), // #t4s-temp-key-active
      str_purchase         = atob('cHVyY2hhc2VfY29kZXQ0'); // purchase_codet4;

      // console.log(ThemeCode,ThemeName,ShopEmail,CookieName,str_temp_active,str_purchase)
  function alert_active_html() {
    return `<section id="${str_purchase}" style="display: flex !important">${ document.querySelector(str_temp_active).innerHTML }</section>`;
  };

  // console.log('ThemeCode', ThemeCode, isTrueSet)

  if (ThemeCode == '') {
    let dom1 = (new DOMParser).parseFromString(alert_active_html(), "text/html");
    document.body.append(dom1.body.firstElementChild);
    let dom2 = (new DOMParser).parseFromString('<div id="luffyabc194"><style>body>*:not(#purchase_codet4) {opacity: 0;pointer-events: none;</style></div>', "text/html");
    document.body.prepend(dom2.body.firstElementChild);
    sessionStorage.removeItem(CookieName);
    localStorage.removeItem(CookieName);
  }
  else if ( !isTrueSet ) {

    //console.log(ShopEmail, ThemeName, ThemeCode);

    var domain     = window.location.hostname,
    mix        = ['4','t','h','e','p','l','i','c','o','/','.',':','n','s'],
    mix_domain = mix[2]+mix[1]+mix[1]+mix[4]+mix[13]+mix[11]+mix[9]+mix[9]+mix[5]+mix[6]+mix[7]+mix[10]+mix[1]+mix[2]+mix[3]+mix[0]+mix[10]+mix[7]+mix[8]+mix[9]+mix[5]+mix[6]+mix[7]+mix[3]+mix[12]+mix[13]+mix[3]+mix[9]+mix[7]+mix[2]+mix[3]+mix[7]+'k',
    data       = {
      "shopify_domain": domain,
      "email"         : ShopEmail,
      "theme"         : ThemeName,
      "purchase_code" : ThemeCode
    };

    fetch(mix_domain, {
      "headers": {
        "accept": "*/*",
        "cache-control": "no-cache",
        "x-requested-with": "XMLHttpRequest"
      },
      "body": btoa (encodeURIComponent(JSON.stringify(data))) ,
      "method": "POST",
      "mode": "cors"
    })
    .then(function(response) {
      if(response.ok){
        return response.json()
      } throw ""
    })
    .then(function(response) {
      let dom = (new DOMParser).parseFromString(alert_active_html(), "text/html");

      if ( response.status == 1) {

        dom.body.firstElementChild.innerHTML = "<p>ACTIVATED SUCCESSFULLY. Thanks for buying my theme!</p>";
        document.body.append(dom.body.firstElementChild);

        // Set a cookie to expire in 1 hour in Javascript
        var isActived = localStorage.getItem(CookieName);
        sessionStorage.setItem(CookieName, 'true')

        if (isActived === 'true') {
          document.querySelector(atob('I3B1cmNoYXNlX2NvZGV0NA==')).remove(); // #purchase_codet4
          // document.querySelector(atob('I2x1ZmZ5YWJjMTk0'))?.remove(); //#luffyabc194
        }
        else {
          localStorage.setItem(CookieName, "true");
          setTimeout(function(){
            document.querySelector(atob('I3B1cmNoYXNlX2NvZGV0NA==')).remove(); // #purchase_codet4
            // document.querySelector(atob('I2x1ZmZ5YWJjMTk0'))?.remove(); //#luffyabc194
          }, 1000);
        }

      }
      else {

        var mess = response.message;
        if (mess == "No sale belonging to the current user found with that code") {

          dom.body.firstElementChild.innerHTML = "<p>Purchase code error. It is a sales reversal or a refund. :(((</p>";

        }
        else if (mess.length == 58 || mess.length == 101) {
          dom.body.firstElementChild.innerHTML = "<p>That license key doesn't appear to be valid. Please check your purchase code again!<br>Please open a ticket at <a href='https://support.the4.co' target='_blank'><span>support.the4.co</span></a> if you have any question.</p>";

        }
        else if (mess.length == 104) {
          dom.body.firstElementChild.innerHTML = "<p>The license not match with current theme.!<br>Please open a ticket at <a href='https://support.the4.co' target='_blank'><span>support.the4.co</span></a> if you have any question.</p>";
        }
        else {
          try {
            var mess = mess.split('active domain `')[1].split('`. ')[0];
          }
          catch(err) {
            //var mess = mess;
          }
          dom.body.firstElementChild.innerHTML = "<p>Your purchase code is invalided since it is being activated at another store "+mess+".<br> Please open a ticket at <a class='cg' href='https://support.the4.co' target='_blank'><span>support.the4.co</span></a> to get quick assistance.</p>";
        }
        document.body.append(dom.body.firstElementChild);

      }

    }).catch(function(e) {
    //}).catch((e)=>{
      console.error(e)
    });

  }
}
// end check purchase code