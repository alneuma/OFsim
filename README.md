# Online-Friends-Simulator

I tried to implement a vaguely realistic chat-room simulation.

## functionality

### chat participants

There are two types of participants, humans and chat-bots. While there can only be one human present at a time, the number of chat-bots is theoretically limitless. Bots will randomly join and leave the chat-room based on a number of different parameters, like the total population of the chat-room or an individual bot's satisfaction level.

### chat exchange

#### chat-messages

A massage comes attached to different types of meta-data like sender, addressee, mood the message is sent in, type of message (e.g. "greeting") or whom the message is about. A messages meta-data determines among other things who will will react to it in which way and what other parameters might change when the message is sent. If for Example somebody is addressed with a message that was sent with bad mood, this somebody's relationship with the sender might deteriorate. 

#### likelihood for bots to post messages

Whenever a participant posts a message into the room, there is a chance for each bot who is not currently busy (e.g. by already preparing a message to post) to react by posting their own message. This chance depends on parameters like the message's meta-data, the bot's verbosity level, the bot's relationship towards the participant who posted the original message, the total population of the room, the number of other bots responding and the recent message density in the chat-room.

#### content of a bot's message

messages are
