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
        let clean_name = sanitizeName(name);
        if (!this.groups.has(clean_name)) {
            let channel_table = document.getElementById('channel-table');
            let title_row = document.createElement('tr');
            title_row.classList.add('channel-group-header');
            let title = document.createElement('th');
            title.classList.add('channel-group-title');
            title.textContent = name;
            title_row.appendChild(title);
            let group_row = document.createElement('tr');
            group_row.classList.add('channel-group');
            group_row.id = 'group-' + clean_name;
            channel_table.appendChild(title_row)
            channel_table.appendChild(group_row);
            this.groups.add(clean_name);
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
        this.active = true;
        this.group = sanitizeName(this.genre)
        this.generateElement();
    }

    generateElement() {
        this.element = document.createElement('td');
        this.element.classList.add('channel-cell');
        this.button = document.createElement('button');
        this.button.classList.add('channel-button', this.group + '-group-button');
        this.button.setAttribute('data-listen', this.listenurl);
        this.button.setAttribute('data-channel', this.server_name);
        this.button.setAttribute('data-group', this.group);
        this.button.setAttribute('data-active', 0);
        this.button.addEventListener("click", toggleButton);
        this.element.appendChild(this.button);
        this.indicator = document.createElement('div');
        this.indicator.classList.add('channel-button-indicator');
        this.indicator.id = 'channel-button-indicator-' + this.server_name;
        this.button.append(this.indicator);
        this.title = document.createElement('div');
        this.title.classList.add('channel-button-title');
        this.title.textContent = this.server_description;
        this.button.append(this.title);
        document.getElementById('group-' + this.group).appendChild(this.element);
        return this.element;
    }
}

function sanitizeName(name) {
    name = name.replace(' ', '');
    return name;
}

function toggleButton(event) {
    let indicator = event.currentTarget.firstChild;
    let url = event.currentTarget.getAttribute('data-listen');
    let channel = event.currentTarget.getAttribute('data-channel');
    let group = event.currentTarget.getAttribute('data-group');
    let active = parseInt(event.currentTarget.getAttribute('data-active'));
    if (active) {
        indicator.style.backgroundColor = 'var(--inactive)';
        event.currentTarget.setAttribute('data-active', 0);
    }
    else {
        indicator.style.backgroundColor = 'var(--active)';
        myAudio = document.createElement('audio');
        event.currentTarget.setAttribute('data-active', 1);
    }
}
  
var trunky = new Trunker();