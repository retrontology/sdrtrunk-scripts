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
        this.button.setAttribute('data-listen', '/' + this.server_name);
        this.button.setAttribute('data-channel', this.server_name);
        this.button.setAttribute('data-group', this.group);
        this.button.setAttribute('data-active', 0);
        this.button.addEventListener("click", toggleButton);
        this.element.appendChild(this.button);
        this.indicator = document.createElement('div');
        this.indicator.classList.add('channel-button-indicator');
        this.indicator.id = 'channel-button-indicator-' + this.server_name;
        this.button.append(this.indicator);
        this.activity = document.createElement('div');
        this.activity.classList.add('channel-button-activity');
        this.activity.id = 'channel-button-activity-' + this.server_name;
        this.button.append(this.activity);
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
    let button = event.currentTarget;
    let active = parseInt(button.getAttribute('data-active'));
    if (active) {
        disableChannel(button);
    }
    else {
        enableChannel(button);
    }
}

function enableChannel(button) {
    let indicator = button.firstChild;
    let channel = button.getAttribute('data-channel');
    let audio = document.createElement('audio');
        audio.id = 'channel-audio-' + channel;
        audio.setAttribute('src', '/' + channel);
        audio.setAttribute('data-channel', channel);
        audio.play();
        audio.addEventListener('playing', onPlaying);
        audio.addEventListener('ended', onQuiet);
        audio.addEventListener('error', onQuiet);
        audio.addEventListener('pause', onQuiet);
        audio.addEventListener('stalled', onQuiet);
        audio.addEventListener('suspend', onQuiet);
        audio.addEventListener('waiting', onQuiet);
        button.appendChild(audio);
        indicator.style.backgroundColor = 'var(--on)';
        button.setAttribute('data-active', 1);
}

function disableChannel(button) {
    let indicator = button.firstChild;
    let channel = button.getAttribute('data-channel');
    let audio = document.getElementById('channel-audio-' + channel);
        audio.pause();
        audio.removeAttribute('src');
        audio.onload();
        audio.remove();
        indicator.style.backgroundColor = 'var(--off)';
        button.setAttribute('data-active', 0);
}

function onPlaying(event) {
    let audio = event.currentTarget;
    let channel = audio.getAttribute('data-channel');
    let indicator = document.getElementById('channel-button-activity-' + channel);
    indicator.style.backgroundColor = 'var(--active)';
}

function onQuiet(event) {
    let audio = event.currentTarget;
    let channel = audio.getAttribute('data-channel');
    let indicator = document.getElementById('channel-button-activity-' + channel);
    indicator.style.backgroundColor = 'var(--inactive)';
}
  
var trunky = new Trunker();