"use strict";

// Plots time series data of a single .data variable.
// Works on all ROS single value std_msgs types.

class BatteryViewer extends Viewer {
  /**
    * Gets called when Viewer is first initialized.
    * @override
  **/
  onCreate() {
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
      .text("Voltage")
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
        {
          show: true,
          label: "Voltage",
          spanGaps: false,
          stroke: "#00c080",
          width: 1,
        },
        {
          show: true,
          label: "Percentage",
          spanGaps: false,
          stroke: "blue",
          width: 1,
        }
      ],
    };

    this.size = 50;
    this.data = [
      new Array(this.size).fill(0),
      new Array(this.size).fill(0),
      new Array(this.size).fill(0),
    ];

    this.ptr = 0;

    this.uplot = new uPlot(opts, this.data, this.plotNode[0]);

    setInterval(()=> {
      let data = [];
      if(this.data[0][this.ptr] === 0) {
        data = [
          this.data[0].slice(0, this.ptr),
          this.data[1].slice(0, this.ptr),
          this.data[2].slice(0, this.ptr),
        ];
      } else {
        data = [
          this.data[0].slice(this.ptr, this.size).concat(this.data[0].slice(0, this.ptr)),
          this.data[1].slice(this.ptr, this.size).concat(this.data[1].slice(0, this.ptr)),
          this.data[2].slice(this.ptr, this.size).concat(this.data[2].slice(0, this.ptr)),
        ];
      }
      this.uplot.setSize({width:this.plotNode[0].clientWidth, height:200});
      this.uplot.setData(data);
    }, 200);

    super.onCreate();
  }

  onData(msg) {
      this.card.title.text(msg._topic_name);
      this.valueField.text(msg.voltage);
      this.data[0][this.ptr] = msg.header.stamp.secs + (msg.header.stamp.nsecs / 1000000000);
      this.data[1][this.ptr] = msg.voltage;
      this.data[2][this.ptr] = msg.percentage;
      this.ptr = (this.ptr + 1) % this.size;
  }
}

BatteryViewer.friendlyName = "Battery plot";

BatteryViewer.supportedTypes = [
    "sensor_msgs/msg/BatteryState",
];

BatteryViewer.maxUpdateRate = 100.0;

Viewer.registerViewer(BatteryViewer);