import { useEffect, useState, useCallback, ChangeEvent } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid, GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid'
import axios from 'axios'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Swal from 'sweetalert2'
import CustomChip from 'src/@core/components/mui/chip'
import headerTableUsers from 'src/pages/admin/component/index'
import { ThemeColor } from 'src/@core/layouts/types'
import Icon from 'src/@core/components/icon'
import { MenuItem } from '@mui/material'
import TambahUserDialog from './TambahUserDialog'
import HeaderTableUsers from 'src/pages/admin/component/index'

interface StatusObj {
  [key: string]: {
    title: string
    color: ThemeColor
  }
}
interface Role {
  id: string
  role_name: string
}

type SortType = 'asc' | 'desc' | undefined | null

const statusObj: StatusObj = {
  ON: { title: 'ON', color: 'primary' },
  OFF: { title: 'OFF', color: 'error' }
}

const TableServerSide = () => {
  const [total, setTotal] = useState<number>(0)
  const [sort, setSort] = useState<SortType>('asc')
  const [rows, setRows] = useState([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [sortColumn, setSortColumn] = useState<string>('full_name')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [openEdit, setOpenEdit] = useState<boolean>(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [roles, setRoles] = useState<Role[]>([])
  // const [openAdd, setOpenAdd] = useState<boolean>(false)

  const handleEditClick = (row: any) => {
    setSelectedRow(row)
    setOpenEdit(true)
  }

  const handleDeleteClick = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async result => {
      if (result.isConfirmed) {
        await axios.delete(`/api/users/${id}`)
        Swal.fire('Deleted!', 'Your data has been deleted.', 'success')
        fetchTableData(sort, searchValue, sortColumn) // Refresh data
      }
    })
  }

  const handleEditSave = async (updatedData: any) => {
    try {
      await axios.put(`/api/users/${updatedData.id}`, updatedData)
      setOpenEdit(false)
      fetchTableData(sort, searchValue, sortColumn) // Refresh data
      Swal.fire('Success', 'User data has been updated.', 'success')
    } catch (error) {
      Swal.fire('Error', 'There was an issue updating the user data.', 'error')
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'no',
      headerName: 'No',
      sortable: false,
      width: 70,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.no}
          </Typography>
        )
      }
    },
    {
      flex: 0.25,
      minWidth: 290,
      field: 'full_name',
      headerName: 'Name',
      renderCell: (params: GridRenderCellParams) => {
        const { row } = params
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
                {row.full_name}
              </Typography>
              <Typography noWrap variant='caption'>
                {row.email}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.175,
      field: 'limit',
      headerName: 'Limit',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.limit}
        </Typography>
      )
    },
    {
      flex: 0.175,
      field: 'expaire',
      headerName: 'Expire',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => {
        const date = new Date(params.row.expaire)
        const formattedDate = date.toLocaleDateString() // Format the date as per the locale

        return (
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {formattedDate}
          </Typography>
        )
      }
    },
    {
      flex: 0.175,
      field: 'role_name',
      headerName: 'Role',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.role_name}
        </Typography>
      )
    },
    {
      flex: 0.175,
      field: 'phone_number',
      headerName: 'Phone Number',
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.phone_number}
        </Typography>
      )
    },
    {
      flex: 0.175,
      minWidth: 140,
      field: 'state',
      headerName: 'Status',
      renderCell: (params: GridRenderCellParams) => {
        const status = statusObj[params.row.state]
        return (
          <CustomChip
            rounded
            size='small'
            skin='light'
            color={status.color}
            label={status.title}
            sx={{ '& .MuiChip-label': { textTransform: 'capitalize' } }}
          />
        )
      }
    },

    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Button variant='text' color='primary' onClick={() => handleEditClick(params.row)}>
            <Icon icon='tabler:edit' fontSize={20} />
          </Button>
          <Button variant='text' color='error' onClick={() => handleDeleteClick(params.row.id)}>
            <Icon icon='tabler:trash' fontSize={20} />
          </Button>
        </Box>
      )
    }
  ]

  const fetchTableData = useCallback(
    async (sort: SortType, q: string, column: string) => {
      await axios
        .get('/api/users', {
          params: {
            q,
            sort,
            column,
            page: paginationModel.page,
            pageSize: paginationModel.pageSize
          }
        })
        .then(res => {
          setTotal(res.data.total)
          setRows(res.data.data)
        })
    },
    [paginationModel.page, paginationModel.pageSize]
  )
  useEffect(() => {
    const fetchRoles = async () => {
      if (roles.length === 0) {
        // Hanya mengambil data jika roles masih kosong
        try {
          const response = await axios.get('/api/role')
          console.log(response.data)

          setRoles(response.data)
        } catch (error) {
          console.error('Error fetching roles:', error)
        }
      }
    }

    fetchRoles()
  }, [roles.length])
  useEffect(() => {
    fetchTableData(sort, searchValue, sortColumn)
  }, [fetchTableData, searchValue, sort, sortColumn])

  const handleSortModel = (newModel: GridSortModel) => {
    if (newModel.length) {
      setSort(newModel[0].sort)
      setSortColumn(newModel[0].field)
    } else {
      setSort('asc')
      setSortColumn('full_name')
    }
  }

  const handleSearch = (value: string) => {
    setSearchValue(value)
  }
  const refreshTable = () => {
    fetchTableData(sort, searchValue, sortColumn)
  }

  return (
    <Card>
      <CardHeader title='Users' />

      <DataGrid
        autoHeight
        pagination
        rows={rows}
        rowCount={total}
        columns={columns}
        sortingMode='server'
        paginationMode='server'
        pageSizeOptions={[10, 25, 50, 100]}
        paginationModel={paginationModel}
        onSortModelChange={handleSortModel}
        slots={{ toolbar: props => <HeaderTableUsers {...props} fetchTableData={refreshTable} /> }}
        onPaginationModelChange={setPaginationModel}
        slotProps={{
          baseButton: {
            size: 'medium',
            variant: 'tonal'
          },
          toolbar: {
            value: searchValue,
            clearSearch: () => handleSearch(''),
            onChange: (event: ChangeEvent<HTMLInputElement>) => handleSearch(event.target.value)
          }
        }}
      />

      {/* Tambah User Modal */}

      {/* Edit Modal */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Full Name'
            type='text'
            fullWidth
            value={selectedRow?.full_name || ''}
            onChange={e => setSelectedRow({ ...selectedRow, full_name: e.target.value })}
          />
          <TextField
            margin='dense'
            label='Email'
            type='email'
            fullWidth
            value={selectedRow?.email || ''}
            onChange={e => setSelectedRow({ ...selectedRow, email: e.target.value })}
          />
          <TextField
            margin='dense'
            label='Limit'
            type='number'
            fullWidth
            value={selectedRow?.limit || ''}
            onChange={e => setSelectedRow({ ...selectedRow, limit: e.target.value })}
          />
          <TextField
            margin='dense'
            label='Expire'
            type='date'
            fullWidth
            InputLabelProps={{
              shrink: true
            }}
            value={selectedRow?.expaire ? selectedRow.expaire.split('T')[0] : ''}
            onChange={e => setSelectedRow({ ...selectedRow, expaire: e.target.value })}
          />
          <TextField
            margin='dense'
            label='Phone Number'
            type='text'
            fullWidth
            value={selectedRow?.phone_number || ''}
            onChange={e => setSelectedRow({ ...selectedRow, phone_number: e.target.value })}
          />
          <TextField
            select
            label='Status'
            fullWidth
            margin='dense'
            value={selectedRow?.state || 'ON'}
            onChange={e => setSelectedRow({ ...selectedRow, state: e.target.value })}
            SelectProps={{
              native: true
            }}
          >
            <option value='ON'>ON</option>
            <option value='OFF'>OFF</option>
          </TextField>
          <TextField
            select
            label='Role'
            fullWidth
            margin='dense'
            value={selectedRow?.role || ''}
            onChange={e => setSelectedRow({ ...selectedRow, role: e.target.value })}
          >
            {roles.map(role => (
              <MenuItem key={role.id} value={role.id}>
                {role.role_name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)} color='primary'>
            Cancel
          </Button>
          <Button onClick={() => handleEditSave(selectedRow)} color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default TableServerSide
