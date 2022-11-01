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

var url = 'http://www.mymainsite.com/somepath/path2/path3/path4';

var pathname = new URL(url).;

console.log(pathname);
  
var trunky = new Trunker();

