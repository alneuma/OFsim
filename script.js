//////////////////
//// settings ////
//////////////////

// all settings should be positive numbers

// state-progression
const STATE_UPDATE_INTERVAL = 1;

// number of bots at the beginning
const STARTING_BOTS_NUMBER = 5;

// amount by which bot relationships approach the default after each STATE_UPDATE_INTERVAL seconds
const BOT_RELATIONSHIP_DECLINE = 0.5;

// timeframe in seconds to calculate message-density per second
const MESSAGE_DENSITY_TIMEFRAME = 30;

// bots interacting
//
// Parameters influencing the chances for bots reacting to each other or the human or taking initiative for interaction
// aswell as the way in which this interaction happens
//
// MAX_BOTS_REACT                     denotes the maximum number of bots reacting to a message sent
// BOT_REACTION_THRESHOLD             minimum botherLevel (is calculated for each message) a bot needs to have to react to another bots message
// BOT_BOTHER_LEVEL_ADDRESSING_BONUS  
// BOT_RELATIONSHIP_ADDRESSING_BONUS  factor with which bots relationship adjustment is modified, when they are addressed directly by a message
//
const MAX_BOTS_REACT = 3;
const BOT_REACTION_THRESHOLD = 0.0;
const BOT_BOTHER_LEVEL_ADDRESSING_BONUS = 1.5;
const BOT_RELATIONSHIP_ADDRESSING_BONUS = 1.5;

// bots typing time
//
// The time a bot needs to compose a message depends on the length of the message the bot is respondig to,
// the length of the message the bot is writing and the bot's .typingSpeed property aswell as some otherconstants and a random number.
// The formula for calculating the actual-time-taken in miliseconds is the following:
//
// actual-time-taken        = BOT_TYPING_TIME_BASE + effective-message-length * random-factor
// effective-message-length = output-message.length * (typing-speed + 0.5) + input-message.length / BOT_TYPING_TIME_READING_QUOTIENT
//
// BOT_TYPING_TIME_BASE             see formula for actual-time-taken
// BOT_TYPING_TIME_FACTOR_MAX       maximum of the random-factor
// BOT_TYPING_TIME_FACTOR_MIN       minimum of the random-factor
// BOT_TYPING_TIME_READING_QUOTIENT see formula for effective-message-length
//
const BOT_TYPING_TIME_BASE = 800;
const BOT_TYPING_TIME_FACTOR_MAX = 200;
const BOT_TYPING_TIME_FACTOR_MIN = 20;
const BOT_TYPING_TIME_READING_QUOTIENT = 2

// bots joining
//
// With each state-progression there is a chance for a bot to join the room based
// on the number of bots already present.
//
// BOT_JOIN_PROBABILITY_BASE      denotes the probability of bots to join a room without any bots
// BOT_JOIN_PROBABILITY_MIN       denotes the probability for bots to join a full chat-room
//                                When set equal to BOT_JOIN_PROBABILITY_BASE, probability will always be the same
//                                independently of the number of bots in the room.
// BOT_JOIN_PROBABILITY_EXPONENT  determines how aprupt the bot joining will end, when the room gets fuller
//                                The higher the number the more aprupt the change in probability will happen
//                                when chat-room approaches fullness.
//                                When set to 1 the probability will linearly decline from BOT_JOIN_PROBABILITY_BASE to BOT_JOIN_PROBABILITY_MIN
// BOT_JOIN_CHAT_ROOM_FULL        denotes at which number of bots the probability for new bots to join is at minimum
//
const BOT_JOIN_PROBABILITY_BASE = 0.02;
const BOT_JOIN_PROBABILITY_MIN = 0.001;
const BOT_JOIN_PROBABILITY_EXPONENT = 2;
const BOT_JOIN_CHAT_ROOM_FULL = 10;

// bots leaving
//
// BOT_LEAVING_PROBABILITY_BASE the base probability for each non-busy bot to initiate it's leaving process
//                              during each state progression. to get the real probability the bot's satisfaction also matters
// BOT_SAYS_GOODBYE             Chance for a bot to send a goodbye message when leaving
// BOT_LEAVING_DELAY_BASE       base time bots will still stat in chat after they decided
//                              to leave or after they have sent a goodbye message in miliseconds
// BOT_LEAVING_DELAY_FACTOR     factor with which the result Math.random() method is multiplied
//                              to calulate the time in miliseconds added to BOT_LEAVING_DELAY_BASE
//                              to calculate the total time a bot needs for leaving
//
const BOT_LEAVING_PROBABILITY_BASE = 0.01
const BOT_SAYS_GOODBYE = 0.35;
const BOT_LEAVING_DELAY_BASE = 2000;
const BOT_LEAVING_DELAY_FACTOR = 5000;

//////////////////////////
//// global variables ////
//////////////////////////

//// chat participants ////
// used to store references to all bots in the chat-room
const botArray = [];
// reference to the human in the chat-room
let human;

//// state measurements ////
const programStartTime = Date.now();
// timestamps of messages during last MESSAGE_DENSITY_TIMEFRAME seconds
const timestamps = [];
// message density in seconds
// The last MESSAGE_DENSITY_TIMEFRAME seconds are used to calculate this value
let messageDensity = 0;

