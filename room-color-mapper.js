    $(document).ready(function(){

        gapi.load('client:auth2', initClient);
        mapRoomColors();        
    })
    // Client ID and API key from the Developer Console
     var CLIENT_ID = '640400674098-bsei1hk16prohqiuie6lapgs8267b0g0.apps.googleusercontent.com';
     var API_KEY = 'AIzaSyDtVWCmVZVy0lSplznLr4xpgsqKZbJDVJU';

     // Array of API discovery doc URLs for APIs used by the quickstart
     var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

     // Authorization scopes required by the API; multiple scopes can be
     // included, separated by spaces.
     var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

     var authorizeButton = document.getElementById('authorize_button');
     var signoutButton = document.getElementById('signout_button');

     /**
      *  On load, called to load the auth2 library and API client library.
      */
     function handleClientLoad() {
        gapi.load('client:auth2', initClient);
     }

     /**
      *  Initializes the API client library and sets up sign-in state
      *  listeners.
      */
     function initClient() {
       gapi.client.init({
         apiKey: API_KEY,
         clientId: CLIENT_ID,
         discoveryDocs: DISCOVERY_DOCS,
         scope: SCOPES
       }).then(function () {
         // Listen for sign-in state changes.
         gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

         // Handle the initial sign-in state.
         updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
         authorizeButton.onclick = handleAuthClick;
         signoutButton.onclick = handleSignoutClick;
       }, function(error) {
           console.log('ERROR', error);
       });
     }

     /**
      *  Called when the signed in status changes, to update the UI
      *  appropriately. After a sign-in, the API is called.
      */
     function updateSigninStatus(isSignedIn) {
       if (isSignedIn) {
         authorizeButton.style.display = 'none';
         signoutButton.style.display = 'block';
      determineRoomStatus(rooms);
       } else {
         authorizeButton.style.display = 'block';
         signoutButton.style.display = 'none';
       }
     }

     /**
      *  Sign in the user upon button click.
      */
     function handleAuthClick(event) {
       gapi.auth2.getAuthInstance().signIn();
     }

     /**
      *  Sign out the user upon button click.
      */
     function handleSignoutClick(event) {
       gapi.auth2.getAuthInstance().signOut();
     }

  
 // A list of code room calendars mapped to room names
     var rooms = [
        {
          "name":'SPOCK',
          "id":"code.berlin_3337333133353032313436@resource.calendar.google.com"
        },
        {
          "name":'PAPER',
          "id": "code.berlin_3232363530373936343635@resource.calendar.google.com"
        },
        {
          "name":'ROCK',
          "id":"code.berlin_3635313131353437333332@resource.calendar.google.com"},
        {
          "name":'SCISSORS',
          "id": "code.berlin_3934313230373536353639@resource.calendar.google.com"},
        { 
          "name":'LIZARD',
          "id": "code.berlin_38323039323339303936@resource.calendar.google.com"},
        {
          "name":'MCROOMFACE',
          "id": "code.berlin_3135303639333334323335@resource.calendar.google.com"},
        {
          "name":'MORTY',
          "id": "code.berlin_31333137303136343636@resource.calendar.google.com"},
        {
          "name":'RICK',
          "id": "code.berlin_3736373335323835363837@resource.calendar.google.com",}
    ];
          
          function determineRoomStatus(rooms) {
            rooms.forEach(function(room){
    
                console.log("thing-i-am-looking-at", gapi);
                gapi.client.calendar.events.list({
                'calendarId': room.id,
                'timeMin': (new Date()).toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': 1,
                'orderBy': 'startTime'
              }).then(function(response) {
           
                // determine if room is booked
                // write to room.status
                var events = response.result.items;
    
                if(events.length > 0) {
                  let start = new Date(events[0].start.dateTime);
                  let end = new Date(events[0].end.dateTime);
                  let now = new Date();
    
                  if (now > start && now < end) {
                    room.status = 'booked';
                  } else {
                    room.status = 'not-booked';
                  }
                } else {
                  room.status = "not-booked";
                
                } 
              });  
              console.log(room);
            } )
            }
       

mapRoomColors = function(){
    var currentRoomStatus = determineRoomStatus (rooms);
    currentRoomStatus.forEach(function(room){
        var roomName = room.name;
        var roomState = room.status;
        var roomOccupancy = room.occupation;
        console.log(roomName);
        $("#meeting-rooms ."+roomName).css("fill", roomColor(roomState,roomOccupancy));
        
        }) 
}



roomColor = function(roomState,roomOccupancy){
if(roomState == "booked" && roomOccupancy == 'true'){
    return "#ea4335";
}else if((roomState == "booked" && roomOccupancy == "false") ){
    return "#fbbc05";
}else if((roomState == "not-booked" && roomOccupancy == "true")){
    return "#34a853"; 
}else { 
    return "#4285f4";
}
        
}