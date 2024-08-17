import { ChangeEvent, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { Button } from '@mui/material'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Modal Import
import TambahModalForm from 'src/pages/admin/users/TambahUserDialog/index'

interface Props {
  value: string
  clearSearch: () => void
  onChange: (e: ChangeEvent) => void
  fetchTableData: () => void // Function to refresh table data passed from parent
}

const HeaderTableUsers = ({ value, clearSearch, onChange, fetchTableData }: Props) => {
  const [openAdd, setOpenAdd] = useState(false)

  const handleOpenAdd = () => {
    setOpenAdd(true)
  }

  const handleCloseAdd = () => {
    setOpenAdd(false)
  }

  return (
    <Box
      sx={{
        gap: 2,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: theme => theme.spacing(2, 5, 4, 5)
      }}
    >
      <Button variant='contained' color='primary' startIcon={<Icon icon='tabler:plus' />} onClick={handleOpenAdd}>
        Tambah User
      </Button>

      {/* Modal for Adding User */}
      <TambahModalForm open={openAdd} onClose={handleCloseAdd} refreshTable={fetchTableData} />

      <CustomTextField
        value={value}
        placeholder='Search…'
        onChange={onChange}
        InputProps={{
          startAdornment: (
            <Box sx={{ mr: 2, display: 'flex' }}>
              <Icon fontSize='1.25rem' icon='tabler:search' />
            </Box>
          ),
          endAdornment: (
            <IconButton size='small' title='Clear' aria-label='Clear' onClick={clearSearch}>
              <Icon fontSize='1.25rem' icon='tabler:x' />
            </IconButton>
          )
        }}
        sx={{
          width: {
            xs: 1,
            sm: 'auto'
          },
          '& .MuiInputBase-root > svg': {
            mr: 2
          }
        }}
      />
    </Box>
  )
}

export default HeaderTableUsers
