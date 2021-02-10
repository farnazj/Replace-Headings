import Vue from 'vue'
import Router from 'vue-router'
// import Home from './views/Home.vue'
import Login from './views/Login.vue'
// import Signup from './views/Signup.vue'
// import ForgotPassword from './views/ForgotPassword.vue'
// import ResetPassword from './views/ResetPassword.vue'
// import VerifyAccount from './views/VerifyAccount.vue'
import Home from './views/Home.vue'
import CustomTitles from './views/CustomTitles'
// import Settings from './views/Settings.vue'
// import Profile from './views/Profile.vue'
// import Invalid from './views/Invalid.vue'
// import SinglePost from './views/SinglePost.vue'
import store from './store/store'

Vue.use(Router)

let router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
//     {
//       path: '/posts/:postid',
//       name: 'singlePost',
//       component: SinglePost,
//       props: true,
//       meta: {
//         requiresAuth: true
//       }
//     },
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        requiresAuth: true
      }
    },
    {
        path: '/custom-titles/:titleId',
        name: 'customTitles',
        props: true,
        component: CustomTitles,
        meta: {
          requiresAuth: true
        }
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
//     {
//       path: '/signup',
//       name: 'signup',
//       component: Signup
//     },
//     {
//       path: '/forgot-password',
//       name: 'forgotPassword',
//       component: ForgotPassword
//     },
//     {
//       path: '/reset-password/:token',
//       name: 'resetPassword',
//       props: true,
//       component: ResetPassword
//     },
//     {
//       path: '/verify-account/:token',
//       name: 'verifyAccount',
//       props: true,
//       component: VerifyAccount
//     },
//     {
//       path: '/invalid',
//       name: 'invalid',
//       component: Invalid,
//       meta: {
//         requiresAuth: true
//       }
//     },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
      meta: {
        requiresAuth: true
        }
    },
    {
      path: '*',
      component: Home
    }
  ]
})

router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth)) {
    if (store.getters['auth/isLoggedIn']) {
      next();
      window.scrollTo(0, 0);
      return;
    }
    else
        next('/login');
  } else {
    next();
  }
})

export default router;
