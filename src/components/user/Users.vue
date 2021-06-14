<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>

      <el-row :gutter="20">
        <el-col :span="7">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList" />
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table
        :data="userList"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column
          type="index"
          label="序号"
          width="180"
        />
        <el-table-column
          prop="username"
          label="姓名"
          width="180"
        />
        <el-table-column
          prop="email"
          label="邮箱"
          width="180"
        />
        <el-table-column
          prop="mobile"
          label="电话"
          width="180"
        />
        <el-table-column
          prop="role_name"
          label="角色"
          width="180"
        />
        <el-table-column
          prop="mg_state"
          label="状态"
          width="180"
        >
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="changeStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
        >
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑管理员" placement="top">
              <el-button type="primary" icon="el-icon-edit" circle size="mini" @click="showEditDialog(scope.row.id)" />
            </el-tooltip>
            <el-tooltip effect="dark" content="分配权限" placement="top">
              <el-button type="success" icon="el-icon-setting" circle size="mini" @click="allocRole(scope.row)" />
            </el-tooltip>
            <el-tooltip effect="dark" content="删除管理员" placement="top">
              <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="delUser(scope.row.id)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      width="50%"
      @close="closeDialog"
    >
      <el-form ref="addRef" :model="addForm" :rules="addRules" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="修改用户"
      :visible.sync="dialogVisibleOfEdit"
      width="50%"
      @close="closeDialogofEdit"
    >
      <el-form ref="editRef" :model="editForm" :rules="editRules" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisibleOfEdit = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="分配角色"
      :visible.sync="allocDialogVisible"
      width="50%"
      @close="resetRole"
    >
      <div>
        <p>当前用户：{{ userInfo.username }}</p>
        <p>当前角色：{{ userInfo.role_name }}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            />
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allocDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var ckEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z])+@([a-zA-Z])+(\.[a-zA-Z])+/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }
    var ckMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0-9]|17[0-9]|18[0-9]|14[0-9])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 1
      },
      userList: [],
      total: 0,
      dialogVisible: false,
      dialogVisibleOfEdit: false,
      allocDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在3-10之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度在6-15之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: ckEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: ckMobile, trigger: 'blur' }
        ]
      },
      editForm: {
        id: '',
        username: '',
        email: '',
        mobile: ''
      },
      editRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: ckEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: ckMobile, trigger: 'blur' }
        ]
      },
      userInfo: {},
      roleList: [],
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: result } = await this.$http.get('/users', { params: this.queryInfo })
      if (result.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userList = result.data.users
      this.total = result.data.total
    },
    handleSizeChange(newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async changeStatus(info) {
      console.log(info)
      const { data: result } = await this.$http.put(`users/${info.id}/state/${info.mg_state}`)
      if (result.meta.status !== 200) {
        info.mg_state = !info.mg_state
        return this.$message.error('更新状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    closeDialog() {
      this.$refs.addRef.resetFields()
    },
    addUser() {
      this.$refs.addRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: result } = await this.$http.post('users', this.addForm)
        if (result.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        this.dialogVisible = false
        this.getUserList()
      })
    },
    async showEditDialog(id) {
      const { data: result } = await this.$http.get(`users/${id}`)
      if (result.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.dialogVisibleOfEdit = true
      this.editForm = result.data
    },
    editUser() {
      console.log(1)
      this.$refs.editRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: result } = await this.$http.put(`users/${this.editForm.id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (result.meta.status !== 200) {
          return this.$message.error('更新用户信息失败')
        }
        this.dialogVisibleOfEdit = false
        this.getUserList()
        this.$message.success('更新用户信息成功')
      })
    },
    closeDialogofEdit() {
      this.$refs.editRef.resetFields()
    },
    async delUser(id) {
      const result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        // console.log(err)
        return err
      })
      if (result !== 'confirm') {
        return this.$message.info('取消删除操作')
      }
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      this.getUserList()
    },
    async allocRole(row) {
      this.userInfo = row
      const { data: result } = await this.$http.get(`roles`)
      if (result.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = result.data
      this.allocDialogVisible = true
    },
    async save() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: result } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (result.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      this.$message.success('更新角色成功')
      this.getUserList()
      this.allocDialogVisible = false
    },
    resetRole() {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>

</style>
