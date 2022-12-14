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
            let title_row = document.createElement('th');
            title_row.classList.add('channel-group-header');
            let disable_button = document.createElement('button');
            disable_button.id = 'channel-group-disable-' + clean_name;
            disable_button.classList.add('channel-group-disable');
            disable_button.setAttribute('data-group', clean_name);
            disable_button.setAttribute('data-enabled', '0');
            disable_button.addEventListener('click', disableGroup);
            title_row.appendChild(disable_button);
            let title = document.createElement('span');
            title.classList.add('channel-group-title');
            title.textContent = name;
            title_row.appendChild(title);
            let collapse_button = document.createElement('button');
            collapse_button.classList.add('channel-group-collapse');
            collapse_button.setAttribute('data-group', clean_name);
            collapse_button.setAttribute('data-collapsed', '0');
            collapse_button.addEventListener("click", onCollapseClick);
            let arrow = document.createElement('div');
            arrow.classList.add('channel-group-collapse-arrow')
            collapse_button.appendChild(arrow);
            title_row.appendChild(collapse_button);
            let group_row = document.createElement('tr');
            group_row.classList.add('channel-group');
            group_row.id = 'group-' + clean_name;
            channel_table.appendChild(title_row);
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
    name = name.replaceAll(' ', '');
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
    //audio.addEventListener('suspend', onQuiet);
    audio.addEventListener('waiting', onQuiet);
    button.appendChild(audio);
    indicator.style.backgroundColor = 'var(--on)';
    button.setAttribute('data-active', 1);
    let group = button.getAttribute('data-group');
    let group_disable = document.getElementById('channel-group-disable-' + group);
    if (group_disable.getAttribute('data-enabled') == '0') {
        group_disable.setAttribute('data-enabled', 1);
        group_disable.style.backgroundColor = 'var(--on)';
    }
}

function disableChannel(button) {
    let indicator = button.firstChild;
    let channel = button.getAttribute('data-channel');
    let activity = document.getElementById('channel-button-activity-' + channel);
    let audio = document.getElementById('channel-audio-' + channel);
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    audio.remove();
    indicator.style.backgroundColor = 'var(--off)';
    activity.style.backgroundColor = 'var(--inactive)';
    button.setAttribute('data-active', 0);
    let group = button.getAttribute('data-group');
    let group_row = document.getElementById('group-' + group);
    let remaining = false;
    for (var i = 0; i < group_row.children.length; i++) {
        if (group_row.children[i].firstChild.getAttribute('data-active') == '1') {
            remaining = true;
        }
    }
    if (remaining == false) {
        let group_button = document.getElementById('channel-group-disable-' + group);
        group_button.style.backgroundColor = 'var(--off)'
        group_button.setAttribute('data-enabled', '0')
    }
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

function onCollapseClick(event) {
    let button = event.currentTarget;
    let group_name = button.getAttribute('data-group');
    let group = document.getElementById('group-' + group_name);
    let arrow = button.firstChild;
    let collapsed = button.getAttribute('data-collapsed');
    if (collapsed == '0') {
        groupCollapse(group);
        arrow.style.borderBottom = 'var(--collapse-max)';
        arrow.style.borderTop = 'var(--collapse-min)';
        button.setAttribute('data-collapsed', 1);
    }
    else {
        groupExpand(group);
        arrow.style.borderBottom = 'var(--collapse-min)';
        arrow.style.borderTop = 'var(--collapse-max)';
        button.setAttribute('data-collapsed', 0);
    }
}

function groupCollapse(group) {
    group.style.display = 'none';
}

function groupExpand(group) {
    group.style.display = 'flex';
}

function disableGroup(event) {
    let button = event.currentTarget;
    let status = button.getAttribute('data-enabled');
    if (status == '1') {
        let group = button.getAttribute('data-group');
        let group_row = document.getElementById('group-' + group);
        for (var i = 0; i < group_row.children.length; i++) {
            let child = group_row.children[i];
            let channel_button = child.firstChild;
            if (channel_button.getAttribute('data-active') == '1') {
                disableChannel(channel_button);
            }
        }
    }
}

var trunky = new Trunker();