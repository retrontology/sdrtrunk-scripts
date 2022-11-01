class Trunker {
    constructor() {
        this.populate();
    }

    get statusUrl() {
        return '/status-json.xsl';
    }

    get status() {
        let request = new XMLHttpRequest();
        request.open( "GET", this.statusUrl, false ); // false for synchronous request
        request.send( null );
        return JSON.parse(request.responseText);
    }

    addChannel(channel) {
        this.channels[channel.server_name] = new Channel(channel);
        this.groups.add(channel.genre);
    }

    getChannels() {
        this.channels = {};
        this.groups = new Set();
        let status = this.status;
        for (const channel of status.icestats.source){
            this.addChannel(channel);
        }
    }

    populate() {
        this.getChannels();
    }
}

class Channel {
    constructor(channel) {
        for (const key in channel) {
            this[key] = channel[key];
        }
        this.listening = false;
    }

    get element() {
        let element = Document.createElement();
    }
}
  
var trunky = new Trunker();

