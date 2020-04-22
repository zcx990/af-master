<template>
    <div> 
        <div>
        <el-row :gutter="10">
           <el-col class="row-item" :span="24">
              <label for="">监测点名称：</label>
              {{infoItem.site_name}}
          </el-col>
        </el-row>
        <el-row :gutter="10">
           <el-col class="row-item" :span="12">
              <label for="">报警等级：</label>
              {{ this.level[infoItem.level] }}
          </el-col>
           <el-col class="row-item" :span="8">
              <label for="">处理状态：</label>
              {{infoItem.status_name}}
          </el-col>
        </el-row>
         <el-row :gutter="10">
            <el-col class="row-item" :span="12">
              <label for="">报警类型：</label>
              {{infoItem.alarm_type_name}}
          </el-col>
           <el-col class="row-item" :span="12">
              <label for="">传感器：</label>
              {{infoItem.sensor_name}}
          </el-col>
        </el-row>
        <el-row :gutter="10">
           <el-col class="row-item" :span="12">
              <label for="">更新日期：</label>
              {{secondToStr(infoItem.update_time*1000)}}
          </el-col>
           <el-col class="row-item" :span="12">
              <label for="">报警位置：</label>
              {{infoItem.position}}
          </el-col>
        </el-row>
        <el-row :gutter="10">
           <el-col class="row-item" :span="12">
              <label for="">负责人：</label>
              {{infoItem.department_man}}
          </el-col>
           <el-col class="row-item" :span="12">
              <label for="">联系方式：</label>
              {{infoItem.department_phone}}
          </el-col>
        </el-row>
        <el-row :gutter="10">
           <el-col class="row-item" :span="12">
            
              <label for="">摄像头：</label>
              暂无数据
          </el-col>
           <el-col class="row-item" :span="12">
              <label for="">版本号：</label>
              {{infoItem.device_version_name}}
          </el-col>
        </el-row>
        <div v-if="type=='edit'">
          <el-row :gutter="10">
            <el-col class="row-item" :span="24">
                <label for="">处理方式：</label>
                <el-radio-group v-model="radio" @change="handleChange">
                    <el-radio v-for="item in handleArr" :key="item.id" :label="item.id">{{item.name}}</el-radio>
                </el-radio-group>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col class="row-item textarea" :span="24">
              
                <label for="">处理意见：</label>
                <el-input
                  type="textarea"
                  :rows="1"
                  placeholder="请输入内容"
                  v-model="textarea">
              </el-input>
            </el-col>
          </el-row>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </div>
    </div>
</template>
<script>
import { secondToStr } from '@/utils/index'

export default {
  props: {
    infoItem: {},
    type:''
  },
  data() {
    return {
    secondToStr,
      handleArr: [
        {
          id: 1,
          name: "消防测试"
        },
        {
          id: 2,
          name: "维修保险"
        },
        {
          id: 3,
          name: "误报"
        },
        {
          id: 4,
          name: "真实火警"
        },
        {
          id: 5,
          name: "其他"
        }
      ],
      radio: 1,
      textarea: "",
      level:{
          1:'低',
          2:'中',
          3:'高'
      }
    };
  },
  methods: {
    handleChange(e) {
    //   console.log(e);
    },
    cancel() {
      this.$emit("close");
    },
    submit() {
      if(this.type=='detail'){
        this.$emit("close");
        return
      }
      this.infoItem.radio = this.radio;
      this.infoItem.textarea = this.textarea;
      this.$emit("close", this.infoItem);
    }
  }
};
</script>
<style lang="scss" scoped>
.row-item {
  padding: 10px 0;
  font-size: 16px;
}
.textarea{
    position: relative;
    padding-left: 90px !important;
    >label{
        position: absolute;
        top: 17px;
        left: 5px;
    }
}
.dialog-footer{
    margin-top: 15px;
    text-align: center;
    >.el-button{
        margin: 0 10px !important;
    }
}
</style>