///////////////////////
//// basic utility ////
///////////////////////

// Formula taken from:
// https://stackoverflow.com/questions/16110758/generate-random-number-with-a-non-uniform-distribution
//
// input:       "none"/"polar"/"left"/"right"
// output:      a random number between 0.0 and 1.0 generated with a distribution biased according to input:
//              "none"  = no bias
//              "polar" = biased towards the minimum and maximum
//              "left"  = biased towards the minimum
//              "right" = biased towards the maximum
//              If none of the above is provided, defaults to "none"
// sideeffects: none
const randomNumber = (bias) => {
  if (bias === "none") {
    return Math.random();
  }
  let beta = Math.sin(Math.random() * Math.PI / 2) ** 2;
  if (bias === "polar") {
    return beta;
  }
  else if (bias === "left") {
    return beta < 0.5 ? 2 * beta : 2 * (1 - beta);
  }
  else if (bias === "right") {
    return beta > 0.5 ? 2 * beta - 1 : 2 * (1 - beta) - 1;
  }
  else {
    return Math.random();
  }
}

/////////////////////////////
//// participant classes ////
/////////////////////////////

//// ChatParticipant ////

// class for representing the human and chat-bots
// Default is human
// Chat-bots are implemented as the ChatBot sub-class with additional properties and methods.
//
// Most of the properties should be self-explanatory
// ._relationships takes .name properties of other ChatParticipants as keys and 
// uses arrays as values. For the human these arrays are of the for [boolean,boolean]
// where the first bolean denotes if the chatter with the key as the .name is a friend
// and the second boolean denotes if this chatter is muted.
// For cat-bots there is an aditional integer-value prepended, which denotes the
// sympathy a bot has for the respective chatter (negative or positive)
class ChatParticipant {
  constructor(name, colorPrimary, font, avatar) {
    this._name = name;
    this._colorPrimary = colorPrimary;
    this._colorSecondary = this.constructor.complementaryColor(colorPrimary);
    this._font = font;
    this._avatar = avatar;
    this._relationships = {};
    this._hasGreeted = false;
    this._lastInteractionTime = Date.now();
    this._isHuman = true;
  }

  // getters and setters
  get name()                { return this._name; }
  get colorPrimary()        { return this._colorPrimary; }
  get colorSecondary()      { return this._colorSecondary; }
  get font()                { return this._font; }
  get avatar()              { return this._avatar; }
  get friendsWith()         { return this._friendsWith; }
  get hasGreeted()          { return this._hasGreeted; }
  get lastInteractionTime() { return this._lastInteractionTime; }
  get isHuman()             { return this._isHuman; }
  get relationships()       { return this._relationships; }

  set name(name)                                { this._name = name; }
  set colorPrimary(colorPrimary)                { this._colorPrimary = colorPrimary; }
  set colorSecondary(colorSecondary)            { this._colorSecondary = colorSecondary; }
  set font(font)                                { this._font = font; }
  set avatar(avatar)                            { this._avatar = avatar; }
  set friendsWith(friendsWith)                  { this._friendsWith = friendsWith; }
  set hasGreeted(hasGreeted)                    { this._hasGreeted = hasGreeted; }
  set lastInteractionTime(lastInteractionTime)  { this._lastInteractionTime = lastInteractionTime; }
  set relationships(relationships)              { this._relationships = relationships; }

  // these arrays save all possible values for the according properties and are used to randomly choose them
  static _fontArray = ["monospace","cursive","math","serif","sans-serif","fantasy"];
  static _colorArray = ["#FF0000","#FF8000"/*,"#FFFF00"*/,"#80FF00","#00FF00","#00FF80","#00FFFF","#0080FF"/*,"#0000FF"*/,"#8000FF","#FF00FF","#FF0080"];

  // input:       string representing a color
  // output:      if input is in this._colorArray, returns the hex code of the complementary color otherwise returns "black"
  // sideeffects: none
  static complementaryColor(color) {
    let colorIndex = this._colorArray.indexOf(color);
    if (colorIndex === -1) {
      return "black";
    }
    let colorArrLength = this._colorArray.length;
    return this._colorArray[(colorIndex + Math.floor(colorArrLength / 2)) % colorArrLength];
  }

  // input:       an object of class ChatParticipant
  // output:      a reference to the inputs .relationships property (object)
  // sideeffects: populates the inputs .relationships property with entries for all other chatters
  static makeRelationships(chatParticipant) {
    let relationships = {};
    if (chatParticipant.isHuman) {
      for (let i = 0; i < botArray.length; i++) {
        relationships[botArray[i].name] = [false];
      }
    }
    else {
      if (typeof human !== "undefined") {
        relationships[human.name] = [0,false];
      }
      for (let i = 0; i < botArray.length; i++) {
        relationships[botArray[i].name] = [0,false];
      }
    }
    return relationships;
  }

