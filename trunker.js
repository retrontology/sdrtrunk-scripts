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
        this.channels[name] = new Channel(name, path, group);
        this.groups.add(group);
    }

    populate() {
        let status = this.status;
        for (const source of status.icestats.source){
            this.addChannel(source.server_name, source.listenurl, source.genre)
        }
    }
}

class Channel {
    constructor(name, url, group) {
        this.name = name;
        this.url = url;
        this.group = group;
    }
}
  
var trunky = new Trunker();

