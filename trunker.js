class Trunker {
    constructor(url, port = 8000, proto = 'http') {
        this.proto = proto;
        this.url = url;
        this.port = port;
        this.channels = {};
        this.groups = new Set();
        this.populate();
    }

    get baseUrl() {
        return this.proto + '://' + this.url + ':' + this.port;
    }

    get statusUrl() {
        return this.baseUrl + '/status-json.xsl';
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
            return this.baseUrl + '/' + this.channels[channel].path;
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
  
var trunky = new Trunker('192.168.1.100');

