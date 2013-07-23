var profile = (function(){
    return {
        basePath: "../src",
        releaseDir: "./release",
        releaseName: "server",
        action: "release",
        layerOptimize: "closure",
        optimize: "closure",
        cssOptimize: "comments",
        stripConsole: "warn",
        
        packages:[{
            name: "dojo",
            location: "dojo"
        },{
            name: "dijit",
            location: "dijit" // just for dependencies
        },{
            name: "main",
            location: "main"
        },{
            name: "server",
            location: "server"
        },{
            name: "sol",
            location: "sol"
        },{
            name: "module",
            location: "module"
        }],
        staticHasFeatures: {
          "host-node": 1 // Ensure we "force" the loader into Node.js mode
          , "dom": 0 // Ensure that none of the code assumes we have a DOM
          , "dojo-firebug": 0
          , "dom-addeventlistener": 0
        },
        defaultConfig: {
          hasCache:{
            "host-node": 1 // Ensure we "force" the loader into Node.js mode
            , "dom": 0 // Ensure that none of the code assumes we have a DOM
            , "dojo-firebug": 0
            , "dom-addeventlistener": 0
          },
          async: 1,
          deps: [ "server/server" ]
        },
        layers: {
            "server/server": {
                include: [ "server/server" ]
            }
        }
    };
})();
