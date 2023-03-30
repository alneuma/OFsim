//////////////
//// BOTS ////
//////////////

// ChatBot object randomly join and leave the chat.
// Every bot in the Chat can, if not busy, randomly post messages
// Furthermore bots have a chance to respond to human messages
// and a smaller chance to respond to the messages of other bots
// We can befriend bots to make it more likely that they will respond to us
// Befriended bots also will not leave the chat
// The response a bot gives depends on it's personality
// Idea to Implement: bot's friendliness towards the human
class ChatBot {
  constructor(name, colorPrimary, font, avatar, personality, verbosity) {
    this._name = name;
    this._colorPrimary = colorPrimary;
    this._colorSecondary = this.constructor.complementaryColor(colorPrimary);
    this._font = font;
    this._avatar = avatar;
    this._personality = personality;
    // lower verbosity: bot speaks more
    this._verbosity = verbosity
    this._friend = false;
    this._busy = false;
    this._hasGreeted = false;
    this._timeSinceInteraction = 0;
  }

  // getters and setters
  get name()                  { return this._name; }
  get colorPrimary()          { return this._colorPrimary; }
  get colorSecondary()        { return this._colorSecondary; }
  get font()                  { return this._font; }
  get avatar()                { return this._avatar; }
  get personality()           { return this._personality; }
  get verbosity()             { return this._verbosity; }
  get friend()                { return this._friend; }
  get busy()                  { return this._busy; }
  get hasGreeted()            { return this._hasGreeted; }
  get timeSinceInteraction()  { return this._timeSinceInteraction; }

  set name(name)                                  { this._name = name; }
  set colorPrimary(colorPrimary)                  { this._colorPrimary = colorPrimary; }
  set colorSecondary(colorSecondary)              { this._colorSecondary = colorSecondary; }
  set font(font)                                  { this._font = font; }
  set avatar(avatar)                              { this._avatar = avatar; }
  set personality(personality)                    { this._personality = personality; }
  set verbosity(verbosity)                        { this._verbosity = verbosity; }
  set friend(friend)                              { this._friend = friend; }
  set busy(busy)                                  { this._busy = busy; }
  set hasGreeted(hasGreeted)                      { this._hasGreeted = hasGreeted; }
  set timeSinceInteraction(timeSinceInteraction)  { this._timeSinceInteraction = timeSinceInteraction; }

  // these arrays save all possible values for the the according bot-characteristics and are used to randomly choose them
  static _personalityArray = ["emoji","picture","wiki","troll"];
  static _fontArray = ["monospace","cursive","emoji","math","serif","sans-serif","fantasy"];
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
    return "Chatty";
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

// input:       chatBot-object and a message it should respond to as a string
// output:      the response message of the bot
// sideeffects: none
const makeBotResponse = (chatBot,input) => {
  return "Hello good Sir how are we doing today I was wondering about the state of your juice press which is not uncommen to believe these days in time.";
}

// used to store references to all bots in the chat-room
const botArray = [];

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

  let $newParticipant = $("<div>")
                          .addClass("participant")
                          .attr("id",ChatBot.name);

  let $newAvatar = $("<img>")
                      .addClass("participant-avatar")
                      .attr("src",newBot.avatar)
                      .attr("alt",newBot.name + "'s avatar");

  let $newName = $("<p>")
                    .addClass("participant-name")
                    .css("font-family",newBot.font)
                    .css("color",newBot.colorSecondary)
                    .css("background-color",newBot.colorPrimary)
                    .text(newBot.name);

  $newAvatar.appendTo($newParticipant);
  $newName.appendTo($newParticipant);
  $newParticipant.appendTo("#participants-window");

  botArray.push(newBot);

  sendSystemMessage("<span style=\"font-family: " + newBot.font + "\">" + newBot.name + "</span> entered the chat.");

  return newBot;
}

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

//// time-string ////

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

//// chat-window control ////

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

//// message creation ////

