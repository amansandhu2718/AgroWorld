
var mybutton = document.getElementsByClassName("myBtn");

function topFunction() {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
}

  //  Language Translation
  function googleTranslateElementInit() {
  	new google.translate.TranslateElement({pageLanguage: 'en', includedLanguages: 'hi'}, 'google_translate_element');
  }





//Ritik JS



//Location

var a = document.getElementById('output');
  function getLocation() {
  	if (navigator.geolocation) {
  		navigator.geolocation.getCurrentPosition(show);
  	}
  	else {
  		a.innerHTML='not supporting'
  	}
  	function show(x) {
          //a.innerHTML = "latitude = "+x.coords.latitude;
          //a.innerHTML += "<br />"
          //a.innerHTML += "longitude = "+x.coords.longitude;
          var locApi = 'https://us1.unwiredlabs.com/v2/reverse.php?token=pk.2c15796f7738abb61fd92adc357e0778&lat='+x.coords.latitude+'&lon='+x.coords.longitude;

          $.get({
          	url : locApi,
          	success : function(data){
          		console.log(data.address.state);
          		var finalLocation = data.address.state;
          		alert(finalLocation);
          	}
          });
      }
  }
//Loaction End




//SIDE NAV BAR

/* Set the width of the sidebar to 250px and the left margin of the page content to 250px */
function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
}

/* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
}

//NAV BAR END







//Ritik JS End
var tabbuttons=document.querySelectorAll(".buttoncontainer button");
var tabpanels=document.querySelectorAll(".tabcontainer .tabpanel");
function showpanel(panelindex,colorcode){
  tabbuttons.forEach((node)=>{
node.style.backgroundcolor=null;
node.style.color="";
node.style.boxShadow="";
node.style.borderRadius="0px";
node.style.fontSize=" 1rem";


  });
  tabbuttons[panelindex].style.backgroundColor=colorcode;
  tabbuttons[panelindex].style.color="white";
  tabbuttons[panelindex].style.boxShadow="2px 2px 5px #BFAFB2";
  tabbuttons[panelindex].style.borderRadius="25px ";
 tabbuttons[panelindex].style.fontSize=" 1.1rem";
  tabpanels.forEach(function(node){
    node.style.display="none";

  });
  tabpanels[panelindex].style.display="block";
  tabpanels[panelindex].style.backgroundColor=colorcode;
}
showpanel(0,"#4db6ac");
