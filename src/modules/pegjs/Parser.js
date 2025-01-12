define([
  "dojo/_base/declare"
  , "dijit/layout/BorderContainer"
  , "sol/wgt/CodeMirror"
  , "sol/wgt/ObjectInspector"
  , "peg/Peg"
  , "dojo/_base/lang"
  , "modules/text/codeMirrorSettings"
  , "dijit/Dialog"
], function(
  declare
  , BorderContainer
  , CodeMirror
  , ObjectInspector
  , Peg
  , lang
  , codeMirrorSettings
  , Dialog
){
  var GetJsDlg = declare([Dialog], {
    title: "JavaScript"
    , buildRendering: function(){
      var self = this;
      this.inherited(arguments);
      this.mirror = this.ownObj(new CodeMirror({
        //"class": "pegjs input"
        //, region: "top"
        //, splitter: true
        mode: "javascript"
      }));
      this.mirror.placeAt(this.containerNode);
      this.ownObj(codeMirrorSettings.on("settings", function(settings){
        self.mirror.set("theme", settings.theme);
      }));
    }
  });
  
  return declare([BorderContainer], {
    "class": "pegjs parser"
    , region: "right"
    , gutters: false
    , splitter: true
    , buildRendering: function(){
      var self = this;
      this.inherited(arguments);
      this.mirror = this.ownObj(new CodeMirror({
        "class": "pegjs input"
        , region: "top"
        , splitter: true
      }));
      this.addChild(this.mirror);
      
      this.ownObj(codeMirrorSettings.on("settings", function(settings){
        self.mirror.set("theme", settings.theme);
      }));
      
      this.mirror.on("change", lang.hitch(this, function(){
        if (this._started){
          this.parse();
        };
      }));
      
      this.inspector = this.ownObj(new ObjectInspector({
        "class": "pegjs output"
        , region: "center"
        , value: undefined
        , expandlevel: 0
      }));
      this.inspector.region = "center";
      this.addChild(this.inspector);
    }
    
    , getJs: function(){
      if (!this.getJsDlg){
        this.getJsDlg = this.ownObj(new GetJsDlg({}));
      };
      this.getJsDlg.show();
      this.getJsDlg.mirror.set("value", this.parser.toSource());
    }
    
    , parse: function(){
      if (!this.parserCode){
        this.parserCode = this.parent.mirror.get("value");
        this.parser = Peg.buildParser(this.parserCode);
      };
      
      try{
        var parsed = this.parser.parse(this.mirror.get("value"));
        this.inspector.set("name", "result");
        this.inspector.set("value", parsed);
      }catch(e){
        this.inspector.set("name", "error");
        this.inspector.set("value", e);
      }
    }
    , parserCodeChanged: function(){
      this.parserCode = this.parent.mirror.get("value");
      this.parser = Peg.buildParser(this.parserCode);
    }
  });
});