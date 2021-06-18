<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCategoryDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table class="tree-table" :data="categoryList" :columns="columns" :selection-type="false" :expand-type="false" :show-index="true" border>
        <template slot="iseffective" slot-scope="scope">
          <i v-if="scope.row.cat_deleted === false" class="el-icon-success" style="color:lightgreen" />
          <i v-else class="el-icon-error" style="color:red" />
        </template>
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success" size="mini">二级</el-tag>
          <el-tag v-else type="warning" size="mini">三级</el-tag>
        </template>
        <template slot="opt" slot-scope="">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <el-pagination
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog
      title="添加分类"
      :visible.sync="dialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <el-form ref="form" :model="form" label-width="80px" :rules="rules">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="form.cat_name" />
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCategoryList"
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name' }"
            :clearable="true"
            :change-on-select="true"
            @change="parentCategoryChange"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      categoryList: [],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'iseffective'
        },
        {
          label: '排序',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      dialogVisible: false,
      form: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      rules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      parentCategoryList: [],
      selectedKeys: []
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList() {
      const { data: result } = await this.$http.get(`categories`, { params: this.queryInfo })
      if (result.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      this.categoryList = result.data.result
      this.total = result.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCategoryList()
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getCategoryList()
    },
    addCategoryDialog() {
      this.getParentCategorys()
      this.dialogVisible = true
    },
    async getParentCategorys() {
      const { data: result } = await this.$http.get('categories', { params: { type: 2 }})
      if (result.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      this.parentCategoryList = result.data
    },
    parentCategoryChange() {
      if (this.selectedKeys.length > 0) {
        this.form.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.form.cat_level = this.selectedKeys.length
      }
    },
    addCategory() {
      // console.log(this.form)
      this.$refs.form.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: result } = await this.$http.post('categories', this.form)
        if (result.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCategoryList()
        this.dialogVisible = false
      })
    },
    addDialogClose() {
      this.$refs.form.resetFields()
      this.selectedKeys = []
      this.form.cat_level = 0
      this.form.cat_pid = 0
    }
  }
}
</script>

<style lang="less" scoped>
.tree-table{
    margin-top:15px;
}

</style>
