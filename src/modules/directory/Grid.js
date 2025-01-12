define([
  "dojo/_base/declare"
  , "dgrid/Grid"
  , "dgrid/extensions/DijitRegistry"
  , "dojo/dom-construct"
  , "dgrid/Selection"
  , "dojo/_base/lang"
  , "dojo/topic"
  , "dijit/form/Button"
  , "sol/fileName"
  , "dojo/date/locale"
  , "dojo/dom-class"
  , "dojo/dom-geometry"
  , "sol/convenient/SceduleExec"
  , "dojo/_base/array"
  , "dgrid/extensions/ColumnResizer"
  , "sol/scroll"
  , "dojo/dom-style"
  , "sol/wgt/ScrollBar"
], function(
  declare
  , Grid
  , DijitRegistry
  , domConstruct
  , Selection
  , lang
  , topic
  , Button
  , fileName
  , locale
  , domClass
  , domGeo
  , SceduleExec
  , array
  , ColumnResizer
  , scroll
  , domStyle
  , ScrollBar
){
  var dimensions;
  
  return declare([
    Grid, DijitRegistry, Selection, ColumnResizer
  ], {
    content: {} // will be provided
    , region: "center"
    , showHeader: false
    , viewMode: "list"
    
    , constructor: function(){
      
      if (!dimensions){
        dimensions = scroll.dimensions();
      };
      
      this._columnDefinition = {
        id: {
          label: "Name"
          , minwidth: 100
            , get: function(object){
              if (object.contentType == "inode/directory"){
                return fileName.single(object.id) + "/";
              };
              return fileName.single(object.id);
            }
        },
        contentType: {
          label: "Content Type"
          , width: 240
          , get: function(object){
            if (object.contentType == "inode/directory"){
              return "dir";
            }
            return object.contentType;
          }
        },
        size: {
          label: "Size"
          , width: 100
        },
        mtime: {
          label: "modified"
          , width: 220
          , get: function(object){
            return object.mtime;
            /*if (object.mtime){
              debugger;
              var r;
              r = locale.parse(object.mtime);
              return r;
            };
            return "";*/
          }
        }
      };
      /*if (this.viewMode == "details"){
        this.columns = this._columnDefinition;
      };*/
      var self = this;
      /*this.correctSize = SceduleExec(function(){
        var box = domGeo.getMarginBox(self.bodyNode);
        domGeo.setMarginBox(self.bodyNode, {
          h: box.w
          , w: box.h
        });
      }, {
        delay: 1000
      });*/
    }
    , buildRendering: function(){
      this.inherited(arguments);
      this._addViewClass();
      this.scrollBar = new ScrollBar({
        direction: "vertical"
        , scrollNode: this.bodyNode
        , deltaCorrection: function(delta){
          delta.y = delta.x;
        }
      });
      this.scrollBar.placeAt(this.domNode);
    }
    , touchScrollCorrection: function(par){
      if (this.viewMode == "list"){
        var y = par.y;
        par.y = par.x;
        par.x = y;
      };
    }
    
    , destroy: function(){
      this.scrollBar.destroy();
      this.inherited(arguments);
    }
    
    , renderRow: function(object){
      var node;
      if (this.viewMode != "list"){
        node = this.inherited(arguments);
      }else{
        
        var fileNameStr = fileName.single(object.id);
        if (object.contentType == "inode/directory"){
          fileNameStr += "/";
        };
        
        var div = domConstruct.create("div", {
          "class": "outer2"
        });
        
        var expander = domConstruct.create("div", {
          "class": "expander"
        });
        domConstruct.place(expander, div);
        
        var text = domConstruct.create("div", {
          "class": "text"
        });
        domConstruct.place(text, expander);
        
        var nameNode = document.createTextNode(fileNameStr);
        domConstruct.place(nameNode, text);
        
        var rotator = domConstruct.create("div", {
          "class": "rotator"
        });
        domConstruct.place(rotator, div);
        
        var inner1 = domConstruct.create("div", {
          "class": "inner1"
        });
        domConstruct.place(inner1, rotator);
        
        var nameNode2 = document.createTextNode(fileNameStr);
        domConstruct.place(nameNode2, inner1);
        
        node = div;
      };
      if (object.contentType){
        var a = object.contentType.split("/");
        array.forEach(a, function(s){
          if (s.length){
            domClass.add(node, s);
          };
        });
      };
      return node;
    }
    
    , _setViewMode: function(viewMode){
      if (this.viewMode == viewMode && this._viewSetCalled){
        return;
      };
      this._viewSetCalled = true;
      
      if (viewMode == "list"){
        this.set("columns", undefined);
        this.set("showHeader", false);
        if (this.headerNode){
          domConstruct.empty(this.headerNode);
        };
        domStyle.set(this.bodyNode, {
          left: "-" + dimensions.w + "px"
          , right: "0px"
          , width: "auto"
        });
      }else{
        this.set("columns", this._columnDefinition);
        this.set("showHeader", true);
        domStyle.set(this.bodyNode, {
          left: "0px"
          , right: "0px"
          , width: "auto"
        });
      };
      this._set("viewMode", viewMode);
      this._addViewClass();
    }
    , _addViewClass: function(){
      if (this.domNode){
        domClass.remove(this.domNode, "list");
        domClass.remove(this.domNode, "details");
        domClass.add(this.domNode, this.viewMode);
      };
    }
    
    , resize: function(){
      //debugger;
      var ret = this.inherited(arguments);
      this.scrollBar.update();
      return ret;
    }
    
    , selectionMode: "single"
    , startup: function(){
      if (this._started){
        return;
      };
      this.inherited(arguments);
      this.doRender();
      this.on(".dgrid-row:click", lang.hitch(this, function(evt){
        var row = this.row(evt);
        topic.publish("client/openid", {
          item: row.data
          , insteadOf: this.mainWgt
        });
        // row.element == the element with the dgrid-row class
        // row.id == the identity of the item represented by the row
        // row.data == the item represented by the row
      }));
      this.set("viewMode", this.viewMode);
      
      this.scrollBar.update();

    }
    
    , doRender: function(){
      if (!this._started){
        return;
      };
      this.refresh();
      this.renderArray(this.content.children);
      this.resize();
    }
    
    , isLeftToRight: function(){
      return true;
    }
    , placeAt: function(parNode, par2){
      domConstruct.place(this.domNode, parNode, par2);
    }
  });
  
});
