//// BOTS ///

class ChatBot {
  constructor(name, color, avatar, personality) {
    this._name = name;
    this._color = color;
    this._avatar = avatar;
    this._personality = personality;
  }

  // getters and setters
  get name()                    { return this._name; }
  get color()                   { return this._color; }
  get avatar()                  { return this._avatar; }
  get personality()             { return this._personality; }

  set name(name)                { this._name = name; }
  set color(color)              { this._color = color; }
  set avatar(avatar)            { this._avatar = avatar; }
  set personality(personality)  { this._personality = personality; }
}

let defaultBot = new ChatBot("Chatty","green","","defaultPersonality");

const makeBotText = (personality) => {
  return "Hello";
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
const makeHumanMessage = (text) => {

  // make name-tag
  let $nameTag = $("<p>");
  $nameTag.addClass("nametag human-nametag");
  $nameTag.text("You:");

  // make chat-text
  let $newText = $("<p>");
  $newText.addClass("chat-text human-chat-text");
  $newText.text(text);

  // make timestamp
  let $newTimestamp = $("<p>");
  $newTimestamp.addClass("message-timestamp");
  $newTimestamp.text(getTimeString());

  // make text-bubble
  let $newBubble = $("<div>");
  $newBubble.addClass("bubble human-bubble");

  // add chat-text and timestamp to text-bubble
  $nameTag.appendTo($newBubble);
  $newText.appendTo($newBubble);
  $newTimestamp.appendTo($newBubble);

  // make avatar-image
  let $newImg = $("<img>");
  $newImg.attr("src","");
  $newImg.attr("alt","human-face");

  // make message element
  let $newMessage = $("<div>");
  $newMessage.addClass("message human-message");

  // add text-bubble and avatar-image to message element
  $newBubble.appendTo($newMessage);
  $newImg.appendTo($newMessage);
  
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
const makeBotMessage = (chatBot) => {

  // make name-tag
  let $nameTag = $("<p>");
  $nameTag.addClass("nametag bot-nametag");
  $nameTag.text(chatBot.name + ":");

  // make chat-text
  let $newText = $("<p>");
  $newText.addClass("chat-text bot-chat-text");
  $newText.text(makeBotText(chatBot.personality));

  // make timestamp
  let $newTimestamp = $("<p>");
  $newTimestamp.addClass("message-timestamp");
  $newTimestamp.text(getTimeString());

  // make text-bubble
  let $newBubble = $("<div>");
  $newBubble.addClass("bubble bot-bubble");

  // add chat-text and timestamp to text-bubble
  $nameTag.appendTo($newBubble);
  $newText.appendTo($newBubble);
  $newTimestamp.appendTo($newBubble);

  // make avatar-image
  let $newImg = $("<img>");
  $newImg.attr("src",chatBot.avatar);
  $newImg.attr("alt",chatBot.name + "'s face");

  // make message element
  let $newMessage = $("<div>");
  $newMessage.addClass("message bot-message");

  // add text-bubble and avatar-image to message element
  $newImg.appendTo($newMessage);
  $newBubble.appendTo($newMessage);
  
  return $newMessage;
}


//// events ////

// what happens when text gets submitted
$("#chat-form").on("submit", function(event) {
  event.preventDefault();

  // Create new message with correct input and append to message-window
  makeHumanMessage($(this).find("input").val()).appendTo($("#message-window"));
  clearChatInput();

  // create new bot message and append to message-window
  makeBotMessage(defaultBot).appendTo($("#message-window"));

  //scroll
  scrollToBottom($("#message-window"));
});

