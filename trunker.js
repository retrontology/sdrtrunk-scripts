class Trunker {
    constructor() {
        this.getChannels();
    }

    get statusUrl() {
        return '/status-json.xsl';
    }

    addChannel(channel) {
        this.addGroup(channel.genre);
        this.channels[channel.server_name] = new Channel(channel);
    }

    addGroup(name) {
        if (!this.groups.has(name)) {
            let group = document.createElement('tr');
            group.classList.add('channel-group');
            group.id = 'group-' + name;
            document.getElementById('channel-table').appendChild(group);
            this.groups.add(name);
        }
    }

    getChannels() {
        let request = new XMLHttpRequest();
        request.open( "GET", this.statusUrl, true ); // false for synchronous request
        request.onload = (e) => {
            if (request.readyState === 4) {
              if (request.status === 200) {
                this.populate(JSON.parse(request.responseText));
              } else {
                console.error(request.statusText);
              }
            }
          };
          request.onerror = (e) => {
            console.error(request.statusText);
          };
        request.send( null );
    }

    populate(data) {
        this.channels = {};
        this.groups = new Set();
        for (const channel of data.icestats.source){
            this.addChannel(channel);
        }
    }

}

class Channel {
    constructor(channel) {
        for (const key in channel) {
            this[key] = channel[key];
        }
        this.generateElement();
    }

    generateElement() {
        this.element = Document.createElement('td');
        this.element.classList.add('channel-cell');
        let button = Document.createElement('button');
        button.classList.add('channel-button', this.genre + '-group-button');
        let indicator = Document.createElement('div');
        indicator.classList.add('channel-button-indicator');
        button.append(indicator);
        let title = Document.createElement('div');
        title.classList.add('channel-button-title');
        button.append(title);
        document.getElementById('group-' + this.genre).appendChild(this.element);
        return this.element;
    }
}
  
var trunky = new Trunker();

this.groups.add(name);