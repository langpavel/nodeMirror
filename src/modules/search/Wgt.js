define([
  "dojo/_base/declare"
  , "dijit/layout/BorderContainer"
  , "dojo/_base/array"
  , "sol/wgt/Text"
  , "./Grid"
  , "./Menu"
  , "dijit/MenuBar"
  , "dijit/form/Button"
  , "dijit/MenuItem"
  , "modules/contentTabs/tabMixin"
], function(
  declare
  , BorderContainer
  , array
  , Text
  , Grid
  , SearchMenu
  , MenuBar
  , Button
  , MenuItem
  , tabMixin
){
  
  
  return declare([BorderContainer, tabMixin], {
    
    title: "<search>"
    
    , buildRendering: function(){
      this.inherited(arguments);
      var self = this;
      
      this.menu = this.ownObj(new SearchMenu({
        region: "top"
        , dir: this.dir
      }));
      this.addChild(this.menu);
      
      this.menuBar = this.ownObj(new MenuBar({
        region: "top"
      }));
      this.addChild(this.menuBar);
      
      this.menuBar.addChild(new MenuItem({
        label: "find"
        , onClick: function(){
          self.find();
        }
      }));
      
      
      this.grid = this.ownObj(new Grid({
        region: "center"
        
      }));
      this.addChild(this.grid);
    }
    
    , find: function(){
      var self = this;
      var search = this.menu.get("search");
      this.module.find(search).then(function(res){
        self.grid.renderArray(res);
      });
    }
    
    //, focus: function(){
    //}
    
  });
});