class Trunker {
    constructor() {
        this.channels = {};
        this.groups = new Set();
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

    addChannel(name, path, group) {
        this.channels[path] = new Channel(name, path, group);
        this.groups.add(group);
    }

    getChannelUrl(channel) {
        if (channel in this.channels) {
            return '/' + this.channels[channel].path;
        }
        else {
            return undefined;
        }
    }

    populate() {
        let status = this.status;
        alert('lole');
    }
}

class Channel {
    constructor(name, path, group) {
        this.name = name;
        this.path = path;
        this.group = group;
    }
}
  
var trunky = new Trunker();

