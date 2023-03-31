/////////////////
//// classes ////
/////////////////

//// ChatParticipant ////

// used as the default class for representing the human chatter
class ChatParticipant {
  constructor(name, colorPrimary, font, avatar) {
    this._name = name;
    this._colorPrimary = colorPrimary;
    this._colorSecondary = this.constructor.complementaryColor(colorPrimary);
    this._font = font;
    this._avatar = avatar;
    this._friendsWith = [];
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
  static _colorArray = ["#FF0000","#FF8000","#FFFF00","#80FF00","#00FF00","#00FF80","#00FFFF","#0080FF","#0000FF","#8000FF","#FF00FF","#FF0080"];

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

  // input:       none
  // output:      a randomly generated chatters name as a string
  // sideeffects: none
  static randomName() {
    let str = Math.floor(Math.random() * 65535).toString(16);
    console.log(str);
    return str;
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
    return new ChatParticipant(this.randomName() + " (You)",
                               this.randomColor(),
                               this.randomFont(),
                               this.randomAvatar());
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
    this._relationships = [];
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
    return new ChatBot(this.randomName(),
                       this.randomColor(),
                       this.randomFont(),
                       this.randomAvatar(),
                       this.randomPersonality(),
                       this.randomVerbosity());
  }
}

/////////////////////////
//// general control ////
/////////////////////////

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
  $("#chat-form").find("input").val("");
};

// input:       jQuery-object
// output:      undefined
// sideeffects: scrolls associated DOM element to the bottom
const scrollToBottom = (jqObject) => {
  jqObject.scrollTop(jqObject[0].scrollHeight);
}

// INCOMPLETE DOCUMENTATION
const sendSystemMessage = (message) => {
  $("<div>")
    .addClass("message system-message")
    .html(getTimeString() + ": " + message)
    .appendTo($("#message-window"));
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

  let $newName = $("<p>")
                    .addClass("participant-name")
                    .css("font-family",chatParticipant.font)
                    .css("color",chatParticipant.colorSecondary)
                    .css("background-color",chatParticipant.colorPrimary)
                    .text(chatParticipant.name);

  $newAvatar.appendTo($newParticipant);
  $newName.appendTo($newParticipant);
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
const makeMessage = (chatParticipant,content) => {

  // make name-tag
  let $nameTag = $("<p>")
                    .addClass("nametag")
                    .css("color",chatParticipant.colorSecondary)
                    .css("font-famliy",chatParticipant.font)
                    .text(chatParticipant.name + ":");

  // make chat-text
  let $newContent = $("<p>")
                      .addClass("message-content")
                      .html(content);

  // make timestamp
  let $newTimestamp = $("<p>")
                        .addClass("timestamp")
                        .css("color",chatParticipant.colorSecondary)
                        .text(getTimeString());

  // make text-bubble
  let $newBubble = $("<div>")
                      .css("background-color",chatParticipant.colorPrimary)
                      .addClass("bubble");

  // add chat-text and timestamp to text-bubble
  $nameTag.appendTo($newBubble);
  $newContent.appendTo($newBubble);
  $newTimestamp.appendTo($newBubble);

  // make message element
  let $newMessage = $("<div>")
                      .addClass("message " + (chatParticipant.isHuman ? "human" : "bot") + "-message");

  // add text-bubble and avatar-image to message element
  $newBubble.appendTo($newMessage);
  
  return $newMessage;
}

// INCOMPLETE DOCUMENTATION
const postMessage = (chatParticipant,content) => {
  makeMessage(chatParticipant,content).appendTo($("#message-window"))
  scrollToBottom($("#message-window"));
}

/////////////////////
//// bot control ////
/////////////////////

// used to store references to all bots in the chat-room
const botArray = [];

// input:       chatBot-object and a message it should respond to as a string
// output:      the response message of the bot
// sideeffects: none
const makeBotResponse = (chatBot,chatParticipant,input) => {
  return "Hello good Sir how are we doing today I was wondering about the state of your juice press which is not uncommen to believe these days in time.";
}

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
//                <p class="participant-name">bot's name</p>
//              </div>
//
const botEntersChat = () => {
  let newBot = ChatBot.randomBot();
  addParticipantToScreen(newBot);
  botArray.push(newBot);
  sendSystemMessage("<span style=\"font-family: " + newBot.font + "\">" + newBot.name + "</span> entered the chat.");
  return newBot;
}

const botLeavesChat = (chatBot) => {
  $("#" + chatBot.name).remove();
  sendSystemMessage("<span style=\"font-family: " + chatBot.font + "\">" + chatBot.name + "</span> has left the chat.");
  botArray.splice(botArray.find(x => x.name === name),1);
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
const botTypingDelay = (chatBot,input,Message) => {
  return 800 + (botMessage.length + input.length / 2)* (Math.floor(Math.random() * 200) + 20)
}

const botSatisfaction = (chatBot) => {
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
const edgeFactor = (chatBot,speaker,input) => {
  return Math.random() * 0.9 ** botArray.length;
}

const effectiveVerbosity = (chatBot) => {
  return chatBot.verbosity * 0.9 ** (chatBot.timeSinceInteraction / 5);
}

// input:       the object of the "persons" to whom it is reacted
// output:      none
// sideeffects: bots respond randomly based on their verbosity levels
const botsReact = (speaker,input) => {
  botArray.forEach(x => {
    if(!x.busy && edgeFactor(x,speaker,input) > effectiveVerbosity(x))
      botDelayedResponse(x,speaker,input);
  });
}
  
// INCOMPLETE DOCUMENTATION
// delayMin/Max in miliseconds
const botDelayedResponse = (chatBot,speaker,input) => {
  if (typeof chatBot !== "object") {
    return;
  }
  chatBot.busy = true;
  let botResponse = makeBotResponse(chatBot,input);
  setTimeout(() => {
      postMessage(chatBot,botResponse);
      chatBot.timeSinceInteraction = 0;
      chatBot.busy = false;
    },
    botTypingDelay(input,botResponse)
  );
}

///////////////////
//// execution ////
///////////////////

//// execution: start ////
sendSystemMessage("welcome");

let human = ChatParticipant.randomHuman();
addParticipantToScreen(human);

// set chat-background color accoring to human.colorSecondary
$("#chat-window").css("background","linear-gradient(to bottom right, #303030, " + human.colorSecondary + ")");


// add starting-bots
botEntersChat();
botEntersChat();
botEntersChat();

//// execution: user-independent processes ////

const randomEventBotJoin = () => {
  if (0.05 * 0.95 ** botArray.length > randomNumber("none")) {
    botEntersChat();
  }
}

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

stateProgression();


//// execution: event-listeners ////

$("#chat-form").on("submit", function(event) {
  event.preventDefault();

  // Create new message with correct input and append to message-window
  let inputMessage = $(this).find("input").val();
  clearChatInput();

  postMessage(human,inputMessage);
  botsReact(human,inputMessage);
});
