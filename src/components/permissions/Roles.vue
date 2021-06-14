<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(key, value) in scope.row.children" :key="key.id" :class="['bdbottom', value === 0 ? 'bdtop' : '', 'vcenter']">
              <el-col :span="5">
                <el-tag closable @close="removeRight(scope.row, key.id)">{{ key.authName }}</el-tag>
                <i class="el-icon-caret-right" />
              </el-col>
              <el-col :span="19">
                <el-row v-for="(k, v) in key.children" :key="k.id" :class="[v === 0 ? '' : 'bdtop', 'vcenter']">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRight(scope.row, k.id)">{{ k.authName }}</el-tag>
                    <i class="el-icon-caret-right" />
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="(k1) in k.children" :key="k1.id" type="warning" closable @close="removeRight(scope.row, k1.id)">{{ k1.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" />
        <el-table-column label="角色名称" prop="roleName" />
        <el-table-column label="角色描述" prop="roleDesc" />
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="allocRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      title="分配权限"
      :visible.sync="allocDialogVisible"
      width="30%"
      @close="initData"
    >
      <el-tree ref="treeRef" :data="permissionTree" :props="treeProps" show-checkbox node-key="id" :default-expand-all="true" :default-checked-keys="defaultKeys" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="allocDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allocRights()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      allocDialogVisible: false,
      permissionTree: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defaultKeys: [],
      role: []
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    async getRoleList() {
      const { data: result } = await this.$http.get('roles')
      if (result.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = result.data
      console.log(this.roleList)
    },
    async removeRight(row, id) {
      console.log(id)
      const resultConfirm = await this.$confirm('此操作将永久删除该权限，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (resultConfirm !== 'confirm') {
        return this.$message.info('取消删除操作')
      }
      console.log(resultConfirm)
      const { data: res } = await this.$http.delete(`roles/${row.id}/rights/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      //   this.getRoleList()
      row.children = res.data
    },
    async allocRightDialog(row) {
      const { data: result } = await this.$http.get('rights/tree')
      if (result.meta.status !== 200) {
        return this.$message.error('获取权限树失败')
      }
      this.permissionTree = result.data
      this.getDefaultKeys(row, this.defaultKeys)
      this.role = row
      this.allocDialogVisible = true
    },
    getDefaultKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(element => this.getDefaultKeys(element, arr))
    },
    initData() {
      this.defaultKeys = []
    },
    async allocRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log(keys)
      const ids = keys.join(',')
      const { data: result } = await this.$http.post(`roles/${this.role.id}/rights`, { rids: ids })
      if (result.meta.status !== 200) {
        return this.$message.error('更新权限集失败')
      }
      this.$message.success('更新权限集成功')
      this.getRoleList()
      this.allocDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
    margin: 7px;
}
.bdtop{
border-top: 1px solid #eee;
}
.bdbottom {
border-bottom: 1px solid #eee;
}
.vcenter {
    display: flex;
    align-items: center;
}
</style>
