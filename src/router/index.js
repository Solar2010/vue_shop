import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Permissions from '../components/permissions/right.vue'
import Roles from '../components/permissions/Roles.vue'
import Category from '../components/goods/category.vue'
import Params from '../components/goods/params.vue'
import Goods from '../components/goods/goods.vue'
import GoodsAdd from '../components/goods/add.vue'
import Order from '../components/order/order.vue'
import Report from '../components/report/report.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Permissions
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Category
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: Goods
      },
      {
        path: '/goods/add',
        component: GoodsAdd
      },
      {
        path: '/orders',
        component: Order
      },
      {
        path: '/reports',
        component: Report
      }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 挂载导航守卫
router.beforeEach((to, from, next) => {
// 如果用户访问登录页，则直接放行
  if (to.path === '/login') return next()
  // 从sessionstorage中获取保存的token值
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果没有token，强制跳转到登录页
  if (!tokenStr) return next('/login')
  next()
})

export default router
