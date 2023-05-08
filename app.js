class Chatbox {
  constructor() {
    this.args = {
      openButton: document.querySelector('.chatbox__button'),
      chatBox: document.querySelector('.chatbox__support'),
      sendButton: document.querySelector('.send__button')
    }

    this.state = false;
    this.messages = JSON.parse(localStorage.getItem('chatbox_messages')) || [];
  }

  display() {
    const { openButton, chatBox, sendButton } = this.args;

    openButton.addEventListener('click', () => this.toggleState(chatBox))

    sendButton.addEventListener('click', () => this.onSendButton(chatBox))

    const node = chatBox.querySelector('input');
    node.addEventListener("keyup", ({ key }) => {
      if (key === "Enter") {
        this.onSendButton(chatBox)
      }
    })

    this.updateChatText(chatBox);
    this.displayDescriptionWithDelay(3000);
  }

  displayDescriptionWithDelay(delay){
    const description = document.querySelector('.chatbox__description--header');
    description.style.display = 'none'; // Hide the description initially

    setTimeout(() => {
      description.style.display = 'block'; // Display the description after the specified delay
    }, delay);
  }

  toggleState(chatbox) {
    this.state = !this.state;

    // show or hides the box
    if (this.state) {
      chatbox.classList.add('chatbox--active')
    } else {
      chatbox.classList.remove('chatbox--active')
    }
  }

  onSendButton(chatbox) {
    var textField = chatbox.querySelector('input');
    let text1 = textField.value
    if (text1 === "") {
      return;
    }

    let msg1 = { name: "User", message: text1, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    this.messages.push(msg1);

    fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      body: JSON.stringify({ message: text1 }),
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(r => r.json())
      .then(r => {
        let msg2 = { name: "Panda", message: r.answer, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        this.messages.push(msg2);

        // store messages in localStorage
        localStorage.setItem('chatbox_messages', JSON.stringify(this.messages));

        this.updateChatText(chatbox)
        textField.value = ''

      }).catch((error) => {
        console.error('Error:', error);
        this.updateChatText(chatbox)
        textField.value = ''
      });
  }

  updateChatText(chatbox) {
    var html = '';
    const messages = JSON.parse(localStorage.getItem('chatbox_messages')) || [];
    messages.slice().reverse().forEach(function (item, index) {
      let message = item.message.replace(/\n/g, "<br>");
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      message = message.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
      let time = `<div class="messages__time">${item.time}</div>`;
      if (item.name === "Panda") {
        html += `<div class="messages__item messages__item--visitor">${message}<div class="time-wrapper">${time}</div></div>`
      }
      else {
        html += `<div class="messages__item messages__item--operator">${message}<div class="time-wrapper">${time}</div></div>`
      }
    });
  
    const chatmessage = chatbox.querySelector('.chatbox__messages');
    chatmessage.innerHTML = html;
  }
  
}

const chatbox = new Chatbox();
chatbox.display();