  // input:       none
  // output:      a randomly generated chatters name as a string
  // sideeffects: none
  static randomName() {
    let keepGoing = true;
    while (keepGoing) {
      var name = Math.floor(Math.random() * 65535).toString(16);
      if (typeof human !== "undefined" && name === human.name) {
        continue;
      }
      keepGoing = false;
      for (var i = 0; i < botArray.length; i++) {
        if (name === botArray[i].name) {
          keepGoing = true;
          break;
        }
      }
    }
    return name;
  }

  // input:       none
  // output:      a randomly chosen entry from this._colorArray
  //              which will be the hex code of one color of a 12-color-color-wheel
  // sideeffects: none
  static randomColor() {
    return this._colorArray[Math.floor(Math.random() * this._colorArray.length)];
  }

  // input:       none
  // output:      a randomly chosen font-family from this._fontArray
  // sideeffects: none
  static randomFont() {
    return this._fontArray[Math.floor(Math.random() * this._fontArray.length)];
  }

  // input:       none
  // output:      a randomly picked avatar-image
  // sideeffects: none
  static randomAvatar() {
    return "";
  }

  // input:       none
  // output:      a randomly created human ChatParticipant
  // sideeffects: none
  static randomHuman() {
    let newHuman = new ChatParticipant(this.randomName(),
                                       this.randomColor(),
                                       this.randomFont(),
                                       this.randomAvatar());
    newHuman.relationships = this.makeRelationships(newHuman);
    return newHuman;
  }
}

//// ChatBot ////

// extends Chat Participant by the following properties:
// personality
// verbosity
// busy
// relationships
// stisfaction
// these properties are used by different parts of the program to determine a bot's automatic behavior
class ChatBot extends ChatParticipant {
  constructor(name, colorPrimary, font, avatar, personality, verbosity, typingSpeed) {
    super(name, colorPrimary, font, avatar)
    this._personality = personality;
    this._verbosity = verbosity
    this._typingSpeed = typingSpeed;
    this._busy = false;
    this._isHuman = false;
    this._satisfaction = 0;
  }

  // getters and setters
  get personality()   { return this._personality; }
  get verbosity()     { return this._verbosity; }
  get busy()          { return this._busy; }
  get typingSpeed()   { return this._typingSpeed; }
  get satisfaction()  { return this._satisfaction; }

  set personality(personality)    { this._personality = personality; }
  set verbosity(verbosity)        { this._verbosity = verbosity; }
  set busy(busy)                  { this._busy = busy; }
  set typingSpeed(typingSpeed)    { this._typingSpeed = typingSpeed; }
  set satisfaction(satisfaction)  { this._satisfaction = satisfaction; }

  // these arrays save all possible values for the the according bot-characteristics and are used to randomly choose them
  static _personalityArray = ["emoji","picture","wiki","troll","spiritual","motivational"];

  // input:       none
  // output:      a randomly chose entry from this._personalityArray
  // sideeffects: none
  static randomPersonality() {
    return this._personalityArray[Math.floor(Math.random() * this._personalityArray.length)];
  }

  // input:       none
  // output:      a randomly generated value for a bots .typingSpeed property
  // sideeffects: none
  static randomTypingSpeed() {
    return randomNumber("none");
  }

  // input:       none
  // output:      a randomly generated value for a bots .verbosity property
  // sideeffects: none
  static randomVerbosity() {
    return Math.random() * 0.6 + 0.2;
  }

  // input:       none
  // output:      a reference to ChatBot (object) with random features
  // sideeffects: none
  static randomBot() {
    let newBot = new ChatBot(this.randomName(),
                             this.randomColor(),
                             this.randomFont(),
                             this.randomAvatar(),
                             this.randomPersonality(),
                             this.randomVerbosity(),
                             this.randomTypingSpeed());
    newBot.relationships = this.makeRelationships(newBot);
    return newBot;
  }
}

///////////////////////
//// message class ////
///////////////////////

// class to represent Messages sent by different chat participants
//
// Besides the ._content there is different metadata that helps determine 
// how bots might react to the message and how the message is represented inside the DOM
// The ._content is chosen to be represented as a jquery-object to make it easier to later implement
// messages which have other content than just text.
//
// from:      participant who sends the message
// to:        participant who is addressed (can be "none")
// types:     greeting, gossip, initiative, goodbye, none
// about:     can be used for gossip (can be "none")
// mood:      0.0 - 1.0 the larger the more friendly
// content:   is a jquery-object
class Message {
  constructor(from,to,type,about,mood) {
    this._from = from;
    this._to = to;
    this._type = type;
    this._about = about;
    this._mood = mood;
    this._content = this.constructor.makeContent(this._from,this._to,this._type,this._about,this._mood);
    this._time = Date.now();
  }

  // setters and getters
  get from()    { return this._from; }
  get to()      { return this._to; }
  get type()    { return this._type; }
  get about()   { return this._about; }
  get mood()    { return this._mood; }
  get content() { return this._content; }
  get time()    { return this._time; }

  set from(from)        { this._from = from; }
  set to(to)            { this._to = to; }
  set type(type)        { this._type = type; }
  set about(about)      { this._about = about; }
  set mood(mood)        { this._mood = mood; }
  set content(content)  { this._content = content; }
  set time(time)        { this._time = time; }