// INCOMPLETE DOCUMENTATION
// input: string
// output: jQuery-Object that holds a DOM element that contains a message sent by human of the following format
//        <div class="human-message">
//          <div class="bubble human-bubble">
//            <p class="nametag human-nametag">bot-name</p>
//            <p class="chat-text human-chat-text">text</p>
//            <p class="message-timestamp">time</p>
//          </div>
//          <img src="" alt="human-face" />
//        </div>
// sideeffects: none
//
// To think about: define helper functions especially for avatar-image
const makeHumanMessage = (human,text) => {

  // make name-tag
  let $nameTag = $("<p>")
                    .addClass("nametag")
                    .css("color",human.colorSecondary)
                    .css("font-famliy",human.font)
                    .text(human.name + ":");

  // make chat-text
  let $newText = $("<p>")
                    .addClass("message-content")
                    .text(text);

  // make timestamp
  let $newTimestamp = $("<p>")
                        .addClass("timestamp")
                        .css("color",human.colorSecondary)
                        .text(getTimeString());

  // make text-bubble
  let $newBubble = $("<div>")
                      .css("background-color",human.colorPrimary)
                      //.css("background","linear-gradient(to right," + human.colorPrimary + "," + human.colorSecondary + ")")
                      .addClass("bubble");

  // add chat-text and timestamp to text-bubble
  $nameTag.appendTo($newBubble);
  $newText.appendTo($newBubble);
  $newTimestamp.appendTo($newBubble);

  // make message element
  let $newMessage = $("<div>")
                      .addClass("message human-message");

  // add text-bubble and avatar-image to message element
  $newBubble.appendTo($newMessage);
  
  return $newMessage;
}

// INCOMPLETE DOCUMENTATION
const postHumanMessage = (human,humanMessage) => {
  makeHumanMessage(human,humanMessage).appendTo($("#message-window"))
  scrollToBottom($("#message-window"));
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
const makeBotMessage = (chatBot,content) => {

  // make name-tag
  let $nameTag = $("<p>")
                    .addClass("nametag")
                    .css("color",chatBot.colorSecondary)
                    .css("font-famliy",chatBot.font)
                    .text(chatBot.name + ":");

  // make chat-text
  let $newText = $("<p>")
                    .addClass("message-content")
                    .text(content);

  // make timestamp
  let $newTimestamp = $("<p>")
                        .addClass("timestamp")
                        .css("color",chatBot.colorSecondary)
                        .text(getTimeString());

  // make text-bubble
  let $newBubble = $("<div>")
                      .css("background-color",chatBot.colorPrimary)
                      .addClass("bubble");

  // add chat-text and timestamp to text-bubble
  $nameTag.appendTo($newBubble);
  $newText.appendTo($newBubble);
  $newTimestamp.appendTo($newBubble);

  // make message element
  let $newMessage = $("<div>")
                      .addClass("message bot-message");

  // add text-bubble and avatar-image to message element
  $newBubble.appendTo($newMessage);
  
  return $newMessage;
}

// INCOMPLETE DOCUMENTATION
const postBotMessage = (chatBot,botMessage) => {
  makeBotMessage(chatBot,botMessage).appendTo($("#message-window"))
  scrollToBottom($("#message-window"));
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
const botTypingDelay = (input,botMessage) => {
  return 800 + (botMessage.length + input.length / 2)* (Math.floor(Math.random() * 200) + 20)
}

// edgeLevel()
// Used to check how much a bot is povoced to react by a certain message
// Will be compared against the bots verbosity
// the higher the edge-level the more likely a bot is to react
//
// input:       chatBot = the bot provoced
//              speaker = the bot/human provocing with input
//              input   = the povocing input
// output:      number between 0.0 and 1.0
// sideeffect:  none
const edgeLevel = (chatBot,speaker,input) => {
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
    if(!x.busy && edgeLevel(x,speaker,input) > effectiveVerbosity(x))
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
      postBotMessage(chatBot,botResponse);
      chatBot.timeSinceInteraction = 0;
      chatBot.busy = false;
    },
    botTypingDelay(input,botResponse)
  );
}

// INCOMPLETE DOCUMENTATION
const sendSystemMessage = (message) => {
  $("<div>")
    .addClass("message system-message")
    .html(getTimeString() + ": " + message)
    .appendTo($("#message-window"));
}

///////////////////
//// execution ////
///////////////////

//// execution: start ////
sendSystemMessage("welcome");

// specify human carachteristics
let humanColor = ChatBot.randomColor();
let human = {
  colorPrimary: humanColor,
  colorSecondary: ChatBot.complementaryColor(humanColor),
  font: "sans-serif",
  avatar: "",
  name: "You",
}

// represent human as a participant
$("#human .participant-avatar").attr("src",human.Avatar);
$("#human .participant-name").css("font-family",human.font)
                             .css("color",human.colorSecondary)
                             .css("background-color",human.colorPrimary)
                             .text(human.name);

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

  postHumanMessage(human,inputMessage);
  botsReact(human,inputMessage);
});
