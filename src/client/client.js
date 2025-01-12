define([
  "dojo/domReady"
  , "sol/extend/destroyable_ownObj"
  , "dojo/_base/declare"
  , "dijit/layout/BorderContainer"
  , "client/Tree"
  , "main/_RemoteCall"
  , "dojo/dom-class"
  , "dijit/layout/TabContainer"
  , "dojo/_base/lang"
  , "dijit/layout/ContentPane"
  , "dojo/on"
  , "dojo/topic"
  , "dijit/Toolbar"
  , "dijit/form/Button"
  , "main/nodeControl"
  , "main/moduleLoader!client"
  , "main/contentIO"
  , "client/globals"
  , "dojo/Deferred"
  , "./Stub"
  , "sol/fileName"
  , "client/connection"
  , "dojo/dom-attr"
  , "client/Terminal"
  , "debug/Wgt"
  , "main/config"  
  , "dojo/dom"
  , "dojo/dom-construct"
  , "dojo/_base/array"
], function(
  domReady
  , extendDestroyable
  , declare
  , BorderContainer
  , Tree
  , _RemoteCall
  , domClass
  , TabContainer
  , lang
  , ContentPane
  , on
  , topic
  , ToolBar
  , Button
  , nodeControl
  , moduleLoader
  , contentIO
  , globals
  , Deferred
  , Stub
  , fileName
  , connection
  , domAttr
  , TerminalContent
  , DebugWgt
  , config
  , dom
  , domConstruct
  , array
){
  
  var tabs;
  var openIds = {};
  
  
  globals.openExtra = function(parExtra){
    tabs.addChild(parExtra);
    tabs.selectChild(parExtra);
  };

  globals.addTab = function(parWgt){
    tabs.addChild(parWgt);
    tabs.selectChild(parWgt);
  };
  
  
  globals.openItem = function(parItem, insteadOf){
    if (openIds[parItem.id]){
      tabs.selectChild(openIds[parItem.id]);
      return;
    };
    globals.loadContent(parItem.id, insteadOf);
  };
  
  globals.loadContent = function(parId, insteadOf){
    return globals.openContent({
      par: {
        type: "file"
        , id: parId
      },
      instead: insteadOf
    });
  };
  
  globals.openContent = function(par){
    var def = new Deferred();
    var contentPs;
    if (par.content){
      contentPs = new Deferred();
      contentPs.resolve(par.content);
    }else{
      contentPs = contentIO.getContentDef(par.par);
    };
    var existing = openIds[par.id];
    if (existing){
      if (!existing._destroyed){
        existing.close();
        existing.destroy();
      };
      delete openIds[par.id];
    };
    if (par.instead){
      if (par.instead.par && par.instead.id !== undefined){
        delete openIds[par.instead.id];
      };
      if (!par.instead._destroyed){
        par.instead.close();
        par.instead.destroy();
      };
    };
    var stub = new Stub({
        content: "opening " + par.par.id + " ..."
      , title: fileName.single(par.par.id)
        , par: par.par
        , removeMe: function(){
          delete openIds[this.par.id];
        }
        , close: function(){
          tabs.removeChild(this);
          delete openIds[this.par.id];
        }
    });
    tabs.addChild(stub);
    tabs.selectChild(stub);
    
    
    contentPs.then(lang.hitch(this, function(res){
      var module = moduleLoader.getModule(res.moduleId);
      if (!module){
        console.log("missing module " + res.moduleId);
        return;
      };
      module.createWidgetPs({
        content: res.content
        , par: res.par
        , removeMe: function(){
          delete openIds[this.par.id];
        }
        , close: function(){
          tabs.removeChild(this);
          delete openIds[this.par.id];
        }
      }).then(function(wgt){
        var existing = openIds[res.par.id];
        if (existing){
          if (!existing._destroyed){
            existing.close();
            existing.destroy();
          };
          delete openIds[res.par.id];
        };
        stub.close();
        openIds[res.par.id] = wgt;
        tabs.addChild(wgt);
        tabs.selectChild(wgt);
        domAttr.set(wgt.domNode, "title", "");
        def.resolve(wgt);
      }, function(){
        console.log("widget creation error");
        def.reject();
      });
    }), function(){
      console.log("module load error");
      def.reject();
    });
  };
  
  topic.subscribe("client/openid", function(par){
    globals.openItem(par.item, par.insteadOf);
  });
  
  
  tabs = moduleLoader.getModule("modules/ContentTabs");
  
  
});
