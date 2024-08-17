// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboard',
      path: '/home',
      icon: 'tabler:smart-home'
    },
    {
      title: 'Master Data',
      icon: 'tabler:users',
      badgeColor: 'error',
      children: [
        {
          title: 'Users',
          path: '/admin/users'
        }
      ]
    }
  ]
}

export default navigation
