class Trunker {
    constructor(url, username, password, port = 8000, proto = 'http') {
        this.proto = proto
        this.url = url;
        this.username = username;
        this.password = password;
        this.port = port;
        this.channels = {};
        this.groups = new Set();
        this.populate();
    }

    get baseUrl() {
        return this.proto + '://' + this.url + ':' + this.port;
    }

    get statsUrl() {
        return this.baseUrl + '/admin/stats';
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
        let request = new XMLHttpRequest();
        request.open( "GET", this.statsUrl, false ); // false for synchronous request
        request.withCredentials = true;
        request.setRequestHeader('Authorization', 'Basic ' + btoa(this.username + ':' + this.password));
        request.send( null );
        return request.responseText;
    }
}

class Channel {
    constructor(name, path, group) {
        this.name = name;
        this.path = path;
        this.group = group;
    }
}
  
var trunky = new Trunker('192.168.1.100', 'user', 'pass');

