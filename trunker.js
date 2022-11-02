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
        this.cell = document.createElement('td');
        this.cell.classList.add('channel-cell');
        this.button = document.createElement('button');
        this.button.classList.add('channel-button', this.group + '-group-button');
        this.button.onclick = this.toggle;
        this.cell.appendChild(this.button);
        this.indicator = document.createElement('div');
        this.indicator.classList.add('channel-button-indicator');
        this.button.append(this.indicator);
        let title = document.createElement('div');
        title.classList.add('channel-button-title');
        title.textContent = this.server_description;
        button.append(title);
        document.getElementById('group-' + this.group).appendChild(this.cell);
        return this.cell;
    }

    toggle(ev) {
        if (this.active) {
            this.indicator.style.backgroundColor = 'var(--inactive)';
            this.active = false;
        }
        else {
            this.indicator.style.backgroundColor = 'var(--inactive)';
            this.active = true;
        }
    }
}

function sanitizeName(name) {
    name = name.replace(' ', '');
    return name;
}
  
var trunky = new Trunker();