var CLIENT_ID = '876004823651-bunvq9no34h5qmqfb82ppbocb7k5c734.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBRTFvgx79n7g4sAKVuWT25jU_Kb3w7EOs';

import "babel-polyfill";

const CLIENT_ID = "833219742380-2lo67of727cepaga68kdpo41b4bbh564.apps.googleusercontent.com";
const API_KEY = "AIzaSyAeePk1Lxt0wIfJvm5YMQfIdD_6DNRJoco";

const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

// A list of code room calendars mapped to room names
export const rooms = {
  SPOCK: "code.berlin_3337333133353032313436@resource.calendar.google.com",
  PAPER: "code.berlin_3232363530373936343635@resource.calendar.google.com",
  ROCK: "code.berlin_3635313131353437333332@resource.calendar.google.com",
  SCISSORS: "code.berlin_3934313230373536353639@resource.calendar.google.com",
  LIZARD: "code.berlin_38323039323339303936@resource.calendar.google.com",
  MCROOMFACE: "code.berlin_3135303639333334323335@resource.calendar.google.com",
  MORTY: "code.berlin_31333137303136343636@resource.calendar.google.com",
  RICK: "code.berlin_3736373335323835363837@resource.calendar.google.com",
};

// A list of all code calendars
const calendars = {
  SE: "code.berlin_7ll36cju0bnakk22drife9g7fo@group.calendar.google.com",
  ID: "code.berlin_pg1oevsslhon2p2fh2pemvrhms@group.calendar.google.com",
  PM: "code.berlin_72gpt2s8d6tf2nearc5r14j42c@group.calendar.google.com",
  STS: "code.berlin_839escpql8nb35j64u6mcai8us@group.calendar.google.com",
  GENERAL: "code.berlin_c89vpghtq7bi10otltoker3c38@group.calendar.google.com",
  EVENTS: "code.berlin_htb7gvcg51iva75htct2hbt7nk@group.calendar.google.com"
};

/**
 * A client to interact with the Google Calendar API
 */
export class CalendarClient {
  constructor() {
    this.signedIn = false;
  }

  /**
   * Initialize the Gapi client and CalendarClient
   */
  async init() {
    return new Promise((resolve, reject) => {
      gapi.load("client:auth2", resolve);
    }).then(() => this.configure());
  }

  /**
   * Configures the Gapi client for Auth
   */
  async configure() {
    return gapi.client
      .init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
      })
      .then(() => {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

        // Handle the initial sign-in state.
        this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      });
  }

  /**
   * Called when the Gapi signing status changes
   * @param status
   */
  updateSigninStatus(status) {
    this.signedIn = status;
  }

  /**
   *  Sign in the user
   */
  async handleAuthClick(event) {
    return gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user
   */
  async handleSignoutClick(event) {
    return gapi.auth2.getAuthInstance().signOut();
  }

  /**
   * Get the current occupation of CODE campus rooms
   */
  async getRoomOccupation() {
    let occupation = {};

    // Get current or next event for each room to calculate the occupation
    for (let room in rooms) {
      await gapi.client.calendar.events
        .list({
          calendarId: rooms[room],
          timeMin: new Date().toISOString(),
          showDeleted: false,
          singleEvents: true,
          maxResults: 1,
          orderBy: "startTime"
        })
        .then(function(response) {
          var events = response.result.items;

          if (events.length > 0) {
            let start = new Date(events[0].start.dateTime);
            let end = new Date(events[0].end.dateTime);
            let now = new Date();

            if (now > start && now < end) {
              occupation[room] = { status: false, time: end };
            } else {
              occupation[room] = { status: true, time: start };
            }
          } else {
            occupation[room] = { status: true, time: start };
          }
        });
    }
    return occupation;
  }

  /**
   * Get the current list of CODE events
   */
  async getEventList() {
    let events = [];

    // Request the next 3 events of each calendar
    for (let calendar in calendars) {
      await gapi.client.calendar.events
        .list({
          calendarId: calendars[calendar],
          timeMin: new Date().toISOString(),
          showDeleted: false,
          singleEvents: true,
          maxResults: 3,
          orderBy: "startTime"
        })
        .then(function(response) {
          var _events = response.result.items;
          events.push(..._events);
        });
    }

    // Sort the events by starting time
    events.sort((a, b) => {
      return new Date(a.start.dateTime) - new Date(b.start.dateTime);
    });

    return events;
  }

  /**
   * Get the current list of CODE events for a single room
   */
  async getRoomEvents(room) {
    return await gapi.client.calendar.events
      .list({
        calendarId: room,
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 3,
        orderBy: "startTime"
      })
      .then(function(response) {
        var _events = response.result.items;
        return _events;
      });
  }
}