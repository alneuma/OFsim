//// BOTS ///

class ChatBot {
  constructor(name, colorPrimary, font, avatar, personality) {
    this._name = name;
    this._colorPrimary = colorPrimary;
    this._colorSecondary = this.constructor.complementaryColor(colorPrimary);
    this._font = font;
    this._avatar = avatar;
    this._personality = personality;
    this._friend = false;
  }

  // getters and setters
  get name()            { return this._name; }
  get colorPrimary()    { return this._colorPrimary; }
  get colorSecondary()  { return this._colorSecondary; }
  get font()            { return this._font; }
  get avatar()          { return this._avatar; }
  get personality()     { return this._personality; }
  get friend()          { return this._friend; }

  set name(name)                      { this._name = name; }
  set colorPrimary(colorPrimary)      { this._colorPrimary = colorPrimary; }
  set colorSecondary(colorSecondary)  { this._colorSecondary = colorSecondary; }
  set font(font)                      { this._font = font; }
  set avatar(avatar)                  { this._avatar = avatar; }
  set personality(personality)        { this._personality = personality; }
  set friend(friend)                  { this._friend = friend; }

  static _personalityArray = ["emoji","picture","wiki","troll"];
  static _fontArray = ["monospace","cursive","emoji","math","serif","sans-serif","fantasy"];
  static _colorArray = ["#FF0000","#FF8000","#FFFF00","#80FF00","#00FF00","#00FF80","#00FFFF","#0080FF","#0000FF","#8000FF","#FF00FF","#FF0080"];

  static complementaryColor(color) {
    let colorArrLength = this._colorArray.length;
    return this._colorArray[(this._colorArray.indexOf(color) + Math.floor(colorArrLength / 2)) % colorArrLength];
  }

  static randomName() {
    return "Chatty";
  }

  static randomColor() {
    // return "#" + Math.floor(Math.random() * 4294967296).toString(16);
    return this._colorArray[Math.floor(Math.random() * this._colorArray.length)];
  }

  static randomFont() {
    return this._fontArray[Math.floor(Math.random() * this._fontArray.length)];
  }

  static randomAvatar() {
    return "";
  }

  static randomPersonality() {
    return this._personalityArray[Math.floor(Math.random() * this._personalityArray.length)];
  }

  static randomBot() {
    return new ChatBot(this.randomName(), this.randomColor(), this.randomFont(), this.randomAvatar(), this.randomPersonality());
  }
}

const makeBotResponse = (chatBot,input) => {
  return "Hello";
}

const botArray = [];

//        <div class="participant">
//          <img class="participant-avatar" src="" alt="avatar" />
//          <p class="participant-name">You</p>
//        </div>
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

//// time-string ////

// getTimeString()
//
// input: none
// output: string of format "HH:mm dd/MM/yyyy" representing current (local) time
// sideeffects: none
//
const getTimeString = () => {
  let date = new Date();
  return ('0' + date.getHours()).slice(-2) + ":" +
         ('0' + date.getMinutes()).slice(-2) + " " +
         ('0' + date.getDate()).slice(-2) + "/" +
         ('0' + (date.getMonth() + 1)).slice(-2) + "/" +
         date.getFullYear();
}

//// chat-window control ////

// clearChatInput()
//
// input: none
// output: undefined
// sideeffects: clears the chat-input-field
//
const clearChatInput = () => {
  $("#chat-form").find("input").val("");
};

// scollToBottom()
//
// input: jQuery-Object
// output: undefined
// sideeffects: DOM elements associated with input to bottom
//
const scrollToBottom = (jqObject) => {
  jqObject.scrollTop(jqObject[0].scrollHeight);
}

//// message creation ////

// makeHumanMessage()
//
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

// makeBotMessage()
//
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

const sendSystemMessage = (message) => {
  $("<div>")
    .addClass("message system-message")
    .html(getTimeString() + ": " + message)
    .appendTo($("#message-window"));
}

sendSystemMessage("welcome");

let humanColor = ChatBot.randomColor();

let human = {
  colorPrimary: humanColor,
  colorSecondary: ChatBot.complementaryColor(humanColor),
  font: "sans-serif",
  avatar: "",
  name: "You",
}

$("#human .participant-avatar").attr("src",human.Avatar);
$("#human .participant-name").css("font-family",human.font)
                             .css("color",human.colorSecondary)
                             .css("background-color",human.colorPrimary)
                             .text(human.name);
$("#chat-window").css("background","linear-gradient(to bottom right, #303030, " + human.colorSecondary + ")");

let defaultBot = botEntersChat();

//// events ////

// what happens when text gets submitted
$("#chat-form").on("submit", function(event) {
  event.preventDefault();

  // Create new message with correct input and append to message-window
  let inputMessage = $(this).find("input").val();
  clearChatInput();

  makeHumanMessage(human,inputMessage).appendTo($("#message-window"));

  let botResponse = makeBotResponse(defaultBot,inputMessage);

  // create new bot message and append to message-window
  makeBotMessage(defaultBot,botResponse).appendTo($("#message-window"));

  //scroll
  scrollToBottom($("#message-window"));
});