  // input:       a reference to a chatParticipant object and a number between 0.0 and 1.0
  // output:      a jquery-object of ._type "greeting"
  // sideeffects: none
  static makeGreeting(to,mood) {
    if (to === "none") {
      if (mood < 0.33) {
        return $("<div>").text("I just entered this chat and do already regret it.");
      }
      else if (mood < 0.66) {
        return $("<div>").text("Hey everybody!");
      }
      else {
        return $("<div>").text("Yo yo yo!!!!! What is going on?!!");
      }
    }
    else {
      if (mood < 0.33) {
        return $("<div>").text(`Oh no! ${to.name} is here!`);
      }
      else if (mood < 0.66) {
        return $("<div>").text(`Hey, ${to.name}!`);
      }
      else {
        return $("<div>").text(`${to.name}!!!!! I am soooo glad you came!!!`);
      }
    }
  }

  // input:       two references to chatParticipant objects and a number between 0.0 and 1.0
  // output:      a jquery-object of ._type "gossip"
  // sideeffects: none
  static makeGossip(to,about,mood) {
    if (about === "none") {
      if (mood < 0.33) {
        return $("<div>").text(`Hey ${to.name}, don't you think, that there are really no decent people around in this chat?`);
      }
      else if (mood < 0.66) {
        return $("<div>").text(`Hey ${to.name}, what do you think about this chat today?`);
      }
      else {
        return $("<div>").text(`Hey ${to.name}, isn't it great to be among all these good people in this chat?`);
      }
    }
    else {
      if (mood < 0.33) {
        return $("<div>").text(`Hey ${to.name}, look at ${about.name}! That's a jerk if I have seen one!`);
      }
      else if (mood < 0.66) {
        return $("<div>").text(`Hey ${to.name}, what do you think about ${about.name}?`);
      }
      else {
        return $("<div>").text(`Hey ${to.name} don't you think ${about.name} is just the bet person around?`);
      }
    }
  }

  // input:       a reference to a chatParticipant object and a number between 0.0 and 1.0
  // output:      a jquery-object of ._type "initiative"
  // sideeffects: none
  static makeInitiative(to,mood) {
    if (to === "none") {
      if (mood < 0.33) {
        return $("<div>").text(`There is so much lag for me today. I guess there are just too many of you guys.`);
      }
      else if (mood < 0.66) {
        return $("<div>").text(`Hey peoples what's buzzin'?`);
      }
      else {
        return $("<div>").text(`My life is just great!!!`);
      }
    }
    else {
      if (mood < 0.33) {
        return $("<div>").text(`${to.name}?!? what kind of lame name is that?`);
      }
      else if (mood < 0.66) {
        return $("<div>").text(`${to.name} what do you think about marshmallows?`);
      }
      else {
        return $("<div>").text(`${to.name}, I really like the color you choose! You must be a person culture!`);
      }
    }
  }

  // input:       a reference to a chatParticipant object and a number between 0.0 and 1.0
  // output:      a jquery-object of ._type "goodbye"
  // sideeffects: none
  static makeGoodbye(to,mood) {
    if (to === "none") {
      if (mood < 0.33) {
        return $("<div>").text(`This chat really is the worst! I'm out.`);
      }
      else if (mood < 0.66) {
        return $("<div>").text(`Gotta bounce. See you guys around!`);
      }
      else {
        return $("<div>").text(`My heart cries. I have to leave this chat. Goodbye to all my friends!!!!`);
      }
    }
    else {
      if (mood < 0.33) {
         return $("<div>").text(`I am glad you leave ${to.name}. I certainly won't miss you!`);
      }
      else if (mood < 0.66) {
        return $("<div>").text(`Bye ${to.name}, see you around!`);
      }
      else {
        return $("<div>").text(`Don't leave me ${to.name}!!!! Please come back soon. I will miss you!!!`);
      }
    }
  }

  // input:       from  = reference to chatParticipant object or "none"
  //              to    = reference to chatParticipant object or "none"
  //              type  = "greeting"/"gossip"/"initiative"/"goodbye"/"none"
  //              about = reference to chatParticipant object or "none"
  //              mood  = a number between 0.0 and 1.0
  // output:      a jquery-object representing content which was generated based on the input
  // sideeffects: none
  static makeContent(from,to,type,about,mood) {
    switch (type) {
      case "greeting":    return this.makeGreeting(to,mood);
      case "gossip":      return this.makeGossip(to,about,mood);
      case "initiative":  return this.makeInitiative(to,mood);
      case "goodbye":     return this.makeGoodbye(to,mood);
      case "none":        return $("<div>");
      default:            return $("<div>");
    }
  }
}

/////////////////////////
//// general control ////
/////////////////////////

// input:       none
// output:      string of format "dd/MM/yyyy HH:mm" representing current (local) time
// sideeffects: none
const getTimeString = () => {
  let date = new Date();
  return ('0' + date.getDate()).slice(-2) + "/" +
         ('0' + (date.getMonth() + 1)).slice(-2) + "/" +
         date.getFullYear() + " " +
         ('0' + date.getHours()).slice(-2) + ":" +
         ('0' + date.getMinutes()).slice(-2)
}

