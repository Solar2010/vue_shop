<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search" />
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" />
        <el-table-column label="订单编号" prop="order_number" />
        <el-table-column label="订单价格" prop="order_price" />
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '1'" type="success">已付款</el-tag>
            <el-tag v-else type="warning">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" />
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox" />
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox" />
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
    <el-dialog
      title="修改地址"
      :visible.sync="dialogVisible"
      width="50%"
      @close="cascaderClose"
    >
      <el-form ref="addressFormRef" :model="addressForm" :rules="addressFormRule" label-width="100px" class="demo-ruleForm">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="addressForm.address1" :options="cityData" />
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%"
    >
      <span>这是一段信息</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from '../citydata'
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      orderList: [],
      dialogVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRule: {
        address1: [
          { required: true, message: '请选择省市区', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      cityData: cityData,
      progressVisible: false
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: result } = await this.$http.get('orders', { params: this.queryInfo })
      if (result.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      this.total = result.data.total
      this.orderList = result.data.goods
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    showBox() {
      this.dialogVisible = true
    },
    cascaderClose() {
      this.$refs.addressFormRef.resetFields()
    },
    async showProgressBox() {
      const id = '88689974775'
      this.progressVisible = true
      const { data: result } = await this.$http.get(`/kuaidi/${id}`)
      if (result.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
    width: 100%;
}
</style>
