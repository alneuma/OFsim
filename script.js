//////////////////
//// settings ////
//////////////////

// denotes the maximum number of bots reaction to a message sent
const MAX_BOTS_REACT = 3;

//////////////////////////
//// global variables ////
//////////////////////////

// used to store references to all bots in the chat-room
const botArray = [];
let human;

///////////////////////
//// basic utility ////
///////////////////////

// Formula taken from:
// https://stackoverflow.com/questions/16110758/generate-random-number-with-a-non-uniform-distribution
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
    return false;
  }
}

/////////////////////////////
//// participant classes ////
/////////////////////////////

//// ChatParticipant ////

// used as the default class for representing the human chatter
// relationships: [bool,bool] for human as [friends,ignored]
//                [int,bool,bool] for bots as [relationship,friends,ignored]
class ChatParticipant {
  constructor(name, colorPrimary, font, avatar) {
    this._name = name;
    this._colorPrimary = colorPrimary;
    this._colorSecondary = this.constructor.complementaryColor(colorPrimary);
    this._font = font;
    this._avatar = avatar;
    this._relationships = {};
    this._hasGreeted = false;
    this._timeSinceInteraction = 0;
    this._isHuman = true;
  }

  // getters and setters
  get name()                  { return this._name; }
  get colorPrimary()          { return this._colorPrimary; }
  get colorSecondary()        { return this._colorSecondary; }
  get font()                  { return this._font; }
  get avatar()                { return this._avatar; }
  get friendsWith()           { return this._friendsWith; }
  get hasGreeted()            { return this._hasGreeted; }
  get timeSinceInteraction()  { return this._timeSinceInteraction; }
  get isHuman()               { return this._isHuman; }

  set name(name)                                  { this._name = name; }
  set colorPrimary(colorPrimary)                  { this._colorPrimary = colorPrimary; }
  set colorSecondary(colorSecondary)              { this._colorSecondary = colorSecondary; }
  set font(font)                                  { this._font = font; }
  set avatar(avatar)                              { this._avatar = avatar; }
  set friendsWith(friendsWith)                    { this._friendsWith = friendsWith; }
  set hasGreeted(hasGreeted)                      { this._hasGreeted = hasGreeted; }
  set timeSinceInteraction(timeSinceInteraction)  { this._timeSinceInteraction = timeSinceInteraction; }

  // these arrays save all possible values for the the according bot-characteristics and are used to randomly choose them
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

