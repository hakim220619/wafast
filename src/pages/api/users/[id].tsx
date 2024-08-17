import type { NextApiRequest, NextApiResponse } from 'next/types'
import pool from '../../../lib/db'

type Data = {
  message: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { method } = req
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ message: 'Missing user ID' })
  }

  switch (method) {
    case 'PUT':
      return handleUpdate(req, res, id)
    case 'DELETE':
      return handleDelete(req, res, id)
    default:
      return res.status(405).json({ message: `Method ${method} Not Allowed` })
  }
}

async function handleUpdate(req: NextApiRequest, res: NextApiResponse<Data>, id: string | string[]) {
  const { full_name, email, limit, expaire, phone_number, state, role } = req.body

  // Basic validation (can be enhanced)
  if (!full_name || !email || !limit || !expaire || !phone_number || !state || !role) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  try {
    // Get a connection from the pool
    const connection = await pool.getConnection()

    try {
      // Update the user in the database
      const [result] = await connection.execute(
        `
        UPDATE users 
        SET full_name = ?, email = ?, \`limit\` = ?, expaire = ?, phone_number = ?, state = ?, role = ? 
        WHERE id = ?
        `,
        [full_name, email, limit, expaire, phone_number, state, role, id]
      )

      if ((result as any).affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' })
      }

      res.status(200).json({ message: 'User updated successfully' })
    } catch (error) {
      console.error('Error updating user:', error)
      res.status(500).json({ message: 'Error updating user' })
    } finally {
      // Release the connection back to the pool
      connection.release()
    }
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({ message: 'Database connection error' })
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<Data>, id: string | string[]) {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection()

    try {
      // Delete the user from the database
      const [result] = await connection.execute(
        `
        DELETE FROM users WHERE id = ?
        `,
        [id]
      )

      if ((result as any).affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' })
      }

      res.status(200).json({ message: 'User deleted successfully' })
    } catch (error) {
      console.error('Error deleting user:', error)
      res.status(500).json({ message: 'Error deleting user' })
    } finally {
      // Release the connection back to the pool
      connection.release()
    }
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({ message: 'Database connection error' })
  }
}