// input:       none
// output:      undefined
// sideeffects: clears the #chat-input DOM-object from any input
const clearChatInput = () => {
  $("#chat-input").val("");
};

// input:       jquery-object
// output:      undefined
// sideeffects: scrolls associated DOM element to the bottom
const scrollToBottom = (jqObject) => {
  jqObject.scrollTop(jqObject[0].scrollHeight);
}

// sendSystemMessage()
//
// input:       a string that can have html represent
// output:      undefined
// sideeffects: Writes a system message with a timestamp to the #message-window and scrolls down
//              the html element representing the message has the following form
//              where "html" denotes the input string and "dd/MM/yyyy HH:mm" denotes the format
//              of a timestring at the respective position:
//
//              <div class="message system-message">
//                <p class="system-message-content><span class="system-message-timestamp">dd/MM/yyyy HH:mm: </span>html</p>
//              </div>
//
const sendSystemMessage = (html) => {
  $newMessage = $("<div>")
                  .addClass("message system-message")
                  .appendTo($("#message-window"));

  $("<p>")
    .addClass("system-message-content")
    .append(html)
    .appendTo($newMessage);

  $("<span>")
    .text(getTimeString() + ": ")
    .addClass("system-message-timestamp")
    .prependTo($newMessage.find(".system-message-content"));

  scrollToBottom($("#message-window"));
}

// addParticipantToScreen()
//
// input:       an object of class ChatParticipatn
// output:      none
// sideeffects: Adds an html element that represents chat-participant to the #participants-window element.
//              The element has the following form, where every instance of chatParticipant.x is to be replaced
//              by the property x of the input. If (input.isHuman === true) " (You)" is appended inside the <h3> element.
//
//              <div id="chatParticipant.name">
//                <img class="participant-avatar" src="chatParticipant.avatar" alt="chatParticipant.name's avatar">
//                <div class="participant-info" style="font-family: chatParticipant.font; color: chatParticipant.colorSecondary; background-color: chatParticipant.colorPrimary">
//                  <h3>chatParticipant.name<h3>
//                </div>
//              </div>
//
const addParticipantToScreen = (chatParticipant) => {
  let $newParticipant = $("<div>")
                          .addClass("participant")
                          .attr("id",chatParticipant.name);

  let $newAvatar = $("<img>")
                      .addClass("participant-avatar")
                      .attr("src",chatParticipant.avatar)
                      .attr("alt",chatParticipant.name + "'s avatar");

  let $newInfo = $("<div>")
                    .addClass("participant-info")
                    .css("font-family",chatParticipant.font)
                    .css("color",chatParticipant.colorSecondary)
                    .css("background-color",chatParticipant.colorPrimary)

  let $newName = $("<h3>")
                      .text(chatParticipant.name + (chatParticipant.isHuman ? " (You)" : ""));

  $newName.appendTo($newInfo);

  $newAvatar.appendTo($newParticipant);
  $newInfo.appendTo($newParticipant);
  $newParticipant.appendTo("#participants-window");
}

// INCOMPLETE DOCUMENTATION
// input: string
// output: jQuery-Object that holds a DOM element that contains a message sent by human of the following format
//        <div class="bot-message">
//          <div class="bubble bot-bubble">
//            <p class="nametag bot-nametag">bot-name</p>
//            <p class="chat-text bot-chat-text">text</p>
//            <p class="message-timestamp">time</p>
//          </div>
//          <img src="" alt="bot-face" />
//        </div>
// sideeffects: none
//
// To think about: define helper functions especially for avatar-image
// input:     Message object
const makeMessageRepresentation = (message) => {

  // make name-tag
  let $nameTag = $("<p>")
                    .addClass("nametag")
                    .css("color",message.from.colorSecondary)
                    .css("font-famliy",message.from.font)
                    .text(message.from.name + ":");

  // make chat-text
  let $newContent = message
                      .content
                      .addClass("message-content")
                      .html(message.content.text());

  // make timestamp
  let $newTimestamp = $("<p>")
                        .addClass("timestamp")
                        .css("color",message.from.colorSecondary)
                        .text(getTimeString());

  // make text-bubble
  let $newBubble = $("<div>")
                      .css("background-color",message.from.colorPrimary)
                      .addClass("bubble");

  // add chat-text and timestamp to text-bubble
  $nameTag.appendTo($newBubble);
  $newContent.appendTo($newBubble);
  $newTimestamp.appendTo($newBubble);

  // make message element
  let $newMessageRepresentation = $("<div>")
                                    .addClass("message " + (message.from.isHuman ? "human" : "bot") + "-message");

  // add text-bubble and avatar-image to message element
  $newBubble.appendTo($newMessageRepresentation);
  
  return $newMessageRepresentation;
}