  static makeRelationships(chatParticipant) {
    let relationships = {};
    if (chatParticipant.isHuman) {
      for (let i = 0; i < botArray.length; i++) {
        relationships[botArray[i].name] = [false,false];
      }
    }
    else {
      if (typeof human !== "undefined") {
        relationships[human.name] = [0,false,false];
      }
      for (let i = 0; i < botArray.length; i++) {
        relationships[botArray[i].name] = [0,false,false];
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
  get tupingSpeed()   { return this._tupingSpeed; }
  get satisfaction()  { return this._satisfaction; }

  set personality(personality)    { this._personality = personality; }
  set verbosity(verbosity)        { this._verbosity = verbosity; }
  set busy(busy)                  { this._busy = busy; }
  set tupingSpeed(tupingSpeed)    { this._tupingSpeed = tupingSpeed; }
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
  // output:      a randomly generated number
  // sideeffects: none
  static randomVerbosity() {
    return Math.random() * 0.6 + 0.2;
  }

  // input:       none
  // output:      a ChatBot-object with random features
  // sideeffects: none
  static randomBot() {
    let newBot = new ChatBot(this.randomName(),
                             this.randomColor(),
                             this.randomFont(),
                             this.randomAvatar(),
                             this.randomPersonality(),
                             this.randomVerbosity());
    newBot.relationships = this.makeRelationships(newBot);
    return newBot;
  }
}

///////////////////////////////
//// message-content class ////
///////////////////////////////

// from:      participant who sends the message
// to:        participant who is addressed (can be "none")
// types:     greeting, gossip, initiative, goodbye, none
// about:     can be used for gossip (can be "none")
// mood:      0.0 - 1.0 the larger the more friendly
// content:   is a jQuery-object
class Message {
  constructor(from,to,type,about) {
    this._from = from;
    this._to = to;
    this._type = type;
    this._about = about;
    this._mood = randomNumber("none");
    this._content = this.constructor.makeContent(from,to,type,about,this._mood);
  }

  // setters and getters
  get from()    { return this._from; }
  get to()      { return this._to; }
  get type()    { return this._type; }
  get about()   { return this._about; }
  get mood()    { return this._mood; }
  get content() { return this._content; }

  set from(from)        { this._from = from; }
  set to(to)            { this._to = to; }
  set type(type)        { this._type = type; }
  set about(about)      { this._about = about; }
  set mood(mood)        { this._mood = mood; }
  set content(content)  { this._content = content; }

  // static methods

  static makeContent(from,to,type,about,mood) {
    switch (type) {
      case "greeting":    return this.makeGreeting(to,mood);
      case "gossip":      return this.makeGossip(to,about,mood);
      case "initiative":  return this.makeInitiative(to,mood);
      case "goodbye":     return this.makeGoodbye(to,mood);
      default:            return $("<div>");
    }
  }

  static makeGreeting(to,mood) {
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

  static makeGossip(to,about,mood) {
    if (to !== "none") {
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
    else {
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
  }

  static makeInitiative(to,mood) {
    if (to !== "none") {
      if (mood < 0.33) {
        return $("<div>").text(`There is so much lag for me today. I guess there are just too many of you guys.`);
      }
      else if (mood < 0.66) {
        return $("<div>").text(`Hey peoples what's buzzin'?`);
      }
      else {
        return $("<div>").text(`I feel sooo great about pretty much everything in this world. This chat is no exception!`);
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

  static makeGoodbye(to,mood) {
    if (to !== "none") {
      if (mood < 0.33) {
        return $("<div>").text(`This chat really is the worst! I'm out.`);
      }
      else if (mood < 0.66) {
        return $("<div>").text(`Gotta get bouncn'`);
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
}

/////////////////////////
//// general control ////
/////////////////////////

// input:       none
// output:      string of format "HH:mm dd/MM/yyyy" representing current (local) time
// sideeffects: none
const getTimeString = () => {
  let date = new Date();
  return ('0' + date.getHours()).slice(-2) + ":" +
         ('0' + date.getMinutes()).slice(-2) + " " +
         ('0' + date.getDate()).slice(-2) + "/" +
         ('0' + (date.getMonth() + 1)).slice(-2) + "/" +
         date.getFullYear();
}

// input:       none
// output:      undefined
// sideeffects: clears the chat-input-field
const clearChatInput = () => {
  $("#chat-input").val("");
};

// input:       jQuery-object
// output:      undefined
// sideeffects: scrolls associated DOM element to the bottom
const scrollToBottom = (jqObject) => {
  jqObject.scrollTop(jqObject[0].scrollHeight);
}

// INCOMPLETE DOCUMENTATION
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

// DOCUMENTATION INCOMPLETE
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
                      .text(chatParticipant.name);

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

// INCOMPLETE DOCUMENTATION
const postMessage = (message) => {
  makeMessageRepresentation(message).appendTo($("#message-window"))
  scrollToBottom($("#message-window"));
  botsReaction(message);
}

/////////////////////
//// bot control ////
/////////////////////

// input:       none
// output:      reference to a randomly chosen non-busy bot, if no such bot exists return false
// sideeffects: none
const chooseBot = () => {
  let idleBotsNumber = botArray.filter(x => !x.busy).length;
  if (idleBotsNumber === 0) {
    return false;
  }
  let index = Math.floor(Math.random() * idleBotsNumber);
  return botArray.filter(x => !x.busy)[index];
}

// botEntersChat()
// Makes a new randomly generated chatBot appear in the chatroom.
//
// input:       none
// output:      a reference to a bot generated with ChatBot.randomBot()
// sideeffects: the reference is pushed onto the botArray
//              a DOM element is added to $("#participants-window")
//              the DOM element has the following shape in html
//              where "bot's name" = name of the generated bot:
//
//              <div class="participant">
//                <img class="participant-avatar" src="" alt="avatar" />
//                <p class="participant-info">bot's name</p>
//              </div>
//
const botEntersChat = () => {
  let newBot = ChatBot.randomBot();
  addParticipantToScreen(newBot);
  human.relationships[newBot.name] = [false,false];
  for (let i = 0; i < botArray.length; i++) {
    botArray[i].relationships[newBot.name] = [0,false,false];
  }
  botArray.push(newBot);
  sendSystemMessage("<span style=\"font-family: " + newBot.font + "\">" + newBot.name + "</span> entered the chat.");
  return newBot;
}

const humanEntersChat = () => {
  newHuman = ChatParticipant.randomHuman();
  human = newHuman;
  for (let i = 0; i < botArray.length; i++) {
    botArray[i].relationships[human.name] = [0,false,false];
  }
  addParticipantToScreen(newHuman);
  sendSystemMessage("welcome");
  $("#message-window").css("background","linear-gradient(to bottom right, #303030, " + newHuman.colorSecondary + ")");
  return newHuman;
}

// if chance bot says bye after delay, then leaves after another delay
// otherwise just leaves after delay
// bot is busy during delays
const botLeavingProcess = (chatBot) => {
  chatBot.busy = true;
  if (randomNumber("none") > 0.5) {
    let leaveMessage = "Bye!";
    let writeDelay = botTypingDelay(chatBot,"",leaveMessage) + 1000;
    setTimeout(() => {
        postMessage(chatBot,leaveMessage);
        setTimeout(botExitChat,
                   randomNumber("left") * 5000 + 2000,
                   chatBot);
      },writeDelay);
  }
  else {
    setTimeout(botExitChat,
               randomNumber("left") * 5000 + 2000,
               chatBot);
  }
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
  return 800 + (botResponse.content.text().length + inputMessage.content.text().length / 2)* (Math.floor(Math.random() * 200) + 20)
}

// edgeFactor()
// Used to check how much a bot is povoced to react by a certain message
// Will be compared against the bots verbosity
// the higher the edge-factor the more likely a bot is to react
//
// input:       chatBot = the bot provoced
//              speaker = the bot/human provocing with input
//              input   = the povocing input
// output:      number between 0.0 and 1.0
// sideeffect:  none
const edgeFactor = (chatBot,message) => {
  return Math.random() * 0.9 ** botArray.length;
}

const effectiveVerbosity = (chatBot) => {
  return chatBot.verbosity * 0.9 ** (chatBot.timeSinceInteraction / 5);
}

const botIsBothered = (chatBot,inputMessage) => {
  if (chatBot.busy) {
    return 0.0;
  }
  return Math.max(randomNumber("left") - chatBot.verbosity, 0.0);
}

const singleBotReaction = (chatBot,inputMessage) => {
  chatBot.busy = true;
  let to = inputMessage.from;
  let type = "greeting";
  let about = "none";
  let reactionMessage = new Message(chatBot,to,type,about);
  setTimeout(() => {
      postMessage(reactionMessage);
      chatBot.timeSinceInteraction = 0;
      chatBot.busy = false;
    },
    botTypingDelay(inputMessage,reactionMessage)
  );
  return true;
}

const compareFirst = (array1,array2) => {
  if      (array1[0] < array2[0]) return -1;
  else if (array1[0] > array2[0]) return  1;
  else                            return  0;
}

const getNumMaxIndeces = (num,array) => {
  let indeces = [];
  for (var i = 0; i < array.length; i++) {
    indeces.push([array[i],i]);
  }
  return indeces
          .sort(compareFirst)
          .slice(0,num)
          .map(x => x[1]);
}

// input:       the object of the "persons" to whom it is reacted
// output:      none
// sideeffects: bots respond randomly based on their verbosity levels
const botsReaction = (inputMessage) => {
  let priorities = [];
  botArray.forEach(bot => {
    let botherLevel = botIsBothered(bot,inputMessage);
    if (botherLevel > 0.0) {
      priorities.push(botherLevel);
    }
  });
  getNumMaxIndeces(MAX_BOTS_REACT,priorities).forEach(i => singleBotReaction(botArray[i],inputMessage));
}

const randomEventBotJoin = () => {
  if (0.05 * 0.95 ** botArray.length > randomNumber("none")) {
    botEntersChat();
  }
}

const randomEventBotsLeave = () => {
}

///////////////////////////////////
//// program-state-progression ////
///////////////////////////////////

const stateProgression = () => {
  setTimeout(() => {
      botArray.forEach(x => {
        x.timeSinceInteraction++;
      });
      randomEventBotJoin();
      stateProgression();
    },
    1000
  );
}

///////////////////
//// execution ////
///////////////////

// add starting-participants
humanEntersChat();
botEntersChat();
botEntersChat();
botEntersChat();

//// execution: user-independent processes ////

stateProgression();

//// execution: event-listeners ////

$("#chat-form").on("submit", function(event) {
  event.preventDefault();
  let inputMessage = new Message(human,"none","none","none");
  inputMessage.content.text($(this).find("#chat-input").val());
  clearChatInput();
  postMessage(inputMessage);
});
