<template>
    <el-dialog
    top="5vh"
    :title="this.title"
    :visible.sync="dialogVisible"
    width="500px"
    :before-close="handleClose">
    <div style="padding:0 20px">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" :disabled="this.title=='查看详情'"
        label-width="100px" class="demo-ruleForm">
            <el-form-item label="摄像头名称" prop="name">
                <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="用户名" prop="user">
                <el-input v-model="ruleForm.user"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input type="password" v-model="ruleForm.password"></el-input>
            </el-form-item>
            <el-form-item label="IP" prop="ip">
                <el-input v-model="ruleForm.ip"></el-input>
            </el-form-item>
            <el-form-item label="端口" prop="port">
                <el-input type="number" v-model="ruleForm.port"></el-input>
            </el-form-item>
            <el-form-item label="通道" prop="channel">
                <el-input  v-model="ruleForm.channel"></el-input>
            </el-form-item>
            <el-form-item label="协议" prop="codingProtocal">
                <el-input  v-model="ruleForm.codingProtocal"></el-input>
            </el-form-item>
            <el-form-item label="传输流" prop="bitstream">
                <el-input  v-model="ruleForm.bitstream"></el-input>
            </el-form-item>
            <el-form-item label="buffer流" prop="buffer">
                <el-input v-model="ruleForm.buffer"></el-input>
            </el-form-item>

            <el-form-item label="终端ID" prop="terminalId">
                <el-input v-model="ruleForm.terminalId"></el-input>
            </el-form-item>
        
            
        </el-form>
        <div class="align-center" style="margin-top:10px">
            <el-button type="primary" @click="submitForm">确认</el-button>
            <el-button @click="handleClose">取消</el-button>
        </div>
    </div>
        
    </el-dialog>
</template>
<script>
let titleObj = {
  add: "添加摄像头",
  edit: "编辑摄像头",
  detail: "查看详情"
};
let template = {
  name: "",
  user: "",
  password: "",
  ip: "",
  id: "",
  port: "",
  channel: "",
  bitstream: "",
  bitstream: "",
  buffer: "",
  terminalId: ""
};

import { dupCameraName, newCamera, updateCamera } from "@/api/camera.js";

export default {
  props: {
    dType: {
      type: String,
      default: "chart"
    },
    data: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "300px"
    },
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      ruleForm: { ...template },
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        user: [{ required: true, message: "请输入用户", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        ip: [{ required: true, message: "请输入ip", trigger: "blur" }],
        port: [{ required: true, message: "请输入端口号", trigger: "change" }],
        channel: [{ required: true, message: "请输入通道", trigger: "blur" }],
        codingProtocal: [{ required: true, message: "请输入协议", trigger: "blur" }],
        bitstream: [
          { required: true, message: "请输入传输流", trigger: "blur" }
        ],
        buffer: [
          { required: true, message: "请输入buffer", trigger: "blur" }
        ],
        terminalId: [
          { required: true, message: "请输入终端ID", trigger: "blur" }
        ]
      }
    };
  },
  computed: {
    title() {
      return titleObj[this.dType];
    }
  },
  watch: {
    data(val) {
      if (val) {
        this.ruleForm = JSON.parse(this.data);
      } else {
        this.ruleForm = { ...template };
      }
    }
  },
  methods: {
    submitForm() {
      if (this.dType == "detail") {
        this.handleClose();
        return
      }
      this.$refs["ruleForm"].validate(valid => {
        this.validFun(valid);
      });
    },

    async validFun(valid) {
      if (!valid) {
        return false;
      }
     
      let params = { name: this.ruleForm.name };
      this.dType == "edit" && (params.id = this.ruleForm.id);
      let nameCHeck = await dupCameraName(params);
      if (nameCHeck.status != 1) {
        // 不可用
        this.showMsg()
        return;
      }

      let fd = new FormData();
      for (let key in this.ruleForm) {
        fd.append(key, this.ruleForm[key]);
      }
      let res, msg='';
      if (this.dType == "add") {
        res = await newCamera(fd);
        res.status==1 && (msg='添加成功')
      } else {
        res = await updateCamera(fd);
        res.status==1 && (msg='编辑成功')
      }
      if(res.status!=1){
        this.$message.error('操作失败，请重试');
        return
      }
      this.$message({
        message: msg,
        type: 'success'
      });
      this.handleClose(true);
    },

    showMsg(){
      this.$alert('提示', '名称不可用', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'info'
            });
          }
        });
    },
    handleClose(flag) {
      this.$refs["ruleForm"].resetFields();
      this.$emit("closeDialog", flag);
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
