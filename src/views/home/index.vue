<template>
<div class="app-container home-container">
    <div class="shadow-top">

    </div>
    <div class="home-title">
      跨边缘计算大数据平台
    </div>
    <div id="container" class="map-container"></div>
    <div class="left-container box-style">
        <div class="top-container ">
          <el-radio-group v-model="counterType" class="radio-container"  @change="handleWarningTypee">
            <el-radio-button label="day">今日</el-radio-button>
            <el-radio-button label="week">本周</el-radio-button>
            <el-radio-button label="month">本月</el-radio-button>
          </el-radio-group>
          <div class="flex-between">
              <div class="card-panel-description">
              <div class="card-panel-text">告警总数</div>
              <count-to class="card-panel-num" :startVal="0" :endVal="warningCounter.total" :duration="2600"></count-to>
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text color-warning">未处理</div>
              <count-to class="card-panel-num color-warning" :startVal="0" :endVal="warningCounter.left" :duration="2600"></count-to>
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text color-success">已处理</div>
              <count-to class="card-panel-num color-success" :startVal="0" :endVal="warningCounter.done" :duration="2600"></count-to>
            </div>
          </div>
        </div>
        <div class="chart-container">
          <div class="split-line"></div>
          <line-chart :width="'420px'"></line-chart>
        </div>
        <div class="msg-container">
          <p class="split-line"></p> 
          <div class="flex-between">
            <el-select v-model="warningType" placeholder="请选择">
              <el-option
                v-for="item in warningTypeList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
            <el-select v-model="warningStatus" placeholder="请选择">
              <el-option
                v-for="item in warningStatusList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </div>
          <div class="warning-list n-scrollbar ">
            <div class="list-container">
              <div class="list-item" :class="{active:selectedWarning==item.id}" @click="handleSelectItem(item)"
               v-for="item in warningList" :key="item.id">
                <i class="icon"></i>
                <div>
                  <p class="item-detail">{{item.detail}}</p>
                  <span class="item-date">{{secondToStr(item.update_time*1000)}}</span>
                  <span class="item-location"><i></i>{{item.position}}</span>
                </div>
                <span class="item-status" :class="{'color-warning':item.status_name=='未处理'}">
                  {{item.status_name}}
                </span>
              </div>
            </div>
          </div>
        </div>
    </div>

    <div class="right-container box-style">
        <!-- <h3>设备信息</h3>
        <div class="split-line"></div>  -->
        <p class="n-s">
          设备总数 -
          <span>583</span>
        </p>
        <p>
          <i class="mark c1"></i> 正&nbsp;常 -
          <span>308</span>
        </p>
        <p>
          <i class="mark c2"></i> 报&nbsp;警 -
          <span>109</span>
        </p>
        <p>
          <i class="mark c3"></i> 故&nbsp;障 -
          <span>31</span>
        </p>
        <p>
          <i class="mark c4"></i> 离&nbsp;线 -
          <span>100</span>
        </p>
        <p>
          <i class="mark c5"></i> 禁&nbsp;用 -
          <span>15</span>
        </p>
        <p>
          <i class="mark c6"></i> 待激活
          <span>20</span>
        </p>
    </div>

    <div class="bottom-container box-style">
      <!-- <p>图例类型</p> -->
      <div class="flex-start">
        <div v-for="(item,index) in markerType" :key="index"  class="type-item" 
         @click="handleMarkerType(item.type)"
         :class="{active:item.type==activeType}">
          <el-tooltip
            effect="dark" :content="item.name" placement="top">
            <img class="icon" :src="item.icon" alt="">
          </el-tooltip>
        </div>
        
      </div>
    </div>

    <div class="dialog-markInfo" v-if="flags.showMarkInfo" >
      <h3> 
        {{activeMark.name}}
        <span class="close-btn" @click="handleCloseMarkInfo">

        </span>
      </h3>
      <p class="split-line"></p>
      <div>
        <p>
          未处理异常:
          <span class="color-warning">240</span>
        </p>
        <p>
        监测点数量: <span class="color-info">855</span> 巡查点数量: <span class="color-info">110</span>
        </p>
        <p>
        负责人：产品测试部 15800021545</p>
      </div>
    </div>

    <el-dialog class="warningInfog" :title="dialogTitle" :width="'800px'"  :visible.sync="flags.showWarningInfo">
      <WarningDialog :infoItem="selectedWarningItem" :type="dialogType" @close="handleInfoDialogChange"></WarningDialog>
    </el-dialog>

    <span class="return-btn" @click="pageBack">
        进入管理平台
    </span>
