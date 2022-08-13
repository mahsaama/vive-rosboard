"use strict";

// Plots time series data of a single .data variable.
// Works on all ROS single value std_msgs types.

class TimeStampsPlotViewer extends Viewer {
  /**
    * Gets called when Viewer is first initialized.
    * @override
  **/
  onCreate() {
    let labels = State.get('arrayLabels');
    let numData = labels.length

    this.viewerNode = $('<div></div>')
      .css({'font-size': '11pt'})
      .appendTo(this.card.content);

    this.plotNode = $('<div></div>')
      .appendTo(this.viewerNode);

    this.dataTable = $('<table></table>')
      .addClass('mdl-data-table')
      .addClass('mdl-js-data-table')
      .css({'width': '100%', 'table-layout': 'fixed' })
      .appendTo(this.viewerNode);

    let tr = $('<tr></tr>')
        .appendTo(this.dataTable);

    $('<td></td>')
      .addClass('mdl-data-table__cell--non-numeric')
      .text("data")
      .css({'width': '40%', 'font-weight': 'bold', 'overflow': 'hidden', 'text-overflow': 'ellipsis'})
      .appendTo(tr);
  this.valueField = $('<td></td>')
      .addClass('mdl-data-table__cell--non-numeric')
      .addClass('monospace')
      .css({'overflow': 'hidden', 'text-overflow': 'ellipsis'})
      .appendTo(tr);

    this.lastData = {};

    let opts = {
      id: "chart1",
      class: "my-chart",
      width: 300,
      height: 200,
      legend: {
        show: true,
      },
      axes: [
        {
          stroke: "#a0a0a0",
          ticks: {
            stroke: "#404040",
          },
          grid: {
            stroke: "#404040",
          },
        },
        {
          stroke: "#a0a0a0",
          ticks: {
            stroke: "#404040",
          },
          grid: {
            stroke: "#404040",
          },
        },
      ],
      series: [
        {},
      ],
    };

    for (let i = 0; i < numData; i++) {
      opts.series.push({
          show: true,
          label: labels[i],
          spanGaps: false,
          stroke: '#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6),
          width: 1,
        }
      );
    }

    this.size = 50; // fixme: last 50 values to show
    this.data = [];

    for (let i = 0; i <= numData; i++) {
      this.data.push(new Array(this.size).fill(0));
    }

    this.ptr = 0;

    this.uplot = new uPlot(opts, this.data, this.plotNode[0]);

    setInterval(()=> {
      let data = [];
      if(this.data[0][this.ptr] === 0) {
        data = [];
        for (let i = 0; i <= numData; i++) {
          data.push(this.data[i].slice(0, this.ptr));
        }
        
      } else {
        data = [];
        for (let i = 0; i <= numData; i++) {
          data.push(this.data[i].slice(this.ptr, this.size).concat(this.data[i].slice(0, this.ptr)));
        }
      }
      this.uplot.setSize({width:this.plotNode[0].clientWidth, height:200});
      this.uplot.setData(data);
    }, 200);

    super.onCreate();
  }

  onData(msg) {
      this.card.title.text(msg._topic_name);
      this.valueField.text(msg.data);
      this.data[0][this.ptr] = msg.header.stamp.secs + (msg.header.stamp.nsecs / 1000000000);
      for (let i = 0; i < msg.data.length; i++) {
        this.data[i+1][this.ptr] = msg.data[i];
      }
      this.ptr = (this.ptr + 1) % this.size;
  }
}

TimeStampsPlotViewer.friendlyName = "Time stamps plot";

TimeStampsPlotViewer.supportedTypes = [
    "std_msgs_stamped/msg/ByteMultiArrayStamped",
    "std_msgs_stamped/msg/Float32MultiArrayStamped",
    "std_msgs_stamped/msg/Float64MultiArrayStamped",
    "std_msgs_stamped/msg/Int8MultiArrayStamped",
    "std_msgs_stamped/msg/Int16MultiArrayStamped",
    "std_msgs_stamped/msg/Int32MultiArrayStamped",
    "std_msgs_stamped/msg/Int64MultiArrayStamped",
    "std_msgs_stamped/msg/UInt8MultiArrayStamped",
    "std_msgs_stamped/msg/UInt16MultiArrayStamped",
    "std_msgs_stamped/msg/UInt32MultiArrayStamped",
    "std_msgs_stamped/msg/UInt64MultiArrayStamped",
];

TimeStampsPlotViewer.maxUpdateRate = 100.0;

Viewer.registerViewer(TimeStampsPlotViewer);