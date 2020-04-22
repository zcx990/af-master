<template>
    <div class="app-container">
        <div class="flex-between">
            <el-form :inline="true" :model="searchForm" class="demo-form-inline">
                <el-form-item label="摄像机类型">
                    <el-select size="small"  v-model="searchForm.cameraType" placeholder="请选择">
                        <el-option
                            v-for="item in cameraType"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="所属设备">
                    <el-select size="small"  v-model="searchForm.equipType" placeholder="请选择">
                        <el-option
                        v-for="item in equipType"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary"  size="small" @click="onSubmit">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="info"  size="small" @click="onSubmit">清除</el-button>
                </el-form-item>
                
            </el-form>
            <el-form :inline="true"  class="demo-form-inline">
                <el-form-item>
                    <el-button type="success"  size="small" @click="showDialog('add')">添加</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="warning"  size="small" @click="handleDelete">批量删除</el-button>
                </el-form-item>
            </el-form>
        </div>
        
        
        <div class="table-content" :style="styles.table">
        <el-table stripe :data="tableData" border 
        ref="multipleTable"
        @selection-change="handleSelectionChange"
        height="100%"
        v-loading="flags.loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)">
            <el-table-column
            align="center"
            type="selection"
            width="55">
            </el-table-column>
            <el-table-column
            label="序号"
            align="center"
            width="50">
            <template slot-scope="scope">
                {{ scope.$index + 1 }}
            </template>
            </el-table-column>
            <el-table-column
            label="名称"
            align="center"
            prop="name">
            </el-table-column>
            <el-table-column
            label="IP地址"
            align="center"
            prop="ip">
            </el-table-column>
            <el-table-column
            label="端口"
            align="center"
            width="port">
            <template slot-scope="scope">
                {{ scope.row.port }}
            </template>
            </el-table-column>
            <el-table-column
            label="通道"
            align="center"
            prop="channel">
            </el-table-column>
            <el-table-column
            label="通信协议"
            align="center">
            <template slot-scope="scope">
                {{ scope.row.codingProtocal }}
            </template>
            </el-table-column>
            <el-table-column
            label="传输流"
            align="center">
            <template slot-scope="scope">
                {{ scope.row.bitstream }}
            </template>
            </el-table-column>
            <el-table-column
            label="buffer"
            align="center">
            <template slot-scope="scope">
            {{ scope.row.buffer }}
            </template>
            </el-table-column>
            <el-table-column
            label="终端ID"
            align="center">
            <template slot-scope="scope">
                {{  scope.row.terminalId }}
            </template>
            </el-table-column>
            <el-table-column
            label="使用者"
            align="center">
            <template slot-scope="scope">
                {{ scope.row.user }}
            </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center" fixed="right">
                <template slot-scope="scope">
                    <!-- <el-popover
                    trigger="click">
                    <p class="popRow">
                        编辑
                    </p>
                    <p class="popRow">
                        详情
                    </p>
                    <el-button type="text" slot="reference">操作</el-button>
                    </el-popover> -->
                    <el-button type="primary" plain  size="mini" @click="showDialog('edit', scope.row)">编辑</el-button>
                    <el-button type="success" plain  size="mini" @click="showDialog('detail', scope.row)">详情</el-button>

                </template>
            </el-table-column>
        </el-table>
        </div>

        <div class="pagination-content fr">
            <el-pagination
                :current-page="searchForm.currentPage"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="searchForm.totalCount">
            </el-pagination>
        </div>

        <info-dialog :dialogVisible="flags.showDialog" @closeDialog="closeDialog" :dType="dialogType" :data="infoItem"></info-dialog>
        
    </div>
</template>
<script>
import { cameraList, deleteCamera } from "@/api/camera.js";
import InfoDialog from "./infoDialog";
const colums = [];
const cameraType = [];
const equipType = [];

function setTableHeight(hasTabs) {
  let h = 0;
  if (hasTabs) {
    h = document.querySelector(".app-main").offsetHeight - 145;
  } else {
    h = document.querySelector(".app-main").offsetHeight - 200;
  }
  return h;
}

function debounce(callback, wait) {
  let timer = null;
  return () => {
    timer && clearTimeout(timer);
    timer = setTimeout(callback, wait);
  };
}

export default {
  components: {
    InfoDialog
  },
  data() {
    return {
      tableData: [],
      selectedList: [],
      searchForm: {
        equipType: "",
        cameraType: "",
        currentPage: 1,
        pageSize: 10,
        totalCount: 0
      },
      flags: {
        showDialog: false,
        loading: false
      },
      styles: {
        table: ""
      },
      cameraType,
      equipType,

      infoItem: "",
      dialogType: "",

      resizeHandler: null
    };
  },
  mounted() {
    this.resizeHandler = this.handleScreenChange();
    this.resizeHandler();
    window.addEventListener("resize", this.resizeHandler);
    this.getCameraList();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeHandler);
    this.resizeHandler = null;
  },
  methods: {
    getCameraList() {
      this.flags.loading = true;
      cameraList().then(res => {
        this.tableData = res.dataValue.cameraList;
        this.searchForm.totalCount = res.dataValue.total;
        this.flags.loading = false;
      });
    },

    handleScreenChange() {
      let that = this;
      return debounce(() => {
        let h1 = setTableHeight(false);
        that.styles.table = `height:${h1}px`;
      }, 500);
    },

    handleSelectionChange(val) {
      this.selectedList = val;
    },

    onSubmit: function() {
      this.getCameraList();
    },

    handleDelete() {
      if (this.selectedList.length == 0) {
        this.$message.info("请选择要删除的摄像头");
        return;
      }
      this.$confirm("此操作将删除选中的摄像头, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.deleteFun();
        })
        .catch(() => {
          // this.$refs.multipleTable.clearSelection();
        });
    },

    async deleteFun() {
      let arr = [];
      this.selectedList.map(item => arr.push(item.id));
      console.log(arr);
      let res = await deleteCamera({ ids: arr.join(",") });
      if (res.status == 1) {
        this.$message({
          message: "删除成功",
          type: "success"
        });
        this.getCameraList();
      } else {
        this.$message.error("操作失败，请重试");
      }
    },

    showDialog(type, item) {
      this.dialogType = type;
      this.infoItem = item ? JSON.stringify(item) : "";
      this.flags.showDialog = true;
    },

    closeDialog(flag) {
      if (this.dialogType != "detail" && flag == true) {
        this.getCameraList();
      }

      this.flags.showDialog = false;
      this.infoItem = "";
    }
  }
};
</script>

<style lang="scss" scoped>
.app-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.pagination-content {
  padding: 10px 0;
  text-align: right;
}

.table-content {
  transition: all linear 0.3s;
}

.popRow {
  margin: 0;
  padding: 5px 0;
  text-align: center;
}
</style>