</div>
</template>
<script>
import MapLoader from "./AMap.js";
import LineChart from "./components/LineChart";
import WarningDialog from "./components/warningDialog";
import { secondToStr } from '@/utils/index'

import CountTo from "vue-count-to";

import { ListData, PointData, WarningData, MarkType } from "./data";

const MapZoom = 15;
const MapConfig = {
  center: [116.405467, 39.907761],
  mapStyle: "amap://styles/46a557c5c8eff46994394876c9b0b637", //设置地图的显示样式
  viewMode: "3D",
  buildingAnimation: false,
  showIndoorMap: false,
  pitch: 40,
  zoom: MapZoom
};

let THAT = {};
let MarkList = [];

const warningTypeList = [
  {
    id: 1,
    name: "全部"
  },
  {
    id: 2,
    name: "剩余电流报警"
  },
  {
    id: 3,
    name: "电器温度报警"
  },
  {
    id: 4,
    name: "烟雾报警"
  },
  {
    id: 5,
    name: "温度报警"
  },
  {
    id: 6,
    name: "手动报警"
  }
];

const warningStatusList = [
  {
    id: 1,
    name: "全部"
  },
  {
    id: 2,
    name: "未处理"
  },
  {
    id: 3,
    name: "已处理"
  }
];

export default {
  components: {
    CountTo,
    LineChart,
    WarningDialog
  },
  computed:{
    dialogTitle(){
      return this.dialogType=='edit' ? '告警处理' : '告警详情'
    }
  },
  data() {
    return {
      map: null,
      counterType: "day",
      warningCounter: {
        total: 0,
        done: 0,
        left: 0
      },
      warningList: [], // 告警列表
      selectedWarning: -1, // warninglist中选中的item
      selectedWarningItem: {},

      warningTypeList, // 告警列表下拉-类型
      warningStatusList, // 告警列表下拉-状态

      warningType: 1,
      warningStatus: 1,

      equipmentData: {
        total: 0,
        normal: 0,
        alarm: 0,
        offline: 0,
        breakdown: 0,
        unused: 0,
        disable: 0
      },
      markerType: MarkType,
      activeType: 0,
      flags: {
        showMarkInfo: false,
        showWarningInfo: false
      },
      activeMark: {
        // 点击mark显示弹框
        name: ""
      },
      dialogType:'detail',
      secondToStr
    };
  },
  mounted() {
    THAT = this;
    MapLoader().then(
      AMap => {
        console.log("地图加载成功");
        THAT.initMap();
      },
      e => {
        console.log("地图加载失败", e);
      }
    );
    this.initCounter();
    this.initList();
  },
  beforeDestroy() {
    THAT = null;
    this.map.destroy();
    this.map = null;
  },
  methods: {
    initMap() {
      this.map = new AMap.Map("container", MapConfig);
      this.renderMark(0);
    },
    pageBack() {
      this.$router.push(`/dashboard`);
    },
    initCounter() {
      this.warningCounter = WarningData.day;
    },
    handleWarningTypee(val) {
      this.warningCounter = WarningData[val];
    },
    initList() {
      this.warningList = ListData;
    },

    handleSelectItem(item) {
      this.dialogType = item.status_name=='未处理' ? 'edit' : 'detail'
      this.selectedWarning = item.id;
      this.selectedWarningItem = JSON.parse(JSON.stringify(item));
      this.flags.showWarningInfo = true;
    },

    handleInfoDialogChange(data) {
      this.flags.showWarningInfo = false;
    },

    // ****************************** 地图相关 **********************************
    // 根据类型添加mark，type为0则渲染全部
    renderMark(type) {
      PointData.map(item => {
        if (item.type == type || type === 0) {
          this.addPoint(item);
        }
      });
    },
    addPoint(item) {
      let mark = new AMap.Marker({
        icon: item.icon,
        position: item.position,
        title: item.title,
        extData: item.extData
      });
      this.map.add(mark);
      AMap.event.addListener(mark, "click", this.handleMarkClick);
      MarkList.push(mark);
    },
    handleMarkClick(e) {
      THAT.map.setZoomAndCenter(MapZoom, [e.lnglat.lng, e.lnglat.lat]);
      THAT.activeMark = {
        name: e.target.getExtData()
      };
      setTimeout(() => {
        THAT.handleShowMarkInfo();
      }, 500);
    },
    handleMarkerType(type) {
      if (type == this.activeType) return;
      this.activeType = type;
      this.handleCleanMark();
      this.handleCloseMarkInfo();
      this.renderMark(type);
    },
    handleCleanMark() {
      this.map.remove(MarkList);
      MarkList = [];
    },
    handleShowMarkInfo() {
      this.flags.showMarkInfo = true;
    },
    handleCloseMarkInfo() {
      this.flags.showMarkInfo = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  position: relative;
  padding: 0;
  color: rgba(255, 255, 255, 0.9);
  min-width: 1280px;
}

.shadow-top{
  // position: absolute;
  // left: 0;
  // right: 0;
  // top: 0;
  // height: 70px;
  // z-index: 1;
  // background: linear-gradient(180deg,#000,hsla(0,0%,100%,0));
}
.home-title{
    position: absolute;
    z-index: 11;
    width: 350px;
    height: 50px;
    padding-top: 20px;
    text-align: center;
    left: 50%;
    margin-left: -125PX;
    font-size: 30px;
    color: #fff;
    background: url('../../assets/map_icon/bg-title.png') 0 0 no-repeat;
    background-size: 100% 100%;
  // &::after{
  //   display: block;
  //   position: absolute;
  //   content: '';
  //   left: -122px;
  //   width: 122px;
  //   bottom: 0;
  //   top: 0;
    
  //   background: url('../../assets/map_icon/bg-title-left.png') 0 0 no-repeat;
  //   background-size: cover;
  //   // bottom: -3px;
  //   // border-left: 3px solid #fff;
  //   // height: 500px;
  //   // transform-origin: bottom;
  //   // transform: rotate(-26deg);
  // }
  // &::before{
  //   display: block;
  //   position: absolute;
  //   content: '';
  //   right: -122px;
  //    width: 122px;
  //   bottom: 0;
  //   top: 0;
    
  //   background: url('../../assets/map_icon/bg-title-right.png') 0 0 no-repeat;
  //   background-size: cover;
  //   // bottom: -3px;
  //   // border-left: 3px solid #ddd;
  //   // height: 500px;
  //   // transform-origin: bottom;
  //   // transform: rotate(26deg);
  // }
}

.app-container,
.map-container {
  width: 100%;
  height: 100%;
}

.box-style {
  background: rgba(000, 000, 000, 0.4);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
  border-radius: 10px;
}

.color-warning {
  color: rgba(255, 45, 45, 1)!important;
}

.color-success {
  color: rgba(45, 255, 45, 1) !important;
}

.color-info {
  color: #3399ff;
}

.left-container {
  position: absolute;
  left: 20px;
  top: 20px;
  bottom: 20px;
  width: 460px;
}

.return-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 8px 15px;
  line-height: 23px;

  background: rgba(000, 000, 000, 0.6);
  border: 1px solid #ddd;
  border-radius: 6px;
  &:hover {
    cursor: pointer;
    box-shadow: 0 0 10px #fff;
  }
}

.split-line {
  position: absolute;
  left: 20px;
  right: 20px;
  top: -5px;
  height: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
}

.top-container {
  height: 175px;
  overflow: hidden;
  margin-bottom: 10px;
  .radio-container {
    margin: 20px 0 0 20px;
  }
  .card-panel-description {
    font-weight: bold;
    margin: 26px auto;
    text-align: center;
    .card-panel-text {
      line-height: 18px;

      font-size: 20px;
      margin-bottom: 12px;
    }
    .card-panel-num {
      font-size: 30px;
    }
  }
}

.chart-container {
  position: relative;
  padding: 0 20px;
  height: 200px;
  margin-bottom: 10px;
}

.msg-container {
  position: absolute;
  top: 400px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  .split-line {
    left: 0;
    right: 0;
    top: -10px;
  }

  // 滚动条
  .warning-list {
    position: absolute;
    top: 50px;
    left: 0;
    bottom: 0;
    right: 0;
    overflow: auto;
  }
  .list-container {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    // animation: scroll 10s linear infinite;
  }
  .list-item {
    position: relative;
    background: rgba(0, 0, 0, 0.2);
    padding: 6px 60px 6px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    &.active {
      background: rgba(2155, 255, 255, 0.1);
    }
    span {
      display: inline-block;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
    > .icon {
      position: absolute;
      left: 0;
      top: 0;
      width: 10px;
    }
    > .item-status {
      position: absolute;
      right: 10px;
      top: 0;
      line-height: 60px;
    }
    .item-detail {
      padding: 5px 0;
    }
    .item-date {
      width: 160px;
      display: inline-block;
    }
    .item-location {
      width: 160px;
      display: inline-block;
    }
  }
}

.right-container {
  position: absolute;
  right: 20px;
  bottom: 20px;
  padding: 10px 0;

  overflow: hidden;
  h3 {
    padding: 12px 0;
    text-align: center;
  }
  .split-line {
    top: 53px;
  }
  p {
    margin: 0;
    padding: 10px 20px;
    &:not(.n-s):hover {
      cursor: pointer;
      background: rgba(255, 255, 255, 0.2);
    }
  }
  span {
    margin-left: 5px;
  }
  .mark {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 4px;
    vertical-align: top;
  }
  .c1 {
    background: #37cf8e;
  }
  .c2 {
    background: #ff3f3f;
  }
  .c3 {
    background: #ffb83f;
  }
  .c4 {
    background: #6b7b94;
  }
  .c5 {
    background: #a4b5d4;
  }
  .c6 {
    background: #8262ff;
  }
}

.bottom-container {
  position: absolute;
  // left: 500px;
  left:45%;
  bottom: 20px;
  padding: 10px;
  // padding-left:90px;

  > p {
    position: absolute;
    top: 0;
    left: 20px;
    line-height: 60px;
  }
  .type-item {
    font-size: 0;
    cursor: pointer;
    border-radius: 5px;
    margin-right: 5px;
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    &.active {
      background: rgba(255, 255, 255, 0.6);
    }
  }
  .icon {
    margin: 5px;
    width: 40px;
    height: 40px;
  }
}

.dialog-markInfo {
  position: absolute;
  z-index: 2;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  width: 350px;
  height: 200px;
  left: 50%;
  top: 50%;
  margin-top: -250px;

  padding: 10px;
  box-sizing: border-box;
  .split-line {
    top: 52px;
  }
  > h3 {
    font-size: 25px;
    position: relative;
    height: 35px;
    line-height: 35px;
    padding: 0 10px;
    margin-bottom: 5px;
    .close-btn {
      position: absolute;
      right: 5px;
      top: 5px;
      width: 20px;
      height: 20px;
      background: url("../../assets/map_icon/icon-close.png") 0 0 no-repeat;
      background-size: contain;
      cursor: pointer;
    }
  }
  > div {
    margin-top: 15px;
    padding: 0 10px;
    p {
      padding: 5px 0;
    }
    .color-warning,
    .color-info {
      font-size: 23px;
      font-weight: bold;
      margin-right: 8px;
    }
  }
}

.dialog-warningInfo {
}
</style>