// postMessage()
//
// input:       an object of class Message
// output:      undefined
// sideeffects: Appends an html-element representing the input to #message-window.
//              Scrolls to bottom of #message-window.
//              Triggers bots reactions to the message.
const postMessage = (message) => {
  makeMessageRepresentation(message).appendTo($("#message-window"))
  scrollToBottom($("#message-window"));
  message.time = Date.now();
  message.from.lastInteractionTime = message.time;
  timestamps.push(message.time);
  botsReaction(message);
}

/////////////////////
//// bot control ////
/////////////////////

const botExists = (chatBot) => {
  return botArray.findIndex(bot => bot.name === chatBot.name) !== -1;
}

// input:       none
// output:      reference to a randomly chosen non-busy bot, if no such bot exists return false
// sideeffects: none
const chooseBot = () => {
  let idleBotsNumber = botArray.filter(x => !x.busy).length;
  if (idleBotsNumber === 0) {
    return false;
  }
  let index = Math.floor(randomNumber("none") * idleBotsNumber);
  return botArray.filter(x => !x.busy)[index];
}

// botEntersChat()
// Makes a new randomly generated chatBot appear in the chatroom.
//
// input:       none
// output:      a reference to a bot generated with ChatBot.randomBot()
// sideeffects: The reference is pushed onto the botArray
//              Calls addParticipantToScreen() with the reference as argument
//              and generates the according sideeffets.
//              The .name proprety of the referenced object as a key with default values
//              to all the .relationships properties (which are objects) of all chat-participants.
//              Calls sendSystemMessage() with an argument that anounces that somebode with the name
//              of the randomly generated bot entered the chat.
//
const botEntersChat = () => {
  let newBot = ChatBot.randomBot();
  addParticipantToScreen(newBot);
  human.relationships[newBot.name] = [false];
  for (let i = 0; i < botArray.length; i++) {
    botArray[i].relationships[newBot.name] = [0,false];
  }
  botArray.push(newBot);
  sendSystemMessage("<span style=\"font-family: " + newBot.font + "\">" + newBot.name + "</span> entered the chat.");
  return newBot;
}

// humanEntersChat()
//
// Largely similar to botEntersChat, but calls ChatParticipant.randomHuman() instead of ChatBot.randomBot()
// and changes the look of the #message-window according to the human's properties
// Should only be called once!!!
//
// input:       none
// output:      a reference to the human generated with ChatParticipant.randomHuman()
// sideeffects: The reference is pushed onto the botArray
//              Calls addParticipantToScreen() with the reference as argument
//              and generates the according sideeffets.
//              The .name proprety of the referenced object as a key with default values
//              to all the .relationships properties (which are objects) of all chat-participants.
//              Calls sendSystemMessage() with an argument that anounces that somebode with the name
//              of the randomly generated human entered the chat.
//              Calls sendSystemMessage() again with a greeting as an argument
//              Colors the background of the #message-window according to the human's .colorSecondary
//              property
//
const humanEntersChat = () => {
  human = ChatParticipant.randomHuman();
  addParticipantToScreen(human);
  for (let i = 0; i < botArray.length; i++) {
    botArray[i].relationships[human.name] = [0,false];
  }
  sendSystemMessage("A human with the name <span style =\"font-family: " + human.font + "\">" + human.name + "</span> entered the chat.");
  sendSystemMessage("Welcome!");
  $("#message-window").css("background","linear-gradient(to bottom right, #202020, " + human.colorSecondary + ")");
  return human;
}

// botTypingDelay()
// Used to generate a delay, before a bot responds to a message
//
// input:       input      = The message a bot is reacting to
//              botMessage = The message the bot will be sending
// output:      a time in milliseconds based on input length and botMessage length
//              input length is wighted less as the bot's reading speed should
//              be sumulated faster as the bot's typing speed
// sideeffects: none
const botTypingDelay = (inputMessage,botResponse) => {
  return BOT_TYPING_TIME_BASE +
         (botResponse.content.text().length * (botResponse.from.typingSpeed + 1.0) + inputMessage.content.text().length / BOT_TYPING_TIME_READING_QUOTIENT) *
         (Math.floor(Math.random() * (BOT_TYPING_TIME_FACTOR_MAX + BOT_TYPING_TIME_FACTOR_MIN)));
}

// botLeavesChat()
//
// input:       an object of class ChatBot
// output:      undefined
// sudeeffects: Removes all references to the input from all other objects.
//              Removes the DOM element representing the input in the #participants-window
//              Calls sendSystemMessage() with an argument anouncing, that somebody with the
//              .name property of the input left.
//
const botLeavesChat = (chatBot) => {
  $("#" + chatBot.name).remove();
  botArray.splice(botArray.findIndex(bot => bot.name === chatBot.name),1);
  delete human.relationships[chatBot.name];
  botArray.forEach(bot => delete bot.relationships[chatBot.name]);
  sendSystemMessage("<span style=\"font-family: " + chatBot.font + "\">" + chatBot.name + "</span> left.");
}

