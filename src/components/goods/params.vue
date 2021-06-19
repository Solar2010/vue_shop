<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="注意，只允许三级分类选择参数！"
        type="warning"
        :closable="false"
        show-icon
      />
      <el-row class="cat_opt">
        <el-col>
          <span>请选择商品分类：</span>
          <el-cascader
            v-model="selectedKeys"
            :options="categories"
            :props="{ expandTrigger: 'hover', value:'cat_id', label:'cat_name' }"
            @change="handleChange"
          />
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isdisable" @click="addDialogVisible = true">添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(value, index) in scope.row.attr_vals" :key="index" closable @close="delAttrVal(index, scope.row)">
                  {{ value }}
                </el-tag>
                <el-input
                  v-if="scope.row.inputVisible"
                  ref="saveTagInput"
                  v-model="scope.row.inputValue"
                  class="input-new-tag"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                />
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" />
            <el-table-column prop="attr_name" label="参数名称" />
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParam(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isdisable" @click="addDialogVisible = true">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(value, index) in scope.row.attr_vals" :key="index" closable @close="delAttrVal(index, scope.row)">
                  {{ value }}
                </el-tag>
                <el-input
                  v-if="scope.row.inputVisible"
                  ref="saveTagInput"
                  v-model="scope.row.inputValue"
                  class="input-new-tag"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                />
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" />
            <el-table-column prop="attr_name" label="属性名称" />
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParam(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      categories: [],
      selectedKeys: [],
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [{
          required: true,
          message: '请输入参数名称',
          trigger: 'blur' }
        ]
      },
      editDialogVisible: false,
      editForm: {
        attr_name: ''
      },
      editFormRules: {
        attr_name: [{
          required: true,
          message: '请输入参数名称',
          trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    isdisable() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    catId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList() {
      const { data: result } = await this.$http.get('categories')
      if (result.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      this.categories = result.data
    },
    handleChange() {
      this.getParamsData()
    },
    handleClick() {
      this.getParamsData()
    },
    async getParamsData() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      const { data: result } = await this.$http.get(`categories/${this.catId}/attributes`, { params: { sel: this.activeName }})
      if (result.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }
      result.data.forEach(element => {
        element.attr_vals = element.attr_vals ? element.attr_vals.split(' ') : []
        element.inputVisible = false
        element.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = result.data
      } else {
        this.onlyTableData = result.data
      }
      console.log(result)
    },
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: result } = await this.$http.post(`categories/${this.catId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (result.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: result } = await this.$http.put(`categories/${this.catId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (result.meta.status !== 200) {
          return this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
        this.editDialogVisible = false
        this.getParamsData()
      })
    },
    async showEditDialog(attr_id) {
      const { data: result } = await this.$http.get(`categories/${this.catId}/attributes/${attr_id}`, { params: {
        attr_sel: this.activeName
      }})
      if (result.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      }
      this.editForm = result.data
      this.editDialogVisible = true
    },
    async removeParam(attr_id) {
      const confirmRes = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('取消操作')
      }
      const { data: result } = await this.$http.delete(`categories/${this.catId}/attributes/${attr_id}`)
      if (result.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrValues(row)
      this.getParamsData()
    },
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    delAttrVal(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrValues(row)
    },
    async saveAttrValues(row) {
      const { data: result } = await this.$http.put(`categories/${this.catId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: this.activeName,
        attr_vals: row.attr_vals.join(' ')
      })
      if (result.meta.status !== 200) {
        return this.$message.error('修改参数失败')
      }
      this.$message.success('修改参数成功')
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt{
    margin: 20px 0 ;
}
.input-new-tag {
     width: 120px;
}
.el-tag{
    margin: 0 10px;
}
</style>
