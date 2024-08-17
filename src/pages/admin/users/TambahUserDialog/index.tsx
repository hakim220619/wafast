import React, { useState, useEffect, ChangeEvent } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Swal from 'sweetalert2'
import axios from 'axios'
import { useRouter } from 'next/router'

interface Role {
  id: string
  role_name: string
}

interface TambahUserDialogProps {
  open: boolean
  onClose: () => void
  refreshTable: () => void
}

interface NewUser {
  full_name: string
  email: string
  limit: string
  expaire: string
  role: string
  phone_number: string
  address: string
  state: 'ON' | 'OFF'
  password: string
}

const TambahUserDialog: React.FC<TambahUserDialogProps> = ({ open, onClose, refreshTable }) => {
  const [newUser, setNewUser] = useState<NewUser>({
    full_name: '',
    email: '',
    limit: '',
    expaire: '',
    role: '',
    phone_number: '',
    address: '',
    state: 'ON',
    password: ''
  })

  const [roles, setRoles] = useState<Role[]>([])
  const router = useRouter()
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('/api/role') // Ganti dengan endpoint API yang sesuai
        setRoles(response.data)
      } catch (error) {
        console.error('Error fetching roles:', error)
        Swal.fire('Error', 'There was an issue fetching roles.', 'error')
      }
    }

    fetchRoles()
  }, [])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewUser({
      ...newUser,
      [name]: value
    })
  }

  const handleSaveUser = async () => {
    try {
      await axios.post('/api/users', newUser)
      onClose() // Close the dialog
      Swal.fire('Success', 'User has been added successfully.', 'success')
      refreshTable()
    } catch (error) {
      Swal.fire('Error', 'There was an issue adding the user.', 'error')
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Tambah User</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin='dense'
          label='Full Name'
          name='full_name'
          type='text'
          fullWidth
          value={newUser.full_name}
          onChange={handleInputChange}
        />
        <TextField
          margin='dense'
          label='Email'
          name='email'
          type='email'
          fullWidth
          value={newUser.email}
          onChange={handleInputChange}
        />
        <TextField
          margin='dense'
          label='Limit'
          name='limit'
          type='number'
          fullWidth
          value={newUser.limit}
          onChange={handleInputChange}
        />
        <TextField
          margin='dense'
          label='Expire'
          name='expaire'
          type='date'
          fullWidth
          InputLabelProps={{
            shrink: true
          }}
          value={newUser.expaire}
          onChange={handleInputChange}
        />
        <TextField
          margin='dense'
          label='Phone Number'
          name='phone_number'
          type='text'
          fullWidth
          value={newUser.phone_number}
          onChange={handleInputChange}
        />
        <TextField
          margin='dense'
          label='Address'
          name='address'
          type='text'
          fullWidth
          value={newUser.address}
          onChange={handleInputChange}
        />
        <TextField
          margin='dense'
          label='Password'
          name='password'
          type='password'
          fullWidth
          value={newUser.password}
          onChange={handleInputChange}
        />

        <TextField
          select
          label='Role'
          name='role'
          fullWidth
          margin='dense'
          value={newUser.role}
          onChange={handleInputChange}
        >
          {roles.map(role => (
            <MenuItem key={role.id} value={role.id}>
              {role.role_name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label='Status'
          name='state'
          fullWidth
          margin='dense'
          value={newUser.state}
          onChange={handleInputChange}
        >
          <MenuItem value='ON'>ON</MenuItem>
          <MenuItem value='OFF'>OFF</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Cancel
        </Button>
        <Button onClick={handleSaveUser} color='primary'>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TambahUserDialog