// botLeavingProcess()
//
// input:       an object of class ChatBot
// output:      undefined
// sideeffects: Calls botLeavesChat() with the input as argument after a random delay.
//              With a certain chance makes the bot send a goodbye message before.
//
const botLeavingProcess = (chatBot) => {
  chatBot.busy = true;
  if (randomNumber("none") > 1 - BOT_SAYS_GOODBYE) {
    let leaveMessage = new Message(chatBot,"none","goodbye","none",randomNumber("none"));
    let writeDelay = botTypingDelay(new Message("none","none","none","none",randomNumber("none")),leaveMessage) + 1000;
    setTimeout(() => {
        postMessage(leaveMessage);
        setTimeout(botLeavesChat,
                   randomNumber("left") * BOT_LEAVING_DELAY_FACTOR + BOT_LEAVING_DELAY_BASE,
                   chatBot);
      },writeDelay);
  }
  else {
    setTimeout(botLeavesChat,
               randomNumber("none") * BOT_LEAVING_DELAY_FACTOR + BOT_LEAVING_DELAY_BASE,
               chatBot);
  }
}

const makeReactionMessage = (chatBot,inputMessage) => {
  let mood;
  let type = "none";
  let to = "none";
  let about = "none";

  // setting the mood
  if (inputMessage.mood < 0.33) {
    mood = randomNumber("left");
  }
  else if (inputMessage.mood <= 0.66) {
    mood = 1.0 - randomNumber("polar");
  }
  else {
    mood = randomNumber("right");
  }

  if ("goodbye" === inputMessage.type && inputMessage.to === "none") {
    type = "goodbye";
    to = inputMessage.from;
  }
  else if ("greeting" === inputMessage.type) {
    type = "greeting";
    to = inputMessage.from
  }
  else if ("gossip" === inputMessage.type) {
    if (chatBot === inputMessage.to) {
      type = "gossip";
      about = inputMessage.about;
      to = inputMessage.from;
    }
    else {
      type = "initiative";
      to = inputMessage.from;
    }
  }
  else if ("initiative" === inputMessage.type) {
    if (randomNumber("none") > 0.5) {
      type = "greeting";
      to = inputMessage.from;
    }
    else {
      type = "gossip";
      about = inputMessage.from;
      to = botArray
            .filter(bot => bot.name !== chatBot.name)
            .concat([human])[Math.floor(randomNumber("none") * botArray.length)];
    }
  }
  else {
    type = "greeting";
    to = inputMessage.from;
  }

  return new Message(chatBot,to,type,about,mood);
}

const singleBotReaction = (chatBot,inputMessage) => {
  chatBot.busy = true;
  let reactionMessage = makeReactionMessage(chatBot,inputMessage);
  setTimeout(() => {
      postMessage(reactionMessage);
      chatBot.busy = false;
    },
    botTypingDelay(inputMessage,reactionMessage)
  );
  return true;
}

const updateRelationship = (chatBot,message) => {

  if (!botExists(message.from)) {
    return;
  }

  let effectiveMessageMood = message.mood - 0.5;
  if (effectiveMessageMood === 0) {
    return;
  }

  let relationshipScore = chatBot.relationships[message.from.name][0];

  if (relationshipScore === 0) {
    relationshipScore += 100 *
                         effectiveMessageMood *
                         ((message.to.name === chatBot.name) ? BOT_RELATIONSHIP_ADDRESSING_BONUS : 1);
  }
  else if (Math.sign(relationshipScore) === Math.sign(effectiveMessageMood)) {
    relationshipScore += Math.sign(relationshipScore) *
                         (100 - Math.abs(relationshipScore)) *
                         Math.abs(effectiveMessageMood) *
                         ((message.to.name === chatBot.name) ? BOT_RELATIONSHIP_ADDRESSING_BONUS : 1);
  }
  else {
    relationshipScore -= Math.sign(relationshipScore) *
                         Math.abs(relationshipScore) *
                         Math.abs(effectiveMessageMood) *
                         ((message.to.name === chatBot.name) ? BOT_RELATIONSHIP_ADDRESSING_BONUS : 1);
  }

  chatBot.relationships[message.from.name][0] = (Math.abs(relationshipScore) > 100) ?
                                                Math.sign(relationshipScore) * 100 :
                                                relationshipScore;
}

// Used to check how much a bot is povoced to react by a certain message
// Will be compared against the bots verbosity
// the higher the edge-factor the more likely a bot is to react
//
// input:       chatBot = the bot provoced
//              speaker = the bot/human provocing with input
//              input   = the povocing input
// output:      number between 0.0 and 1.0
// sideeffect:  none
const botBotherLevel = (chatBot,inputMessage) => {
//  BOT_BOTHER_LEVEL_ADDRESSING_BONUS
  if (chatBot.busy) {
    return 0.0;
  }
  return Math.max(randomNumber("left") - chatBot.verbosity, 0.0);
}

const compareFirst = (array1,array2) => {
  if      (array1[0] < array2[0]) return -1;
  else if (array1[0] > array2[0]) return  1;
  else                            return  0;
}

