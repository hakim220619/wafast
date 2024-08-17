import type { NextApiRequest, NextApiResponse } from 'next/types'
import pool from '../../../lib/db'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { column, q, sort } = req.query

      // Start with a base query
      let query = 'SELECT ROW_NUMBER() OVER () AS no, u.*, r.role_name FROM users u, role r WHERE u.role=r.id'
      const queryParams: (string | number)[] = []

      // If a column and query value are provided, add them to the query
      if (column && q) {
        query += ` AND ?? LIKE ?`
        queryParams.push(column as string, `%${q}%`)
      }

      // If a sort order is provided, add it to the query
      if (sort) {
        const [sortColumn, sortOrder] = (sort as string).split(':')
        if (sortColumn && (sortOrder === 'asc' || sortOrder === 'desc')) {
          query += ` ORDER BY ?? ${sortOrder.toUpperCase()}`
          queryParams.push(sortColumn)
        }
      }

      // Fetch users from the database
      const [rows] = await pool.query(query, queryParams)

      // Send the data as a JSON response
      res.status(200).json({ data: rows })
    } catch (error) {
      console.error('Error fetching users:', error)
      res.status(500).json({ message: 'Internal Server Error' })
    }
  } else if (req.method === 'POST') {
    try {
      const { full_name, email, password, role, phone_number, state, address, limit, expaire } = req.body

      if (!full_name || !email || !password || !role || !phone_number || !state || !address || !limit || !expaire) {
        return res.status(400).json({ message: 'All fields are required' })
      }

      // Convert limit to an integer
      const limitInt = parseInt(limit, 10)

      if (isNaN(limitInt)) {
        return res.status(400).json({ message: 'Limit must be a valid number' })
      }
      if (isNaN(Date.parse(expaire))) {
        return res.status(400).json({ message: 'Expaire must be a valid date' })
      }

      // Hash the password before inserting it into the database
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Insert the new user into the database
      const insertQuery = `
        INSERT INTO users (full_name, email, password, role, phone_number, state, address, \`limit\`, expaire)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

      const [result] = await pool.query(insertQuery, [
        full_name,
        email,
        hashedPassword, // Use the hashed password
        role,
        phone_number,
        state,
        address,
        limitInt, // Use the integer limit
        expaire
      ])
      console.log(result)

      // Send a success response
      res.status(200).json({ message: 'User created successfully', userId: result.insertId })
    } catch (error) {
      console.error('Error creating user:', error)
      res.status(500).json({ message: 'Internal Server Error' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
