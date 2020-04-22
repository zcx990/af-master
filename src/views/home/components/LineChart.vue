<template>
  <div :class="className" ref="lineChart" :style="{height:height,width:width}"></div>
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import { debounce } from "@/utils";

const cdata = {
  x: ["2019-10-17","2019-10-18","2019-10-19","2019-10-20","2019-10-21","2019-10-22","2019-10-23","2019-10-24","2019-10-25","2019-10-26","2019-10-27","2019-10-28","2019-10-29","2019-10-30","2019-10-31","2019-11-01","2019-11-02","2019-11-03","2019-11-04","2019-11-05","2019-11-06","2019-11-07","2019-11-08","2019-11-09","2019-11-10","2019-11-11","2019-11-12","2019-11-13","2019-11-14","2019-11-15","2019-11-16","2019-11-17"],
  y: [5,7,0,0,7,0,1,2,0,0,2,7,0,23,15,9,0,1,3,13,13,10,14,1,1,4,25,14,9,16,1,14]
};

export default {
  props: {
    className: {
      type: String,
      default: "chart"
    },
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "200px"
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      default: cdata.data
    }
  },
  data() {
    return {
      chart: null,
      cdata
    };
  },
  mounted() {
    this.initChart();
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }

    this.chart.dispose();
    this.chart = null;
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val);
      }
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.lineChart, "macarons");
      this.setOptions(this.cdata);
    },

    setOptions(data) {
      this.chart.setOption({
        xAxis: {
          show: false,
          type: "category",
          data: data.x,
          boundaryGap: false,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 5,
          right: 5,
          bottom: 10,
          top: 10
          // containLabel: true
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // type: "cross"
          },
          padding: [5, 10],
          backgroundColor:'rgba(0,0,0,01)'
        },
        yAxis: {
          show: false,
          axisTick: {
            show: false
          }
        },
        legend: {
          show: false
          // data: ['expected', 'actual']
        },
        series: [
          {
            name: "数量",
            smooth: true,
            type: "line",
            itemStyle: {
              normal: {
                color: "#69DFFF",
                lineStyle: {
                  color: "#69DFFF",
                  width: 2
                },
                areaStyle: {
                  color: "rgba(255,255,255,.2)"
                }
              }
            },
            data: data.y,
            animationDuration: 2800,
            animationEasing: "quadraticOut"
          }
        ]
      });
    }
  }
};
</script>
