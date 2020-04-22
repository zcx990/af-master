<template>
    <div class="app-container">
        <div class="flex-between">
            <div style="width:20%">
                <el-collapse v-model="collapseType" accordion>
                    <el-collapse-item title="摄像头列表" name="1">
                        <p class="collapse-item"  v-for="(item) in data" v-bind:key="item.id" :class="{ 'active': item.id==activeId }" @click="handleVideoChange(item)">
                            {{item.name}}
                        </p>
                    </el-collapse-item>
                    <el-collapse-item title="本地设备" name="2">
                        <!-- <p class="collapse-item" v-for="(item) in data" v-bind:key="item.id">
                            {{item.name}}
                        </p> -->
                    </el-collapse-item>
                    <el-collapse-item title="我的收藏" name="3">
                        <!-- <p class="collapse-item" v-for="(item) in data" v-bind:key="item.id">
                            {{item.name}}
                        </p> -->
                    </el-collapse-item>
                </el-collapse>
            </div>
            <div style="width:78%" class="flex-column-center">
              <el-tabs v-model="videoType">
                <el-tab-pane label="实时监控" name="first">
                  <video-player 
                        class="video-player-box"
                        ref="videoPlayer"
                        :options="playerOptions"
                        :playsinline="true"
                        customEventName="customstatechangedeventname"

                        @play="onPlayerPlay($event)"
                        @pause="onPlayerPause($event)"
                        @ended="onPlayerEnded($event)"
                        @waiting="onPlayerWaiting($event)"
                        @playing="onPlayerPlaying($event)"
                        @loadeddata="onPlayerLoadeddata($event)"
                        @timeupdate="onPlayerTimeupdate($event)"
                        @canplay="onPlayerCanplay($event)"
                        @canplaythrough="onPlayerCanplaythrough($event)"

                        @statechanged="playerStateChanged($event)"
                        @ready="playerReadied">
                  </video-player>
                </el-tab-pane>
                <!-- <el-tab-pane label="历史录像" name="second">

                </el-tab-pane> -->
              </el-tabs>
                
            </div>
        </div>
        
    </div>
</template>
<script>
// 2.组件内引用
import videojs from "video.js";
import { videoPlayer } from "vue-video-player";
import "video.js/dist/video-js.css";
import "vue-video-player/src/custom-theme.css";
import "videojs-flash";
import SWF_URL from "videojs-swf/dist/video-js.swf";

videojs.options.flash.swf = SWF_URL; // 设置flash路径，Video.js会在不支持html5的浏览中使用flash播放视频文件

import { cameraList, videoUrl } from "@/api/camera.js";

export default {
  components: {
    videoPlayer
  },
  data() {
    return {
      collapseType: "1",
      videoType: "first",
      data: [],
      activeId: "",
      playerOptions: {
        // videojs options
        autoplay: false, //如果true,浏览器准备好时开始回放。
        loop: false, // 导致视频一结束就重新开始。
        preload: "auto", // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        aspectRatio: "16:9", // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。

        techOrder: ["html5", "flash"],
        flash: { hls: { withCredentials: false }, swf: SWF_URL },
        html5: { hls: { withCredentials: false } },
        muted: true,
        language: "zh-CN",
        playbackRates: [0.7, 1.0, 1.5, 2.0],
        sources: [
          {
            type: "rtmp/mp4",
            src: "http://vjs.zencdn.net/v/oceans.mp4" // 视频地址-改变它的值播放的视频会改变
            //src: ''
          }
        ],
        // poster: URL, //"/static/images/author.jpg", //你的封面地址
        notSupportedMessage: "此视频暂无法播放，请稍后再试", //允许覆盖Video.js无法播放媒体源时显示的默认信息。
        notSupportedMessage: "此视频暂无法播放，请稍后再试",
        // width: 400, //播放器宽度
        // height: 300,
        controlBar: {
          timeDivider: true,
          durationDisplay: true,
          remainingTimeDisplay: false,
          fullscreenToggle: true //全屏按钮
        }
      }
    };
  },
  mounted() {
    this.getcameraList();
    this.getVideoUrl();
  },
  beforeDestroy() {
    this.player.dispose()
  },
  computed: {
    player() {
      return this.$refs.videoPlayer.player;
    }
  },
  methods: {
    getcameraList() {
      cameraList().then(res => {
        this.data = res.dataValue.cameraList;
        this.handleVideoChange(this.data[0], true);
      });
    },

    handleVideoChange(item, flag) {
      this.activeId = item.id;
      let fd = new FormData();
      fd.append("userId", item.user);
      fd.append("cameraId", item.id);
      fd.append("terminalId", item.terminalId);
      videoUrl(fd).then(res => {
        if (res.status == 1) {
          if (!flag) {
            this.$message.success("摄像头切换成功");
          }
          this.player.src(res.dataValue);
          this.player.play()
        } else {
          this.$message.success("视频播放失败");
          this.player.src("");
          this.player.pause()
        }
      });
    },

    getVideoUrl() {},

    // listen event
    onPlayerPlay(player) {
      // console.log('player play!', player)
    },
    onPlayerPause(player) {
      // console.log('player pause!', player)
    },
    // ...player event

    // or listen state event
    playerStateChanged(playerCurrentState) {
      // console.log('player current update state', playerCurrentState)
    },

    // player is ready
    playerReadied(player) {
      console.log("the player is readied");
      // you can use it to do something...
      // player.[methods]
    },
    onPlayerEnded() {},
    onPlayerWaiting() {
      console.log("the player is onPlayerWaiting");
    },
    onPlayerPlaying() {},
    onPlayerLoadeddata() {
      console.log("the player is onPlayerLoadeddata");
    },
    onPlayerTimeupdate() {},
    onPlayerCanplay() {},
    onPlayerCanplaythrough() {},
    playerStateChanged() {}
  }
};
</script>
<style lang="scss" scoped>
.collapse-item {
  position: relative;
  margin: 0;
  padding: 10px 18px;
  font-size: 15px;
  &:hover {
    background: #ecf5ff;
    cursor: pointer;
  }
  &::after {
    content: "";
    display: none;
    width: 2px;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    background: #2d8cf0;
  }
  &.active {
    color: #2d8cf0;
    background: #f0faff;
  }
  &.active::after {
    display: block;
  }
}

.el-collapse-item__wrap {
  border: 1px solide #ddd;
}


</style>