// input:       the object of the "persons" to whom it is reacted
// output:      undefined
// sideeffects: as a reaction to a message:
//              updates bots relationships
//              choses the MAX_BOTS_REACT number of botsj
const botsReaction = (inputMessage) => {
  botArray.forEach(bot => {
    if (bot.name !== inputMessage.from.name) {
      updateRelationship(bot,inputMessage);
    }
  });

  let priorities = [];
  for (let i = 0; i < botArray.length; i++) {
    let botherLevel = botBotherLevel(botArray[i],inputMessage);
    if (botherLevel > BOT_REACTION_THRESHOLD) {
      priorities.push([botherLevel,i]);
    }
  }

  priorities
    .sort(compareFirst)
    .slice(0,MAX_BOTS_REACT)
    .map(x => x[1])
    .forEach(i => singleBotReaction(botArray[i],inputMessage));
}

const updateMessageDensity = () => {
  let currentTime = Date.now();
  timestamps.splice(0, timestamps.findIndex(time => time >= currentTime - MESSAGE_DENSITY_TIMEFRAME * 1000));
  messageDensity = 1000 *
                   timestamps.length /
                   ((currentTime - programStartTime < MESSAGE_DENSITY_TIMEFRAME * 1000) ?
                   currentTime - programStartTime :
                   MESSAGE_DENSITY_TIMEFRAME * 1000);
}

const botsRelationshipDecline = () => {
  botArray.forEach(bot => {
    let currentRelationshipLevel = 0.0;
    for (let participant in bot.relationships) {
      currentRelationshipLevel = bot.relationships[participant][0];
      if (Math.abs(currentRelationshipLevel) <= BOT_RELATIONSHIP_DECLINE) {
        bot.relationships[participant][0] = 0;
      }
      else if (currentRelationshipLevel < 0) {
        bot.relationships[participant][0] += BOT_RELATIONSHIP_DECLINE;
      }
      else {
        bot.relationships[participant][0] -= BOT_RELATIONSHIP_DECLINE;
      }
    }
  });
}

// randomEventBotJoins()
//
// Is called via stateProgression() every STATE_UPDATE_INTERVAL (see settings) of seconds.
// Makes bots randomly join the chat.
//
// input:       none
// output:      undefined
// sideeffects: randomly determines if a new bot joins the chat, based on the amount of bots already in a room, a couple of constants and
//              a function with constant exponent.
const randomEventBotJoins = () => {
  if (Math.max(BOT_JOIN_PROBABILITY_BASE *
               (1 - ((((botArray.length) / BOT_JOIN_CHAT_ROOM_FULL) * Math.pow(1 - BOT_JOIN_PROBABILITY_MIN, 1/BOT_JOIN_PROBABILITY_EXPONENT)) ** BOT_JOIN_PROBABILITY_EXPONENT)),
               BOT_JOIN_PROBABILITY_MIN)
      > randomNumber("none")) {
    botEntersChat();
  }
}

// randomEventBotsLeave()
//
// Is called via stateProgression() every STATE_UPDATE_INTERVAL (see settings) of seconds.
// Makes bots randomly leave the chat.
//
// input:       none
// output:      undefined
// sideeffects: randomly determines for each bot that is not busy if it will initiate it's leaving or not, based on the
//              BOT_LEAVING_PROBABILITY_BASE constant (see settings) and the bot.satisfaction
const randomEventBotsLeave = () => {
  botArray
    .filter(bot => !bot.busy)
    .filter(bot => randomNumber("none") < BOT_LEAVING_PROBABILITY_BASE * (1.0 - bot.satisfaction))
    .forEach(bot => botLeavingProcess(bot));
}

const randomEventBotsTalk = () => {
}

///////////////////////////////////
//// program-state-progression ////
///////////////////////////////////

// stateProgression()
//
// Manages all functions that should be executed at regular time-intervals.
// Keeps running by repeatedly calling itself.
// Should be called explicitly only ONCE during program execution!!
//
// input:       none
// output:      undefined
// sideffects:  Constantly updates bots relationships.
//              Keeps track of message density per second.
//              Makes bots randomly join.
//              Makes bots randomly leave.
//              Makes bots randomly interact.
//              Calls itself after each STATE_UPDATED_INTERVAL (see settings) seconds.
const stateProgression = () => {
  setTimeout(() => {
      randomEventBotsLeave();
      botsRelationshipDecline();
      randomEventBotJoins();
      updateMessageDensity();
      randomEventBotsTalk();
      stateProgression();
    },
    1000 * STATE_UPDATE_INTERVAL
  );
}

///////////////////
//// execution ////
///////////////////

// add starting-participants
humanEntersChat();

for (let i = 0; i < STARTING_BOTS_NUMBER; i++) {
  botEntersChat();
}

//// execution: user-independent processes ////

stateProgression();

//// execution: event-listeners ////

// processes user-input to the #chat-form
$("#chat-form").on("submit", function(event) {
  event.preventDefault();
  let to = "none"
  let type = "none"
  let about = "none"
  let mood = 1.0 - randomNumber("polar");
  let inputMessage = new Message(human,to,type,about,mood);
  inputMessage.content.text($(this).find("#chat-input").val());
  clearChatInput();
  postMessage(inputMessage);
});
