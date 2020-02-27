import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, AsyncStorage } from 'react-native';
import SocketIOClient from 'socket.io-client';
import { GiftedChat } from 'react-native-gifted-chat';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' + 'Shake or press menu button for dev menu',
});

const USER_ID = '@userId';

export default class App extends Component {
  state = {
    messages: [],
    userId: null,
  };

  constructor (props) {
    super(props);

    this.socket = SocketIOClient('http://localhost:3000');
    this.socket.on('message', this.onReceiveMessage);
    this.determineUser();
  }

  determineUser = () => {
    AsyncStorage.getItem(USER_ID)
      .then((userId) => {
        if (!userId) {
          this.socket.emit('userJoined', null);
          this.socket.on('userJoined', (userId) => {
            AsyncStorage.setItem(USER_ID, userId);
            this.setState({ userId });
          });
        } else {
          this.socket.emit('userJoined', userId);
          this.setState({ userId });
        }
      }).catch((err) => console.log(err));
  };
  onReceiveMessage = (messages) => {
    this._storeMessages(messages);
  };
  onSend = (messages = []) => {
    this.socket.emit('message', messages[0]);
    this._storeMessages(messages);
  };
  _storeMessages = (messages) => {
    this.setState((prev) => ({ messages: GiftedChat.append(prev.messages, messages) }));
  };

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={this.onSend}
        user={{ _id: this.state.userId }}
      />
    );
  }
}
