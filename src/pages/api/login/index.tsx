// pages/api/login.ts

import { NextApiRequest, NextApiResponse } from 'next/types'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { email, password } = req.body

  try {
    // Query the database for the user by email
    const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email])

    // Check if user exists
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const user = rows[0]

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.NEXT_PUBLIC_JWT_SECRET as string, {
      expiresIn: '1h'
    })
    // console.log(token)

    // Return the token
    return res.status(200).json({ userData: rows[0], accessToken: 'Bearer ' + token })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
