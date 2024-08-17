// pages/api/roles.ts

import type { NextApiRequest, NextApiResponse } from 'next/types'
import pool from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [rows] = await pool.query('SELECT * FROM role')

    res.status(200).json(rows)
  } catch (error) {
    console.error('Error fetching roles:', error)
    res.status(500).json({ message: 'Error fetching roles' })
  }
}
