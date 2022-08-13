"use strict";

// GenericViewer just displays message fields and values in a table.
// It can be used on any ROS type.
// const Actdata = [
//   {
//     id: 1,
//     name: 'action1',
//     children: [
//       { name: 'action1-1' },
//       { name: 'action1-2' }
//     ]
//   },
//   {
//     id: 2,
//     name: 'action2',
//     children: [
//       { name: 'action2-1' },
//       { name: 'action2-2' },
//     ]
//   }
// ];


class ActionTreeViewer extends Viewer {
  /**
    * Gets called when Viewer is first initialized.
    * @override
  **/
  descreptions = [];

  onCreate() {
    this.viewerNode = $('<div id="treeArea"></div>')
      .css({ 'font-size': '11pt', 'background-color': 'white','display':'flex', 'flex-direction':'row' })
      .appendTo(this.card.content);

    this.viewerNodeFadeTimeout = null;

    this.expandFields = {};
    this.fieldNodes = {};
    this.dataTable = $('<div id="tree1"></div>')
    .css({'width':'50%'})
      .appendTo(this.viewerNode);

    this.descArea = $('<div id="desc"></div>')
    .css({'width':'50%', 'height':'100%', 'padding-top':'15px'});
    this.descArea.appendTo(this.viewerNode);

    super.onCreate();
  }

  setSelected(name) {
    let items = document.getElementsByClassName('jqtree-title')
    for (var j = 0; j < items.length; j++) {
      if (items[j].innerHTML == name)
        items[j].parentNode.parentNode.classList.add('jqtree-selected');
    }
  }

  checkSelected(obj){
    for (var i =0; i<obj.length; i++)
    {
      this.descreptions.push(obj[i].data);
      if (obj[i].status == 1) {
        this.setSelected(obj[i].name);
      }
      if(obj[i].children != [])
        this.checkSelected(obj[i].children);
    }
  }

  onData(data) {
    this.card.title.text(data._topic_name);
    let Actdata = JSON.parse(data.data);
    let selecteditems = document.getElementsByClassName("jqtree-selected");
    for(var i=0;i<selecteditems.length; i++)
    {
      selecteditems[i].classList.remove('jqtree-selected');
    }

    $('#tree1').tree({
      data: Actdata,
      autoOpen: true,
    });

    this.descreptions = [];
    this.checkSelected(Actdata);
    let descArea = document.getElementById('desc');
    descArea.innerHTML = '';
    console.log(this.descreptions);
    for (var i=0; i<this.descreptions.length;i++)
    {
      let itemDesc = document.createElement('p');
      itemDesc.style.margin = '1px';
      itemDesc.innerHTML = this.descreptions[i];
      descArea.appendChild(itemDesc);
    }
    
  }
}

ActionTreeViewer.friendlyName = "Action Tree Viewer";

ActionTreeViewer.supportedTypes = [
  "std_msgs_stamped/msg/StringStamped",
];

Viewer.registerViewer(ActionTreeViewer);