// pages/api/auth/me.ts

import { NextApiRequest, NextApiResponse } from 'next/types'
import jwt from 'jsonwebtoken'
import pool from 'src/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET as string) as jwt.JwtPayload

    // Query the database to get the user data
    const [rows]: any = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.userId])

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const user = rows[0]

    // Return the user's data (excluding sensitive information like password)
    return res.status(200).json({ userData: user, accessToken: token })
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
