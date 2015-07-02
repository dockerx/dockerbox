var fs = require('fs'),
    path = require('path'),
    db = require('./db');

var content = {
        currentPort : 8000,
        unusedPorts : [],
        usedPorts : []
    };

module.exports = {
    getPort : function (port) {
        var content = getData();
        port = port || content.unusedPorts.pop() || getNewPort(content);
        content.usedPorts.push(+port);
        updateData(content);
        return port;
    },

    addUnused : function(port) {
        var content = getData();
        content.unusedPorts.push(+port);
        content.usedPorts = content.usedPorts.filter(function(x){return x != +port});
        updateData(content);
    },

    
}

function getNewPort(content) {
    var port = content.currentPort++;
    while(content.usedPorts.indexOf(port) > -1) port = content.currentPort++;
    return port
}

function getData() {
    updateData(content);
    /*getData = function() {
        return JSON.parse(fs.readFileSync(path.join(defaultLocation, 'proxyconfig.json'), 'utf8'));
    }*/
    return content;
}

function updateData(content) {
    //fs.writeFileSync(path.join(defaultLocation, 'proxyconfig.json'), JSON.stringify(content));
}